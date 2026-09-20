/**
 * Every type the simulation exchanges with the outside world. Nothing here
 * knows about Phaser, React, sockets or the DOM — the same structures are
 * produced by the server and consumed by both clients.
 */

/** An axis-aligned box, in whole pixels, relative to a fighter's origin.
 *  The origin is between the feet: `x` grows in the direction the fighter
 *  faces, `y` grows upwards from the floor. */
export interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}

/** A box resolved into arena coordinates, ready for an overlap test. */
export interface WorldBox {
    left: number;
    right: number;
    bottom: number;
    top: number;
}

/** The coarse state a fighter is in. Animations and legal actions both derive
 *  from it, which keeps illegal transitions impossible by construction. */
export type FighterStateId =
    | 'idle'
    | 'walk'
    | 'walkBack'
    | 'guard'
    | 'jumpRise'
    | 'jumpFall'
    | 'land'
    | 'attack'
    | 'hitstun'
    | 'airHitstun'
    | 'blockstun'
    | 'knockdown'
    | 'wakeup'
    | 'victory'
    | 'defeat'
    | 'intro';

export type MoveSlot = 'light' | 'heavy' | 'special' | 'ultimate' | 'airLight' | 'airHeavy';

/** How a hit behaves when it connects. */
export interface HitProperties {
    /** Damage before combo scaling. */
    damage: number;
    /** Damage dealt through a guard. */
    chipDamage: number;
    /** Frames the victim is stunned for when hit. */
    hitstun: number;
    /** Frames the victim is stunned for when guarding. */
    blockstun: number;
    /** Impulse applied to the victim, in pixels per frame, forward/up. */
    knockbackX: number;
    knockbackY: number;
    /** Freeze applied to both fighters on contact, which is what gives a
     *  heavy hit its weight. */
    hitstop: number;
    /** Meter the attacker gains, and the meter the victim gains. */
    meterGainOnHit: number;
    meterGainOnTakeHit: number;
    /** A launcher puts the victim into the air-hitstun state. */
    launcher?: boolean;
    /** A hard knockdown ends the combo and forces a wake-up. */
    knockdown?: boolean;
    /** Cannot be blocked while standing (for a low or a command grab). */
    unblockable?: boolean;
}

/**
 * A drawing the renderer lays over a move: the magma a fist throws off, the
 * sand a hook drags behind it, the aura of a transformation.
 *
 * Nothing here is read by the simulation. Two clients that disagree about an
 * effect still agree about the fight, which is why an effect can be authored
 * freely without touching the checksum.
 */
export interface MoveEffect {
    /** Animation key, `<texture>-fx-<name>`. */
    animation: string;
    /** Frame of the move it appears on. */
    frame: number;
    /** Offset from the fighter's origin, forward and up, in pixels. */
    offsetX: number;
    offsetY: number;
    scale?: number;
    /** Track the fighter instead of staying where it was spawned. */
    follow?: boolean;
    /** Draw behind the fighter rather than in front. */
    behind?: boolean;
    /** Fade out over its lifetime. A spark should; a magma fist should not. */
    fade?: boolean;
    /** Play it once and hold the last frame for this many frames. */
    hold?: number;
}

/** The spark left where a blow connects. */
export interface ImpactEffect {
    animation: string;
    scale: number;
}

/** A projectile emitted by a move. */
export interface ProjectileSpec {
    /** Frame of the move on which it spawns. */
    spawnFrame: number;
    /** Spawn offset from the owner's origin, forward/up, in pixels. */
    offsetX: number;
    offsetY: number;
    /** Horizontal speed in pixels per frame, always forward. */
    speed: number;
    /** Vertical speed and gravity, in pixels per frame. */
    speedY?: number;
    gravity?: number;
    /** Frames before it vanishes on its own. */
    lifetime: number;
    box: Box;
    hit: HitProperties;
    /** Animation key for the renderer. */
    animation: string;
    /** How many fighters it can hit before dying. 0 means it never dies. */
    hits: number;
    /** Renderer scale hint. */
    scale?: number;
}

/** One attack. Frame data is authoritative: the animation is fitted to it,
 *  never the other way around. */
export interface MoveDefinition {
    id: string;
    name: string;
    slot: MoveSlot;
    /** Renderer animation key, `<texture>-<move>`. */
    animation: string;
    /** Total frames the move occupies, startup + active + recovery. */
    duration: number;
    /** Frames before the first active window. */
    startup: number;
    /** Active windows as [firstFrame, lastFrame] pairs, inclusive, so a
     *  multi-hit move is a list rather than a special case. */
    active: ReadonlyArray<readonly [number, number]>;
    /** Hitbox, valid during every active window. */
    hitbox: Box;
    hit: HitProperties;
    /** Meter spent when the move starts. */
    meterCost: number;
    /** Moves this one can be cancelled into, and when. */
    cancelInto: readonly string[];
    cancelWindow: readonly [number, number];
    /** Horizontal impulse applied on a given frame, in pixels per frame. */
    momentum?: { frame: number; x: number; y: number };
    /** Invulnerability window, inclusive. */
    invuln?: readonly [number, number];
    /** Only usable in the air / only usable on the ground. */
    airOnly?: boolean;
    groundOnly?: boolean;
    projectile?: ProjectileSpec;
    /** Frames of screen freeze when the move starts, for a super flash. */
    startupFreeze?: number;
    /** Renderer hint: shake the camera when this connects. */
    cameraShake?: number;
    /**
     * The frame of the animation that shows the blow landing. The renderer
     * lines it up with the first active frame, so what the player sees at the
     * moment the hitbox opens is the strike itself rather than the wind-up.
     * Without it the animation is merely stretched over the move, which is how
     * a move ends up looking short of its own range.
     */
    impactFrame?: number;
    /** Effects drawn while the move plays. */
    effects?: readonly MoveEffect[];
    /** Spark shown where this move connects, overriding the character's. */
    impactEffect?: ImpactEffect;
}

export interface FighterStats {
    maxHealth: number;
    /** Pixels per frame. */
    walkSpeed: number;
    backSpeed: number;
    jumpVelocity: number;
    jumpForward: number;
    gravity: number;
    /** Resistance to knockback: 100 is neutral, higher moves less. */
    weight: number;
    /** Frames of recovery after landing from a jump. */
    landingLag: number;
    /** Renderer scale applied to the sprite. */
    spriteScale: number;
}

export interface CharacterDefinition {
    id: string;
    name: string;
    /** Short pitch shown on the select screen. */
    tagline: string;
    /** Texture key produced by the asset pipeline. */
    texture: string;
    /** Frame used as the character's portrait. */
    portraitFrame: string;
    /** Accent colour used by the UI, as a CSS hex string. */
    color: string;
    stats: FighterStats;
    /** Hurtboxes per posture. */
    hurtbox: { standing: Box; air: Box; down: Box };
    /** Body box used to keep the two fighters from overlapping. */
    pushbox: Box;
    /** Non-attack animation keys. */
    animations: {
        idle: string;
        walk: string;
        walkBack: string;
        jumpRise: string;
        jumpFall: string;
        land: string;
        hurt: string;
        guard: string;
        knockdown: string;
        victory: string;
        defeat: string;
    };
    moves: readonly MoveDefinition[];
    /** Sparks left by this fighter's blows, unless a move overrides them.
     *  Akainu splashes magma where Crocodile scatters sand; sharing one spark
     *  between the five of them is what made every hit read the same. */
    hitEffects?: { light: ImpactEffect; heavy: ImpactEffect; block: ImpactEffect };
    /** Documented gaps in the source sprite sheet, surfaced in the UI so a
     *  reused animation is never passed off as a dedicated one. */
    spriteNotes?: readonly string[];
}

/** A live projectile. */
export interface ProjectileState {
    id: number;
    owner: 0 | 1;
    specId: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    gravity: number;
    facing: 1 | -1;
    life: number;
    hitsLeft: number;
    /** Fighters already hit, as a bitmask, so a piercing shot never
     *  double-dips on the same victim. */
    hitMask: number;
}

export interface FighterState {
    characterId: string;
    /** Fixed-point arena coordinates; y is the distance above the floor. */
    x: number;
    y: number;
    vx: number;
    vy: number;
    facing: 1 | -1;
    health: number;
    meter: number;
    state: FighterStateId;
    /** Frames spent in the current state. */
    stateFrame: number;
    /** Id of the move being performed, when state is `attack`. */
    moveId: string | null;
    /** Active windows already consumed by this move, as a bitmask. */
    hitWindows: number;
    /** Remaining frames of hitstun or blockstun. */
    stunFrames: number;
    /** True once the current move has connected, which opens its cancels. */
    connected: boolean;
    hitstop: number;
    invuln: number;
    guarding: boolean;
    airborne: boolean;
    /** Combo counter carried by the *victim*, reset when they recover. */
    comboHits: number;
    comboDamage: number;
    /** Rounds won. */
    wins: number;
    /** Last `INPUT_BUFFER_FRAMES` masks, newest first. */
    buffer: number[];
    /** Previous frame's mask, for edge detection. */
    lastInput: number;
}

export type MatchPhase = 'intro' | 'fight' | 'ko' | 'roundEnd' | 'matchEnd';

/** Everything the outcome of the fight depends on. Two identical
 *  `MatchState`s stepped with identical inputs always produce identical
 *  results — that property is what rollback reconciliation rests on. */
export interface MatchState {
    frame: number;
    phase: MatchPhase;
    phaseFrame: number;
    round: number;
    /** Frames left on the round clock. */
    timer: number;
    fighters: [FighterState, FighterState];
    projectiles: ProjectileState[];
    nextProjectileId: number;
    /** Winner of the round that just ended, or null on a double KO / timeout
     *  draw. Only meaningful during `ko`, `roundEnd` and `matchEnd`. */
    roundWinner: 0 | 1 | null;
    matchWinner: 0 | 1 | null;
    /** Global freeze, used by super flashes. */
    freeze: number;
    stageId: string;
    rng: number;
}

/** Side-effects of a frame: sounds, sparks, camera shakes. They are output
 *  only — never read back by the simulation — so they are excluded from the
 *  checksum and dropped during a rollback re-simulation. */
export type CombatEvent =
    | { type: 'hit'; attacker: 0 | 1; victim: 0 | 1; x: number; y: number; damage: number; moveId: string; heavy: boolean }
    | { type: 'block'; victim: 0 | 1; x: number; y: number }
    | { type: 'whiff'; attacker: 0 | 1; moveId: string }
    | { type: 'move'; fighter: 0 | 1; moveId: string; animation: string }
    | { type: 'jump'; fighter: 0 | 1 }
    | { type: 'land'; fighter: 0 | 1 }
    | { type: 'super'; fighter: 0 | 1; moveId: string }
    | { type: 'projectile'; id: number; owner: 0 | 1; animation: string }
    | { type: 'projectileGone'; id: number }
    | { type: 'combo'; fighter: 0 | 1; hits: number; damage: number }
    | { type: 'ko'; loser: 0 | 1 }
    | { type: 'timeout' }
    | { type: 'roundStart'; round: number }
    | { type: 'roundEnd'; winner: 0 | 1 | null }
    | { type: 'matchEnd'; winner: 0 | 1 | null }
    | { type: 'shake'; strength: number };

/** Result of one simulated frame. */
export interface StepResult {
    state: MatchState;
    events: CombatEvent[];
}

/** The two characters of a match, by slot. */
export type MatchSetup = {
    characters: [string, string];
    stageId: string;
    seed: number;
};
