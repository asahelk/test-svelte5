

export function createObserver({
    callback,
    threshold,
    rootMargin = '0px' }: { callback: IntersectionObserverCallback, threshold?: number, rootMargin?: string }
): IntersectionObserver {
    const options: IntersectionObserverInit = {
        root: null, // viewport
        rootMargin,
        threshold
    };

    return new IntersectionObserver(callback, options);
}

export function createObserver2(
    callback: IntersectionObserverCallback,
    threshold: number,
    rootMargin = '0px'
): IntersectionObserver {
    const options: IntersectionObserverInit = {
        root: null, // viewport
        rootMargin,
        threshold
    };

    return new IntersectionObserver(callback, options);
}