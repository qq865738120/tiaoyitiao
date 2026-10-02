/** Synchronous, injectable subset of Creator sys.localStorage; no cc/global dependency. */
export interface StoragePort {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}

export const BEST_SCORE_KEY = 'jump:4856b445-bfe4-49c2-8933-59e229f06792:best:v1';

/** Best score belongs to this project only. Storage failure never aborts a run. */
export class StorageAdapter {
    readonly key: string = BEST_SCORE_KEY;
    private value = 0;
    private error: string | null = null;
    private pendingWrite = false;

    constructor(private readonly storage: StoragePort) {
        let raw: string | null;
        try { raw = storage.getItem(this.key); }
        catch (_) { this.error = 'storage-read-failed'; return; }
        if (raw === null) return;
        try {
            const parsed: unknown = JSON.parse(raw);
            if (!this.validScore(parsed)) { this.error = 'invalid-stored-score'; return; }
            this.value = parsed;
        } catch (_) { this.error = 'invalid-stored-score'; }
    }

    get best(): number { return this.value; }
    get lastError(): string | null { return this.error; }

    /** true means the current max needs no further write, not that score increased. */
    record(score: number): boolean {
        if (!this.validScore(score)) { this.error = 'invalid-score'; return false; }
        if (score > this.value) { this.value = score; this.pendingWrite = true; }
        if (!this.pendingWrite) return true;
        try {
            this.storage.setItem(this.key, JSON.stringify(this.value));
            this.pendingWrite = false; this.error = null;
            return true;
        } catch (_) { this.error = 'storage-write-failed'; return false; }
    }

    /** Failed removal retains memory/pending state; callers must inspect the result. */
    reset(): boolean {
        try { this.storage.removeItem(this.key); }
        catch (_) { this.error = 'storage-remove-failed'; return false; }
        this.value = 0; this.pendingWrite = false; this.error = null;
        return true;
    }

    private validScore(score: unknown): score is number {
        return typeof score === 'number' && Number.isFinite(score) && Number.isInteger(score) && score >= 0;
    }
}
