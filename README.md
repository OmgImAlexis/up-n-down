# Up 'n' Down

Up 'n' Down is a link aggregation internet forum. Users write posts and nested comments. Users must follow other users in order to see their content.

Other features:

* REST API
* Public and Private Groups
* [Instruction Manual](https://www.peachesnstink.com/manual)

## Install

Install one of the [tagged releases](https://github.com/omgimalexis/up-n-down/releases), preferably the most recent.

Create a PostgreSQL 11+ database.

Install Redis. This is only for the session store. Redis 6+ should be used.

Make sure you have Node.js installed. 

Run `npm install` to download all the Node.js dependencies that are listed in `package.json`.

Set the following environment variables in a `.env` file.

* `PGHOST`: PostgreSQL host (usually `localhost`)
* `PGUSER`: PostgreSQL username
* `PGDATABASE`: PostgreSQL database name
* `PGPASSWORD`: PostgreSQL password
* `PGPORT`: PostgreSQL port
* `HTTP_PORT`: Port this app will use
* `REDIS_PORT`: Redis port
* `SESSION_NAME`: `express-session` `name`
* `SESSION_SECRET`: `express-session` `secret`
* `NODE_ENV`: built-in node environment flag
