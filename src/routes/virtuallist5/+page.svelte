<script lang="ts">
	import { dndzone, type DndEvent } from 'svelte-dnd-action';
	import type VirtualListType from './VirtualList5.svelte';
	import VirtualList from './VirtualList5.svelte';
	import { overrideItemIdKeyNameBeforeInitialisingDndZones } from 'svelte-dnd-action';
	import { mergeArrayObjectsByKeyWithMap } from '$lib/utils/utils';
	import SimpleVirtualList from '$lib/components/SimpleVirtualList/SimpleVirtualList.svelte';

	// TODO: This ↓ is needed because if we use id, dnd change the id of the items when we drag it (with VirtualList5)
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

	let items = $state(Array.from({ length: 17 }, (_, i) => ({ id: crypto.randomUUID(), name: `xitem ${i}`, isVisible: false })));
	type DnDItem = (typeof virtualListItems)[number];
	type DnDItem2 = (typeof items)[number];

	let itemSize = 50;

	function handleSortConsider(e: CustomEvent<DndEvent<DnDItem>>) {
		const {
			items: partialDndItems,
			info: { id: elementIndex, trigger },
		} = e.detail;

		console.log(`consider event => ${trigger.toUpperCase()} - ${elementIndex}`, $state.snapshot(partialDndItems));

		if (virtualList === undefined) return;

		indexGrabbed = +elementIndex;
		const { start = 0, stop } = virtualList.getVisibleRange();

		const { array: dndNoDuplicates } = mergeArrayObjectsByKeyWithMap(partialDndItems, 'index');

		const newDndItems = dndNoDuplicates.map((e, i) => {
			return {
				...e,
				order: start + i,
				style: `left:0;width:100%;height:${itemSize}px;position:absolute;top:${(start + i) * itemSize}px;'`,
			};
		});

		virtualList.setVirtualItems([...newDndItems]);
	}

	function handleSortFinalize(e: CustomEvent<DndEvent<DnDItem>>) {
		const {
			items: partialDndItems,
			info: { id: elementIndex, trigger },
		} = e.detail;
		console.log(`finalize event => ${trigger.toUpperCase()} - ${elementIndex}`, $state.snapshot(partialDndItems));

		if (virtualList === undefined) return;

		indexGrabbed = -1;
		const { start = 0 } = virtualList.getVisibleRange();

		const newDndItems = partialDndItems.map((e, i) => {
			return {
				...e,
				order: start + i,
				// style: `left:0;width:100%;height:${itemSize}px;position:absolute;top:${(start + i) * itemSize}px;'`,
			};
		});

		const oldPosition = +elementIndex;
		const auxNewPosition = newDndItems.find((e) => e.index === oldPosition)?.order ?? -1;
		// This ↓: Fix when dropping the item is sliding one position up when scrolling down because VL rerender the list
		const newPosition = start - virtualListItems.length > oldPosition ? auxNewPosition - 1 : auxNewPosition;

		const elementToMove = items.splice(oldPosition, 1)[0];
		items = items.toSpliced(newPosition, 0, elementToMove);
		virtualList.setVirtualItems(newDndItems);
		virtualList.recomputeSizes(start);
	}

	function testClick() {
		// virtualList?.recomputeSizes(0);
		console.log('items', $state.snapshot(items));
		if (virtualList === undefined) return;

		const { offset } = virtualList.getState();
		const { start, stop } = virtualList.getVisibleRange();
		console.log({ offset, start, stop });
	}

	let dndOptions = $derived({
		items: items,
		flipDurationMs: 200,
		// dropTargetClasses: ['!outline-teal-500', '!outline-dashed'],
		dropTargetStyle: {
			outline: '1px dashed rgb(13 148 136)',
		},
		type: 'columns',
		autoAriaDisabled: true,
	});

	function handleSortConsider2(e: CustomEvent<DndEvent<DnDItem2>>) {
		const {
			items: dndItems,
			info: { id, trigger },
		} = e.detail;

		console.log(`consider event => ${trigger.toUpperCase()} - ${id}`, $state.snapshot(dndItems));
		items = dndItems;
	}
</script>

<section class="flex flex-col">
	{items.length}-{virtualListItems?.length}
	<div>
		<!-- <SimpleVirtualList
			bind:items
			itemSize={140}
			height={600}
			width={600}
			use={[[dndzone, dndOptions]]}
			onconsider={handleSortConsider2}
			onfinalize={handleSortConsider2}
			getKey={(index) => items[index]?.id}
			scrollDirection="horizontal"
			class="grid gap-10 w-full"
		>
			{#snippet renderItem(index: number)}
				{@const dndItem = items[index]}
				<div class="w-full h-full" style="width: 100%;">
					{items[index]?.name}
					-{index}--
				</div>
			{/snippet}
		</SimpleVirtualList> -->
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
			getKey={(index) => items[index]?.id}
			class="inner-container"
		>
			{#snippet theItem(style: string, index: number, key: number)}
				<div class="w-full" style="width: 100%;{virtualListItems[index]?.style}">
					{items[index]?.name}
					-{index}--
				</div>
			{/snippet}
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
		/* width: 70%; */
		/* padding: 0.2em; */
		/* border: 1px solid blue; */
		/* margin: 0.15em 0; */
	}

	:global(.inner-container) {
		/* margin: 24px 0; */
		/* margin-bottom: 2rem; */
	}
</style>
