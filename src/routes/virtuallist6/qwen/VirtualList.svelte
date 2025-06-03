<script lang="ts" generics="T extends {id:string}">
    import { onMount, type Component, type Snippet } from 'svelte';
    import { createObserver } from './utils';
    import { SvelteSet } from 'svelte/reactivity';
    import type { HTMLAttributes } from 'svelte/elements';
    import type { DndEvent } from 'svelte-dnd-action';
    import type { ActionArray } from '../../virtuallist5/useActions';

    type Props = {
        items: T[];
        itemsCount: number;
        itemSize?: number;
        height?: number;
        width?: number;
        use?: ActionArray;
        scrollDirection?: string;
        gap?: number;
        ItemComponent?: Component; // Constructor of a Svelte component
        PlaceholderComponent?: Component | null;
        containerClass?: string;
        animationDuration?: number;
        getKey?: (index: number) => string | number;
        renderItem: Snippet<[T, number]>;
        onconsider?: (e: CustomEvent<DndEvent<T>>) => void;
        onfinalize?: (e: CustomEvent<DndEvent<T>>) => void;
    } & HTMLAttributes<HTMLDivElement>;

    let { items, itemSize = 0, renderItem }: Props = $props();

    let threshold = 0.1;

    let container: HTMLElement | null = null;
    const visibleIndices = new SvelteSet<number>();

    onMount(() => {
        if (!container) return;

        const observer = createObserver((entries) => {
            console.log(entries);
            for (const entry of entries) {
                const index = Number((entry.target as HTMLElement).dataset.index);
                if (entry.isIntersecting) {
                    visibleIndices.add(index);
                } else {
                    visibleIndices.delete(index);
                }
            }
        }, threshold);

        for (let i = 0; i < container.children.length; i++) {
            const child = container.children[i];
            observer.observe(child);
        }

        return () => {
            visibleIndices.clear();
            observer.disconnect();
        };
    });
</script>

<div class="virtual-list" bind:this={container}>
    {#each items as item, i}
        <div class="item-wrapper bg-teal-500" data-index={i} style="top: {i * itemSize}px;height:{itemSize}px;">
            {#if visibleIndices.has(i)}
                {@render renderItem?.(item, i)}
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
