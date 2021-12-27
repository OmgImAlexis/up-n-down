import cacheManager from 'cache-manager';
import { v4 } from 'uuid';

const cache = new Map();
const users = new Map();
let totalClients = 0;

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
		cache.set(userId, new Map());
	}

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
	const id = Math.random().toString(36).substr(2, 9);

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

export const pushToPublicFirehose = (event, data = {}, shouldCache = true) => {
	const id = Math.random().toString(36).substr(2, 9);

	// Save event for reconnection
	if (shouldCache) {
		cacheEvent('public', { id, event, data });
	}

	users.forEach(user => {
		user.forEach(client => {
			writeToClient(client, { id, event, data });
		});
	});
};

export const firehose = async (req, res) => {
	const userId = req.session.user?.user_id ?? -1;
	const requestId = v4();

	res.writeHead(200, {
		'Cache-Control': 'no-cache, no-transform',
		'Content-Type': 'text/event-stream',
		Connection: 'keep-alive',
	});

	// Check if we have public cached data
	const publicCache = cache.get('public');
	if (publicCache) {
		publicCache.forEach(event => {
			res.write(`id: ${event.id}\n`);
			res.write(`event: ${event.event}\n`);
			res.write(`data: ${JSON.stringify({ id: event.id, ...event.data })}\n\n`);
		});
	}

	// Check if we have private cached data
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
	console.log('[firehose] New Client for user %s. Total clients = %s', userId, totalClients);

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
		console.log('[firehose] Lost Client for user %s. Remaining clients =', userId, totalClients);
	});
};
