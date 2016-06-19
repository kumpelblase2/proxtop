const Promise = require('bluebird');

class CacheController {
    constructor(cacheTime, refresh, mapping = () => '__default') {
        this.values = new Map();
        this.cacheTime = cacheTime;
        this.refresh = refresh;
        this.mapping = mapping;
    }

    get(...args) {
        const mappedValue = this.mapping(...args);
        const lastResult = this.values.get(mappedValue);

        if(isFresh(lastResult, this.cacheTime)) {
            return Promise.resolve(lastResult.value);
        } else {
            return this.update(mappedValue, ...args);
        }
    }

    update(mappedValue, ...args) {
        return this.refresh(...args).then((value) => {
            const newValue = {
                accessTime: Date.now(),
                value: value
            };
            this.values.set(mappedValue, newValue);
            return value;
        });
    }
}

function isFresh(result, maxTime) {
    return !!result && !!result.value && Date.now() - result.accessTime < maxTime;
}

module.exports = CacheController;