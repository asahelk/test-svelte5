<script>
    import { onMount } from 'svelte';

    // Props
    export let items = []; // Array of items to render
    export let itemHeight = 50; // Height of each item in pixels
    export let height = 500; // Height of the container in pixels
    export let buffer = 10; // Extra items to render above/below the viewport
    export let theItem; // Reference to the item component

    // Component state
    let container; // Reference to the container div
    let topSentinel; // Sentinel above the first visible item
    let bottomSentinel; // Sentinel below the last visible item
    let startIndex = 0; // Index of the first visible item
    let visibleCount = Math.ceil(height / itemHeight) + buffer; // Number of items to render
    let endIndex = Math.min(items.length - 1, visibleCount - 1); // Index of the last visible item
    let visibleItems = items.slice(startIndex, endIndex + 1); // Array of currently visible items
    let totalHeight = items.length * itemHeight; // Total height of all items

    const step = Math.ceil(visibleCount / 2); // Number of items to shift when loading more

    // Reactively update when the items array changes
    $: if (items) {
        startIndex = 0;
        endIndex = Math.min(items.length - 1, visibleCount - 1);
        visibleItems = items.slice(startIndex, endIndex + 1);
        totalHeight = items.length * itemHeight;
    }

    // Set up Intersection Observer on mount
    onMount(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                console.log('entries', entries);
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        if (entry.target === topSentinel && startIndex > 0) {
                            // Load more items above
                            const newStartIndex = Math.max(0, startIndex - step);
                            startIndex = newStartIndex;
                            endIndex = Math.min(items.length - 1, startIndex + visibleCount - 1);
                        } else if (entry.target === bottomSentinel && endIndex < items.length - 1) {
                            // Load more items below
                            const newEndIndex = Math.min(items.length - 1, endIndex + step);
                            endIndex = newEndIndex;
                            startIndex = Math.max(0, endIndex - visibleCount + 1);
                        }
                        visibleItems = items.slice(startIndex, endIndex + 1);
                    }
                }
            },
            {
                root: container,
                rootMargin: '100px 0px', // Trigger when sentinels are within 100px of viewport
                threshold: 0, // Trigger as soon as any part intersects
            },
        );

        // Observe sentinels (Note: 'bottomSentinel' was incorrectly 'customSentinel' in thinking trace)
        observer.observe(topSentinel);
        observer.observe(bottomSentinel);

        // Cleanup on unmount
        return () => {
            observer.disconnect();
        };
    });
</script>

<div bind:this={container} style="height: {height}px; overflow: auto; position: relative;">
    <div style="position: relative; height: {totalHeight}px;">
        <!-- Top sentinel positioned just above the first visible item -->
        <div bind:this={topSentinel} style="position: absolute; top: {startIndex * itemHeight - 1}px; height: 1px; width: 100%;"></div>

        <!-- Render visible items -->
        {#each visibleItems as item, i (item.id)}
            <div style="position: absolute; top: {(startIndex + i) * itemHeight}px; height: {itemHeight}px; width: 100%;">
                {@render theItem?.(item, i)}
            </div>
        {/each}

        <!-- Bottom sentinel positioned just below the last visible item -->
        <div bind:this={bottomSentinel} style="position: absolute; top: {(endIndex + 1) * itemHeight}px; height: 1px; width: 100%;"></div>
    </div>
</div>
