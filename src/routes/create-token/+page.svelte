<script lang="ts">
	import { ethers } from 'ethers';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import FormStringInput from '$lib/componets/FormStringInput.svelte';
	import FormNumberInput from '$lib/componets/FormNumberInput.svelte';
	import FormCheckbox from '$lib/componets/FormCheckbox.svelte';

	import { OmegaFather } from '$lib/omegaFatherGateway';
	import { omegaFactories } from '$lib/contractAddresses';

	let omegaFactory: OmegaFather;

	const signer = getContext('signer') as Writable<ethers.Signer>;
	const connectWallet = getContext('connectWallet') as () => Promise<void>;

	let taxWallet: string = '';
	let decimals: number;
	let buyTax: number;
	let sellTax: number;
	let transferTax: number;
	let totalSupply: number;
	let name: string = '';
	let symbol: string = '';
	let isPartner: boolean = false;
	let hasTax: boolean;

	let required = true;
	let network = selectSupportedNetwork();
	let unsupported = false;

	let errors: string[] = [];

	async function switchNetwork(chainId: number) {
		try {
			await (window as any).ethereum.request({
				method: 'wallet_switchEthereumChain',
				params: [{ chainId: `0x${parseInt(chainId.toString(), 10).toString(16)}` }]
			});
		} catch (switchError: any) {
			// This error code indicates that the chain has not been added to MetaMask
			if (switchError.code === 4902) {
				throw 'This network is not available in your MetaMask, please add it manually';
			} else {
				throw 'Failed to switch the network';
			}
		}
	}
	async function createToken() {
		if (!hasTax) {
			taxWallet = '';
			sellTax = 0;
			buyTax = 0;
			transferTax = 0;
		}

		const userNetwork = (await $signer.provider?.getNetwork())?.chainId as bigint;
		if (ethers.toNumber(userNetwork) !== network) {
			try {
				await switchNetwork(network);
			} catch (err: any) {
				errors = [err, ...errors];
				return;
			}
		}
		omegaFactory = new OmegaFather((omegaFactories as any)[network], $signer);

		const rawBalance = await $signer.provider!.getBalance($signer.getAddress());
		const [mainFee, partFee] = await omegaFactory.getCreationFee();

		if (!isPartner && rawBalance < mainFee) {
			// alert the user
			errors = [
				`Your balance is too low to create a new token. You need to have at least ${ethers.formatEther(mainFee)} ${(await $signer.provider!.getNetwork()).name}`,
				...errors
			];
			return;
		}

		if (isPartner && rawBalance < partFee) {
			errors = [
				`Your balance is too low to create a new token. You need to have at least ${ethers.formatEther(partFee)} ${(await $signer.provider!.getNetwork()).name}`,
				...errors
			];
			return;
		}

		try {
			const token = await omegaFactory.createToken(
				taxWallet,
				decimals,
				buyTax,
				sellTax,
				transferTax,
				totalSupply,
				name,
				symbol,
				isPartner
			);
			// result
			await goto('manage-tokens/' + token.createdToken);
		} catch (err) {
			console.log(err);
		}
	}

	function selectSupportedNetwork() {
		return Number(Object.keys(omegaFactories).shift());
	}

	async function connectUserWallet() {
		await connectWallet();
	}

	function checkNetwork() {
		if ((omegaFactories as any)[network] === undefined) {
			unsupported = true;
			return;
		}
		unsupported = false;
	}
</script>

{#if errors}
	<div class="fixed flex z-[100] flex-col text-sm gap-2 top-0 right-0 max-w-sm p-2">
		{#each errors as error, index}
			<button
				on:click={() => {
					errors = errors.filter((e, i) => i !== index);
				}}
			>
				<p
					class="px-4 py-2 backdrop-blur-sm text-red-500 border border-red-300 bg-red-400 bg-opacity-20 rounded-2xl"
				>
					{error}
				</p>
			</button>
		{/each}
	</div>
{/if}

{#if unsupported}
	<div class="fixed inset-0 bg-bg z-50 flex justify-center align-middle place-items-center">
		<div class="max-w-md w-full p-4 rounded-2xl shadow-sm shadow-orange-400 relative">
			<button
				class="absolute top-0 right-0 text-red-400"
				on:click={() => {
					network = selectSupportedNetwork();
					unsupported = false;
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
			<p class="italic text-sm text-neutral-500">
				The selected network is not supported for now. We are currently under development to support
				the network, check back support or submit your email below to get notified once it's added.
			</p>
			<div class="mt-6 flex flex-col gap-2">
				<input type="email" class="p-4 rounded-2xl w-full" placeholder="awesomeuser@gmail.com" />
				<button class="p-4 rounded-2xl bg-green-400 text-white"> 🔔 Get Notified</button>
			</div>
		</div>
	</div>
{/if}

<div class="flex">
	<form class="px-4 flex-1 flex flex-col mx-auto max-w-md" on:submit|preventDefault={createToken}>
		<FormStringInput {required} placeholder="Bitcoin" title="Name" bind:value={name} />
		<FormStringInput {required} placeholder="BTC" title="Symbol" bind:value={symbol} />
		<FormNumberInput
			{required}
			placeholder="8000000000"
			title="Total Supply"
			bind:value={totalSupply}
		/>
		<FormNumberInput {required} placeholder="18" title="Decimals" bind:value={decimals} />

		<label class="flex flex-col gap-4 py-2">
			Select Network
			<select
				class="p-4 rounded-md bg-white"
				bind:value={network}
				on:change={checkNetwork}
				{required}
			>
				<option value={1}>Etheruem</option>
				<option value={56}>Binance Smart Chain</option>
				<option value={137}>Polygon</option>
				<option value={100}>Gnosis</option>
				<option value={314}>Filecoin</option>
				<option value={2222}>Kava</option>
				<option value={10}>Optimism</option>
				<option value={43114}>Avalanche</option>
				<option value={42161}>Arbitrum One</option>
				<option value={25}>Cronos</option>
				<option value={1284}>Moonbeam</option>
			</select>
		</label>

		<FormCheckbox title="Add Tax" bind:checked={hasTax} />
		{#if hasTax}
			<FormStringInput
				{required}
				placeholder={ethers.ZeroAddress}
				title="Tax Wallet"
				bind:value={taxWallet}
			/>
			<FormNumberInput placeholder="10%" title="Buy Tax" bind:value={buyTax} />
			<FormNumberInput placeholder="8%" title="Sell Tax" bind:value={sellTax} />
			<FormNumberInput placeholder="2%" title="Transfer Tax" bind:value={transferTax} />
		{/if}
		<FormCheckbox title="Enable Partnership" bind:checked={isPartner} />

		{#if $signer === undefined}
			<button
				type="button"
				class="w-full p-4 rounded-md bg-orange-400 mt-6 text-white"
				on:click={connectUserWallet}>Connect Wallet</button
			>
		{:else}
			<button type="submit" class="w-full p-4 rounded-md bg-green-400 mt-6 text-white"
				>Create Token</button
			>
		{/if}
	</form>
</div>
