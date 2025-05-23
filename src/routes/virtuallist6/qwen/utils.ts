

export function createObserver(
    callback: IntersectionObserverCallback,
    threshold = 0.1
): IntersectionObserver {
    const options: IntersectionObserverInit = {
        root: null, // viewport
        rootMargin: '0px',
        threshold
    };

    return new IntersectionObserver(callback, options);
}