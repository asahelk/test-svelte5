<script>
    import { onMount, onDestroy, tick } from 'svelte';

    export let items = [];
    export let itemHeight = 50;

    let container;
    let visibleIndices = new Set();
    let observer;

    // Define the observe function
    async function observe(node, index) {
        await tick();
        node.dataset.index = index;
        if (observer) {
            observer.observe(node);
        }

        return {
            destroy() {
                observer.unobserve(node);
            },
        };
    }

    onMount(() => {
        observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    const idx = +entry.target.dataset.index;
                    if (entry.isIntersecting) {
                        visibleIndices.add(idx);
                    } else {
                        visibleIndices.delete(idx);
                    }
                }
                // Trigger reactivity
                visibleIndices = new Set(visibleIndices);
            },
            {
                root: container,
                threshold: 0.1,
            },
        );
    });

    onDestroy(() => {
        if (observer) observer.disconnect();
    });
</script>

<div class="viewport" bind:this={container} style="height:500px;">
    <div class="inner" style="height: {items.length * itemHeight}px;">
        {#each items as item, i}
            <div class="item" use:observe={i} style="top: {i * itemHeight}px; height: {itemHeight}px;">
                {#if visibleIndices.has(i)}
                    <slot name="item" {item} {i}>
                        {item}
                    </slot>
                {/if}
            </div>
        {/each}
    </div>
</div>

<style>
    .viewport {
        overflow: auto;
        will-change: transform;
        -webkit-overflow-scrolling: touch;
    }
    .inner {
        position: relative;
        width: 100%;
    }
    .item {
        /* position: absolute;
        width: 100%;
        box-sizing: border-box; */
    }
</style>
