import { ULTIMATE_COST } from '../engine/match';
import { getChar } from '../engine/registry';
import { BTN, PX, type FighterState, type MatchState } from '../engine/types';

/**
 * The computer opponent. It reads the same state a player sees on screen and
 * answers with button bits, one tick at a time, exactly like a keyboard: it
 * cannot touch the state, read the other side's inputs, or act faster than
 * its reaction time allows.
 */

type Step = { bits: number; ticks: number };

export interface CpuLevel {
    /** Ticks between noticing something and reacting to it. */
    reaction: number;
    /** Chance of blocking an attack it has noticed. */
    block: number;
    /** Chance of anti-airing a jump. */
    antiAir: number;
    /** Chance of finishing a combo once a hit lands. */
    combo: number;
    /** How often it acts at all when nothing happens (0..1 per decision). */
    aggression: number;
}

export const LEVELS: CpuLevel[] = [
    { reaction: 22, block: 0.2, antiAir: 0.1, combo: 0.25, aggression: 0.35 },
    { reaction: 16, block: 0.45, antiAir: 0.3, combo: 0.5, aggression: 0.5 },
    { reaction: 11, block: 0.65, antiAir: 0.55, combo: 0.75, aggression: 0.6 },
    { reaction: 7, block: 0.82, antiAir: 0.75, combo: 0.92, aggression: 0.7 },
    { reaction: 5, block: 0.92, antiAir: 0.88, combo: 0.98, aggression: 0.78 }
];

export class Cpu {
    private plan: Step[] = [];
    private wait = 0;
    private seed: number;
    /** What the CPU saw `reaction` ticks ago: it acts on the past. */
    private memory: { oppMode: string; oppMove: string | null; oppY: number; oppFrame: number; dist: number }[] = [];
    private blocking = 0;

    constructor(readonly level: CpuLevel, seed = 1) {
        this.seed = seed * 7919 + 13;
    }

    private rand(): number {
        this.seed = (this.seed * 48271) % 2147483647;
        return this.seed / 2147483647;
    }

    private fwd(me: FighterState): number { return me.facing === 1 ? BTN.right : BTN.left; }
    private back(me: FighterState): number { return me.facing === 1 ? BTN.left : BTN.right; }

    private push(...steps: [number, number][]): void {
        for (const [bits, ticks] of steps) this.plan.push({ bits, ticks });
    }

    /** Press a button with a direction, then release. */
    private press(dir: number, btn: number, after = 6): void {
        this.push([dir, 1], [dir | btn, 2], [0, after]);
    }

    private qcf(me: FighterState, btn: number): void {
        const f = this.fwd(me);
        this.push([BTN.down, 2], [BTN.down | f, 2], [f, 1], [f | btn, 2], [0, 10]);
    }

    private dp(me: FighterState, btn: number): void {
        const f = this.fwd(me);
        this.push([f, 2], [BTN.down, 2], [BTN.down | f, 1], [BTN.down | f | btn, 2], [0, 12]);
    }

    next(state: MatchState, side: 0 | 1): number {
        const me = state.fighters[side];
        const opp = state.fighters[1 - side];
        const dist = Math.abs(opp.x - me.x) / PX;
        this.memory.push({ oppMode: opp.mode, oppMove: opp.move, oppY: opp.y, oppFrame: opp.frame, dist });
        if (this.memory.length > 40) this.memory.shift();
        if (state.phase !== 'fight') { this.plan = []; return 0; }

        // Running plan first (combos, motions).
        if (this.plan.length) {
            const step = this.plan[0];
            step.ticks--;
            if (step.ticks <= 0) this.plan.shift();
            return step.bits;
        }

        const seen = this.memory[Math.max(0, this.memory.length - 1 - this.level.reaction)];
        const free = ['idle', 'walk', 'crouch', 'land', 'blockstun'].includes(me.mode);

        // Keep blocking while the threat lasts.
        if (this.blocking > 0) {
            this.blocking--;
            const low = opp.move === 'crouchLight' || opp.move === 'crouchHeavy';
            return this.back(me) | (low ? BTN.down : 0);
        }

        // Combo: we hit them, keep going.
        if (me.mode === 'move' && me.connected && opp.mode === 'hitstun' && this.rand() < this.level.combo) {
            this.continueCombo(me);
            return 0;
        }

        if (!free) return 0;
        if (this.wait > 0) { this.wait--; return this.walkBits(me, dist); }

        // Defence: an attack started a reaction time ago, and it is close.
        const threat = seen && seen.oppMode === 'move' && seen.dist < 110;
        const projectile = state.projectiles.some((p) => p.owner !== side && Math.abs(p.x - me.x) / PX < 120);
        if ((threat || projectile) && this.rand() < this.level.block) {
            this.blocking = 14;
            const low = opp.move === 'crouchLight' || opp.move === 'crouchHeavy';
            return this.back(me) | (low ? BTN.down : 0);
        }

        // Anti-air: they jumped towards us.
        if (seen && seen.oppY > 20 * PX && dist < 90 && this.rand() < this.level.antiAir) {
            if (this.rand() < 0.5) this.dp(me, BTN.special);
            else this.press(this.back(me), BTN.heavy, 12);
            return 0;
        }

        // Punish: they whiffed something big right in front of us.
        if (opp.mode === 'move' && !opp.connected && dist < 70 && opp.frame > 2 && this.rand() < this.level.combo) {
            this.openCombo(dist);
            return 0;
        }

        // Ultimate when it will connect.
        if (me.meter >= ULTIMATE_COST && dist < 70 && (opp.mode === 'move' || opp.mode === 'land') && this.rand() < 0.6) {
            this.push([BTN.heavy | BTN.special, 2], [0, 20]);
            return 0;
        }

        if (this.rand() > this.level.aggression) {
            this.wait = 6 + Math.floor(this.rand() * 18);
            return this.walkBits(me, dist);
        }
        this.neutral(me, opp, dist);
        return 0;
    }

    private walkBits(me: FighterState, dist: number): number {
        // Drift to a comfortable range: close enough to poke, not glued.
        if (dist > 95) return this.fwd(me);
        if (dist < 40 && this.rand() < 0.3) return this.back(me);
        return 0;
    }

    private neutral(me: FighterState, opp: FighterState, dist: number): void {
        const def = getChar(me.char);
        const hasProjectile = !!def.moves.specialN.projectile;
        const r = this.rand();
        if (dist > 150) {
            if (hasProjectile && r < 0.45) this.qcf(me, BTN.special);
            else if (r < 0.7) this.push([this.fwd(me), 1], [0, 2], [this.fwd(me), 1], [this.fwd(me), 10], [0, 2]); // dash
            else this.push([this.fwd(me), 20]);
            return;
        }
        if (dist > 70) {
            if (hasProjectile && r < 0.3) this.qcf(me, BTN.special);
            else if (r < 0.5) this.push([this.fwd(me), 16]);
            else if (r < 0.7) {
                // Jump in with a heavy.
                this.push([BTN.up | this.fwd(me), 4], [0, 14], [BTN.heavy, 2], [0, 20]);
            } else if (r < 0.85) this.press(this.fwd(me), BTN.special, 18);
            else this.push([this.fwd(me), 1], [0, 2], [this.fwd(me), 1], [this.fwd(me), 8], [0, 1]);
            return;
        }
        // Close.
        if (r < 0.15 && opp.mode !== 'move') this.push([BTN.light | BTN.heavy, 2], [0, 20]); // throw
        else if (r < 0.45) this.openCombo(dist);
        else if (r < 0.6) this.press(BTN.down, BTN.heavy, 20); // sweep
        else if (r < 0.72) this.press(this.fwd(me), BTN.heavy, 20); // overhead
        else if (r < 0.85) this.press(BTN.down, BTN.light, 10);
        else this.push([this.back(me), 14]);
    }

    private openCombo(dist: number): void {
        if (dist < 45) this.push([0, 1], [BTN.light, 2], [0, 6], [BTN.light, 2], [0, 6]);
        else this.push([0, 1], [BTN.heavy, 2], [0, 10]);
    }

    private continueCombo(me: FighterState): void {
        const f = this.fwd(me);
        switch (me.move) {
            case 'lightA': this.push([BTN.light, 2], [0, 5]); break;
            case 'lightB': this.push([BTN.light, 2], [0, 5]); break;
            case 'lightC':
            case 'heavy':
            case 'crouchLight':
                if (this.rand() < 0.5) this.push([f | BTN.special, 2], [0, 20]);
                else this.push([BTN.down, 2], [BTN.down | BTN.special, 2], [0, 20]);
                break;
            default:
                if (me.meter >= ULTIMATE_COST && this.rand() < 0.5) this.push([BTN.heavy | BTN.special, 2], [0, 30]);
        }
    }
}

/** Training dummy behaviours. */
export type DummyMode = 'stand' | 'crouch' | 'guard' | 'jump' | 'cpu';

export function dummyBits(mode: DummyMode, me: FighterState, tick: number): number {
    const back = me.facing === 1 ? BTN.left : BTN.right;
    switch (mode) {
        case 'stand': return 0;
        case 'crouch': return BTN.down;
        case 'guard': return back | (tick % 120 < 60 ? BTN.down : 0);
        case 'jump': return me.y === 0 && tick % 50 === 0 ? BTN.up : 0;
        default: return 0;
    }
}
