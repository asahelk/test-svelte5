<script lang="ts" generics="T extends {id:string}">
    import { onMount, type Component, type Snippet } from 'svelte';
    import { createObserver } from './utils';
    import { SvelteSet } from 'svelte/reactivity';
    import type { HTMLAttributes } from 'svelte/elements';
    import type { DndEvent } from 'svelte-dnd-action';
    import { useActions, type ActionArray } from '../../virtuallist5/useActions';
    import { DIRECTION } from '$lib/components/VirtualList/constants';

    type Props = {
        items: T[];
        itemsCount: number;
        itemSize?: number | number[];
        estimatedItemSize?: number | null;
        height?: number | string;
        width?: number | string;
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

    let {
        items = [],
        itemSize = 0,
        itemsCount = items.length,
        estimatedItemSize = 50,
        height = '100%',
        width = '100%',
        use = [],
        scrollDirection = DIRECTION.VERTICAL,
        gap = 0,
        renderItem,
        ...props
    }: Props = $props();

    let _$container: HTMLElement | null = null;
    let _$inner: HTMLElement | null = null;

    const visibleIndices = new SvelteSet<number>();

    const heightUnit = typeof height === 'number' ? 'px' : '';
    const widthUnit = typeof width === 'number' ? 'px' : '';

    let containerStyle = $derived(`height:${height}${heightUnit};width:${width}${widthUnit};`);

    let innerStyle = $derived(
        scrollDirection === DIRECTION.VERTICAL
            ? `flex-direction:column;height:${getTotalSize()}px;gap:${gap}px;`
            : `flex-direction:row;min-width:${getTotalSize()}px;gap:${gap}px`,
    );

    onMount(() => {
        if (!_$container || !_$inner) return;

        const observer = createObserver({
            callback: (entries) => {
                for (const entry of entries) {
                    const index = Number((entry.target as HTMLElement).dataset.index);
                    if (entry.isIntersecting) {
                        visibleIndices.add(index);
                    } else {
                        visibleIndices.delete(index);
                    }
                }
            },
            // threshold: 0.01,
            // rootMargin: '0px 200px 0px 200px',
        });

        for (let i = 0; i < _$inner.children.length; i++) {
            const child = _$inner.children[i];
            observer.observe(child);
        }

        return () => {
            visibleIndices.clear();
            observer.disconnect();
        };
    });

    function getItemSize(index: number) {
        if (Array.isArray(itemSize) && itemSize.length < itemsCount) {
            throw new Error(`When itemSize is an array, itemSize.length can't be smaller than itemCount`);
        }
        if (Array.isArray(itemSize)) {
            return itemSize[index];
        }

        return itemSize;
    }

    function getTotalSize() {
        if (Array.isArray(itemSize)) {
            return itemSize.reduce((acc, size) => acc + size + gap, -gap);
        }

        return (itemSize + gap) * itemsCount - gap;
    }

    function getStyle(index: number) {
        const size = getItemSize(index);
        return scrollDirection === DIRECTION.VERTICAL ? `min-height:${size}px;min-width:100%` : `min-height:100%;min-width:${size}px;`;
    }
</script>

<div bind:this={_$container} class="virtual-list-container" style={containerStyle}>
    <div bind:this={_$inner} class="virtual-list-inner" style={innerStyle} use:useActions={use} {...props}>
        {#each items as item, index (item.id)}
            <!-- <div class="virtual-list-item-wrapper" data-index={index} style="height:{itemSize}px;min-width:{itemSize}px;"> -->
            <div class="virtual-list-item-wrapper" data-index={index} style={getStyle(index)}>
                {#if visibleIndices.has(index)}
                    {@render renderItem?.(item, index)}
                {/if}
            </div>
        {/each}
    </div>
</div>

<style>
    .virtual-list-container {
        overflow: auto;
        will-change: transform;
        -webkit-overflow-scrolling: touch;
    }

    .virtual-list-inner {
        display: flex;
        position: relative;
    }

    .virtual-list-item-wrapper {
        flex-grow: 0;
        flex-shrink: 0;
    }
</style>
