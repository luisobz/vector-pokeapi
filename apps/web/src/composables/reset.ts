const resetFns: Array<() => void> = [];

export function registerReset(fn: () => void) {
    resetFns.push(fn);
}

export function resetAllModules() {
    resetFns.forEach((fn) => fn());
}