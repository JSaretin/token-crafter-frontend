<script>
	import Socials from '$lib/componets/Socials.svelte';
</script>

<svelte:head>
	<title>Manage and create tokens</title>
</svelte:head>

<div class="mb-6 leading-relaxed">
	<p>Create and manage your token by navigating to either of the pages below. </p>

	<p class="mt-4 text-neutral-600">Note: If you are using a laptop, you need to have the MetaMask or TrustWallet extension installed to use the site. You can also copy the page link and open it directly from your mobile wallet DAPP interact with the smart contract from your smart phone.</p>
</div>

<div class="flex gap-4 text-white text-center">
	<a href="/manage-tokens" class="p-4 rounded-md flex-1 bg-orange-400">Manage Token</a>
	<a href="/create-token" class="p-4 rounded-md flex-1 bg-green-400">Create Token</a>
</div>

<div class="my-10">
	<Socials />
</div>


<div class="w-full flex flex-col align-middle place-items-center justify-center gap-2">
	<a href="https://github.com/JSaretin/omega-smart-contracts" class="text-blue-600 font-bold" target="_blank" rel="noopener noreferrer">Contract Source Code</a>
	<span class="text-neutral-500">Audited By GPT4</span>
</div>