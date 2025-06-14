<script lang="ts">
    import { fade, scale } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    import { data } from '$lib/data/data';
    import ItemChild from '$lib/components/Simple/ItemChild.svelte';
    import { containersState, derivedAddressesState } from '$lib/data/data.svelte';
    import { dndzone } from 'svelte-dnd-action';

    containersState.containers = structuredClone(data);
    // let obj = $state({ array: [...data] });
    // let array = $state([0, 1, 2, 3, 4]);

    let containerIndex = $state(4);
    let filterIndex = $state(1);

    let returned: string | undefined = $state();

    function pop() {
        returned = containersState.containers.pop()?.name;
        // array = array;
    }

    function push() {
        // if ( containersState.containers.length > 0) {
        //     returned =  containersState.containers.push( containersState.containers[ containersState.containers.length - 1] + 1);
        //     // array = array;
        // } else {
        //     returned =  containersState.containers.push(0);
        //     // array = array;
        // }
        containersState.containers.push({
            id: containersState.containers.length + 1,
            name: `item-${containersState.containers.length}`,
            age: 18,
            addresses: [
                { id: 1, street: '123 Main St' },
                { id: 2, street: '456 Elm St' },
            ],
        });
    }

    function shift() {
        returned = containersState.containers.shift()?.name;
        // array = array;
    }

    function unshift() {
        if (containersState.containers.length > 0) {
            returned = `${containersState.containers.unshift({
                id: containersState.containers[0].id - 1,
                name: `item-${containersState.containers[0].id - 1}`,
                age: 18,
                addresses: [
                    { id: 1, street: '123 Main St' },
                    { id: 2, street: '456 Elm St' },
                ],
            })}`;
            // array = array;
        } else {
            returned = `${containersState.containers.unshift({
                id: 0,
                name: 'item-0',
                age: 18,
                addresses: [
                    { id: 1, street: '123 Main St' },
                    { id: 2, street: '456 Elm St' },
                ],
            })}`;
            // array = array;
        }
    }

    const auxItem = containersState.containers[containerIndex];
    const itemx = {
        ...auxItem,
    };
    function editFirstLevel() {
        itemx.name += '-x';
        containersState.containers[containerIndex] = { ...itemx };

        //  containersState.containers[index].name = `${ containersState.containers[index].name}-z`;
    }

    function editSecondLevel() {
        const item = containersState.containers[containerIndex];
        const address = item.addresses[filterIndex];
        item.addresses[filterIndex] = { ...address, street: `${address.street}-x` };
    }
</script>

<h1>Fun with Arrays!</h1>
<div class="flex flex-col gap-2">
    <input class="bg-[#333] text-white w-20" bind:value={containerIndex} />
    <input class="bg-[#333] text-white w-20" bind:value={filterIndex} />
</div>
<h3>array:</h3>
<!-- <div class="array"> -->
<div class="array" use:dndzone={{ items: containersState.containers, flipDurationMs: 100 }}>
    {#each containersState.containers as element, i (element.id)}
        <div animate:flip={{ duration: 300 }} out:scale={{ duration: 250 }} in:scale={{ duration: 250 }} class="element">
            <ItemChild bind:item={containersState.containers[i]}></ItemChild>
        </div>
    {/each}
</div>
<h3>returned:</h3>

<div class="returned">
    {returned}
</div>

<div class="text-white">
    {#each derivedAddressesState.addresses as address}
        <div>
            {address}
        </div>
    {/each}
</div>

<button onclick={editFirstLevel}>Edit First</button>
<button onclick={editSecondLevel}>Edit Second</button>
<button onclick={pop}>pop</button>
<button onclick={push}>push</button>
<button onclick={shift}>shift</button>
<button onclick={unshift}>unshift</button>

<style>
    :global(body) {
        color: #000;
        margin: 4%;
    }

    h1 {
        max-width: 30rem;
        color: #4e7;
        text-shadow: -0.125rem 0.125rem 0 #b5f;
        font-size: 3.25rem;
        transform: rotate(-9deg);
        margin-bottom: 2em;
    }

    .array {
        display: flex;
    }

    .element {
        width: 10em;
        background-color: #5f8;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid black;
    }

    .element + .element {
        margin-left: 0.25em;
    }

    .returned {
        width: 3em;
        height: 3em;
        background-color: #ff5599;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid black;
        margin-bottom: 2rem;
    }

    button {
        color: #000;
        background-color: #bb99ff;
        padding: 0.75em 1.5em;
        border: 2px solid black;
        border-radius: 0.25em;
        box-shadow: -0.25em 0.25em 0 #000;
        cursor: pointer;
    }

    button + button {
        margin-left: 0.5em;
    }
</style>
