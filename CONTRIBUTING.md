Contributing
===

## JavaScript Style Guide

We're borrowing [Airbnb's style guide](https://github.com/airbnb/javascript/tree/master/es5) and enforcing as much as possible automatically with `eslint`.

## Pull Requests

* Before you push a change make sure that the tests and linter are passing (this can all be accomplished by running `$ npm test`).
* Update and/or create new documentation using the [JSDoc format](http://usejsdoc.org/) (at a minimum declaring param/return types). We will use this to automatically generate documentation.
* If your PR makes a code change make sure to bump the version number in package.json according to [SEMVER](http://semver.org/) guidelines:

```
Given a version number MAJOR.MINOR.PATCH, increment the:
1. MAJOR version when you make incompatible API changes,
2. MINOR version when you add functionality in a backwards-compatible manner, and 3. PATCH version when you make backwards-compatible bug fixes.
```

* Push your changes to a feature branch in your clone or fork of the repository. If you have a Github issue associated with your feature consider prefixing your branch with the issue (e.g. IS-2).
* Submit a pull request to the relevant repository in IGME-research-studio.
* Update your Github issue to mark that you have submitted code and are ready for it to be reviewed. Include a link to the pull request in the issue.
* After two other contributors review the PR and give it a thumbs up, then it's ready to be merged.

## Continuous Integration
* When code is pushed to GitHub `npm test` is run against your patch on Circle CI, you will not be allowed to merge unless this passes.
* When merged into `stage` code gets automatically deployed to `storm-server-stage.herokuapp.com`
* When code get's to a point that we want to release a new version, make a commit to bump the version number in `package.json` and after it gets merged into stage, cut a new release on GitHub. This will automatically deploy to `storm-server-prod.herokuapp.com`.

## Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less, if more comments are necessary include a blank line in between (makes git log output more legible). For example:

```
Ran `sails new --no-frontend` to scaffold out a base application

The no-frontend flag removes the static assets directory and gives us a base
application designed to be a pure API.

Also adds:
- Gruntfile with eslint for linting and mocha for testing.
- PEOPLE.md and CONTRIBUTING.md`
```

* Consider prefixing your commit messages with relevant issues or pull request numbers (IS-1 or PR-2)
