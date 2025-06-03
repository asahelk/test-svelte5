<script lang="ts">
    import VirtualList from './VirtualList.svelte';

    let items = $state(
        Array.from({ length: 1000 }, (_, i) => ({
            id: `item-${i}`,
            text: `This is item number ${i}`,
        })),
    );
    let itemSize = $state(50);
</script>

<VirtualList {items} {itemSize}>
    {#snippet renderItem(item, index)}
        {item.id}
    {/snippet}
</VirtualList>
