<script lang="ts">
	import { ethers } from 'ethers';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	const signer = getContext('signer') as Writable<ethers.Signer>;
	const connectWallet = getContext('connectWallet') as () => Promise<void>;

</script>

{#if $signer === undefined}
	<div
		class="max-w-lg w-full justify-center align-middle place-items-center mx-auto flex flex-col gap-2 p-6"
	>
		<h2>Connect your wallet to manage tokens</h2>
		<button on:click={connectWallet} class="bg-blue-500 py-2 px-6 rounded-2xl text-white w-fit"
			>Connect Wallet</button
		>
	</div>
{:else}
	<slot />
{/if}
