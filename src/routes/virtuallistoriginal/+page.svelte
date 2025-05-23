<script>
    import ListItem from '../virtuallist6/mistral/ListItem.svelte';
    import VirtualList from './VirtualList.svelte';

    const items = Array.from({ length: 100000 }, (_, i) => `Item ${i + 1}`);
</script>

<main>
    <h1>Vertical Virtual List</h1>
    <VirtualList height={400} itemSize={50} itemCount={items.length} scrollDirection="vertical">
        <!-- {#snippet item(item, index)}
            <ListItem {item} {index} />
        {/snippet} -->
        <div slot="item" let:index let:style {style}>
            <!-- <div {style}>
                Item {index}
            </div> -->
            <ListItem item={items[index]} {index} />
        </div>
    </VirtualList>

    <!-- <h1>Horizontal Virtual List</h1>
    <VirtualList {items} scrollDirection="horizontal" /> -->
</main>
