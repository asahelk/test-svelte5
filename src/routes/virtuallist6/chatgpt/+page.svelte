<script>
    import VirtualList from './VirtualList.svelte';

    // e.g. 1000 dummy items
    let items = Array.from({ length: 1000 }, (_, i) => `Item #${i + 1}`);
</script>

<VirtualList {items} itemHeight={30}>
    <div slot="item" let:item let:i style="padding: 4px; border-bottom: 1px solid #eee;">
        <strong>{i + 1}.</strong>
        {item}
    </div>
</VirtualList>
