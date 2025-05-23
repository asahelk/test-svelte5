<script lang="ts">
    import VirtualList from './VirtualList.svelte';
    import ListItem from './ListItem.svelte';
    import PlaceholderItem from './PlaceholderItem.svelte';

    let allItems = $state(
        Array.from({ length: 1000 }, (_, i) => ({
            id: `item-${i}`,
            text: `This is item number ${i}`,
        })),
    );

    // Example of how to dynamically add more items
    function addMore() {
        const currentLength = allItems.length;
        const newItems = Array.from({ length: 100 }, (_, i) => ({
            id: `item-${currentLength + i}`,
            text: `This is item number ${currentLength + i}`,
        }));
        allItems = [...allItems, ...newItems];
    }
</script>

<h1>Svelte 5 Virtual List with Intersection Observer</h1>
<button onclick={addMore}>Add 100 More Items</button>

<VirtualList items={allItems} itemHeight={60} ItemComponent={ListItem} PlaceholderComponent={PlaceholderItem} containerHeight="600px" rootMargin="300px 0px" />

<style>
    h1 {
        font-family: sans-serif;
        margin-bottom: 1em;
    }
    button {
        margin-bottom: 1em;
        padding: 0.5em 1em;
    }
</style>
