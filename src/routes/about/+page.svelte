<script lang="ts">
	import PageMeta from '#lib/components/PageMeta.svelte';
</script>

<PageMeta title="About Me" />

<div class="space-y-4">
	<h1 class="mb-4 h1">About Me</h1>
	<p class="text-surface-800-200">
		Hi! My name is Vaughan Milliman, and I am currently an undergraduate at the Georgia Institute of
		Technology.
		<br />
		I have been programming since I was in second grade. This site serves as a collection of my experience
		in the field.
	</p>

	<h3 class="mb-4 h3">Education</h3>
	<p class="text-surface-800-200">
		I am currently attending Georgia Tech for a Bachelors of Science in Computer Science. My
		coursework includes DSA (CS 1332), Computer Organization and Programming (CS 2110), and Honors
		Linear Algebra (MATH 1564), just to name a few. I plan to specialize in Systems and Architecture
		and Information Internetworks.
	</p>
	<p class="text-surface-800-200">
		Before coming to Georgia Tech for a Bachelors of Science in Computer Science, I attended
		Vestavia Hills High School in Birmingham, Alabama. I also took Calculus III as a dual-enrollment
		course with the University of Alabama.
	</p>

	<h3 class="mb-4 h3">Achievements (Programming)</h3>
	<ul class="list-disc pl-5 text-surface-800-200">
		<li>
			Over <b>1000</b> stars on GitHub (on
			<a class="text-primary-500 hover:underline" href="https://github.com/zeroxoneafour/polonium"
				>this repo</a
			>)
		</li>
		<li>
			Codewars <b>Kyu 3</b> (<a
				class="text-primary-500 hover:underline"
				href="https://www.codewars.com/users/zeroxoneafour">my profile</a
			>) and <b>published kata author</b>
		</li>
		<li>ACSL programming competition <b>finalist</b></li>
		<li>UAB and College of Charleston HSPC <b>winner</b></li>
	</ul>

	<h3 class="mb-4 h3">Achievements (Other)</h3>
	<ul class="list-disc pl-5 text-surface-800-200">
		<li><b>AIME</b> qualifier (2025)</li>
		<li>
			Beat Saber peak <b>top 5000 global</b> (<a
				class="text-primary-500 hover:underline"
				href="https://beatleader.com/u/76561198974437941/ranked">my profile</a
			>)
		</li>
	</ul>

	<h3 class="mb-4 h3">Hobbies</h3>
	<p class="text-surface-800-200">
		I am very into VR. This should be fairly evident given my accomplishments and projects, but I
		enjoy VR gaming as a consumer too. I have modified my headset to be more comfortable by
		relocating and resoldering the battery (see <a
			href="https://www.reddit.com/r/virtualreality/comments/1qacxox/meta_frame_quest_3_battery_relocation_mod/"
			class="text-primary-500 hover:underline">this Reddit post</a
		>). Someday I'll own a Steam Frame, maybe...
	</p>
	<p class="text-surface-800-200">
		I own a homelab server. It runs on an i5-6100U and has 16GB of DDR4. It only has 256+256GB
		storage, so I can't do mass media storage, but it is sufficient to run Navidrome and Jellyfin
		for basic media. The homelab server uses Podman running on Fedora IoT edition. It can be
		reconfigured and deployed in a matter of minutes. To access it, I also host a VPS that runs
		Headscale. The servers and my computers run Tailscale, and the server is exposed to the internet
		through several layers of reverse proxies via Tailscale. Deploying this server taught me a lot,
		and let me finally break away from Spotify. I now fully self host my music streaming.
	</p>
	<p class="text-surface-800-200">
		I play percussion in band. I have not yet joined a band at Georgia Tech, but I plan to do
		percussion ensemble. My favorite concert percussion instrument to play is the vibraphone. In
		marching band, I prefer to play bass drum.
	</p>
	<p class="text-surface-800-200">
		I have also recently started fencing and working out. I fence foil, but I am fairly bad at it
		right now.
	</p>
</div>
