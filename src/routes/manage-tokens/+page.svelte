<script lang="ts">
	import { ethers } from 'ethers';
	import { OmegaFather } from '$lib/omegaFatherGateway';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	const signer = getContext('signer') as Writable<ethers.Signer>;
	const omegaFactory = getContext('omegaFactory') as Writable<OmegaFather>;

	let loadedSigner = false;
	let totalCreatedContracts: number = 0;
	let createdContracts: any[] = [];

	$: if (!loadedSigner && $signer !== undefined) {
		loadedSigner = true;
		setTimeout(async () => {
			let signerAddr = await $signer.getAddress();
			totalCreatedContracts = await $omegaFactory.getCreatorTotalContractsCounts(signerAddr);
			if (totalCreatedContracts == 0) return;
			createdContracts = await $omegaFactory.getCreatorContractsDetail(
				signerAddr,
				0,
				totalCreatedContracts
			);
		});
	}
</script>

<svelte:head>
	<title>Manage created tokens</title>
</svelte:head>

<div class="flex flex-col max-w-lg mx-auto">
	<h1 class="flex justify-between">Created Contracts <span>{totalCreatedContracts}</span></h1>
	<div class="flex flex-col gap-4 mt-6">
		{#each createdContracts as contract (contract.addr)}
			<a href={'/manage-tokens/' + contract.addr}>
				<div class="flex flex-col py-4 p-4 rounded-2xl shadow-sm shadow-orange-400">
					<div class="flex">{contract.name} <span>({contract.symbol})</span></div>
					<div class="">{contract.totalSupply}</div>
					<div class="">{contract.decimals}</div>
				</div>
			</a>
		{/each}
	</div>
</div>
