const initFirehose = () => {
	const stream = new EventSource('/api/v1/firehose');

	stream.addEventListener('comment', ({ data }) => window.createToast({
		event: 'comment',
		...JSON.parse(data),
	}));

	stream.addEventListener('post', ({ data }) => console.log({
		event: 'post',
		...JSON.parse(data),
	}));

	stream.addEventListener('notification', ({ data }) => {
		window.createToast(JSON.parse(data));
	});

	stream.addEventListener('clear-notification', ({ data }) => {
		window.clearToast(JSON.parse(data));
	});
};

window.addEventListener('live', () => {
	initFirehose();
});
