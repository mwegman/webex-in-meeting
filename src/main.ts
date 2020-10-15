import App from './App.svelte';

const Media = () => {
	let mediaStream;

	const getStream = async (deviceId) => {
		if (!mediaStream) {
			mediaStream = await navigator.mediaDevices.getUserMedia({
				video:
					deviceId ?
					{deviceId: {exact: deviceId}} :
					{width: {exact: 1920}, height: {exact: 1080}}
			});
		}
		return new MediaStream([mediaStream.getVideoTracks()[0]]);
	};

	let shareStream;
	const getShareStream = async () => {
		if (!shareStream) {
			shareStream = await navigator.mediaDevices.getDisplayMedia({video: true});
		}
		return new MediaStream([shareStream.getVideoTracks()[0]]);
	};
	const getVideoStream = async () => getStream();

	return new class {
		get localVideoStream() {
			return getVideoStream();
		}
		get remoteVideoStream() {
			return getVideoStream();
		}
		get remoteShareStream() {
			return getShareStream();
		}
	};
};

const app = new App({
	target: document.body,
	props: {
		streams: Media(),
	}
});

export default app;