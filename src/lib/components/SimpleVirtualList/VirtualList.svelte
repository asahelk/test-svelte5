<script lang="ts" generics="T extends { isVisible: boolean }">
	import type { Snippet } from 'svelte';

	interface Props {
		items: T[];
		renderItem: Snippet<[index: number]>;
		itemSize: number;
		width: number;
		height?: number;
		getKey?: (index: number) => unknown;
	}

	let { items = $bindable(), renderItem, itemSize, width, height, getKey }: Props = $props();

	let scrollLeft = $state(0);

	function onScroll(
		event: UIEvent & {
			currentTarget: EventTarget & HTMLElement;
		}
	) {
		scrollLeft = event.currentTarget.scrollLeft;
		rerender();
	}

	$effect(() => {
		rerender();
	});

	function rerender() {
		const firstIndex = Math.floor(scrollLeft / itemSize);
		const count = Math.ceil(width / itemSize) + 1;

		for (let i = 0; i < count; i++) {
			if (items[firstIndex - i]) items[firstIndex - i].isVisible = false;

			if (items[firstIndex + count]) items[firstIndex + count].isVisible = false;

			const item = items[firstIndex + i];
			if (item) item.isVisible = true;
		}
	}

	rerender();
</script>

{scrollLeft}
<section
	class="container-wrapper overflow-x-auto"
	onscroll={onScroll}
	style="width: {width}px;height: {height}px;"
>
	<div
		class="container-inner"
		style="grid-template-columns: repeat({items.length},1fr); width: {itemSize * items.length}px;"
	>
		{#each items as item, index (getKey ? getKey(index) : index)}
			{#if item?.isVisible}
				<div class="item bg-teal-900" style="grid-column: {index + 1};">
					{@render renderItem(index)}
				</div>
			{/if}
		{/each}
	</div>
</section>

<style>
	.container-inner {
		transition: transform 0.3s ease-in-out;
		display: grid;
		height: 100%;
		width: 100%;
	}
</style>
