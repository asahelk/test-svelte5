<script lang="ts">
	import { setLocale } from '$lib/paraglide/runtime';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { m } from '$lib/paraglide/messages.js';
</script>

<h1>{m.hello_world({ name: 'SvelteKit User' })}</h1>
<div class="flex items-center gap-2">
	<button onclick={() => setLocale('en')}>en</button>
	<button onclick={() => setLocale('es')}>es</button>
	<button onclick={() => setLocale('ja')}>ja</button>
	<button onclick={() => setLocale('ko')}>ko</button>
	<button onclick={() => setLocale('zh-tw')}>zh-tw</button>
	<button onclick={() => setLocale('zh-cn')}>zh-cn</button>
	<button onclick={() => setLocale('zh-hk')}>zh-hk</button>
	<button onclick={() => setLocale('fr-fr')}>fr-fr</button>
	<button onclick={() => setLocale('de-de')}>de-de</button>
	<button onclick={() => setLocale('de-at')}>de-at</button>
	<button onclick={() => setLocale('de-ch')}>de-ch</button>
	<button onclick={() => setLocale('pt-br')}>pt-br</button>
	<button onclick={() => setLocale('pt-pt')}>pt-pt</button>
	<button class="rounded" onclick={() => setLocale('hi-in')}>hi-in</button>
</div>
<p>
	If you use VSCode, install the <a
		href="https://marketplace.visualstudio.com/items?itemName=inlang.vs-code-extension"
		target="_blank">Sherlock i18n extension</a
	> for a better i18n experience.
</p>

<style>
	button {
		background: var(--color-sky-600);
		color: white;
		padding: 4px 12px;
		border-radius: 4px;
		cursor: pointer;
	}

	button:hover {
		background: var(--color-sky-800);
	}
</style>
