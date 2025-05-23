<script>
    import { onMount, afterUpdate } from 'svelte';

    export let items = [];
    export let itemHeight = 50;
    export let buffer = 5;

    let container;
    let startIndex = 0;
    let endIndex = 0;
    let topSentinel;
    let bottomSentinel;
    let observer;

    $: visibleItems = items.slice(startIndex, endIndex);

    onMount(() => {
        initVirtualList();
        return () => observer?.disconnect();
    });

    function initVirtualList() {
        if (!container) return;

        // Calculate initial visible range
        const containerHeight = container.clientHeight;
        const visibleCount = Math.ceil(containerHeight / itemHeight);
        startIndex = Math.max(0, 0 - buffer);
        endIndex = Math.min(items.length, visibleCount + buffer);

        // Setup intersection observer
        observer = new IntersectionObserver(handleIntersection, {
            root: container,
            rootMargin: '50px 0px',
            threshold: 0.1,
        });

        updateSentinels();
    }

    function handleIntersection(entries) {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;

            if (entry.target === topSentinel) {
                startIndex = Math.max(0, startIndex - buffer);
                endIndex = Math.max(endIndex - buffer, startIndex + buffer);
            } else if (entry.target === bottomSentinel) {
                endIndex = Math.min(items.length, endIndex + buffer);
                startIndex = Math.min(startIndex + buffer, endIndex - buffer);
            }
        }
        updateSentinels();
    }

    function updateSentinels() {
        if (!topSentinel || !bottomSentinel) return;

        // Update sentinel positions
        topSentinel.style.top = `${Math.max(0, startIndex - 1) * itemHeight}px`;
        bottomSentinel.style.top = `${Math.min(items.length, endIndex + 1) * itemHeight}px`;

        // Reconnect observers
        observer.disconnect();
        observer.observe(topSentinel);
        observer.observe(bottomSentinel);
    }

    afterUpdate(updateSentinels);
</script>

<div class="container" bind:this={container}>
    <div class="scroll-area" style="height: {items.length * itemHeight}px; position: relative;">
        <div class="sentinel" bind:this={topSentinel} />

        {#each visibleItems as item, i (item.id)}
            <div class="item" style="top: {(startIndex + i) * itemHeight}px; height: {itemHeight}px;">
                {item.content}
            </div>
        {/each}

        <div class="sentinel" bind:this={bottomSentinel} />
    </div>
</div>

<style>
    .container {
        height: 100vh;
        overflow: auto;
        border: 1px solid #ccc;
    }

    .scroll-area {
        position: relative;
    }

    .item {
        position: absolute;
        width: 100%;
        padding: 1rem;
        box-sizing: border-box;
        border-bottom: 1px solid #eee;
    }

    .sentinel {
        position: absolute;
        height: 1px;
        width: 100%;
        pointer-events: none;
    }
</style>
