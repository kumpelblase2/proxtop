import * as Promise from "bluebird";
import translate from "../translation";
import windowManager from "../ui/window_manager";
import Log from "../util/log";
import { Errors } from "../globals";

const PERIOD_TIME = 30000;
const REQUESTS_PER_PERIOD = 10;

function currentTime() {
    return Date.now();
}

export default class APILimiter {
    lastPeriod = 0;
    requests = 0;
    hasDisplayedWarning = false;
    translation = translate();

    makeRequest() {
        if(this._isPeriodTimedOut()) {
            this._beginPeriod();
        }

        this.requests = this.requests + 1;

        if(this.requests >= REQUESTS_PER_PERIOD) {
            Log.warn("Max requests reached! Requests are getting delayed.");
            if(!this.hasDisplayedWarning) {
                this.hasDisplayedWarning = true;
                windowManager.notifyWindow('error', this.translation.get(Errors.SEVERITY.WARNING), this.translation.get(Errors.PROXER.API_LIMIT_REACHED));
            }
        }
    }

    awaitFreeLimit() {
        if(this.canMakeRequest()) {
            return Promise.resolve();
        } else {
            const requiredDelay = PERIOD_TIME - (currentTime() - this.lastPeriod);
            Log.info("We're at the limit! Queueing request for " + requiredDelay + "ms");
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
        Log.debug("Starting new API limit period.");
    }

    _isPeriodTimedOut() {
        return currentTime() - this.lastPeriod > PERIOD_TIME;
    }
}
