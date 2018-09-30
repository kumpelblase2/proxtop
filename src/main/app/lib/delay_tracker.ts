import Log from "../util/log";

const INIT_DELAY = 5000;
const MAX_DELAY = 600000;
const DELAY_INCREASE = 5000;

export default class DelayTracker {
    initDelay: number;
    delay: number;
    maxDelay: number;
    increaseRate: number;
    failTicks: number;
    name?: string;

    constructor(initDelay: number = INIT_DELAY, maxDelay: number = MAX_DELAY, increase: number = DELAY_INCREASE) {
        this.initDelay = initDelay;
        this.delay = initDelay;
        this.maxDelay = maxDelay;
        this.increaseRate = increase;
        this.failTicks = 0;
        this.name = null;
    }

    increase() {
        this.failTicks += 1;
        this._updateDelay();
        Log.debug("Delay " + (this.name ? this.name + " " : "") + "increase");
    }

    reset() {
        this.delay = this.initDelay;
        this.failTicks = 0;
        Log.debug("Delay " + (this.name ? this.name + " " : "") + "reset");
    }

    _updateDelay() {
        const next = this.delay + this.failTicks * this.increaseRate;
        this.delay = Math.min(next, this.maxDelay);
    }
}
