const initFirehose = () => {
	window.firehose.addEventListener('comment', ({ data }) => window.createToast({
		event: 'comment',
		...JSON.parse(data),
	}));

	window.firehose.addEventListener('post', ({ data }) => console.log({
		event: 'post',
		...JSON.parse(data),
	}));
};

document.addEventListener('DOMContentLoaded', () => {
	initFirehose();
});

