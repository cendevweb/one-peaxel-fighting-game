'use client';

import Phaser from 'phaser';
import {
    ARENA_WIDTH,
    ROSTER,
    VIEW_HEIGHT,
    VIEW_WIDTH,
    findStage,
    resolveBox,
    toPx,
    type CharacterDefinition,
    type CombatEvent,
    type FighterState,
    type ImpactEffect,
    type MatchState,
    type MoveDefinition
} from '@opfg/combat-core';
import type { FightBridge } from './bridge';
import { animationsByKey, type AssetManifest, type ManifestAnimation } from './manifest';

export interface FightSceneConfig {
    bridge: FightBridge;
    manifest: AssetManifest;
    characters: [string, string];
    stageId: string;
}

/** Player colours for the floor shadows and the impact flashes. */
const SLOT_TINT = [0xff6a2b, 0x45b6ff] as const;

interface EffectSprite {
    sprite: Phaser.GameObjects.Sprite;
    animation: ManifestAnimation;
    frame: number;
    elapsed: number;
    /** Arena coordinates. Effects used to be placed in screen space and never
     *  moved again, so a spark slid across the stage as soon as the camera
     *  followed the fighters. */
    worldX: number;
    worldY: number;
    fade: boolean;
    /** Extra frames the last image is held for. */
    hold: number;
    /** The effect rides a fighter instead of the arena. */
    follow?: { slot: 0 | 1; offsetX: number; offsetY: number };
}

/** Sparks used when a character declares none of its own. */
const FALLBACK_HIT: { light: ImpactEffect; heavy: ImpactEffect; block: ImpactEffect } = {
    light: { animation: 'luffy-fx-spark', scale: 1.9 },
    heavy: { animation: 'luffy-fx-ring', scale: 2.6 },
    block: { animation: 'luffy-fx-spark', scale: 1.4 }
};

/**
 * Draws the fight. It owns no rules: every position, every animation frame and
 * every hitbox it paints is read from the `MatchState` the simulation produced
 * for that frame. Ask it what the health is and it has to look it up.
 *
 * Animation frames are picked from the simulation's own frame counter rather
 * than played by Phaser's animation clock. A move that is active on frame 10
 * of 38 therefore *shows* its active frame on frame 10, on both machines, no
 * matter what the browser's frame rate is doing.
 */
export class FightScene extends Phaser.Scene {
    private bridge!: FightBridge;
    private manifest!: AssetManifest;
    private characterIds!: [string, string];
    private stageId!: string;

    private animations = new Map<string, ManifestAnimation>();
    private fighters: Phaser.GameObjects.Sprite[] = [];
    private shadows: Phaser.GameObjects.Ellipse[] = [];
    private projectiles = new Map<number, Phaser.GameObjects.Sprite>();
    private effects: EffectSprite[] = [];
    private background?: Phaser.GameObjects.Image;
    private floor?: Phaser.GameObjects.Rectangle;
    private debug?: Phaser.GameObjects.Graphics;
    private flash?: Phaser.GameObjects.Rectangle;

    private cameraX = 0;
    private shake = 0;
    private floorY = 452;

    /** Move each fighter is currently performing, and the effects that move has
     *  already put on screen, so a frame replayed during hitstop does not spawn
     *  the same magma fist twice. */
    private currentMove: [string | null, string | null] = [null, null];
    private spawnedEffects = new Set<string>();

    constructor() {
        super('fight');
    }

    init(config: FightSceneConfig): void {
        this.bridge = config.bridge;
        this.manifest = config.manifest;
        this.characterIds = config.characters;
        this.stageId = config.stageId;
        this.animations = animationsByKey(config.manifest);
    }

    preload(): void {
        for (const character of this.manifest.characters) {
            if (!this.textures.exists(character.texture)) {
                this.load.atlas(
                    character.texture,
                    `/atlases/${character.texture}.png`,
                    `/atlases/${character.texture}.json`
                );
            }
        }
        const stage = this.manifest.stages.find((entry) => entry.id === this.stageId);
        if (stage && !this.textures.exists(`stage-${stage.id}`)) {
            this.load.image(`stage-${stage.id}`, `/stages/${stage.image}`);
        }
    }

    create(): void {
        const stage = findStage(this.stageId);
        this.floorY = stage.floorY;

        this.cameras.main.setBackgroundColor('#05060a');
        this.cameras.main.setRoundPixels(true);

        if (this.textures.exists(`stage-${stage.id}`)) {
            this.background = this.add
                .image(0, VIEW_HEIGHT, `stage-${stage.id}`)
                .setOrigin(0, 1)
                .setDepth(-20);
        }

        // A tint over the backdrop keeps the sprites readable on the busier
        // stages without repainting six pixel-art scenes.
        this.add
            .rectangle(0, 0, VIEW_WIDTH, VIEW_HEIGHT, stage.overlayColor, stage.overlayAlpha)
            .setOrigin(0, 0)
            .setDepth(-15);

        this.floor = this.add
            .rectangle(0, this.floorY, VIEW_WIDTH, VIEW_HEIGHT - this.floorY, 0x05070d, 0.82)
            .setOrigin(0, 0)
            .setDepth(-10);

        for (let slot = 0; slot < 2; slot += 1) {
            this.shadows.push(
                this.add.ellipse(0, this.floorY, 70, 16, 0x000000, 0.42).setDepth(1)
            );
            const sprite = this.add.sprite(0, this.floorY, this.characterIds[slot] ?? 'luffy');
            sprite.setOrigin(0.5, 1).setDepth(10 + slot);
            this.fighters.push(sprite);
        }

        this.debug = this.add.graphics().setDepth(50);
        this.flash = this.add
            .rectangle(0, 0, VIEW_WIDTH, VIEW_HEIGHT, 0xffffff, 0)
            .setOrigin(0, 0)
            .setDepth(60);

        this.scale.on('resize', () => this.cameras.resize(VIEW_WIDTH, VIEW_HEIGHT));
    }

    override update(_time: number, delta: number): void {
        if (!this.bridge.paused) {
            this.bridge.tick?.(delta);
        }
        const state = this.bridge.state;
        if (!state) {
            return;
        }

        this.consumeEvents(this.bridge.events.splice(0, this.bridge.events.length));
        this.updateCamera(state);
        this.updateFighters(state);
        this.updateProjectiles(state);
        this.updateEffects(delta, state);
        this.drawDebug(state);
    }

    // ------------------------------------------------------------------ camera

    private updateCamera(state: MatchState): void {
        const a = toPx(state.fighters[0].x);
        const b = toPx(state.fighters[1].x);
        const midpoint = (a + b) / 2;
        const target = Phaser.Math.Clamp(midpoint - VIEW_WIDTH / 2, 0, ARENA_WIDTH - VIEW_WIDTH);
        // Eased rather than locked: a camera nailed to the midpoint jitters on
        // every pushback frame.
        this.cameraX += (target - this.cameraX) * 0.16;

        if (this.shake > 0) {
            this.shake *= 0.86;
            if (this.shake < 0.4) {
                this.shake = 0;
            }
        }

        const stage = findStage(this.stageId);
        const jitterX = this.shake > 0 ? (Math.random() - 0.5) * this.shake : 0;
        const jitterY = this.shake > 0 ? (Math.random() - 0.5) * this.shake : 0;

        if (this.background) {
            this.background.x = Math.round(-this.cameraX * stage.parallax + jitterX * 0.4);
            this.background.y = Math.round(VIEW_HEIGHT + jitterY * 0.4);
        }
        if (this.floor) {
            this.floor.y = this.floorY;
        }
        this.cameraOffset = { x: Math.round(this.cameraX - jitterX), y: Math.round(-jitterY) };
    }

    private cameraOffset = { x: 0, y: 0 };

    // ---------------------------------------------------------------- fighters

    private characterOf(slot: 0 | 1): CharacterDefinition | undefined {
        return ROSTER[this.characterIds[slot] ?? ''];
    }

    /** Which animation a fighter is showing, and how far into it. */
    private animationFor(
        fighter: FighterState,
        character: CharacterDefinition
    ): { key: string; progress: number; loop: boolean; move?: MoveDefinition } {
        const names = character.animations;
        switch (fighter.state) {
            case 'attack': {
                const move = character.moves.find((entry) => entry.id === fighter.moveId);
                if (move) {
                    return {
                        key: move.animation,
                        progress: Phaser.Math.Clamp(fighter.stateFrame / Math.max(1, move.duration), 0, 1),
                        loop: false,
                        move
                    };
                }
                return { key: names.idle, progress: 0, loop: true };
            }
            case 'walk':
                return { key: names.walk, progress: 0, loop: true };
            case 'walkBack':
                return { key: names.walkBack, progress: 0, loop: true };
            case 'jumpRise':
            case 'jumpFall':
                return { key: names.jumpRise, progress: Phaser.Math.Clamp(fighter.stateFrame / 26, 0, 1), loop: false };
            case 'land':
                return { key: names.land, progress: 0, loop: true };
            case 'hitstun':
            case 'airHitstun':
                return { key: names.hurt, progress: Phaser.Math.Clamp(fighter.stateFrame / 10, 0, 1), loop: false };
            case 'blockstun':
                return { key: names.guard, progress: 0, loop: true };
            case 'knockdown':
                return { key: names.knockdown, progress: Phaser.Math.Clamp(fighter.stateFrame / 30, 0, 1), loop: false };
            case 'wakeup':
                return { key: names.knockdown, progress: 1, loop: false };
            case 'victory':
                return { key: names.victory, progress: 0, loop: true };
            case 'defeat':
                return { key: names.defeat, progress: 1, loop: false };
            default:
                return {
                    key: fighter.guarding ? names.guard : names.idle,
                    progress: 0,
                    loop: true
                };
        }
    }

    /**
     * Which frame of an attack shows on a given frame of the move.
     *
     * Stretching the animation evenly over the move — what this used to do —
     * puts whatever frame happens to fall there on screen when the hitbox
     * opens, and it never fell right: every move in the roster displayed a
     * wind-up frame on its own first active frame, so blows landed before the
     * limb had moved and the sprite struck once the hitbox had closed.
     *
     * So the animation is pinned instead. `impactFrame` is placed exactly on
     * the first active frame; the wind-up is spread over the startup; the
     * follow-through then runs at the animation's own rate and holds its last
     * image through the recovery. Range and impact read as one thing again.
     */
    private attackFrameIndex(
        move: MoveDefinition,
        animation: ManifestAnimation,
        stateFrame: number
    ): number {
        const count = animation.frames.length;
        const impact = Phaser.Math.Clamp(
            move.impactFrame ?? Math.round((count - 1) / 2),
            0,
            count - 1
        );
        const startup = Math.max(1, move.startup);
        if (stateFrame <= startup) {
            return Phaser.Math.Clamp(Math.round((impact * stateFrame) / startup), 0, count - 1);
        }
        // After the blow, the frames that are left are spread over the frames
        // of the move that are left, so the animation finishes exactly when
        // the move does. Playing the tail at its own rate instead would reach
        // the last drawing halfway through the recovery and hold it there,
        // which is what made every heavy attack end on a frozen pose.
        const tail = count - 1 - impact;
        if (tail <= 0) {
            return count - 1;
        }
        const span = Math.max(1, move.duration - startup);
        const elapsed = Math.round((tail * (stateFrame - startup)) / span);
        return Phaser.Math.Clamp(impact + elapsed, 0, count - 1);
    }

    private frameNameFor(
        animation: ManifestAnimation,
        progress: number,
        loop: boolean,
        clock: number,
        move?: MoveDefinition,
        stateFrame = 0
    ): string {
        const count = animation.frames.length;
        if (count === 0) {
            return '';
        }
        let index: number;
        if (move) {
            index = this.attackFrameIndex(move, animation, stateFrame);
        } else if (loop) {
            index = Math.floor((clock * animation.frameRate) / 60) % count;
        } else {
            index = Phaser.Math.Clamp(Math.floor(progress * count), 0, count - 1);
        }
        return animation.frames[index] ?? animation.frames[0] ?? '';
    }

    private updateFighters(state: MatchState): void {
        for (const slot of [0, 1] as const) {
            const fighter = state.fighters[slot];
            const character = this.characterOf(slot);
            const sprite = this.fighters[slot];
            if (!character || !sprite) {
                continue;
            }

            const choice = this.animationFor(fighter, character);
            const animation = this.animations.get(choice.key);
            if (animation) {
                const frame = this.frameNameFor(
                    animation,
                    choice.progress,
                    choice.loop,
                    state.frame,
                    choice.move,
                    fighter.stateFrame
                );
                if (frame && sprite.texture.key === character.texture) {
                    if (sprite.frame.name !== frame) {
                        sprite.setFrame(frame);
                    }
                } else if (frame) {
                    sprite.setTexture(character.texture, frame);
                }
            }

            this.updateMoveEffects(slot, fighter, choice.move);

            const x = toPx(fighter.x) - this.cameraOffset.x;
            const y = this.floorY - toPx(fighter.y) + this.cameraOffset.y;
            sprite.setPosition(Math.round(x), Math.round(y));
            // A row the rip drew facing the other way has to be mirrored back
            // before the facing flip, or the move plays out of the fighter's
            // back.
            sprite.setFlipX((fighter.facing === -1) !== (animation?.flip ?? false));
            sprite.setScale(character.stats.spriteScale);

            // Hitstop is the frame the game stops to let a hit land; showing it
            // as a flash is what makes a heavy hit read as heavy.
            // Phaser 4 separates the tint colour from the tint mode, so the
            // white flash is a FILL tint rather than the old `setTintFill`.
            if (fighter.hitstop > 0 && fighter.state !== 'attack') {
                sprite.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);
            } else if (fighter.invuln > 0 && state.frame % 6 < 3) {
                sprite.setTint(0x88aaff).setTintMode(Phaser.TintModes.MULTIPLY);
            } else {
                sprite.clearTint();
            }
            sprite.setAlpha(fighter.state === 'intro' ? 0.92 : 1);

            const shadow = this.shadows[slot];
            if (shadow) {
                const height = toPx(fighter.y);
                shadow.setPosition(Math.round(x), this.floorY + 2);
                shadow.setScale(Phaser.Math.Clamp(1 - height / 420, 0.45, 1));
                shadow.setAlpha(Phaser.Math.Clamp(0.45 - height / 900, 0.12, 0.45));
            }
        }
    }

    // ------------------------------------------------------------- projectiles

    private projectileMove(specId: string): MoveDefinition | undefined {
        for (const slot of [0, 1] as const) {
            const character = this.characterOf(slot);
            const move = character?.moves.find((entry) => entry.id === specId);
            if (move?.projectile) {
                return move;
            }
        }
        return undefined;
    }

    private updateProjectiles(state: MatchState): void {
        const alive = new Set<number>();

        for (const projectile of state.projectiles) {
            alive.add(projectile.id);
            const move = this.projectileMove(projectile.specId);
            const spec = move?.projectile;
            if (!spec) {
                continue;
            }
            const animation = this.animations.get(spec.animation);
            if (!animation) {
                continue;
            }
            const texture = spec.animation.split('-')[0] ?? '';

            let sprite = this.projectiles.get(projectile.id);
            if (!sprite) {
                sprite = this.add.sprite(0, 0, texture).setDepth(9);
                sprite.setOrigin(0.5, 0.5);
                this.projectiles.set(projectile.id, sprite);
            }

            const age = spec.lifetime - projectile.life;
            const frame = animation.frames[Math.floor((age * animation.frameRate) / 60) % animation.frames.length];
            if (frame) {
                sprite.setTexture(texture, frame);
            }
            sprite.setPosition(
                Math.round(toPx(projectile.x) - this.cameraOffset.x),
                Math.round(this.floorY - toPx(projectile.y) + this.cameraOffset.y)
            );
            sprite.setFlipX(projectile.facing === -1);
            sprite.setScale(spec.scale ?? 2);
        }

        for (const [id, sprite] of this.projectiles) {
            if (!alive.has(id)) {
                sprite.destroy();
                this.projectiles.delete(id);
            }
        }
    }

    // ----------------------------------------------------------------- effects

    /**
     * Puts an effect on the arena. `worldX` and `worldY` are arena coordinates
     * — x from the left wall, y above the floor — not screen ones, so the
     * effect stays where it was put while the camera moves.
     */
    private spawnEffect(
        key: string,
        worldX: number,
        worldY: number,
        scale: number,
        options: {
            fade?: boolean;
            behind?: boolean;
            hold?: number;
            flip?: boolean;
            follow?: { slot: 0 | 1; offsetX: number; offsetY: number };
        } = {}
    ): void {
        const animation = this.animations.get(key);
        if (!animation || animation.frames.length === 0) {
            return;
        }
        const texture = key.split('-')[0] ?? 'luffy';
        if (!this.textures.exists(texture)) {
            return;
        }
        const sprite = this.add
            .sprite(0, 0, texture, animation.frames[0])
            .setDepth(options.behind ? 5 : 30);
        sprite.setOrigin(0.5, 0.5).setScale(scale).setFlipX(options.flip ?? false);
        this.effects.push({
            sprite,
            animation,
            frame: 0,
            elapsed: 0,
            worldX,
            worldY,
            fade: options.fade ?? true,
            hold: options.hold ?? 0,
            ...(options.follow ? { follow: options.follow } : {})
        });
    }

    /**
     * Spawns the effects a move declares, once each. A move's frame counter
     * stands still during hitstop and can be read several times on the same
     * value, so the spawn is keyed rather than compared for equality — and the
     * comparison is `>=`, so an effect is not lost when the browser drops a
     * frame between two simulation steps.
     */
    private updateMoveEffects(slot: 0 | 1, fighter: FighterState, move?: MoveDefinition): void {
        const active = fighter.state === 'attack' ? (move?.id ?? null) : null;
        if (this.currentMove[slot] !== active) {
            for (const key of [...this.spawnedEffects]) {
                if (key.startsWith(`${slot}:`)) {
                    this.spawnedEffects.delete(key);
                }
            }
            this.currentMove[slot] = active;
        }
        if (!move?.effects || fighter.state !== 'attack') {
            return;
        }

        move.effects.forEach((effect, index) => {
            const key = `${slot}:${move.id}:${index}`;
            if (fighter.stateFrame < effect.frame || this.spawnedEffects.has(key)) {
                return;
            }
            this.spawnedEffects.add(key);
            const forward = fighter.facing;
            this.spawnEffect(
                effect.animation,
                toPx(fighter.x) + forward * effect.offsetX,
                toPx(fighter.y) + effect.offsetY,
                effect.scale ?? 2,
                {
                    fade: effect.fade ?? false,
                    behind: effect.behind ?? false,
                    hold: effect.hold ?? 0,
                    flip: forward === -1,
                    ...(effect.follow
                        ? { follow: { slot, offsetX: effect.offsetX, offsetY: effect.offsetY } }
                        : {})
                }
            );
        });
    }

    private updateEffects(delta: number, state: MatchState): void {
        for (let index = this.effects.length - 1; index >= 0; index -= 1) {
            const effect = this.effects[index];
            if (!effect) {
                continue;
            }
            effect.elapsed += delta;
            const count = effect.animation.frames.length;
            const frame = Math.floor((effect.elapsed / 1000) * effect.animation.frameRate);
            if (frame >= count + effect.hold) {
                effect.sprite.destroy();
                this.effects.splice(index, 1);
                continue;
            }
            const shown = Math.min(frame, count - 1);
            if (shown !== effect.frame) {
                effect.frame = shown;
                const name = effect.animation.frames[shown];
                if (name) {
                    effect.sprite.setFrame(name);
                }
            }

            if (effect.follow) {
                const owner = state.fighters[effect.follow.slot];
                effect.worldX = toPx(owner.x) + owner.facing * effect.follow.offsetX;
                effect.worldY = toPx(owner.y) + effect.follow.offsetY;
                effect.sprite.setFlipX(owner.facing === -1);
            }
            effect.sprite.setPosition(
                Math.round(effect.worldX - this.cameraOffset.x),
                Math.round(this.floorY - effect.worldY + this.cameraOffset.y)
            );
            effect.sprite.setAlpha(effect.fade ? 1 - frame / (count + effect.hold + 1) : 1);
        }
    }

    /**
     * The spark a blow leaves. Every hit in the game used to draw Luffy's, so
     * Akainu's magma and Crocodile's sand landed as a puff of rubber smoke. A
     * move may name its own; otherwise the fighter's does.
     */
    private impactEffectFor(slot: 0 | 1, moveId: string | undefined, heavy: boolean): ImpactEffect {
        const character = this.characterOf(slot);
        const move = moveId ? character?.moves.find((entry) => entry.id === moveId) : undefined;
        const declared = move?.impactEffect ?? (heavy ? character?.hitEffects?.heavy : character?.hitEffects?.light);
        return declared ?? (heavy ? FALLBACK_HIT.heavy : FALLBACK_HIT.light);
    }

    private consumeEvents(events: CombatEvent[]): void {
        for (const event of events) {
            switch (event.type) {
                case 'hit': {
                    const spark = this.impactEffectFor(event.attacker, event.moveId, event.heavy);
                    this.spawnEffect(spark.animation, event.x, event.y, spark.scale);
                    this.shake = Math.max(this.shake, event.heavy ? 7 : 3);
                    break;
                }
                case 'block': {
                    const character = this.characterOf(event.victim);
                    const spark = character?.hitEffects?.block ?? FALLBACK_HIT.block;
                    this.spawnEffect(spark.animation, event.x, event.y, spark.scale);
                    break;
                }
                case 'super': {
                    this.flashScreen(SLOT_TINT[event.fighter] ?? 0xffffff, 0.55);
                    this.shake = Math.max(this.shake, 10);
                    break;
                }
                case 'shake':
                    this.shake = Math.max(this.shake, event.strength);
                    break;
                case 'ko':
                    this.flashScreen(0xffffff, 0.7);
                    break;
                default:
                    break;
            }
        }
    }

    private flashScreen(colour: number, alpha: number): void {
        if (!this.flash) {
            return;
        }
        this.flash.setFillStyle(colour, alpha);
        this.tweens.add({ targets: this.flash, fillAlpha: 0, duration: 260, ease: 'Quad.easeOut' });
    }

    // ------------------------------------------------------------------- debug

    private drawDebug(state: MatchState): void {
        if (!this.debug) {
            return;
        }
        this.debug.clear();
        if (!this.bridge.showHitboxes) {
            return;
        }

        const draw = (
            box: { left: number; right: number; bottom: number; top: number },
            colour: number
        ): void => {
            this.debug?.lineStyle(1, colour, 0.9);
            this.debug?.strokeRect(
                box.left - this.cameraOffset.x,
                this.floorY - box.top + this.cameraOffset.y,
                box.right - box.left,
                box.top - box.bottom
            );
        };

        for (const slot of [0, 1] as const) {
            const fighter = state.fighters[slot];
            const character = this.characterOf(slot);
            if (!character) {
                continue;
            }
            const hurt = fighter.airborne
                ? character.hurtbox.air
                : fighter.state === 'knockdown'
                  ? character.hurtbox.down
                  : character.hurtbox.standing;
            draw(resolveBox(hurt, toPx(fighter.x), toPx(fighter.y), fighter.facing), 0x43e08a);
            draw(resolveBox(character.pushbox, toPx(fighter.x), toPx(fighter.y), 1), 0x8b96b4);

            if (fighter.state === 'attack' && fighter.moveId) {
                const move = character.moves.find((entry) => entry.id === fighter.moveId);
                const active =
                    move?.active.some(
                        (window) => fighter.stateFrame >= window[0] && fighter.stateFrame <= window[1]
                    ) ?? false;
                if (move && active) {
                    draw(resolveBox(move.hitbox, toPx(fighter.x), toPx(fighter.y), fighter.facing), 0xff3d5e);
                }
            }
        }
    }
}
