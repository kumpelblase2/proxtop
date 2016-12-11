const INIT_DELAY = 5000;
const MAX_DELAY = 600000;
const DELAY_INCREASE = 5000;

class DelayTracker {
    constructor(initDelay = INIT_DELAY, maxDelay = MAX_DELAY, increase = DELAY_INCREASE) {
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
        LOG.debug("Delay " + (this.name ? this.name + " " : "") + "increase");
    }

    reset() {
        this.delay = this.initDelay;
        this.failTicks = 0;
        LOG.debug("Delay " + (this.name ? this.name + " " : "") + "reset");
    }

    _updateDelay() {
        const next = this.delay + this.failTicks * this.increaseRate;
        this.delay = Math.min(next, this.maxDelay);
    }
}

module.exports = DelayTracker;