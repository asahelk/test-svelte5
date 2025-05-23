<script lang="ts">
    import { tick, type Component } from 'svelte';

    // Props definition for the VirtualList component
    interface Item {
        id: string | number; // Each item must have a unique id
        [key: string]: unknown; // Allow other properties on the item
    }

    let {
        items, // Array of items to display
        itemHeight, // Fixed height of each item in pixels (number)
        ItemComponent, // The Svelte component to render for each visible item
        PlaceholderComponent = null, // Optional: A Svelte component to render for non-visible items
        rootMargin = '200px 0px', // IntersectionObserver rootMargin
        containerHeight = '500px', // CSS height for the scrollable container
        containerClass = '', // Optional CSS class for the main container
    } = $props<{
        items: Item[];
        itemHeight: number;
        ItemComponent: Component; // Constructor of a Svelte component
        PlaceholderComponent?: Component | null;
        rootMargin?: string;
        containerHeight?: string;
        containerClass?: string;
    }>();

    // Reactive state
    let viewportRef = $state<HTMLElement | null>(null); // Reference to the scrollable container div
    const visibleItemIds: Record<string, boolean> = $state({}); // Set of item IDs that are currently visible

    // Non-reactive variable to hold the IntersectionObserver instance.
    // Its lifecycle is managed by the $effect below.
    let activeObserver: IntersectionObserver | null = null;

    // $inspect('visibleItemIds', visibleItemIds);

    // Map to keep track of DOM elements associated with item IDs for the observer.
    // This does not need to be $state as its modifications are handled imperatively by the action
    // and used by the $effect when the observer is (re)created.
    const observedElementsRegistry = new Map<string | number, HTMLElement>();

    /**
     * Svelte action to manage observation of individual item elements.
     */
    function observeElementAction(node: HTMLElement, itemId: string | number) {
        observedElementsRegistry.set(itemId, node);
        // await tick();

        // If an observer instance currently exists, start observing this new node.
        if (activeObserver) {
            activeObserver.observe(node);
        }

        return {
            destroy() {
                // When the element is destroyed:
                if (activeObserver) {
                    activeObserver.unobserve(node); // Stop observing
                }
                observedElementsRegistry.delete(itemId); // Unregister the element
                delete visibleItemIds[itemId]; // Ensure it's marked as not visible (this is a $state change, which is fine here)
            },
        };
    }

    /**
     * Effect to initialize and manage the IntersectionObserver instance.
     * This effect re-runs if `viewportRef` or `rootMargin` (props are reactive dependencies) change.
     */
    $effect(() => {
        const currentViewport = viewportRef; // Capture $state value

        // Cleanup previous observer if it exists.
        // `activeObserver` here refers to the instance created in the previous run of this effect.
        if (activeObserver) {
            activeObserver.disconnect();
        }

        if (!currentViewport) {
            activeObserver = null; // No viewport, so no observer
            return; // Cleanup for this path (no observer created) is handled by the initial disconnect.
        }

        // Create the new IntersectionObserver
        // Store it in the non-reactive 'activeObserver' variable.
        activeObserver = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    const itemId = (entry.target as HTMLElement).dataset.itemId;

                    if (itemId === undefined) continue;

                    if (entry.isIntersecting) {
                        visibleItemIds[itemId] = true; // Modify $state Set
                    } else {
                        delete visibleItemIds[itemId]; // Modify $state Set
                    }
                }
                // Direct modifications to a $state Set are reactive.
            },
            {
                root: currentViewport,
                rootMargin: rootMargin, // from props
                threshold: 0.01,
            },
        );

        // Observe all elements that have been registered so far.
        // This is important if elements were added to the registry before the observer was ready
        // or when the observer is recreated (e.g. due to rootMargin change).
        for (const el of observedElementsRegistry.values()) {
            activeObserver.observe(el);
        }

        // Cleanup function for *this* observer instance when the effect re-runs or component unmounts.
        // const observerToClean = activeObserver; // Capture the current instance for cleanup.
        return () => {
            if (activeObserver) {
                activeObserver.disconnect();
            }
            // If activeObserver was this one, it will be reset or replaced in the next effect run.
        };
    });

    // Derived state: total height of the scrollable content
    let totalHeight = $derived(items.length * itemHeight);

    // Reactive helper function to check if an item is visible
    const isVisible = (itemId: string | number) => visibleItemIds[itemId];
</script>

{JSON.stringify(visibleItemIds)}
<div
    bind:this={viewportRef}
    class="virtual-list-container {containerClass}"
    style:height={containerHeight}
    style="overflow-y: auto; position: relative; border: 1px solid #eee;"
>
    <div class="virtual-list-spacer" style:height="{totalHeight}px" style="position: relative; width: 100%;">
        {#each items as item, index (item.id)}
            {@const itemId = item.id}
            <div
                class="virtual-list-item-wrapper"
                style:top="{index * itemHeight}px"
                style:height="{itemHeight}px"
                style="position: absolute; left: 0; right: 0; contain: layout style paint;"
                data-item-id={itemId}
                use:observeElementAction={itemId}
            >
                {#if isVisible(itemId)}
                    <ItemComponent {item} {index} />
                {:else if PlaceholderComponent}
                    <PlaceholderComponent {item} {index} />
                {:else}
                    <div style="height: 100%; width: 100%;"></div>
                {/if}
            </div>
        {/each}
    </div>
</div>

<style>
    .virtual-list-container {
        /* background-color: #f0f0f0; */ /* For debugging visibility */
    }
    .virtual-list-item-wrapper {
        box-sizing: border-box;
        /* border: 1px dashed #f00; */ /* Optional: for visualizing item wrappers */
        display: flex;
        align-items: stretch;
    }
    .virtual-list-item-wrapper > :global(*) {
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
</style>
