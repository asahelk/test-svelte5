<script lang="ts">
	import Child from "$lib/components/Simple/Child.svelte";
	import VirtualList from "$lib/components/SimpleVirtualList/SimpleVirtualList.svelte";

	let items = $state(Array.from({ length: 20 }, (_, i) => ({ name: i + 1, isVisible: false })));

	function changeItems() {
		items = Array.from({ length: 10 }, (_, i) => ({ name: i + 1, isVisible: false }));
		// items.push({ name: 21, isVisible: false });
	}
</script>

<div class="flex flex-col gap-10">
	<VirtualList {items} itemSize={100} width={400} height={100}>
		{#snippet renderItem(index)}
			<Child item={items[index]} />
		{/snippet}
	</VirtualList>

	<button onclick={changeItems}>Change items</button>
</div>
