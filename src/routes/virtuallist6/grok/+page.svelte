<script>
    import VirtualList from './VirtualList.svelte';

    let items = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        label: `Item ${i}`,
    }));
</script>

<VirtualList {items} itemHeight={50} height={500} buffer={10}>
    {#snippet theItem(item, index)}
        <div>
            {item.label}
        </div>
    {/snippet}
</VirtualList>
