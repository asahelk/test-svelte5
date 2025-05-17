<script lang="ts">
	import { dndzone, type DndEvent } from 'svelte-dnd-action';
	import type VirtualListType from './VirtualList.svelte';
	import VirtualList from './VirtualList.svelte';
	import { overrideItemIdKeyNameBeforeInitialisingDndZones } from 'svelte-dnd-action';
	// import { array } from './states.svelte.ts';

	overrideItemIdKeyNameBeforeInitialisingDndZones('index');

	let virtualList = $state<ReturnType<typeof VirtualListType>>();

	let virtualListItems = $derived(
		virtualList?.getVirtualItems().map((e, i) => {
			if (virtualList === undefined) return e;
			const { offset } = virtualList.getState();
			const { start = 0, stop } = virtualList.getVisibleRange();
			return {
				order: start + i,
				...e,
			};
		}) ?? [],
	);

	let items = $state(Array.from({ length: 34 }, (_, i) => ({ id: crypto.randomUUID(), name: `xitem ${i}` })));
	type DnDItem = (typeof virtualListItems)[number];

	let itemSize = 50;
	// let items = $state([...array.value])

	function handleSortConsider(e: CustomEvent<DndEvent<DnDItem>>) {
		// console.log("event", JSON.stringify(e.detail,null, 2))
		const {
			items: partialDndItems,
			info: { id: elementIndex, trigger },
		} = e.detail;

		console.log(`consider event => ${trigger.toUpperCase()} - ${elementIndex}`, $state.snapshot(partialDndItems));
		if (virtualList === undefined) return;

		const { offset } = virtualList.getState();
		const { start = 0, stop } = virtualList.getVisibleRange();

		console.log({ start, stop });

		const newDndItems = partialDndItems.map((e, i) => {
			return {
				...e,
				order: start + i,
				style: `left:0;width:100%;height:${itemSize}px;position:absolute;top:${(start + i) * itemSize}px;'`,
			};
		});

		// console.log("getVirtualItems()",$state.snapshot(virtualList?.getVirtualItems()))
		// console.log("virtualListItems",$state.snapshot(virtualListItems))
		// console.log("partialDndItems",$state.snapshot(partialDndItems))
		// console.log("newDndItems",$state.snapshot(newDndItems))

		// virtualList.setVirtualItems([...newDndItems])
		virtualList.setVirtualItems([...newDndItems]);
		// partialDndItems[2].order = 9
		console.log('\n\n');
	}

	function handleSortFinalize(e: CustomEvent<DndEvent<DnDItem>>) {
		const {
			items: partialDndItems,
			info: { id: elementIndex, trigger },
		} = e.detail;
		console.log(`finalize event => ${trigger.toUpperCase()} - ${elementIndex}`, $state.snapshot(partialDndItems));

		if (virtualList === undefined) return;
		const { offset } = virtualList.getState();
		const { start = 0, stop } = virtualList.getVisibleRange();

		// console.log({start,stop})

		const newDndItems = partialDndItems.map((e, i) => {
			return {
				...e,
				order: start + i,
				style: `left:0;width:100%;height:${itemSize}px;position:absolute;top:${(start + i) * itemSize}px;'`,
			};
		});

		// console.log("getVirtualItems()",$state.snapshot(virtualList?.getVirtualItems()))
		// console.log("virtualListItems",$state.snapshot(virtualListItems))
		// console.log("partialDndItems",$state.snapshot(partialDndItems))
		// console.log("newDndItems",$state.snapshot(newDndItems))

		const oldPosition = +elementIndex;
		const auxNewPosition = newDndItems.find((e) => e.index === oldPosition)?.order;
		const newPosition = newDndItems[auxNewPosition - 1]?.order ?? 0;
		// console.log("oldPosition",oldPosition)
		// console.log("auxNewPosition",auxNewPosition)
		// console.log("newPosition",newPosition)

		const elementToMove = items.splice(oldPosition, 1)[0];

		// console.log("items bef",$state.snapshot(items))
		items = items.toSpliced(auxNewPosition, 0, elementToMove);
		virtualList.setVirtualItems(newDndItems);
		virtualList.recomputeSizes(start);

		console.log('\n\n');
	}

	function testClick() {
		if (virtualList === undefined) return;

		const { offset } = virtualList.getState();
		const { start, stop } = virtualList.getVisibleRange();
		console.log({ offset, start, stop });
	}

	function onscroll() {
		// const {start, stop} = virtualList.getVisibleRange()
		// virtualList.recomputeSizes(start)
		// items = [...items]
	}

	// let virtualListItems = $derived(virtualList?.getVirtualItems() ?? [])
</script>

<section class="flex flex-col">
	{items.length}
	<div>
		<VirtualList
			bind:this={virtualList}
			use={[
				[
					dndzone,
					{
						items: virtualListItems,
						flipDurationMs: 200,
						// dropTargetClasses: ['!outline-teal-500', '!outline-dashed'],
						dropTargetStyle: {
							outline: '1px dashed rgb(13 148 136)',
						},
						type: 'columns',
						dragDisabled: false,
						autoAriaDisabled: true,
					},
				],
			]}
			width="100%"
			height={300}
			itemCount={items.length}
			{itemSize}
			overscanCount={0}
			onconsider={handleSortConsider}
			onfinalize={handleSortFinalize}
			wrapperRestProps={{ onscroll }}
			getKey={(index) => index}
		>
			{#snippet theItem(style: string, index: number, key: number)}
				<div class="w-full" style="width: 100%;">
					{items[index]?.name}
					-{index}-{key}
				</div>
			{/snippet}

			<!-- <div slot="item" let:index let:style {style}>
				Letter: {items[index]}, Row: #{index}
			</div> -->

			<!-- getKey={(index) => items[index].id} -->

			<!-- <div slot="item" let:index let:style {style}>
			{index}-{style}
		</div> -->
		</VirtualList>
	</div>
	<button class="cursor-pointer bg-neutral-500 p-2" onclick={testClick}> Test </button>
</section>

<style>
	:root {
		background: black;
		color: white;
	}
	section {
		padding: 0.3em;
		/* this will allow the dragged element to scroll the list */
		/* overflow: scroll; */
		/* height: 600px; */
	}
	div {
		width: 50%;
		padding: 0.2em;
		border: 1px solid blue;
		margin: 0.15em 0;
	}
</style>
