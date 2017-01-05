![Logo](http://i.imgur.com/rp6p0vD.png)

A platform for brainstorming, organizing, and refining ideas in a distributed manner.

## Bloxeo Server

Server for our Brainstorm App, an Express 4 application.

### Tech Stack

* Node.js
* MongoDB / Mongoose for persistent data storage
* Redis / ioredis for in memory storage
* Express HTTP, Socket.io WebSockets for client communication

### Getting started

Clone the repo.

```
$ git clone git@github.com:IGME-Research-Studio/bloxeo-server.git
$ cd bloxeo-server
$ npm install
```

#### Additional Dependencies
Bloxeo's server requires running a MongoDB instance and Redis server instance.

* Install MongoDB: https://docs.mongodb.com/manual/installation/
* Install Redis: https://redis.io/download

When running the server locally, Bloxeo points to the following ports:
* MongoDB's default port (27017)
* Redis' default port (6379)

#### Commands
```
# Start Server
$ npm start

# Check the source code for stylistic correctness
$ npm run lint

# Run the unit tests
$ npm run unit-test

# Run the linter followed by the test suite
$ npm test

```

### Contributing guide

See [CONTRIBUTING.md](CONTRIBUTING.md) for contributing guidelines.

We use ES6 JavaScript transpiled with Babel and enforced by Airbnb's eslint config.

### License

Copyright MAGIC Spell Studios, 2017

See [PEOPLE.md](PEOPLE.md) for a list of contributors.
