<script lang="ts">
    let { item, index } = $props();
</script>

<div style="padding: 10px; border-bottom: 1px solid #ddd; background-color: #000; height: 100%; display:flex; align-items:center;">
    ID: {item.id} - Content: {item.text} (Index: {index})
</div>
