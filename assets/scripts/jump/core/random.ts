import { normalizeSeed } from './config';

export class Xorshift32 {
    private state: number;
    constructor(seed: number) { this.state = normalizeSeed(seed); }
    get currentState(): number { return this.state; }
    nextUint32(): number {
        let s = this.state;
        s ^= s << 13;
        s ^= s >>> 17;
        s ^= s << 5;
        this.state = s >>> 0;
        return this.state;
    }
    next(): number { return this.nextUint32() / 4294967296; }
}
