<script>
    import VirtualList from './VirtualList.svelte';

    // Generate sample data
    const items = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        content: `Item ${i + 1}`,
    }));
</script>

<VirtualList {items} itemHeight={60} buffer={10} />
