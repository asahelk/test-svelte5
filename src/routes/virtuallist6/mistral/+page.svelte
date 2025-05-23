<script>
  import ListItem from './ListItem.svelte';
  import VirtualList from './VirtualList.svelte';

  let items = $state(Array.from({ length: 1000 }, (_, i) => ({ id: crypto.randomUUID(), name: `xitem ${i}`, isVisible: false })));

  let height = 400;
</script>

<main>
  <h1>Vertical Virtual List</h1>
  <VirtualList {height} itemSize={50} {items} scrollDirection="vertical" getKey={(index) => items[index].id}>
    {#snippet theItem(index, style)}
      <ListItem item={items[index].name} {index} />
    {/snippet}
  </VirtualList>

  <!-- <h1>Horizontal Virtual List</h1>
  <VirtualList {items} scrollDirection="horizontal" /> -->
</main>
