import { v4 } from 'uuid';
import httpErrors from 'http-errors';

const { ServiceUnavailable } = httpErrors;

const cache = new Map();
const users = new Map();
let totalClients = 0;

const generateId = () => Math.random().toString(36).substr(2, 9);

const writeToClient = (client, { id, event, data }) => {
	client.res.write(`id: ${id}\n`);
	client.res.write(`event: ${event}\n`);
	client.res.write(`data: ${JSON.stringify({ id, ...data })}\n\n`);
	client.res.flushHeaders();
};

const cacheEvent = (userId, { id, event, data }) => {
	// Get cache or create it
	const firehoseCache = cache.get(userId);
	if (!firehoseCache) {
		console.log('making cache for ' + userId);
		cache.set(userId, new Map());
	}

	console.log('caching', { id, event, data });

	// Save data for reconnection
	cache.get(userId).set(id, { id, event, data });
};

export const deleteCachedEvent = (userId, id) => {
	const firehoseCache = cache.get(userId);
	if (!firehoseCache) {
		return;
	}

	// Remove event from cache
	firehoseCache.delete(id);

	// Let currently connected clients know they need to clear this notification
	pushToPrivateFirehose(userId, 'clear-notification', {
		id,
	}, false);
};

export const pushToPrivateFirehose = (userId, event, data, shouldCache = true) => {
	const id = generateId();

	// Save event for reconnection
	if (shouldCache) {
		cacheEvent(userId, { id, event, data });
	}

	// If user has no open connections then bail
	const user = users.get(userId);
	if (!user) {
		return;
	}

	// Send data to each of the user's open connections
	user.forEach(client => {
		writeToClient(client, { id, event, data });
	});
};

export const pushToConnectedClientsFirehose = (event, data = {}, shouldCache = true) => {
	const id = generateId();

	users.forEach((user, userId) => {
		user.forEach(client => {
			// Save event for reconnection
			if (shouldCache) {
				cacheEvent(userId, { id, event, data });
			}

			writeToClient(client, { id, event, data });
		});
	});
};

export const createPrivateNotification = (userId, { title, link, content }, shouldCache = true) => {
	pushToPrivateFirehose(userId, 'notification', {
		title,
		link,
		content,
	}, shouldCache);
};

export const createPublicNotification = ({ title, link, content }, shouldCache = true) => {
	// |
	// pushToPublicFireHose('notification', {
	// 	title,
	// 	content,
	// }, shouldCache);
};

export const createConnectedClientsNotification = ({ title, link, content }, shouldCache = true) => {
	pushToConnectedClientsFirehose('notification', {
		title,
		link,
		content,
	}, shouldCache);
};

export const firehose = async (req, res) => {
	const userId = req.session.user?.user_id ?? -1;
	const requestId = v4();

	// If we hit our limit of connections throw an error
	if (totalClients > 99) {
		throw new ServiceUnavailable('Too many clients connected!');
	}

	// Start an event-stream
	res.writeHead(200, {
		'Cache-Control': 'no-cache, no-transform',
		'Content-Type': 'text/event-stream',
		'X-Request-Id': requestId,
		Connection: 'keep-alive',
	});

	// Tell client to retry if connection drops
	res.write('retry: 30\n');

	// Check if we have cached data
	const privateCache = cache.get(userId);
	if (privateCache) {
		privateCache.forEach(event => {
			res.write(`id: ${event.id}\n`);
			res.write(`event: ${event.event}\n`);
			res.write(`data: ${JSON.stringify({ id: event.id, ...event.data })}\n\n`);
		});
	}

	// Create user store
	if (!users.has(userId)) {
		users.set(userId, new Map());
	}

	// Add this session to the user's store
	totalClients++;
	users.get(userId).set(requestId, { req, res });
	console.log('[firehose] userId: %s status: %s', userId, 'connected');
	console.log('[firehose] connected: %s/100', totalClients);

	// If client closes connection, stop sending events
	res.on('close', () => {
		const user = users.get(userId);
		if (!user) {
			return;
		}

		const client = user.get(requestId);
		if (!client) {
			return;
		}

		totalClients--;
		client.res.end();
		users.get(userId).delete(requestId);
		console.log('[firehose] userId: %s status: %s', userId, 'disconnected');
		console.log('[firehose] connected: %s/100', totalClients);
	});
};
