<script lang="ts">
	import '../app.css';
	import { ethers } from 'ethers';
	import { setContext } from 'svelte';
	import { writable, type Writable } from 'svelte/store';

	const signer: Writable<ethers.Signer> = writable();

	async function connectWallet() {
		let browserProvider = (window as any).ethereum;
		if (!Boolean(browserProvider)) {
			// user does not have metamask
			return;
		}
		const provider = new ethers.BrowserProvider(browserProvider);
		$signer = await provider.getSigner();
	}

	setContext('signer', signer);
	setContext('connectWallet', connectWallet);
</script>

<h1 class="text-2xl text-center my-6">TokenCrafter</h1>

<div class="max-w-lg w-full mx-auto text-neutral-600">
	<slot></slot>
</div>

<style lang="postcss">
	:global(html) {
		background-color: theme(colors.bg);
		font-family: theme(fontFamily.content);
	}
</style>
