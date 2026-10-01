export interface XZ { readonly x: number; readonly z: number; }
export interface FootPosition extends XZ { readonly y: number; }
export type ModelKey = 'block_00' | 'block_01' | 'block_03' | 'block_04' | 'block_08' | 'block_11' | 'block_12' | 'block_33' | 'block_34' | 'block_35';

export interface GameConfig {
    readonly configVersion: string;
    readonly seed: number;
    readonly fixedStepSeconds: number;
    readonly maxTicksPerFrame: number;
    readonly minChargeSeconds: number;
    readonly maxChargeSeconds: number;
    readonly minJumpDistance: number;
    readonly maxJumpDistance: number;
    readonly verticalVelocity: number;
    readonly gravity: number;
    readonly platformWidth: number;
    readonly platformDepth: number;
    readonly platformHeight: number;
    readonly minPlatformScale: number;
    readonly maxPlatformScale: number;
    readonly minEdgeGap: number;
    readonly maxEdgeGap: number;
    readonly safeRadius: number;
    readonly centerRadius: number;
    readonly geometryEpsilon: number;
    readonly cameraMoveSeconds: number;
    readonly initialTargetDistance: number;
    readonly platformPoolLimit: number;
    readonly normalScore: number;
    readonly centerScoreMultiplier: number;
    readonly maxRewardStreak: number;
    readonly modelKeys: readonly ModelKey[];
}
interface PlatformBase {
    readonly id: number;
    readonly centerXZ: XZ;
    readonly topY: number;
    readonly modelKey: ModelKey;
    readonly horizontalScale: number;
}
export type PlatformSpec = PlatformBase & (
    { readonly shape: 'rect'; readonly halfExtent: XZ; } |
    { readonly shape: 'circle'; readonly radius: number; }
);
export type ActivePhase = 'ready' | 'charging' | 'airborne' | 'landing' | 'recentering' | 'falling';
export type Phase = 'menu' | ActivePhase | 'paused' | 'gameover';
export interface CallbackToken { readonly runId: number; readonly jumpId?: number; }
export interface JumpToken extends CallbackToken { readonly jumpId: number; }
export interface JumpPlan extends JumpToken {
    readonly startFoot: FootPosition;
    readonly directionXZ: XZ;
    readonly startTick: number;
    readonly distance: number;
    readonly flightTime: number;
    readonly targetId: number;
}
export type JumpPlanDraft = Omit<JumpPlan, 'runId' | 'jumpId' | 'startTick'>;
export type LandingOutcome = 'target' | 'current';
export interface RunState {
    readonly runId: number;
    readonly phase: Phase;
    readonly resumePhase: Exclude<ActivePhase, 'charging'> | null;
    readonly tick: number;
    readonly seed: number;
    readonly score: number;
    readonly streak: number;
    readonly currentId: number | null;
    readonly targetId: number | null;
    readonly jumpId: number | null;
    readonly chargeStartTick: number | null;
    readonly inputOwner: string | null;
    readonly jumpPlan: JumpPlan | null;
    readonly landingOutcome: LandingOutcome | null;
}
interface EventBase { readonly runId: number; readonly tick: number; }
export type DomainEvent = EventBase & (
    { readonly type: 'Started'; readonly seed: number; } |
    { readonly type: 'Charge'; readonly action: 'begin' | 'cancel'; readonly source: string; readonly reason?: string; } |
    { readonly type: 'Jump'; readonly jumpId: number; readonly plan: JumpPlan; } |
    { readonly type: 'Landed'; readonly jumpId: number; readonly outcome: LandingOutcome; } |
    { readonly type: 'Scored'; readonly jumpId: number; readonly delta: number; readonly score: number; readonly streak: number; } |
    { readonly type: 'Failed'; readonly jumpId: number; readonly reason: string; } |
    { readonly type: 'Paused'; readonly resumePhase: Exclude<ActivePhase, 'charging'>; readonly reason: string; } |
    { readonly type: 'Resumed'; readonly phase: Exclude<ActivePhase, 'charging'>; } |
    { readonly type: 'Returned'; }
);
export interface ReplayInput {
    readonly tick: number;
    readonly type: 'press' | 'release' | 'cancel' | 'pause' | 'resume';
    readonly source: string;
}
export interface ReplayResult {
    readonly tick: number;
    readonly jumpId: number;
    readonly classification: 'target-normal' | 'target-center' | 'current' | 'miss';
    readonly foot: FootPosition;
    readonly score: number;
    readonly streak: number;
}
export interface ReplayRecord {
    readonly configVersion: string;
    readonly seed: number;
    readonly inputs: readonly ReplayInput[];
    readonly results: readonly ReplayResult[];
}
