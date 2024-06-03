<script lang="ts">
    export let tax: number;
    export let isPartner: boolean;
    export let isTransfer: boolean = false;
	export let error = false;


    const MAX_TAX = 30
    const PARTNER_TAX = 0.05
    $: calculatedTax = isPartner ? (isTransfer ? tax : Number(tax) + PARTNER_TAX) : tax
    $: error = calculatedTax > MAX_TAX
</script>

{#if error}
    <div class="text-sm w-full rounded-md p-2 bg-red-600 bg-opacity-30 border border-red-600 text-red-600">
        <p>Tax is too high! max is {isPartner ? (isTransfer ? MAX_TAX : MAX_TAX - PARTNER_TAX) : MAX_TAX}%</p>
    </div>
{/if}