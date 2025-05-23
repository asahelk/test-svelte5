<!-- src/VirtualList.svelte -->
<script lang="ts" generics="T">
    import type { Snippet } from 'svelte';
    import { DIRECTION } from '../../virtuallist5/constants';

    interface Props {
        items: T[];
        itemSize?: number;
        height?: number;
        width?: number;
        theItem: Snippet<[number, string]>;
        scrollDirection?: string;
        getKey?: (index: number) => string | number;
    }
    let { items = [], itemSize = 50, height = 400, width = 400, theItem, scrollDirection = 'vertical', getKey }: Props = $props();
    let styleCache: Record<string, string> = {};

    let scrollTop = 0;
    let scrollLeft = 0;
    let startIndex = $state(0);
    let endIndex = 0;
    // let items = [];
    let visibleItems: { index: number; style: string }[] = $state([]);
    let container: HTMLElement | undefined = $state();
    let containerStyle = $state('');
    let innerStyle = $state('');

    // Calculate the number of visible items
    const visibleCount = $derived(Math.ceil(height / itemSize));
    const totalSize = $derived(items.length * itemSize);

    // Update the visible items based on scroll position
    const updateVisibleItems = () => {
        const heightUnit = typeof height === 'number' ? 'px' : '';
        const widthUnit = typeof width === 'number' ? 'px' : '';
        if (scrollDirection === DIRECTION.VERTICAL) {
            containerStyle = `height:${height}${heightUnit};width:${width}${widthUnit};`;
            innerStyle = `flex-direction:column;height:${totalSize}px;`;
        } else {
            containerStyle = `height:${height}${heightUnit};width:${width}${widthUnit};`;
            innerStyle = `min-height:100%;width:${totalSize}px;`;
        }

        let newItems = [];
        const scrollSize = scrollDirection === DIRECTION.VERTICAL ? scrollTop : scrollLeft;
        startIndex = Math.floor(scrollSize / itemSize);
        for (let i = 0; i < visibleCount; i++) {
            const index = startIndex + i;
            if (index >= 0 && index < items.length) {
                newItems.push({
                    index,
                    style: getStyle(i),
                });
            }
        }
        visibleItems = [...newItems];

        // endIndex = startIndex + visibleCount;
        // visibleItems = items.slice(startIndex, endIndex);
    };

    $effect(() => {
        updateVisibleItems();
    });

    function getStyle(virtualIndex: number) {
        const index = startIndex + virtualIndex;
        if (styleCache[index]) return styleCache[index];

        let style = '';
        // let offset = (startIndex + index) * itemSize;
        let offset = index * itemSize;

        if (scrollDirection === DIRECTION.VERTICAL) {
            style = `left:0;width:100%;height:${itemSize}px;`;

            style += `position:absolute;top:${offset}px;`;
        } else {
            style = `top:0;width:${itemSize}px;`;

            style += `position:absolute;height:100%;left:${offset}px;`;
        }

        styleCache[index] = style;
        return style;
    }

    // Handle scroll events
    const handleScroll = () => {
        scrollTop = container?.scrollTop ?? 0;
        scrollLeft = container?.scrollLeft ?? 0;
        updateVisibleItems();
    };

    updateVisibleItems();
</script>

<div bind:this={container} style={containerStyle} onscroll={handleScroll} class="virtual-list-container">
    <div style={innerStyle} class="virtual-list-inner">
        {#each visibleItems as item, index (getKey ? getKey(item.index) : item.index)}
            <!-- {@const offset = (startIndex + index) * itemSize} -->
            <!-- {@const style = `position:absolute;${scrollDirection === DIRECTION.VERTICAL ? `top:${offset}px;width: 100%;` : `left:${offset}px;height: 100%;`} `} -->
            <!-- <div class="virtual-item" style="position: absolute; top: {(startIndex + index) * itemSize}px; height: {itemSize}px; width: 100%;"> -->
            <div class="virtual-item" style={item.style}>
                {@render theItem(item.index, item.style)}
            </div>
        {/each}
    </div>
</div>

<!-- {JSON.stringify(styleCache, null, 2)} -->

<style>
    .virtual-list-container {
        overflow: auto;
    }
    .virtual-list-inner {
        position: relative;
        /* border-bottom: 1px solid #eee; */
        /* padding: 10px; */
        /* box-sizing: border-box; */
    }
</style>
