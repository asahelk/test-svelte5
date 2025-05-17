<svelte:options runes />

<script>
	import { onDestroy } from 'svelte';

	let { item = $bindable() } = $props();

	onDestroy(() => {
		console.log('destroy', item.name);
		if (item) item.isVisible = false;
	});
</script>

<div class="border">{item.name}</div>
