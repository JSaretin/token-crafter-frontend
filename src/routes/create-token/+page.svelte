<script lang="ts">
	import { ethers } from 'ethers';
	import { getContext, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import FormStringInput from '$lib/componets/FormStringInput.svelte';
	import FormNumberInput from '$lib/componets/FormNumberInput.svelte';
	import FormCheckbox from '$lib/componets/FormCheckbox.svelte';

	import { OmegaFather } from '$lib/omegaFatherGateway';
	import { omegaFactories } from '$lib/contractAddresses';
	import Socials from '$lib/componets/Socials.svelte';
	import CheckTax from '$lib/componets/CheckTax.svelte';

	let omegaFactory: OmegaFather;

	const siteLink = getContext('siteLink');

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
	let creating = false

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

		creating = true

		await connectUserWallet()

		const userNetwork = (await $signer.provider?.getNetwork())?.chainId as bigint;
		if (ethers.toNumber(userNetwork) !== network) {
			try {
				await switchNetwork(network);
			} catch (err: any) {
				errors = [err, ...errors];
				return;
			}
			await connectWallet();
		}
		omegaFactory = new OmegaFather((omegaFactories as any)[network], $signer);

		const rawBalance = Number(ethers.formatEther(await $signer.provider!.getBalance($signer.getAddress())));

		if (!isPartner && rawBalance < fees[network].non_partner) {
			// alert the user
			errors = [
				`Your balance is too low to create a new token. You need to have at least ${fees[network].non_partner} ${coins[network]}`,
				...errors
			];
			return;
		}

		if (isPartner && rawBalance < fees[network].partner) {
			errors = [
				`Your balance is too low to create a new token. You need to have at least ${fees[network].partner} ${coins[network]}`,
				...errors
			];
			creating = false
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
			creating= false
			errors = [String(err), ...errors];
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

	let buyTaxError = false;
	let sellTaxError = false;
	let transferTaxError = false;

	$: isInvelidForm = hasTax && (buyTaxError || sellTaxError || transferTaxError);

	let showConfirmation = false;
	let fee = 0;

	const rpc = {
		137: 'https://polygon-mainnet.infura.io/v3/ca62ea2529ea4d0a8ab47ae53ae84082',
		56: 'https://bsc-dataseed1.binance.org/'
	};

	let fees: {
		[chain: number]: {
			non_partner: number;
			partner: number;
		};
	} = {};

	let coins: { [chain: number]: string } = {};

	async function loadFees() {
		await Promise.all(
			Object.keys(omegaFactories).map(async (key) => {
				try {
					const pro = new ethers.JsonRpcProvider((rpc as any)[key]);
					const net = await pro.getNetwork();
					coins[key as any] = net.name.toUpperCase();
					const [withoutPartner, part] = await new OmegaFather(
						(omegaFactories as any)[key],
						pro
					).getCreationFee();
					fees[key as any] = {
						non_partner: Number(ethers.formatEther(withoutPartner)),
						partner: Number(ethers.formatEther(part))
					};
				} catch (e) {
					errors = ['Unable to estimate creation fee', ...errors];
				}
			})
		);
	}

	onMount(async () => {
		await loadFees();
	});

	async function showConfirmationPopUp() {
		showConfirmation = true;
	}
</script>

<svelte:head>
	<title>Create new token</title>
</svelte:head>

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

{#if showConfirmation}
	<div
		class="fixed inset-0 flex justify-center align-middle place-items-center bg-neutral-800 bg-opacity-80 backdrop-blur-sm p-2"
	>
		<div class="max-w-lg w-full flex flex-col bg-neutral-300 rounded-md">
			<div class="w-full flex justify-center p-4 border-b-2 border-neutral-400">
				<h2 class="text-2xl uppercase">Token Preview</h2>
			</div>
			<div class="flex flex-col p-4 [&_span]:text-neutral-500">
				<div class="flex justify-between">
					Name: <span>{name}</span>
				</div>
				<div class="flex justify-between">
					Symbol: <span>{symbol}</span>
				</div>
				<div class="flex justify-between">
					Total Supply: <span>{Number(totalSupply).toLocaleString()}</span>
				</div>
				<div class="flex justify-between">
					Decimals: <span>{decimals}</span>
				</div>
				<div class="flex justify-between">
					Is Parterner: <span>{isPartner ? 'Yes' : 'No'}</span>
				</div>

				{#if hasTax}
					<div class="flex justify-between whitespace-nowrap">
						Tax Wallet: <span class="truncate">{taxWallet}</span>
					</div>
					<div class="flex justify-between">
						Buy Tax: <span>{buyTax || 0}%</span>
					</div>
					<div class="flex justify-between">
						Sell Tax: <span>{sellTax || 0}%</span>
					</div>
					<div class="flex justify-between">
						Transfer Tax: <span>{transferTax || 0}%</span>
					</div>
				{/if}
				<div class="flex justify-between">
					Deployment Fee: <span>{isPartner? fees[network].partner : fees[network].non_partner} {coins[network]}</span>
				</div>
			</div>

			<div class="flex gap-4 mt-10 pt-3 border-t-2 p-4 border-neutral-400 text-white">
				<button
					class="flex-1 p-4 bg-yellow-500 rounded-md"
					on:click={() => {
						showConfirmation = false;
					}}>Edit</button
				>
				<button class="flex-1 p-4 bg-green-500 overflow-hidden rounded-md relative" disabled={creating} on:click={createToken}>
					{#if creating}
						<div class="bg-green-500 absolute inset-0 flex justify-center align-middle place-items-center">
							Creating...
						</div>
					{/if}
					Create</button>
			</div>
		</div>
	</div>
{/if}

<div class="flex flex-col w-full">
	<div class="w-full flex justify-between">
		<a href="/" class="text-blue-600">Back</a>
		<a href="/manage-tokens" class="text-green-600">Manage Tokens</a>
	</div>
	<form
		class="w-full mt-6 flex-1 flex flex-col mx-auto"
		on:submit|preventDefault={showConfirmationPopUp}
	>
		<FormStringInput {required} placeholder="Bitcoin" title="Name" bind:value={name} />
		<FormStringInput {required} placeholder="BTC" title="Symbol" bind:value={symbol} />
		<FormNumberInput
			{required}
			placeholder="8000000000"
			title="Total Supply"
			bind:value={totalSupply}
		/>
		<FormNumberInput
			{required}
			placeholder="18"
			title="Decimals (Recommended 18)"
			bind:value={decimals}
		/>

		<label class="flex flex-col gap-4 py-2">
			Select Network
			<select
				class="p-4 rounded-md bg-white"
				bind:value={network}
				on:change={checkNetwork}
				{required}
			>
				<!-- <option value={1}>Etheruem</option> -->
				<option value={56}>Binance Smart Chain</option>
				<option value={137}>Polygon</option>
				<option value={-1}>Solana</option>
				<option value={-2}>TON</option>
				<!-- <option value={100}>Gnosis</option> -->
				<!-- <option value={314}>Filecoin</option> -->
				<!-- <option value={2222}>Kava</option> -->
				<!-- <option value={10}>Optimism</option> -->
				<!-- <option value={43114}>Avalanche</option> -->
				<!-- <option value={42161}>Arbitrum One</option> -->
				<!-- <option value={25}>Cronos</option> -->
				<!-- <option value={1284}>Moonbeam</option> -->
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
			<CheckTax bind:tax={buyTax} bind:isPartner bind:error={buyTaxError} />
			<FormNumberInput placeholder="8%" title="Sell Tax" bind:value={sellTax} />
			<CheckTax bind:tax={sellTax} bind:isPartner bind:error={sellTaxError} />
			<FormNumberInput placeholder="2%" title="Transfer Tax" bind:value={transferTax} />
			<CheckTax
				bind:tax={transferTax}
				bind:isPartner
				isTransfer={true}
				bind:error={transferTaxError}
			/>
		{/if}
		<FormCheckbox title="Enable Partnership" bind:checked={isPartner} />
		{#if isPartner}
			<div
				class="mt-4 text-sm text-yellow-700 italic bg-yellow-600 bg-opacity-40 p-4 rounded-2xl border border-yellow-600"
			>
				<p>
					Enabling partnership allows you to deploy your new token with 30% less than the required
					amount for deployment. <span class="underline"
						>By allowing this feature, you agree for Token Crafter to remove 0.05% fee from this
						token trade(s).</span
					>
					We will also share the token with our community to boost it exposure and investor base.
					<a
						href={`${siteLink}#faqs`}
						target="_blank"
						rel="noopener noreferrer"
						class="text-blue-600 font-bold">Click here</a
					> to learn more about partnership
				</p>
			</div>
		{/if}

		<button
			disabled={isInvelidForm}
			type="submit"
			class="w-full disabled:cursor-not-allowed p-4 rounded-md bg-green-400 mt-6 text-white"
			>Create Token</button
		>

		<!-- {#if $signer === undefined}
			<button
				type="button"
				class="w-full p-4 rounded-md bg-orange-400 mt-6 text-white"
				on:click={connectUserWallet}>Connect Wallet</button
			>
		{:else}
			<button disabled={isInvelidForm} type="submit" class="w-full disabled:cursor-not-allowed p-4 rounded-md bg-green-400 mt-6 text-white"
				>Create Token</button
			>
		{/if} -->
	</form>

	<div class="my-10">
		<Socials />
	</div>
</div>
