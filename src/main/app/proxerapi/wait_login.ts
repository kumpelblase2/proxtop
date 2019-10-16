const promiseCallbacks: Function[] = [];
let loggedIn = false;

export function whenLogin(): Promise<void> {
    if(loggedIn) {
        return Promise.resolve();
    } else {
        return new Promise<void>(resolve => {
            promiseCallbacks.push(resolve);
        });
    }
}

export function finishLogin() {
    this.loggedIn = true;
    promiseCallbacks.forEach(callback => callback());
}
