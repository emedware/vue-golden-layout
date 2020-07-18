# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.10] - 2020-07-18

### Fixed

- adding return value for the goldenContainer data mixin

## [2.0.9] - 2020-06-23

### Fixed

- issue#59

## [2.0.8] - 2020-06-15

### Changed

- Component' model becomes a generic `state.sync` that can be used on any GL object

## [2.0.7] - 2020-06-14

### Added

- Component' model

## [2.0.5] - 2020-02-28

### Changed

- Used packages upgrade

## [2.0.4] - 2020-02-28

### Fixed

- issue #57

## [2.0.3] - 2020-02-18

### Fixed

- issue #55

## [2.0.2] - 2019-11-08

### Fixed

- Obsolete code removal
- issue-51
- `forwardEvent` calls

## [2.0.1] - 2019-10.xx

### Added

- `vueComponent.focus()`

### Changed

- Lots of code clean-up
- Fix moving random tab in `gl-router`
- Documentation rewriting
- Selecting a tab in a `d-stack` now `focus()` it even if it is not in the d-stack anymore

## [2.0.0] - 2019-10.xx

### Added

- Cross-windows synchronisation: one `vue` tree controls all the windows
- Custom containers: allows to define custom controls who contain a part of the layout
- Custom containers as route components
- Branch coloring to retrieve which master goes with which slave easily

### Changed

- Named template are obsolete, components are to be defined inline

## [1.5.14] - 2019-02-15

### Added

- `inter-window` property

### Fixed

- Templates now can access to the `VueComponent`' data
- `golden-layout` and `gl-items` are not observed anymore
- Security vulnerability fix

## [1.5.13] - 2019-01-15

### Fixed

- Routes and custom components have a `glComponent` class

## [1.5.12] - 2019-01-09

### Fixed

- Security vulnerability fix

## [1.5.10] - 2018-11-28

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
