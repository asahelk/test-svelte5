<script context="module">
    export function get({ params }) {
        return {
            props: {
                items: [],
            },
        };
    }
</script>

<script>
    import { onMount, onDestroy } from 'svelte';
    let items = Array.from({ length: 1000 }, (_, i) => ({
        id: `item-${i}`,
        text: `This is item number ${i}`,
    }));
    let container;
    let observer;
    let visibleItems = [];
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0,
    };
    function handleIntersect(entries) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const index = entry.target.getAttribute('data-index');
                if (!visibleItems.includes(index)) {
                    visibleItems = [...visibleItems, index];
                }
            }
        });
    }
    onMount(() => {
        observer = new IntersectionObserver(handleIntersect, options);
        items.forEach((item, index) => {
            // const element = document.createElement('div');
            // element.setAttribute('data-index', index);
            // element.textContent = item;
            // container.appendChild(element);
            // observer.observe(element);
        });
        return () => {
            observer.disconnect();
        };
    });
</script>

{JSON.stringify(visibleItems)}
<div bind:this={container} style="height: 600px; overflow-y: auto;width:1600px;background:teal;">
    {#each visibleItems as index}
        <div>{items[index]}</div>
    {/each}
</div>
