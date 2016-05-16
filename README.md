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
$ git clone git@github.com:IGME-Research-Studio/StormServer.git
$ cd StormServer
$ npm install
```

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

### Documentation

Github page coming soon.

### License

Copyright &copy; 2015 MAGIC Spell Studios, all rights reserved.

See [PEOPLE.md](PEOPLE.md) for a list of contributors.
