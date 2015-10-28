# Storm Server

Server for our Brainstorm App, a [Sails](http://sailsjs.org) application.

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
# Lift the sails server
$ npm start

# Check the source code for stylistic correctness
$ npm run lint

# Run the unit tests
$ npm run unit-test

# Run the linter followed by the test suite
$ npm test

# Lift the sails server in debug mode
$ npm run debug
```

## Contributing guide

See [CONTRIBUTING.md](CONTRIBUTING.md) for contributing guidelines.

We use ES6 JavaScript transpiled with Babel and enforced by Airbnb's eslint config.

One hiccup is that files in the `config/` folder are loaded inside Sails and thus are not transpiled by default. All you need to do is explicitly tell Babel to transpile a config file by putting `require('babel/register')` at the top of the file.

Technically this only needs to be done on one config file, but since there are no guarantees on what order sails loads these files (being objects and all), it's safer to just be explicit.

## Documentation

Github page coming soon.

## License

Copyright &copy; 2015 MAGIC Spell Studios, all rights reserved.

See [PEOPLE.md](PEOPLE.md) for a list of contributors.

