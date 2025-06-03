<script lang="ts">
    import VirtualList from './VirtualList.svelte';

    let items = $state(
        Array.from({ length: 1000 }, (_, i) => ({
            id: `item-${i}`,
            text: `This is item number ${i}`,
        })),
    );
    let itemHeight = $state(50);
</script>

<VirtualList {items} {itemHeight}></VirtualList>
