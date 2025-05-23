<script>
  import ListItem from './ListItem.svelte';
  import VirtualList from './VirtualList.svelte';

  const items = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);

  let height = 400;
</script>

<main>
  <h1>Vertical Virtual List</h1>
  <VirtualList {height} itemSize={33} {items} scrollDirection="horizontal">
    {#snippet theItem(item, index)}
      <ListItem {item} {index} />
    {/snippet}
  </VirtualList>

  <!-- <h1>Horizontal Virtual List</h1>
  <VirtualList {items} scrollDirection="horizontal" /> -->
</main>
