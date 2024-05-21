<script lang="ts">
	export let title: string;
	export let checked: boolean;
</script>

<label class="flex justify-between py-2">
	{title}
	<input bind:checked class="p-4 rounded-md" type="checkbox" />
</label>
