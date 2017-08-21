# vue-golden-layout
Integration of the golden-layout to Vue
## Installation

```
npm install --save vue-golden-layout
```
In order to test, after cloning, a static application can be compiled :

```
npm install
npm run compile
```
The file dist/index.html then shows test/test.vue in action

## Example

```html
<layout-golden>
	<gl-col>
		<gl-component @resize="console.log('resize')" title="compA">
			<h1>CompA</h1>
		</gl-component>
		<gl-row>
			...
		</gl-row>
		<gl-stack>
			...
		</gl-stack>
	</gl-col>
</layout-golden>
```
## Usage
```javascript
import vgl from 'vue-golden-layout'
Vue.use(vgl);
```
The objects are differentiated into : The layout object (golden), the container objects (golden and glRow, glCol and glStack), the contained objects (glRow, glCol and glStack and glComponent).

### Control
The purpose has been to have it mainly behaving with Vue so :
- use v-if to add/remove an element
- v-for is supposed to work too but has not been tested

Properties like 'hidden' and 'title' are watched (but the 'hidden' property sucks)
#### CSS
The glComponent answers to this class to fit in the layout child container, that you can override
```stylus
.glComponent
	width 100%
	height 100%
	overflow auto
```
### Properties
#### glComponent
```typescript
title: string
```
#### Contained objects

```typescript
width: number
height: number
closable: boolean
hidden: boolean
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
Straight forwards from golden-layout, refer to their doc
```javascript
show
shown
maximised
minimised
resize
hide
close
open
destroy
```
### Methods
#### Container
These are defined on the container objects

```javascript
addGlChild(child, comp)
```
'child' is a configuration object (cfr golden-layout doc.), 'comp' is a vue component of a contained object
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

# TODOs

## Re-ordering and interactions
For now, either Vue interact with the layout, either we let the user re-organise
- goldenKey property to elements (re-use the v-for :key ?)
- replicate the reorganisation in the ghost structure (list of empty &lt;div&gt; surrounded by display:none; replicating the layout tree)

# Donations
I contribute for free with drive, passion and time.
If you like what I do, you can promote me to do it more.

These are the only *like* buttons that have a real effect.

- [paypal.me/eeddow](https://www.paypal.me/eeddow)
- ETH: 0xb79b61130bc5726ddab6c1d59c3e0479afe69540
- BTC: 39ybn3KGNUvZrhifaLJcf4cJdzkGMdfAMT
- BCH: 3K81iYWwLZuWXY1qHcBL559FYraUqKMkEp