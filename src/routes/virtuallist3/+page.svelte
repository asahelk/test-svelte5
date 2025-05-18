<script lang="ts">
    import { dndzone, TRIGGERS } from 'svelte-dnd-action';
    import type VirtualListType from './VirtualList3.svelte';
    import VirtualList from './VirtualList3.svelte';
    import { array } from '../virtuallist5/states.svelte';
    import type { DndEvent } from 'svelte-dnd-action';

    // let items = $state(Array.from({ length: 33 }, (_, i) => ({ id: crypto.randomUUID(), name: `xitem ${i + 1}` })));

    let virtualList = $state<ReturnType<typeof VirtualListType>>();

    let items = $derived.by(() => {
        // virtualList?.getVirtualItems();
        return [...array.value];
    });

    type DnDItem = (typeof items)[number];

    let count = 0;
    let wrongElementTakenIndex = -1;
    let originalElementIndex = -1;
    let originalElementId = '';

    function handleSortConsider(event: CustomEvent<DndEvent<DnDItem>>) {
        // console.log("event", JSON.stringify(e.detail,null, 2))
        const {
            items: dndItems,
            info: { id: elementId, trigger },
        } = event.detail;
        console.log(`consider event => ${trigger.toUpperCase()} - ${elementId}`, $state.snapshot(dndItems));

        if (virtualList === undefined) return;

        // The problem here is that dnd grab the id by position of the VirtualList
        // e.g if is rendered from 10-20 and the grabbed item is 15 it returns the id of the item in index 5

        // const elementId = e.detail.info.id

        // use it to get the selected item in the VL

        const vlItems = virtualList.getVirtualItems();

        const start = vlItems[0].index;
        const stop = vlItems[vlItems.length - 1].index;

        // const dndItemsMapped = dndItems.map((e,i) => {

        // 	return {...e,index:i}
        // })

        // const { offset } = virtualList.getState();
        // const {start, stop} = virtualList.getVisibleRange()

        // const partialDndItems = dndItemsMapped.slice(start,stop)

        // const indexDragged = items.findIndex(e => e.id === elementId)

        // console.log("indexDragged",indexDragged)

        // items[indexDragged] = {
        // 	...items[indexDragged],
        // 	id: "id:dnd-shadow-placeholder-0000",
        // 	isDndShadowItem : true
        // }

        // const sliced = dndItems.slice(start,stop+1)
        // console.log("sliced",sliced)

        if (trigger === 'dragStarted' || trigger === 'draggedEntered') {
            // const indexVL = items.findIndex(e => e.id === fakeElementId || e.id === '"id:dnd-shadow-placeholder-0000"')
            // let originalIndex = vlItems[indexVL]?.index
            // console.log({start,stop,vlItems,indexVL,originalIndex})
            // const temp = {...dndItems[indexVL]}
            // dndItems[indexVL] = items[indexVL]
            // // dndItems[originalIndex].id = "id:dnd-shadow-placeholder-0000"
            // // dndItems[originalIndex].isDndShadowItem= true
            // dndItems[originalIndex] = {...temp}
            // dndItems[5].name = "hola " + count++
            // const temp = {...dndItems[0]};
            // dndItems[0] = {...dndItems[5]};
            // dndItems[5] = {...temp};
        }

        console.log('start', start);
        console.log('stop', stop);
        const partialDndItems = dndItems.slice(start, stop + 1).map((e, i) => {
            return {
                ...e,
                index: vlItems?.[i].index,
                style: vlItems?.[i].style,
            };
        });

        wrongElementTakenIndex = dndItems.findIndex((e) => e.id === 'id:dnd-shadow-placeholder-0000');
        // const wrongElementTaken = items[wrongElementTakenIndex];
        originalElementIndex = wrongElementTakenIndex + start;
        originalElementId = originalElementId ? originalElementId : items[originalElementIndex].id;

        console.log('originalElementId', $state.snapshot(originalElementId));
        console.log('originalElementIndex', $state.snapshot(originalElementIndex));
        console.log('wrongElementTakenIndex', $state.snapshot(wrongElementTakenIndex));
        if (originalElementIndex !== -1) {
            const wrongElementExistsInDndItems = dndItems.findIndex((e) => e.id === elementId);
            if (wrongElementExistsInDndItems !== -1) {
                dndItems.splice(wrongElementExistsInDndItems, 1);
                dndItems.splice(originalElementIndex, 0, items[originalElementIndex]);
            }
        }

        // if (originalElementIndex === -1) return;

        const dndItemsMapped = dndItems.map((e, i) => {
            if (start !== 0 && wrongElementTakenIndex !== -1 && (trigger === TRIGGERS.DRAG_STARTED || trigger === TRIGGERS.DRAGGED_ENTERED)) {
                console.log('INSIDE!!', wrongElementTakenIndex);
                if (i === wrongElementTakenIndex) {
                    return { ...items[wrongElementTakenIndex], index: i, test: 'wrong' };
                }
                if (i === originalElementIndex) {
                    event.detail.info = { ...event.detail.info, id: e.id };
                    return { ...items[originalElementIndex], id: 'id:dnd-shadow-placeholder-0000', isDndShadowItem: true, index: i, test: 'orig' };
                }
            }

            return {
                ...e,
                index: i,
            };
        });

        // console.log('partialDndItems', $state.snapshot(partialDndItems));
        // console.log("dndItems",JSON.stringify(dndItems,null, 2))
        console.log('items', $state.snapshot(items));
        console.log('dndItemsMapped', $state.snapshot(dndItemsMapped));
        // virtualList?.setVirtualItems(partialDndItems);
        // virtualList.recomputeSizes(start);
        items = dndItemsMapped;

        console.log('\n\n');
    }

    // NOT WORKING, THE DND LIBRARY MANIPULATE ITS OWN LIST OF ITEMS EVEN WHEN SPECIFIC INDEX IS BEING CHANGED THE DND LIBRARY IS UPDATING ITS OWN LIST OF ITEMS ON CALLBACKS
    function handleSortFinalize(e: CustomEvent<DndEvent<DnDItem>>) {
        const {
            items: dndItems,
            info: { id: elementId, trigger },
        } = e.detail;
        console.log(`finalize event => ${trigger.toUpperCase()} - ${elementId}`, $state.snapshot(dndItems));

        if (virtualList === undefined) return;

        if (wrongElementTakenIndex !== originalElementIndex) {
            dndItems[originalElementIndex].id = originalElementId;
        }

        console.log('items', $state.snapshot(items));
        console.log('dndItems', $state.snapshot(dndItems));

        items = dndItems;
    }

    function testClick() {
        if (virtualList === undefined) return;
        const { offset } = virtualList.getState();
        const { start, stop } = virtualList.getVisibleRange();
        console.log({ offset, start, stop });
    }

    function onscroll() {
        items = [...items];
        // const { start, stop } = virtualList.getVisibleRange();
        // virtualList.recomputeSizes(start);
    }

    // 	import {overrideItemIdKeyNameBeforeInitialisingDndZones} from "svelte-dnd-action";
    // overrideItemIdKeyNameBeforeInitialisingDndZones("index");
</script>

<section class="">
    {items.length}
    <VirtualList
        bind:this={virtualList}
        use={[
            [
                dndzone,
                {
                    items: items,
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
        itemSize={32}
        overscanCount={0}
        onconsider={handleSortConsider}
        onfinalize={handleSortFinalize}
        wrapperRestProps={{ onscroll }}
        getKey={(index) => items[index].id}
    >
        {#snippet theItem(style: string, index: number, key: number)}
            <div style="width: 100%;">
                {items[index]?.name} - {index} - - {key}
            </div>
        {/snippet}

        <!-- getKey={(index) => items[index].id} -->

        <!-- <div slot="item" let:index let:style {style}>
			{index}-{style}
		</div> -->
    </VirtualList>
    <button class="bg-neutral-500 p-2 cursor-pointer" onclick={testClick}> Test </button>

    <section class="grid grid-cols-5">
        <pre class="col-span-1 bg-black! text-white!" style="font-size:0.775rem">
			{JSON.stringify(items, null, 2)}
		</pre>
        <pre class="col-span-4 bg-black! text-white!" style="font-size:0.775rem">
			{JSON.stringify(virtualList?.getVirtualItems(), null, 2)}
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
        width: 50%;
        padding: 0.2em;
        border: 1px solid blue;
        margin: 0.15em 0;
    }
</style>
