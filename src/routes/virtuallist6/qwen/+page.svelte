<script lang="ts">
    import { DIRECTION } from '$lib/components/VirtualList/constants';
    import VirtualList from './VirtualList.svelte';

    const length = 3;
    let items = $state(
        Array.from({ length }, (_, i) => ({
            id: `item-${i}`,
            text: `This is item number ${i}`,
        })),
    );
    let itemSize = $state(50);
    let itemSizes = $state(Array.from({ length }, (_, i) => 10));

    function getTotalSize(array: number[]) {
        if (Array.isArray(array)) {
            return array.reduce((acc, size) => acc + size, 0);
        }

        return 0;
        // return itemSize * itemsCount;
    }
</script>

<!-- {itemSizes} -->
{JSON.stringify(itemSizes, null, 2)}
{getTotalSize(itemSizes)}
<div class="h-screen">
    <VirtualList {items} {itemSize} itemsCount={length} width={500} scrollDirection={DIRECTION.VERTICAL} gap={14}>
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
