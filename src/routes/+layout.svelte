<script lang="ts">
	import { page } from '$app/stores';
	import Socials from '$lib/componets/Socials.svelte';
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
	<div class="fixed inset-0 bg-bg z-50 flex justify-center align-middle place-items-center">
		<div class="max-w-md w-full p-4 rounded-2xl shadow-sm shadow-orange-400 relative">
			<button
				class="absolute top-0 right-0 text-red-400"
				on:click={() => {
					showMetamaskError = false;
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="w-6 h-6"
				>
					<path
						fill-rule="evenodd"
						d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>
			<p class="italic text-sm text-neutral-500 leading-relaxed">
				To create a new token, you need to have MetaMask installed or copy the link below and open
				it in your offline wallet (TrustWallet, MetaMask (mobile) or any other wallet with DAPP
				support) DAPP browser to continue.
			</p>
			<div class="mt-6 rounded-2xl w-full bg-white overflow-hidden flex">
				<input type="text" value={link} class="py-4 pl-4 text-neutral-500 font-bold flex-1 font-mono" />
				{#if !copied}
					<button class="px-4 bg-blue-500 text-white" on:click={copyLink}>Copy</button>
				{:else}
					<button
						class="px-4 bg-green-500 text-white"
						on:blur={resetCopied}
						on:mouseout={resetCopied}>Copied</button
					>
				{/if}
			</div>
			<div class="mt-6">
			<Socials />

			</div>
		</div>
	</div>
{/if}

<div class="max-w-lg w-full mx-auto text-neutral-600">
	<slot></slot>
</div>

<style lang="postcss">
	:global(html) {
		background-color: theme(colors.bg);
		font-family: theme(fontFamily.content);
	}
</style>
