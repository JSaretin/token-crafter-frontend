<script lang="ts">
	import { ethers } from 'ethers';
	import { OmegaFather } from '$lib/omegaFatherGateway';
	import { OmegaToken } from '$lib/omegaTokenGateway';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { page } from '$app/stores';

	import FormStringInput from '$lib/componets/FormStringInput.svelte';
	import FormNumberInput from '$lib/componets/FormNumberInput.svelte';
	import FormCheckbox from '$lib/componets/FormCheckbox.svelte';

	const signer = getContext('signer') as Writable<ethers.Signer>;
	const omegaFactory = getContext('omegaFactory') as Writable<OmegaFather>;

	let loadedSigner = false;

	let contractData: any;
	let isOwner: boolean;
	let loading: boolean = true;
	let taxWallet: string;

	let buyTax: number = 0;
	let sellTax: number = 0;
	let transferTax: number = 0;
	let convertTaxToCoin: boolean;
	let canMint: boolean;
	let canBurn: boolean;

	let contract: OmegaToken;

	$: if (!loadedSigner && $signer !== undefined) {
		loadedSigner = true;
		setTimeout(async () => {
			let signerAddr = await $signer.getAddress();
			// contractData = await $omegaFactory.getContractDetails($page.params.token_address)
			contract = new OmegaToken($page.params.token_address, $signer);
			const owner = await contract.owner();
			isOwner = owner == signerAddr;
			taxWallet = await contract.taxWallet();

			buyTax = await contract.BUY_TAX();
			sellTax = await contract.SELL_TAX();
			transferTax = await contract.TRANSFER_TAX();
			convertTaxToCoin = await contract.convertTaxToCoin();
			canMint = await contract.mintEnabled();
			canBurn = await contract.burnEnabled();
			loading = false;
		});
	}

	async function updateSettings() {
		await contract.updateSettings(canMint, canBurn);
	}

	async function updateTax() {
		const result = await contract.setTax(buyTax, sellTax, transferTax, convertTaxToCoin);
	}

	let liquiditySetting: {
		etherValue: number;
		tokenValue: number;
		minToken: number;
		minEth: number;
	} = {
		etherValue: 0,
		tokenValue: 0,
		minToken: 0,
		minEth: 0
	};

	async function increaseTokenLiquidity() {
		const transaction = await contract.increaseLiquidity(
			liquiditySetting.etherValue,
			liquiditySetting.tokenValue,
			liquiditySetting.minToken,
			liquiditySetting.minEth
		);
	}

	let burnAmount: number;
	async function burnToken() {
		if (!Boolean(burnAmount)) return;
		await contract.burn(burnAmount);
	}

	let mintAmount: number;
	let mintReceiver: string;

	async function mintToken() {
		if (!Boolean(mintReceiver) || !Boolean(mintAmount)) return;
		await contract.mint(mintReceiver, mintAmount);
	}
</script>

{#if $signer == undefined}
	please connect your wallet
{:else if loading}
	loading
{:else if !isOwner}
	You can not manage this token with the connected wallet
{:else}
	<div class="">
		<div class="mb-6">
			<h2 class="uppercase mt-6">Update Settings</h2>

			<FormCheckbox title="Mint Status" bind:checked={canMint} />
			<FormCheckbox title="Burn Status" bind:checked={canBurn} />

			<button on:click={updateSettings} class="p-4 rounded-2xl bg-green-400 w-full text-white mt-6"
				>Update Status</button
			>
		</div>

		{#if taxWallet !== ethers.ZeroAddress}
			<div class="">
				<h2 class="uppercase mt-6">Token Tax Settings</h2>
				<FormNumberInput title="Buy Tax" bind:value={buyTax} />
				<FormNumberInput title="Sell Tax" bind:value={sellTax} />
				<FormNumberInput title="Transfer Tax" bind:value={transferTax} />
				<FormCheckbox title="Convert Tax To Coin" bind:checked={convertTaxToCoin} />
				<button on:click={updateTax} class="p-4 rounded-2xl bg-orange-400 w-full text-white mt-6"
					>Update Settings</button
				>
			</div>
		{/if}

		<div class="mt-6">
			<h2 class="uppercase mt-6">Increase Token Liquidity</h2>

			<FormNumberInput title="Coin Amount" bind:value={liquiditySetting.etherValue} />
			<FormNumberInput title="Token Amount" bind:value={liquiditySetting.tokenValue} />
			<button
				on:click={increaseTokenLiquidity}
				class="p-4 rounded-2xl bg-blue-400 w-full text-white mt-6">Increase liquidity</button
			>
		</div>

		{#if canMint}
			<div class="">
				<h2 class="uppercase mt-6">Mint New Tokens</h2>

				<FormStringInput title="Address" bind:value={mintReceiver} />
				<FormNumberInput title="Amount" bind:value={mintAmount} />
				<button on:click={mintToken} class="p-4 rounded-2xl bg-green-400 w-full text-white mt-6"
					>Mint token</button
				>
			</div>
		{/if}

		{#if canBurn}
			<div class="mb-6">
				<h2 class="uppercase mt-6">Burn Tokens</h2>

				<FormNumberInput title="Amount" bind:value={burnAmount} />
				<button on:click={burnToken} class="p-4 rounded-2xl bg-red-400 w-full text-white mt-6"
					>Burn token</button
				>
			</div>
		{/if}
	</div>
{/if}
