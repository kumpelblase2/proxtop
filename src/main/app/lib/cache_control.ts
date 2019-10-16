import { Promise, resolve } from "bluebird";

type KeyMapper = (...values) => string;
type Refresh<T> = (...values) => Promise<T>;

type Result<T> = { accessTime: number, value: T }

export default class CacheController<T> {
    values: Map<string,Result<T>>;
    mapping: KeyMapper;
    cacheTime: number;
    refresh: Refresh<T>;

    constructor(cacheTime: number, refresh: Refresh<T>, mapping: KeyMapper = () => '__default') {
        this.values = new Map();
        this.cacheTime = cacheTime;
        this.refresh = refresh;
        this.mapping = mapping;
    }

    get(...args): Promise<T> {
        const mappedValue = this.mapping(...args);
        const lastResult = this.values.get(mappedValue);

        if(isFresh(lastResult, this.cacheTime)) {
            // @ts-ignore
            return Promise.resolve(lastResult.value);
        } else {
            return this.update(mappedValue, ...args);
        }
    }

    getIfFresh(...args) {
        const mappedValue = this.mapping(...args);
        const lastResult = this.values.get(mappedValue);
        return (isFresh(lastResult, this.cacheTime) ? lastResult.value : null);
    }

    update(mappedValue, ...args): Promise<T> {
        return this.refresh(...args).then((value) => {
            const newValue = {
                accessTime: Date.now(),
                value: value
            };
            this.values.set(mappedValue, newValue);
            return value;
        });
    }

    replace(value, ...args) {
        const mappedValue = this.mapping(...args);
        const lastResult = this.values.get(mappedValue);
        lastResult.value = value;
        this.values.set(mappedValue, lastResult);
    }

    invalidate() {
        this.values.clear();
    }
}

function isFresh(result, maxTime) {
    return !!result && !!result.value && Date.now() - result.accessTime < maxTime;
}
