<script lang="ts">
	export let title: string;
	export let value: string;
	export let required = false;
	export let placeholder = ""
</script>

<label class="flex flex-col gap-4 py-2">
	{title}
	<input {placeholder} bind:value class="p-4 rounded-md" {required} type="text" />
</label>
