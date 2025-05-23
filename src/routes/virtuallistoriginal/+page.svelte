<script>
    import ListItem from '../virtuallist6/mistral/ListItem.svelte';
    import VirtualList from './VirtualList.svelte';

    let items = $state(Array.from({ length: 1000 }, (_, i) => ({ id: crypto.randomUUID(), name: `xitem ${i}`, isVisible: false })));
</script>

<main>
    <h1>Vertical Virtual List</h1>
    <VirtualList height={400} itemSize={50} width={400} itemCount={items.length} scrollDirection="vertical" getKey={(index) => items[index].id}>
        {#snippet theItem(index, style)}
            <ListItem item={items[index].name} {index} />
        {/snippet}
        <!-- <div slot="item" let:index let:style {style}>
            <ListItem item={items[index].name} {index} />
        </div> -->
    </VirtualList>

    <!-- <h1>Horizontal Virtual List</h1>
    <VirtualList {items} scrollDirection="horizontal" /> -->
</main>
