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
    loggedIn = true;
    promiseCallbacks.forEach(callback => callback());
    while(promiseCallbacks.length > 0) {
        promiseCallbacks.pop();
    }
}
