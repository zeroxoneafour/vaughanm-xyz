<script lang="ts">
	let { date }: { date: string } = $props();

	// Dates are calendar days, so format in UTC to avoid shifting by a day in negative offsets.
	const formatted = $derived(
		new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			timeZone: 'UTC'
		})
	);
</script>

<time datetime={date}>{formatted}</time>
