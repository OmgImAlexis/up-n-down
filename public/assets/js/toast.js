const toasts = new Map();

const initToasts = () => {
	// Get body
	// eslint-disable-next-line no-undef
	const body = document.getElementsByTagName('body')[0];

	// Create toast container
	// eslint-disable-next-line no-undef
	const toastContainer = document.createElement('div');
	toastContainer.id = 'toast-container';

	// Append toast container at end of body
	body.insertAdjacentElement('beforeend', toastContainer);

	if (window.firehose) {
		window.firehose.addEventListener('notification', ({ data }) => {
			window.createToast(JSON.parse(data));
		});

		window.firehose.addEventListener('clear-notification', ({ data }) => {
			window.clearToast(JSON.parse(data));
		});
	}
};

const createToast = options => {
	const { id } = options ?? {};
	const content = options.content ?? '';
	const title = options.title ?? '';
	const link = options.link ?? '';
	const toast = {
		id,
		content,
		link,
		title,
	};

	// Broken toast?
	if (!id) {
		return;
	}

	// Render on page
	renderToast(toast);
};

const clearToast = options => {
	const { id } = options ?? {};

	// Broken toast?
	if (!id) {
		return;
	}

	const toast = toasts.get(id);
	if (toast) {
		toast.remove();
	}
};

// eslint-disable-next-line no-undef
window.clearToast = clearToast;

const renderToast = ({ id, title, link, content }) => {
	// eslint-disable-next-line no-undef
	const toastContainer = document.getElementById('toast-container');

	// Create toast elements
	const toast = document.createElement('div');
	const toastHeader = document.createElement('div');
	const toastTitle = document.createElement('div');
	const toastDestroyButton = document.createElement('button');
	const toastContent = document.createElement('div');

	// Set header class
	toastHeader.className = 'toast-header';

	// Set content class
	toastContent.className = 'toast-body';

	// Set title
	if (link) {
		const linkElement = document.createElement('a');

		// Clear notification on click
		linkElement.addEventListener('click', async function (event) {
			const { href } = this;
			event.preventDefault();

			// Send request to server to remove notification
			await fetch(`/api/v1/notification/${id}`, { method: 'DELETE' }).catch(console.error);

			// Redirect the user
			window.location.href = href;
		});

		// Set link
		linkElement.setAttribute('href', link);

		// Set link title
		linkElement.setAttribute('title', title);

		// Set link content
		linkElement.innerHTML = title;

		// Set title content
		toastTitle.appendChild(linkElement);
	} else {
		// Set title content
		toastTitle.innerHTML = title;
	}

	// Set content
	toastContent.innerHTML = content;

	// Set button content
	toastDestroyButton.innerHTML = 'X';

	// Link destroy button to callback
	toastDestroyButton.addEventListener('click', async () => {
		const toast = toasts.get(id);
		if (!toast) {
			return;
		}

		// Send request to server to remove notification
		await fetch(`/api/v1/notification/${id}`, { method: 'DELETE' });

		// Delete element
		toast.remove();

		// Remove toast from store
		toasts.delete(id);
	});

	// Add title and button to header
	toastHeader.append(toastTitle);
	toastHeader.append(toastDestroyButton);

	// Add header and content to toast
	toast.append(toastHeader);
	toast.append(toastContent);

	// Save for later
	toasts.set(id, toast);

	// Append to page
	toastContainer.append(toast);
};

// eslint-disable-next-line no-undef
window.createToast = createToast;

document.addEventListener('DOMContentLoaded', () => {
	initToasts();
});

