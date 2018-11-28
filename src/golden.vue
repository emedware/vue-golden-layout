<template>
	<div ref="layoutRoot" v-resize="onResize">
		<slot />
	</div>
</template>
<script lang="ts">
import Vue from 'vue'
import {Component, Inject, Model, Prop, Watch, Emit} from 'vue-property-decorator'
import * as GoldenLayout from 'golden-layout'
import {goldenContainer} from './roles'
import * as resize from 'vue-resize-directive'

var globalComponents: {[name: string] : (gl: goldenLayout)=> (container: any, state: any)=> void} = {};

function correctArrays(config) {	//Solve a bug where content is not an array
	// state.openPopouts[0].content looks like an array, even in the debugger, but `instance of Array` returns false
	if(!config || 'object'!== typeof config)
		return config;
	if(config.map && config.concat)
		return [].concat(config.map(correctArrays));
	var rv = {};
	for(let i in config) rv[i] = correctArrays(config[i]);
	return rv;
}

@Component({directives: {resize}})
export default class goldenLayout extends goldenContainer {
	$router
	static registerGlobalComponent(name: string, comp: (gl: goldenLayout)=> (container: any, state: any)=> void) {
		console.assert(!globalComponents[name], `Component name "${name}" unused`);
		globalComponents[name] = comp;
	}

	//Settings
	@Prop({default: true}) hasHeaders: boolean
	@Prop({default: true}) reorderEnabled: boolean
	@Prop({default: false}) selectionEnabled: boolean
	@Prop({default: true}) popoutWholeStack: boolean
	@Prop({default: true}) blockedPopoutsThrowError: boolean
	@Prop({default: true}) closePopoutsOnUnload: boolean
	@Prop({default: true}) showPopoutIcon: boolean
	@Prop({default: true}) showMaximiseIcon: boolean
	@Prop({default: true}) showCloseIcon: boolean
	@Model('state', {default: null}) state: any
	
	@Watch('hasHeaders') @Watch('reorderEnabled') @Watch('selectionEnabled') @Watch('popoutWholeStack')
	@Watch('blockedPopoutsThrowError') @Watch('closePopoutsOnUnload') @Watch('showPopoutIcon')
	@Watch('showMaximiseIcon') @Watch('showCloseIcon')
	settingsChanged() {
		//TODO: change settings in this.gl
	}


	@Prop({default: 5}) borderWidth: number
	@Prop({default: 10}) minItemHeight: number
	@Prop({default: 10}) minItemWidth: number
	@Prop({default: 20}) headerHeight: number
	@Prop({default: 300}) dragProxyWidth: number
	@Prop({default: 200}) dragProxyHeight: number

	@Watch('borderWidth') @Watch('minItemHeight') @Watch('minItemWidth')
	@Watch('headerHeight') @Watch('dragProxyWidth') @Watch('dragProxyHeight')
	dimensionsChanged() {
		//TODO: change settings in this.gl
	}

	@Emit('state')
	gotState(state, expanded) {}
/*
	labels: {
		close: 'close',
		maximise: 'maximise',
		minimise: 'minimise',
		popout: 'open in new window'
	},*/

	gl: any
	tplCount = 0
	tplPreload = {}
	
	registerComponent(component/*: Vue|()=>any*/, name?: string): string {
		if(!name) name = 'tpl'+(++this.tplCount);
		var tplData = 'function'=== typeof component ?
			component :
			function(container, state) {
				container.getElement().append(component.$el);
				forwardEvt(container, component, component.events);
				component.container = container;
			};
		if(this.gl) {
			this.gl.registerComponent(name, tplData);
			console.warn('Dynamic golden-layout components should be named templates instead.');
		} else this.tplPreload[name] = tplData;
		return name;
	}
	initialisedCB: ((any?)=> void)[]
	onGlInitialise(cb: (any?)=> void) {
		if(this.glObject) cb(this.gl);
		else (this.initialisedCB || (this.initialisedCB=[])).push(cb);
	}
	@Emit() subWindow(is: boolean) {}
	mounted() {
		var me = this, layoutRoot = this.$refs.layoutRoot, gl,
			state = this.state instanceof Promise ?
				this.state : Promise.resolve(this.state);
		state.then(state=> {
			if(state) {
				this.config = state.content ?
					state :
					GoldenLayout.unminifyConfig(state);
			} else {
				this.config.settings = {
					hasHeaders: this.hasHeaders,
					reorderEnabled: this.reorderEnabled,
					selectionEnabled: this.selectionEnabled,
					popoutWholeStack: this.popoutWholeStack,
					blockedPopoutsThrowError: this.blockedPopoutsThrowError,
					closePopoutsOnUnload: this.closePopoutsOnUnload,
					showPopoutIcon: this.showPopoutIcon,
					showMaximiseIcon: this.showMaximiseIcon,
					showCloseIcon: this.showCloseIcon
				};
				this.config.dimensions = {
					borderWidth: this.borderWidth,
					minItemHeight: this.minItemHeight,
					minItemWidth: this.minItemWidth,
					headerHeight: this.headerHeight,
					dragProxyWidth: this.dragProxyWidth,
					dragProxyHeight: this.dragProxyHeight
				};
			}
			this.gl = gl = new GoldenLayout(this.config, <Element>layoutRoot);
			this.subWindow(gl.isSubWindow);
			for(var tpl in this.tplPreload)
				gl.registerComponent(tpl, this.tplPreload[tpl]);
			delete this.tplPreload;
			function appendVNodes(container, vNodes) {
				var el = document.createElement('div');
				container.getElement().append(el);
				renderVNodes(me, el, vNodes, {
					class: 'glComponent'
				});
			}
			//#region Register gl-components
			// Components registered with this.registerComponent(...)
			for(var tpl in this.tplPreload)
				gl.registerComponent(tpl, this.tplPreload[tpl]);
			delete this.tplPreload;
			var slots = (<any>this).$slots;
			// Register direct-children templates
			for(var tpl in slots) if('default'!== tpl) ((tpl)=> {
				gl.registerComponent(tpl, function(container) {
					appendVNodes(container, slots[tpl]);
				});
			})(tpl);
			var scopedSlots = (<any>this).$scopedSlots;
			// Register direct-children templates with a scope
			for(var tpl in scopedSlots) ((tpl)=> {
				gl.registerComponent(tpl, function(container, state) {
					appendVNodes(container, scopedSlots[tpl](state));
				});
			})(tpl);
			// Register global components given by other vue-components
			for(var tpl in globalComponents) ((tpl)=> {
				gl.registerComponent(tpl, globalComponents[tpl](this));
			})(tpl);
			//#endregion
			const maxRetries = 5;
			//#region Events
			var raiseStateChanged = (retry)=> {
				if('number'!== typeof retry) retry = 0;
				setTimeout(()=> {
					var config;
					try {
						//gl.toConfig() raise exceptions when opening a popup
						//it allso raise a 'stateChanged' event when closing a popup => inf call
						config = gl.toConfig();
					}
					catch(e) {
						if(retry < maxRetries)
							raiseStateChanged(++retry);
						else
							throw e;
					}
					if(config) {
						config = correctArrays(config);
						this.gotState(GoldenLayout.minifyConfig(config), config);
					}
				}, 500);
			};
			gl.on('stateChanged', raiseStateChanged);
			gl.on('initialised', () => {
				if(this.initialisedCB) for(let cb of this.initialisedCB) cb(gl);
				delete this.initialisedCB;
			});
			gl.on('itemCreated', (itm) => {
				Vue.set(itm, 'vueObject', itm === gl.root ? this :
					itm.config.vue && !gl.isSubWindow ? this.getChild(itm.config.vue) :
					{});
				Vue.set(itm.vueObject, 'glObject', itm);
				if(itm.config.vue && itm.vueObject.nodePath) {
					itm.config.__defineGetter__('vue', ()=> itm.vueObject.nodePath());
				}
			});
			gl.on('itemDestroyed', (itm) => {
				itm.vueObject.glObject = null;
				//Bugfix: when destroying a tab before itm, stack' activeItemIndex is not updated and become invalid
				if(itm.parent.isStack && itm.parent.contentItems.indexOf(itm) < itm.parent.config.activeItemIndex)
					setTimeout(()=> {
						--itm.parent.config.activeItemIndex;
					});
			});
			forwardEvt(gl, this, ['itemCreated', 'stackCreated', 'rowCreated', 'tabCreated', 'columnCreated', 'componentCreated', 'selectionChanged',
				'windowOpened', 'windowClosed', 'itemDestroyed', 'initialised',
				'activeContentItemChanged']);
			//#endregion
			try{
				gl.init();
			} catch( e ) {
				if( e.type === 'popoutBlocked' ) {
					alert('The browser has blocked the pop-up you requested. Please allow pop-ups for this site.')
				}
			}
		});
	}
	onResize() { this.gl && this.gl.updateSize(); }
}

export function renderVNodes(parent, el, vNodes, options?) {
	return new Vue({
		render: function(ce) {
			return ce('div', options, vNodes instanceof Array ? vNodes : [vNodes]);
		},
		parent,
		el
	});
}
function forwardEvt(from, toward, events) {
	for(let event of events)
		from.on(event, (...args) =>
			'object'=== typeof event?
				toward.$emit(event.type, event):
				toward.$emit(event, ...args));
}
</script>
