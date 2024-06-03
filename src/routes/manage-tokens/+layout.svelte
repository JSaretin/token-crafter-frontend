<script lang="ts">
	import { ethers } from 'ethers';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	const signer = getContext('signer') as Writable<ethers.Signer>;
	const connectWallet = getContext('connectWallet') as () => Promise<void>;
</script>

{#if $signer === undefined}
	<div
		class="max-w-lg w-full justify-center align-middle place-items-center mx-auto flex flex-col gap-2"
	>
		<h2>Connect your wallet to manage tokens</h2>
		<button on:click={connectWallet} class="bg-blue-500 p-4 mt-6 rounded-2xl text-white w-fit"
			>Connect Wallet</button
		>
	</div>
{:else}
	<div class="w-full flex justify-between mb-6">
		<a href="/" class="text-blue-600">Back</a>
		<a href="/create-token" class="text-yellow-400">Create Token</a>
	</div>
	<slot />
{/if}
