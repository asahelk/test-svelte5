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

    let { items, itemSize = 0, height, width, renderItem }: Props = $props();

    let threshold = 0.1;

    let _$container: HTMLElement | null = null;
    const visibleIndices = new SvelteSet<number>();

    const heightUnit = typeof height === 'number' ? 'px' : '';
    const widthUnit = typeof width === 'number' ? 'px' : '';
    let containerStyle = $derived(`height:${height}${heightUnit};width:${width}${widthUnit};`);

    onMount(() => {
        if (!_$container) return;

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

        for (let i = 0; i < _$container.children.length; i++) {
            const child = _$container.children[i];
            observer.observe(child);
        }

        return () => {
            visibleIndices.clear();
            observer.disconnect();
        };
    });
</script>

<div bind:this={_$container} class="virtual-list-container" style={containerStyle}>
    {#each items as item, index (item.id)}
        <div class="virtual-list-item-wrapper" data-index={index} style="top: {index * itemSize}px;height:{itemSize}px;">
            {#if visibleIndices.has(index)}
                {@render renderItem?.(item, index)}
            {/if}
        </div>
    {/each}
</div>

<style>
    .virtual-list-container {
        overflow: auto;
        will-change: transform;
        -webkit-overflow-scrolling: touch;
    }
</style>
