# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Fixed
- The `state` as a `Promise` is a temporary solution as it does not fit with a persisted state
- The `state` remembers the popups but not their content (the popups appear blank on reload)

## [1.5.9] - 2018-11-24
The branch `feature/dstack` has been merged with the `gl-dstack` functionality (implemented by the `gl-router`) 
### Added
- The control `gl-dstack` that behaves like a `gl-stack` but remains opened in the main window when poped-out
- The control `gl-route` allows the user to use the routing hacks implemented here
- The golden-layout `state` can be given as a Promise
- The property `reorder-enabled` that can avoid a tab to be dragged

## [1.5.8] - 2018-10-30
The library has become stable enough for us to take care to keep a stable master branch. Let's get this libray from "hobby" level to "serious" one.