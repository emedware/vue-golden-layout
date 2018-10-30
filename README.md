[![npm](https://img.shields.io/npm/v/vue-golden-layout.svg)](https://www.npmjs.com/package/vue-golden-layout)
# vue-golden-layout
Integration of the golden-layout to Vue
## Installation

```
npm i -S vue-golden-layout
```
In order to test, after cloning, a static application can be compiled :

```
npm install
npm start
```
You can browse the file `test/dist/index.html` in your browser.

## Example

```html
<golden-layout>
	<gl-col>
		<gl-component title="compA">
			<h1>CompA</h1>
		</gl-component>
		<gl-row>
			...
		</gl-row>
		<gl-stack>
			...
		</gl-stack>
	</gl-col>
</golden-layout>
```
## Don't forget in order to make it work
- Include a golden-layout theme CSS.
```typescript
import 'golden-layout/src/css/goldenlayout-light-theme.css'
```
`goldenlayout-base.css` is already integrated to the library.

## Usage
```javascript
import vgl from 'vue-golden-layout'
Vue.use(vgl);
```

In case of incompatibility with bundlers, you can bundle `vue-golden-layout` by simply bundling the sources.
The sources entry point is in `vue-golden-layout/src/index.ts`

```javascript
import vgl from 'vue-golden-layout/src'
Vue.use(vgl);
```

The objects are differentiated into : The layout object (golden), the container objects (golden and glRow, glCol and glStack), the contained objects (glRow, glCol and glStack and glComponent).

## Named templates

In order to use `v-if` and `v-for` to control the content, templates have to be defined and used with a name.
If this rule is broken :
- Popup will display blank
- Loading a saved state will fail
- This will be displayed in your console: "Dynamic golden-layout components should be named templates instead."

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
hidden: boolean
```

## Saving/restoring states

The `golden-layout` has a *property* and an *event* named `state`.
- The event is triggered when the state has changed (even deeply, like a deep watch).
- The property is used **at mount** to initialise the configuration. After that, any change will have no effect.
Notes:
- The property `state` can be given minified or not
- The event `state` gives indeed the minified version of the config, and the expanded version as a second argument.# slot

## Low-level functionalities

### global components
Some golden-layout global component can be given before any instanciation (while declaring classes) by calling this function:
```typescript
static registerGlobalComponent(name: string, comp: (gl: goldenLayout)=> (container: any, state: any)=> void)
```
`(container: any, state: any)=> void` is the signature of a gloden-layout component and they are created per golden-layout instances

### CSS
The glComponent are the ones directly included in the `<div>` controlled and sized by golden-layout and answers to this class to fit in the layout child container, that you can override
```css
.glComponent {
	width: 100%;
	height: 100%;
	overflow: auto;
}
```

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
#### Contained objects

`destroy` is provided for all components beside the golden-layout object. It occurs on user's closure of pop-out.

### Methods
#### Container
These are defined on the container objects

```javascript
addGlChild(child, comp)
```
`child` is a configuration object (cfr golden-layout doc.), 'comp' is a vue component of a contained object
The child.componentState.templateId will be managed : don't fuss with the IDs, just give the component (your specified ID won't be replaced)
```javascript
removeGlChild(index)
```
This function is called automatically on VueComponent.beforeDestroy
#### Contained objects
```javascript
hide()
show()
close()
```

# gl-router

The router is a `glContainer` that aims to sublimate the `<router-view />`
It let people manage their routes in tabs, open them in a split screen or even popped-out in another browser window on another physical display.

The main usage is `<gl-router />`. Any options of `router-view` still has to be implemented.

## Slots

A default content to render all routes can be provided as the `route` slot template - with or without scope : if a scope is queried, it will be the route object
If this content is provided, it should contain a `<main />` tag that will be filled with the loaded component.
Note: the provided template will be ignored when maximised/popped-out.

## Properties
### titler

Allows you to specify a function that takes a route object in parameter and gives the string that will be used as tab title.
If none is specified, the default is to take `$route.meta.title` - this means that routes have to be defined with a title in their meta-data.

### empty-route

Specify the URL to use when the user closes all the tabs (`"/"` by default)
