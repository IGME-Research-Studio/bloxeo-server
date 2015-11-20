# Storm Server

Server for our Brainstorm App, an Express 4 application.

## Getting started

Clone the repo.

```
$ git clone git@github.com:IGME-Research-Studio/StormServer.git
$ cd StormServer
$ npm install
$ npm install -g grunt-cli
```

### Commands
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

## Contributing guide

See [CONTRIBUTING.md](CONTRIBUTING.md) for contributing guidelines.

We use ES6 JavaScript transpiled with Babel and enforced by Airbnb's eslint config.

One hiccup is that files in the `config/` folder are loaded inside Sails and thus are not transpiled by default. All you need to do is explicitly tell Babel to transpile a config file by putting `require('babel/register')` at the top of the file.


## Documentation

Github page coming soon.

## License

Copyright &copy; 2015 MAGIC Spell Studios, all rights reserved.

See [PEOPLE.md](PEOPLE.md) for a list of contributors.
