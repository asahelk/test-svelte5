<script lang="ts">
    import { DIRECTION } from '$lib/components/VirtualList/constants';
    import VirtualList from './VirtualList.svelte';

    const length = 1000;
    let items = $state(
        Array.from({ length }, (_, i) => ({
            id: `item-${i}`,
            text: `This is item number ${i}`,
        })),
    );
    let itemSize = $state(50);
    let itemSizes = $state(Array.from({ length }, (_, i) => 24));

    function getTotalSize(itemSize: number | number[], itemsCount: number, gap: number) {
        if (Array.isArray(itemSize)) {
            return itemSize.reduce((acc, size) => acc + size + gap, -gap);
        }

        return (itemSize + gap) * itemsCount - gap;
    }
</script>

<!-- {itemSizes} -->
{JSON.stringify(itemSizes, null, 2)}
{getTotalSize(itemSize, length, 14)}
<div class="h-screen">
    <VirtualList {items} {itemSize} itemsCount={length} width={700} height={500} scrollDirection={DIRECTION.VERTICAL} gap={14}>
        {#snippet renderItem(item, index)}
            <div bind:clientHeight={itemSizes[index]} class="h-full bg-red-500">
                <div class="bg-teal-500">{item.id}</div>
                {#if index % 2 === 0}
                    <div class=" w-150">{item.id}aserhraeshera searh</div>
                {/if}
            </div>
        {/snippet}
    </VirtualList>
</div>

<!-- <VirtualList {items} itemHeight={50}></VirtualList> -->
