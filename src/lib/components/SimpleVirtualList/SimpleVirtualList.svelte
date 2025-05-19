<script lang="ts" generics="T extends { isVisible?: boolean }">
	import type { Snippet } from "svelte";
	import { useActions, type ActionArray } from "../../../routes/virtuallist5/useActions";

	interface Props {
		items: T[];
		renderItem: Snippet<[index: number]>;
		itemSize: number;
		width: number;
		height?: number;
		getKey?: (index: number) => unknown;
		use?: ActionArray | undefined;
	}

	let { items = $bindable(), renderItem, itemSize, width, height, getKey, use = [], ...rest }: Props = $props();

	let scrollLeft = $state(0);

	function onScroll(
		event: UIEvent & {
			currentTarget: EventTarget & HTMLElement;
		},
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
		items = items;
	}

	rerender();

	//TODO: pass length, and create a new array with the length with isVisible
	// in Svelte svelte@5.29.0 they introduced the attachments, useful to manage use:actions
	// https://github.com/sveltejs/svelte/pull/15000 - width this useActions file is not longer needed
</script>

<section class="container-wrapper" onscroll={onScroll} style="width: {width}px; height: 100%;">
	<div
		class="container-inner"
		style="grid-template-columns: repeat({items.length},1fr); width: {itemSize * items.length}px; min-height: 100%;"
		use:useActions={use}
		{...rest}
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
	.container-wrapper {
		overflow: auto;
		/* overflow-y: hidden; */
		will-change: transform;
		-webkit-overflow-scrolling: touch;
	}
	.container-inner {
		transition: transform 0.3s ease-in-out;
		display: grid;
		height: 100%;
		width: 100%;
	}
</style>
