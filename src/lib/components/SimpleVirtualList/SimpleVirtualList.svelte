<script module lang="ts">
	/**
	 * the third argument for event bundler
	 * @see https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
	 */
	const thirdEventArg = (() => {
		let result = false;

		try {
			const arg = Object.defineProperty({}, "passive", {
				get() {
					// @ts-ignore
					result = { passive: true };
					return true;
				},
			});

			// @ts-ignore
			window.addEventListener("testpassive", arg, arg);
			// @ts-ignore
			window.remove("testpassive", arg, arg);
		} catch (e) {
			/* */
		}

		return result;
	})();
</script>

<script lang="ts" generics="T extends { isVisible?: boolean }">
	import { onDestroy, onMount, type Snippet } from "svelte";
	import { useActions, type ActionArray } from "../../../routes/virtuallist5/useActions";
	import type { HTMLAttributes } from "svelte/elements";
	import { flip } from "svelte/animate";
	import type { DndEvent } from "svelte-dnd-action";

	type Props = {
		items: T[];
		renderItem: Snippet<[index: number]>;
		itemSize: number;
		width: number;
		height: number;
		getKey?: (index: number) => unknown;
		use?: ActionArray | undefined;
		scrollDirection?: "horizontal" | "vertical";
		wrapperRestProps?: HTMLAttributes<HTMLDivElement>;
		onconsider: (e: CustomEvent<DndEvent<T>>) => void;
		onfinalize: (e: CustomEvent<DndEvent<T>>) => void;
	} & HTMLAttributes<HTMLDivElement>;

	let { items = $bindable(), renderItem, itemSize, width, height, getKey, use = [], scrollDirection, wrapperRestProps, ...props }: Props = $props();

	let scrollLeft = $state(0);
	let scrollTop = $state(0);

	let wrapper: HTMLDivElement | undefined = $state();

	onMount(() => {
		wrapper?.addEventListener("scroll", onScroll as (e: Event) => void, thirdEventArg);
	});

	function onScroll(
		event: UIEvent & {
			currentTarget: EventTarget & HTMLElement;
		},
	) {
		scrollLeft = event.currentTarget.scrollLeft;
		scrollTop = event.currentTarget.scrollTop;
		rerender();
	}

	$effect(() => {
		rerender();
	});

	function rerender() {
		let scrollSize = scrollDirection === "vertical" ? scrollTop : scrollLeft;

		const firstIndex = Math.floor(scrollSize / itemSize);

		const size = scrollDirection === "vertical" ? height : width;
		const count = Math.ceil(size / itemSize) + 1;

		for (let i = 0; i < count; i++) {
			if (items[firstIndex - i]) items[firstIndex - i].isVisible = false;

			if (items[firstIndex + count]) items[firstIndex + count].isVisible = false;

			const item = items[firstIndex + i];
			if (item) item.isVisible = true;
		}
		// items = items;
	}

	let innerStyle = $derived.by(() => {
		if (scrollDirection === "vertical") {
			return `grid-template-rows: repeat(${items.length},1fr); height: ${itemSize * items.length}px; min-height: 100%;`;
		}
		return `grid-template-columns: repeat(${items.length},1fr); width: ${itemSize * items.length}px; min-height: 100%;`;
	});
	rerender();

	//TODO: pass length, and create a new array with the length with isVisible
	// in Svelte svelte@5.29.0 they introduced the attachments, useful to manage use:actions
	// https://github.com/sveltejs/svelte/pull/15000 - width this useActions file is not longer needed

	onDestroy(() => {
		wrapper?.removeEventListener("scroll", onScroll as (e: Event) => void);
	});
</script>

<div bind:this={wrapper} class="container-wrapper" style="width: {width}px; height: {height}px;" {...wrapperRestProps}>
	<div class="container-inner" style={innerStyle} use:useActions={use} {...props}>
		{#each items as item, index (getKey ? getKey(index) : index)}
			<div class="flex flex-1" animate:flip={{ duration: 200 }}>
				{#if item?.isVisible}
					<div class="item bg-teal-900 flex flex-1">
						{@render renderItem(index)}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.item {
		display: flex;
	}
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
