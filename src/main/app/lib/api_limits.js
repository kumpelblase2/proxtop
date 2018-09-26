const Promise = require('bluebird');
const windowManager = require('../ui/window_manager');
const translate = require('../translation');

const PERIOD_TIME = 30000;
const REQUESTS_PER_PERIOD = 10;

function currentTime() {
    return Date.now();
}

class APILimiter {
    constructor() {
        this.lastPeriod = 0;
        this.requests = 0;
        this.hasDisplayedWarning = false;
        this.translation = translate();
    }

    makeRequest() {
        if(this._isPeriodTimedOut()) {
            this._beginPeriod();
        }

        this.requests = this.requests + 1;

        if(this.requests >= REQUESTS_PER_PERIOD) {
            LOG.warn("Max requests reached! Requests are getting delayed.");
            if(!this.hasDisplayedWarning) {
                this.hasDisplayedWarning = true;
                windowManager.notifyWindow('error', this.translation.get(ERRORS.SEVERITY.WARNING), this.translation.get(ERRORS.PROXER.API_LIMIT_REACHED));
            }
        }
    }

    awaitFreeLimit() {
        if(this.canMakeRequest()) {
            return Promise.resolve();
        } else {
            const requiredDelay = PERIOD_TIME - (currentTime() - this.lastPeriod);
            LOG.info("We're at the limit! Queueing request for " + requiredDelay + "ms");
            return Promise.delay(requiredDelay).then(() => {
                return this.awaitFreeLimit();
            });
        }
    }

    canMakeRequest() {
        return this._isPeriodTimedOut() || this.requests < REQUESTS_PER_PERIOD;
    }

    _beginPeriod() {
        this.lastPeriod = currentTime();
        this.requests = 0;
        this.hasDisplayedWarning = false;
        LOG.debug("Starting new API limit period.");
    }

    _isPeriodTimedOut() {
        return currentTime() - this.lastPeriod > PERIOD_TIME;
    }
}

module.exports = APILimiter;