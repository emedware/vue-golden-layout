[![npm](https://img.shields.io/npm/v/vue-golden-layout.svg)](https://www.npmjs.com/package/vue-golden-layout)
[![NPM downloads](https://img.shields.io/npm/dm/vue-golden-layout.svg?style=flat)](https://npmjs.org/package/vue-golden-layout)
[![Known Vulnerabilities](https://snyk.io/test/github/eddow/vue-golden-layout/badge.svg)](https://snyk.io/test/github/eddow/vue-golden-layout)
[![codebeat badge](https://codebeat.co/badges/8fb41a11-58bd-4f6f-948b-5ac12ec59b5b)](https://codebeat.co/projects/github-com-eddow-vue-golden-layout-master)
# vue-golden-layout
Integration of the golden-layout to Vue

## Installation

```sh
npm i -S vue-golden-layout
```

> For the ones who clone, in order to test, a static sample application can be compiled :
> 
> ```sh
> npm install
> npm run demo
> ```
> You can now browse http://localhost:9000

## Don't forget in order to make it work
  - Include a golden-layout theme CSS.
```typescript
import 'golden-layout/src/css/goldenlayout-light-theme.css'
```
Available themes are `light`, `dark`, `soda`, `translucent`.

`goldenlayout-base.css` is already integrated to the library.

## Usage
```javascript
import vgl from 'vue-golden-layout'
Vue.use(vgl);
```

In case of incompatibility with bundlers, `vue-golden-layout` can be bundeled by the sources.
The sources entry point is in `vue-golden-layout/src/index.ts`

```javascript
import vgl from 'vue-golden-layout/src'
Vue.use(vgl);
```

## Structure

Elements like `<gl-row>`, `<gl-col>` and `<gl-stack>` can be represented in a tree - they respectively stand for a golden-layout row, column and stack.

## Inserting components

Component can be described *by extension* - namely, by giving their content using the data from the defining component.
```html
<gl-component>
	<h1>Heydoo</h1>
	Price: {{priceLess}}
</gl-component>
```

## Named templates

In order to use `v-if` and `v-for` to control the content, templates have to be defined and used with a name.
If this rule is broken :
- Popup will display blank
- Loading a saved state will fail
- This will be displayed in the console: "Dynamic golden-layout components should be named templates instead."

### Defining a template
This is done through `slot`s in the `<golden-layout>` element (the square brackets stand for "optional")
```html
<template slot="template-name"[ slot-scope="myState"]>
	...
</template>
```
The content of `myState` can of course be changed. This will be saved/loaded when the overall state is saved/loaded.

### Using a template
`gl-component` has a `template` property. This is a string that target the `slot` defined.
It also (useful for `v-for`s) has a `state` property that will be used as the `slot-scope`
```html
<gl-component v-for="sth in swhr" :key="sth.else"
	template="template-name" :state="sth.state" />
```

## Properties

### Contained objects

```typescript
title: string
width: number
height: number
closable: boolean
reorderEnabled: boolean
hidden: boolean
```

## Saving/restoring states

The `golden-layout` has a *property* and an *event* named `state`.
- The event is triggered when the state has changed (even deeply, like a deep watch).
- The property is used [**at mount**](https://github.com/eddow/vue-golden-layout/issues/20#issuecomment-433828678) to initialise the configuration. After that, any change will have no effect.
- The `state` property can be a `Promise`, then the golden-layout will be rendered only when the `Promise` has been resolved.

Notes:
- The property `state` can be given minified or not
- The event `state` gives indeed the minified version of the config, and the expanded version as a second argument.
- It is also the `v-model` of the `golden-layout`

## Low-level functionalities

### global components
Some golden-layout global component can be given before any instanciation (while declaring classes) by calling this function:
```typescript
import {registerGlobalComponent} from 'vue-golden-layout'
// registerGlobalComponent(name: string, comp: (gl: goldenLayout, container: any, state: any)=> void)
```
`(container: any, state: any)=> void` is the signature of a gloden-layout component and they are created per golden-layout instances

### CSS
The glComponent are the ones directly included in the `<div>` controlled and sized by golden-layout and answers to this class to fit in the layout child container, that can be overridden
```css
.glComponent {
	width: 100%;
	height: 100%;
	overflow: auto;
}
```
### Objects linking

Golden-layout and Vue both have objects representing their internal state. A `glRow` is associated with a `ContentItem`.

Each vue object has a `glObject` property and, vice versa, each golden-layout object has a `vueObject` property linking to each another.

#### Virtual vs actual tree

Vue objects (rows, components, stacks, ...) all have a `$parent` that retrieve their Vue' parent. Also their children might be retrieved with `$children`.

Though, the user might change the order of things and who contain what. To retrieve the golden-layout-wise hierarchy, we can use `glParent` as well as `glChindren` on the vue objects to retrieve vue objects.

### Events
#### Layout 
Straight forwards from golden-layout, refer to their doc
```javascript
itemCreated
stackCreated
rowCreated
tabCreated
columnCreated
componentCreated
selectionChanged
windowOpened
windowClosed
itemDestroyed
initialised
activeContentItemChanged
```
Also, the event `sub-window` is emitted on mount with a `is: boolean` argument that is `true` iif this instance of golden-layout is loaded as a pop-up window.
#### Contained objects
Straight forwards from golden-layout, refer to their doc
```javascript
stateChanged
titleChanged
activeContentItemChanged
beforeItemDestroyed
itemDestroyed
itemCreated
```
## Specific components
### gl-dstack

*Duplicatable stacks* are stacks that should always remain in the main window as their content is modified programatically. These stacks, when poped-out, *remain* in the main screen while their content is poped-out.
Defineing in it components that are not `closable` nor `reorder-enabled` will *stay* in the stack in the main window.

### gl-router

The router is a `glContainer` that aims to sublimate the `<router-view />`
It let people manage their routes in tabs, open them in a split screen or even popped-out in another browser window on another physical display.

The main usage is `<gl-router />`. Any options of `router-view` still has to be implemented.

Note: `gl-router` is a `gl-dstack`.

#### Slots

A default content to render all routes can be provided as the `route` slot template - with or without scope : if a scope is queried, it will be the route object.
If this content is provided, it should contain a `<main />` tag that will be filled with the loaded route component.

Note: the provided template will be ignored when maximised/popped-out.

#### Properties
##### `titler`

Allows to specify a function that takes a route object in parameter and gives the string that will be used as tab title.
If none is specified, the default is to take `$route.meta.title` - this means that routes have to be defined with a title in their meta-data.

##### `empty-route`

Specify the URL to use when the user closes all the tabs (`"/"` by default)

### gl-route

`gl-route`s are components displaying a route. They are meant to be used in a gl-router but only have to be used in a golden-layout container.

They can take a `name` and/or a `path`, and their `closable` and `reorder-enabled` properties are false by default. They can be forced a `title` but their container' `titler` will be used if not.

Note: all the elements inside them rendered from route' component will have a `this.$route` pointing to the given route, not the actual one.

## `<golden-layout ...>`
### Properties
#### Properties directly forwarded to the config
```typescript
@Prop({default: true}) hasHeaders: boolean
@Prop({default: true}) reorderEnabled: boolean
@Prop({default: false}) selectionEnabled: boolean
@Prop({default: true}) popoutWholeStack: boolean
@Prop({default: true}) blockedPopoutsThrowError: boolean
@Prop({default: true}) closePopoutsOnUnload: boolean
@Prop({default: true}) showPopoutIcon: boolean
@Prop({default: true}) showMaximiseIcon: boolean
@Prop({default: true}) showCloseIcon: boolean
@Prop({default: 5}) borderWidth: number
@Prop({default: 10}) minItemHeight: number
@Prop({default: 10}) minItemWidth: number
@Prop({default: 20}) headerHeight: number
@Prop({default: 300}) dragProxyWidth: number
@Prop({default: 200}) dragProxyHeight: number
```
#### `popup-timeout`
(default: 5 = 5 seconds)

When the state change, an event is fired and provides the new state. Unfortunately, when something is poped-out, querying the state will raise an exception is the pop-out' golden-layout is not loaded. Hence, the first call to `GoldenLayout.toConfig()` will for sure raise an exception.

The policy chosen here is to then wait a bit and try again. In order to avoid infinite exception+try-again, a time-out is still specified.

Therefore:
- Changing this value to higher will not postpone the event fireing, it will just allow more time for the popup to load before raising an exception
- This can be useful to increase in applications where the main page has some long loading process before displaying the golden-layout
#### `inter-window`
This (optional) is an object that will be shared among all the windows (the main one and the poped-out ones).
The initial value will be set by the main window and ignored by the poped-out windows, though any change by any window will be propagated to all the others.