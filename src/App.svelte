<svelte:options tag="webex-in-meeting"/>

<script>
	import {onMount} from 'svelte';

	export let streams;

	let remoteVideo;
	let remoteShare;
	let localVideo;

	$: {
		(async () => {
			if (streams) {
				remoteVideo.srcObject = await streams.remoteVideoStream;
				remoteShare.srcObject = await streams.remoteShareStream;
				localVideo.srcObject = await streams.localVideoStream;
			}
		})();
	}

	const	locations = [
			'top-right',
			'top-left',
			'bottom-right',
			'bottom-left',
		];
	let	current = locations[0];

	const togglePiP = async () => {
		if (!document.pictureInPictureElement) {
			await remoteShare.requestPictureInPicture();
		} else {
			await document.exitPictureInPicture();
		}
	};

	const fullScreen = (element) => async () => {
		const ms = await window.isMultiScreen();
		console.log('****:', ms);

		const screens = await window.getScreens();
		const primary = screens.filter((s) => s.primary);
		
		try {
			await element.requestFullscreen({screen: primary[0]});
		} catch(err) {
			console.warn('Unable to get full screen:', err);
		}
		
		// const opt = { name: 'window-placement'};
		// try {
		// 	const perm = await navigator.permissions.query(opt);
		// 	return perm.state === 'granted';
		// } catch {
		// 	return false;
		// }
	};

	const devices = async () => {
		return navigator.mediaDevices.enumerateDevices()
			.then(function(devices) {
				devices.forEach(function(device) {
					console.log(device.kind + ": " + device.label +
											" id = " + device.deviceId);
				});
			})
			.catch(function(err) {
				console.log(err.name + ": " + err.message);
			});
	};
	

	let pip = false;
	onMount(() => {
		remoteShare.addEventListener('enterpictureinpicture', () => {
			pip = true;
		});
		remoteShare.addEventListener('leavepictureinpicture', () => {
			pip = false;
		});
	})
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<main>
	<div class="parent">
		<div class="remote-parent" class:pip>
			<video class="video" bind:this={remoteVideo} playsinline=true autoplay=true/>
			<video class="share" bind:this={remoteShare} playsinline=true autoplay=true/>
		</div>
				
		{#each locations as corner}
			<div
				class={corner}
				ondragover="return false"
				on:drop|preventDefault={(e) => {current = corner;}}
			>
				{#if corner === current}
					<div
						class="local-parent"
						draggable=true
					>
						<video bind:this={localVideo} playsinline=true autoplay=true />
					</div>
				{/if}
			</div>
		{/each}
		
		<div class="buttons">
			<button on:click={togglePiP}>PiP</button>
			<button on:click={fullScreen(remoteShare)}>Full Screen</button>
			<button on:click={devices}>Devices</button>
		</div>
	</div>
</main>

<style type="text/scss">
	.buttons {
		position: absolute;
		bottom: 0;
		display: flex;
	}

	.parent {
		&>.top-left {
			position: absolute;
			background-color: transparent;
			top: 0;
			left: 0;
			right: 50%;
			bottom: 50%;
		}
		&>.top-right {
			position: absolute;
			background-color: transparent;
			top: 0;
			left: 50%;
			right: 0;
			bottom: 50%;
		}
		&>.bottom-left {
			position: absolute;
			background-color: transparent;
			top: 50%;
			left: 0;
			right: 50%;
			bottom: 0;
		}
		&>.bottom-right {
			position: absolute;
			background-color: transparent;
			top: 50%;
			left: 50%;
			right: 0;
			bottom: 0;
		}
	}

	@mixin hide-element() {
		visibility: hidden;
		opacity: 0;
		transition: visibility 0s, opacity 0.3s linear;
	}

	@mixin show-element($opacity: 1) {
		visibility: visible;
		opacity: $opacity;
	}

	main {
		--min-size: max(200px, 100%);
		--local-video-margin: 2vw;
		--local-video-width: clamp(140px, 30vw, 300px);
		--local-video-height: clamp(100px, 30vh, 280px);
		--local-video-button-size: 25px;
		height: 100vh;
		min-width: 200px;
		margin: auto;
	}

	.parent {
		height: var(--min-size);
		width: var(--min-size);
		background-color: black;
		position: relative;
	}

	.remote-parent {
		width: 100%;
		height: 100%;
		place-items: center;
		overflow: hidden;

		display: grid;
		grid-template:
			"video" 1fr
			"share" 5fr;

		& .video {
			grid-area: video;
		}
		& .share {
			grid-area: share;
		}
	}

	video {
		width: 100%;
		height: 100%;
		padding: 0px;
		display: block;
	}

	.next:hover {
		box-shadow: 0 0 0 3px lightgreen;
		filter: brightness(140%);
	}

	.previous:hover {
		box-shadow: 0 0 0 3px lightgreen;
		filter: brightness(140%);
	}

	.local-parent {
		@include hide-element();

		width: var(--local-video-width);
		height: auto;
		position: absolute;
		overflow: hidden;

		cursor: move;

		& video {
			transform: scaleX(-1);
		}

		.top-right & {
			top: var(--local-video-margin);
			right: var(--local-video-margin);
		}

		.bottom-right & {
			bottom: var(--local-video-margin);
			right: var(--local-video-margin);
		}

		.bottom-left & {
			bottom: var(--local-video-margin);
			left: var(--local-video-margin);
		}

		.top-left & {
			top: var(--local-video-margin);
			left: var(--local-video-margin);
		}

		.parent:hover & {
			@include show-element();
		}
	}

	@media only screen and (max-height: 1000px) {
		.remote-parent:not(.pip) {
			grid-template: "share" 100%;

			& .video {
				display: none;
			}
		}
	}
	@media only screen and (max-height: 550px) {
		.local-parent {
			width: auto;
			height: var(--local-video-height);
		}

		.local-parent video {
			width: unset;
		}
	}
	@media only screen and (min-width: 2000px) {
		.remote-parent:not(.pip) {
			grid-template: "video share" / 1fr 1fr;

			& .video {
				display: block;
			}
		}
	}

	.remote-parent.pip {
		grid-template: "video" 100%;

		& .share {
			display: none;
		}
	}
</style>