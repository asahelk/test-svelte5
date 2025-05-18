<script lang="ts">
    import { dndzone } from 'svelte-dnd-action';
    import type VirtualListType from './VirtualList3.svelte';
    import VirtualList from './VirtualList3.svelte';
    import { array } from '../virtuallist5/states.svelte';
    import type { DndEvent } from 'svelte-dnd-action';

    // let items = $state(Array.from({length: 13}, (_, i) =>
    // 	({id:crypto.randomUUID(), name:`xitem ${i+1}`})))

    let virtualList = $state<ReturnType<typeof VirtualListType>>();

    let items = $derived.by(() => {
        // virtualList?.getVirtualItems();
        return [...array.value];
    });

    type DnDItem = (typeof items)[number];

    let count = 0;
    function handleSortConsider(e: CustomEvent<DndEvent<DnDItem>>) {
        // console.log("event", JSON.stringify(e.detail,null, 2))
        const {
            items: dndItems,
            info: { id: elementIndex, trigger },
        } = e.detail;
        console.log(`consider event => ${trigger.toUpperCase()} - ${elementIndex}`, $state.snapshot(dndItems));

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

        const partialDndItems = dndItems.slice(start, stop + 1).map((e, i) => {
            return {
                ...e,
                index: vlItems?.[i].index,
                style: vlItems?.[i].style,
            };
        });

        console.log('partialDndItems', $state.snapshot(partialDndItems));
        // console.log("dndItems",JSON.stringify(dndItems,null, 2))
        console.log('dndItems', $state.snapshot(dndItems));

        virtualList?.setVirtualItems(partialDndItems);
        items = dndItems;
        console.log('\n\n');
    }

    function handleSortFinalize(e: CustomEvent<DndEvent<DnDItem>>) {}

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

<section>
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
            <div {style}>
                {items[index]?.name}-{index}-{key}
            </div>
        {/snippet}

        <!-- getKey={(index) => items[index].id} -->

        <!-- <div slot="item" let:index let:style {style}>
			{index}-{style}
		</div> -->
    </VirtualList>
    <button class="bg-neutral-500 p-2 cursor-pointer" onclick={testClick}> Test </button>
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
