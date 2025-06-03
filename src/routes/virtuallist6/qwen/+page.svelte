<script lang="ts">
    import { onMount } from 'svelte';
    import { createObserver } from './utils';
    import { SvelteSet } from 'svelte/reactivity';

    export let items = Array.from({ length: 1000 }, (_, i) => ({
        id: `item-${i}`,
        text: `This is item number ${i}`,
    }));
    export let itemHeight = 50;
    export let threshold = 0.1;

    let container: HTMLElement | null = null;
    const visibleIndices = new SvelteSet<number>();
    // let visibleItems: number[] = [];

    onMount(() => {
        if (!container) return;

        const observer = createObserver((entries) => {
            console.log(entries);
            for (const entry of entries) {
                const index = Number((entry.target as HTMLElement).dataset.index);
                if (entry.isIntersecting) {
                    visibleIndices.add(index);
                    // visibleItems = [...visibleItems, index];
                } else {
                    visibleIndices.delete(index);
                    // visibleItems = visibleItems.filter((i) => i !== index);
                }
            }
            // entries.forEach((entry) => {
            //     const index = Number(entry.target.dataset.index);
            //     if (entry.isIntersecting) {
            //         visibleItems = [...visibleItems, index];
            //     } else {
            //         visibleItems = visibleItems.filter((i) => i !== index);
            //     }
            // });
        }, threshold);

        for (let i = 0; i < container.children.length; i++) {
            const child = container.children[i];
            console.log('child:', child);
            observer.observe(child);
        }
        // Array.from(container.children).forEach((child) => {
        //     observer.observe(child);
        // });

        return () => {
            visibleIndices.clear();
            // visibleItems = [];
            observer.disconnect();
        };
    });
</script>

<div class="virtual-list" bind:this={container}>
    {#each items as item, i}
        <div class="item-wrapper bg-teal-500" data-index={i} style="top: {i * itemHeight}px;height:{itemHeight}px;">
            {#if visibleIndices.has(i)}
                {item.id}
            {/if}
        </div>
    {/each}
</div>

<style>
    .virtual-list {
        position: relative;
        height: 500px;
        overflow-y: auto;
    }

    .item-wrapper {
        /* height: ; */
        position: absolute;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
