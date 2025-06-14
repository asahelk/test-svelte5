<svelte:options runes />

<script>
    import { onDestroy } from 'svelte';

    let { item = $bindable() } = $props();
</script>

<div class="flex flex-col">
    <div class="border">{item.name}</div>
    <div class="flex flex-col">
        {#each item.addresses as address (address.id)}
            <div>- {address.street}</div>
        {/each}
    </div>
</div>
