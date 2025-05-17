<script lang="ts">
	import { dndzone, type DndEvent } from 'svelte-dnd-action';
	import type VirtualListType from './VirtualList5.svelte';
	import VirtualList from './VirtualList5.svelte';
	import { overrideItemIdKeyNameBeforeInitialisingDndZones } from 'svelte-dnd-action';
	import { mergeArrayObjectsByKeyWithMap } from '$lib/utils/utils';
	// import { array } from './states.svelte.ts';

	overrideItemIdKeyNameBeforeInitialisingDndZones('index');

	let virtualList = $state<ReturnType<typeof VirtualListType>>();

	let virtualListItems = $derived(
		virtualList?.getVirtualItems().map((e, i) => {
			if (virtualList === undefined) return e;
			const { start = 0 } = virtualList.getVisibleRange();
			return {
				...e,
				order: start + i,
				style: `${start + i === indexGrabbed ? 'visibility: hidden !important;' : ''}`,
				// style: '',
			};
		}) ?? [],
	);

	let indexGrabbed = $state(-1);

	let items = $state(Array.from({ length: 17 }, (_, i) => ({ id: crypto.randomUUID(), name: `xitem ${i}` })));
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

		indexGrabbed = +elementIndex;
		if (virtualList === undefined) return;

		const { start = 0, stop } = virtualList.getVisibleRange();

		const { array: dndNoDuplicates } = mergeArrayObjectsByKeyWithMap(partialDndItems, 'index');

		const newDndItems = dndNoDuplicates.map((e, i) => {
			return {
				...e,
				order: start + i,
				style: `left:0;width:100%;height:${itemSize}px;position:absolute;top:${(start + i) * itemSize}px;'`,
			};
		});

		console.log('dndNoDuplicates', $state.snapshot(dndNoDuplicates));
		console.log('getVirtualItems()', $state.snapshot(virtualList?.getVirtualItems()));
		console.log('virtualListItems', $state.snapshot(virtualListItems));
		console.log('partialDndItems', $state.snapshot(partialDndItems));
		console.log('newDndItems', $state.snapshot(newDndItems));

		// const oldPosition = +elementIndex;
		// const auxNewPosition = newDndItems.find((e) => e.index === oldPosition)?.order;

		// const elementToMove = items.splice(oldPosition, 1)[0];
		// items = items.toSpliced(auxNewPosition, 0, elementToMove);
		// const newElements = items.toSpliced(oldPosition, 1);
		// console.log('newElements', $state.snapshot(newElements));
		virtualList.setVirtualItems([...newDndItems]);
		// virtualList.recomputeSizes(start);

		console.log('\n\n');
	}

	function handleSortFinalize(e: CustomEvent<DndEvent<DnDItem>>) {
		const {
			items: partialDndItems,
			info: { id: elementIndex, trigger },
		} = e.detail;
		console.log(`finalize event => ${trigger.toUpperCase()} - ${elementIndex}`, $state.snapshot(partialDndItems));

		indexGrabbed = -1;
		if (virtualList === undefined) return;
		const { offset } = virtualList.getState();
		const { start = 0, stop } = virtualList.getVisibleRange();

		// console.log({start,stop})

		const newDndItems = partialDndItems.map((e, i) => {
			return {
				...e,
				order: start + i,
				// style: `left:0;width:100%;height:${itemSize}px;position:absolute;top:${(start + i) * itemSize}px;'`,
			};
		});

		// console.log("getVirtualItems()",$state.snapshot(virtualList?.getVirtualItems()))
		// console.log("virtualListItems",$state.snapshot(virtualListItems))
		// console.log("partialDndItems",$state.snapshot(partialDndItems))
		// console.log("newDndItems",$state.snapshot(newDndItems))

		//TODO: Fix when dropping the item is sliding one position up

		const oldPosition = +elementIndex;
		const auxNewPosition = newDndItems.find((e) => e.index === oldPosition)?.order;
		// const newPosition = newDndItems[auxNewPosition - 1]?.order ?? 0;
		// console.log("oldPosition",oldPosition)
		// console.log("auxNewPosition",auxNewPosition)
		// console.log("newPosition",newPosition)

		// console.log("items bef",$state.snapshot(items))

		const elementToMove = items.splice(oldPosition, 1)[0];
		items = items.toSpliced(auxNewPosition, 0, elementToMove);
		virtualList.setVirtualItems(newDndItems);
		virtualList.recomputeSizes(start);

		console.log('\n\n');
	}

	function testClick() {
		// virtualList?.recomputeSizes(0);
		console.log('items', $state.snapshot(items));
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
	{items.length}-{virtualListItems?.length}
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
			getKey={(index) => items[index]?.id}
			class="inner-container"
		>
			{#snippet theItem(style: string, index: number, key: number)}
				<div class="w-full" style="width: 100%;{virtualListItems[index]?.style}">
					{items[index]?.name}
					-{index}--
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
	<section class="grid grid-cols-5">
		<pre class="col-span-2 bg-black! text-white!" style="font-size:0.775rem">
			{JSON.stringify(items, null, 2)}
		</pre>
		<pre class="col-span-3 bg-black! text-white!" style="font-size:0.775rem">
			{JSON.stringify(virtualListItems, null, 2)}
		</pre>
	</section>
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
		width: 70%;
		padding: 0.2em;
		border: 1px solid blue;
		margin: 0.15em 0;
	}

	:global(.inner-container) {
		margin: 24px 0;
		/* margin-bottom: 2rem; */
	}
</style>
