import { EventEmitter } from 'events';

export class SSE extends EventEmitter {
	constructor(initial = [], options = { isSerialized: true, isCompressed: false }) {
		super();
		this.options = options;
		this.initial = Array.isArray(initial) ? initial : [initial];
		this.init = this.init.bind(this);
	}

	init(request, response) {
		let id = 0;
		request.socket.setTimeout(0);
		request.socket.setNoDelay(true);
		request.socket.setKeepAlive(true);
		response.statusCode = 200;
		response.setHeader('Content-Type', 'text/event-stream');
		response.setHeader('Cache-Control', 'no-cache, no-transform');
		response.setHeader('X-Accel-Buffering', 'no');
		if (request.httpVersion !== '2.0') {
			response.setHeader('Connection', 'keep-alive');
		}

		if (this.options.isCompressed) {
			response.setHeader('Content-Encoding', 'deflate');
		}

		this.setMaxListeners(this.getMaxListeners() + 2);
		const dataListener = data => {
			response.write(`id: ${id++}\n`);
			id += 1;

			if (data.event) {
				response.write(`event: ${data.event}\n`);
			}

			response.write(`data: ${JSON.stringify(data.data)}\n\n`);
			response.flushHeaders();
		};

		const serializeListener = data => {
			const serializeSend = data.reduce((all, msg) => `${all}id: ${id++}\ndata: ${JSON.stringify(msg)}\n\n`, '');
			response.write(serializeSend);
		};

		this.on('data', dataListener);
		this.on('serialize', serializeListener);
		if (this.initial) {
			if (this.options.isSerialized) {
				this.serialize(this.initial);
			} else if (this.initial.length > 0) {
				this.send(this.initial, this.options.initialEvent);
			}
		}

		request.on('close', () => {
			this.removeListener('data', dataListener);
			this.removeListener('serialize', serializeListener);
			this.setMaxListeners(this.getMaxListeners() - 2);
		});
	}

	updateInit(data) {
		this.initial = Array.isArray(data) ? data : [data];
	}

	dropInit() {
		this.initial = [];
	}

	send(data, event, id) {
		this.emit('data', { data, event, id });
	}

	serialize(data) {
		if (Array.isArray(data)) {
			this.emit('serialize', data);
		} else {
			this.send(data);
		}
	}
}


