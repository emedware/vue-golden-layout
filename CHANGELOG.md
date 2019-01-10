# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.12] 2019-01-09
### Fixed
- Security vulnerability fix

## [1.5.10] 2018-11-28
### Fixed
- The `state` as a `Promise` is indeed a pretty neat solution. Tested and a bit corrected
- Weird bug corrected with the saved state of popups (arraay-like objects not array ... ?!?)

## [1.5.9] - 2018-11-24
The branch `feature/dstack` has been merged with the `gl-dstack` functionality (implemented by the `gl-router`) 
### Added
- The control `gl-dstack` that behaves like a `gl-stack` but remains opened in the main window when poped-out
- The control `gl-route` allows the user to use the routing hacks implemented here
- The golden-layout `state` can be given as a Promise
- The property `reorder-enabled` that can avoid a tab to be dragged

## [1.5.8] - 2018-10-30
The library has become stable enough for us to take care to keep a stable master branch. Let's get this libray from "hobby" level to "serious" one.