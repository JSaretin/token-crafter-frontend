<script lang="ts">
	import { page } from '$app/stores';
	import '../app.css';
	import { ethers } from 'ethers';
	import { setContext } from 'svelte';
	import { writable, type Writable } from 'svelte/store';

	const signer: Writable<ethers.Signer> = writable();

	let showMetamaskError: boolean;

	async function connectWallet() {
		let browserProvider = (window as any).ethereum;
		if (!Boolean(browserProvider)) {
			showMetamaskError = true;
			// user does not have metamask
			return;
		}
		const provider = new ethers.BrowserProvider(browserProvider);
		$signer = await provider.getSigner();
	}

	let link = $page.url.href;
	let copied: boolean;

	async function copyLink() {
		const clipboard = window.navigator?.clipboard;
		if (clipboard !== undefined) {
			clipboard.writeText(link);
			copied = true;
		}
	}

	function resetCopied() {
		copied = false;
	}

	setContext('signer', signer);
	setContext('connectWallet', connectWallet);
</script>

<h1 class="text-2xl text-center my-6">TokenCrafter</h1>

{#if showMetamaskError}
	<div class="p-4 w-full h-screen flex align-middle place-items-center justify-center">
		<div
			class="max-w-sm w-full p-4 rounded-2xl shadow-sm shadow-orange-200 flex flex-col gap-4 text-lg"
		>
			<p class="text-red-600 font-medium">
				To create a new token, you need to have MetaMask installed or copy the link below and open
				it in your offline wallet (TrustWallet, MetaMask (mobile) or any other wallet with DAPP
				support) DAPP browser to continue.
			</p>
			<div class="rounded-2xl w-full bg-white overflow-hidden flex">
				<input type="text" value={link} class="py-4 pl-4 flex-1 font-mono" />
				{#if !copied}
					<button class="px-4 bg-blue-500 text-white" on:click={copyLink}>Copy</button>
				{:else}
					<button class="px-4 bg-green-500 text-white" on:blur={resetCopied} on:mouseout={resetCopied}>Copied</button>
				{/if}
			</div>

			<div class="flex justify-center">
				<a href="http://x.com/_TokenCrafter" target="_blank" rel="noopener noreferrer" class="text-4xl font-bold">X</a>
			</div>
		</div>
	</div>
{:else}
	<div class="max-w-lg w-full mx-auto text-neutral-600">
		<slot></slot>
	</div>
{/if}

<style lang="postcss">
	:global(html) {
		background-color: theme(colors.bg);
		font-family: theme(fontFamily.content);
	}
</style>
