<template>
	<div ref="layoutRoot" v-resize="onResize">
		<slot v-if="!isSubWindow" />
	</div>
</template>
<style>
.dstack_anchor {
    position: absolute;
    right: 6px;
    width: 11px;
    height: 11px;
}
.dstack_anchor::after {
	content: "\2693";
}
</style>
<script lang="ts">
import Vue, { VNode, VueConstructor } from 'vue'
import { Component, Model, Prop, Watch, Provide } from 'vue-property-decorator'
import * as GoldenLayout from 'golden-layout'
import { goldenContainer, goldenChild, goldenItem } from './roles'
import * as resize from 'vue-resize-directive'
import { isSubWindow, Dictionary, Semaphore, newSemaphore, statusChange, localWindow, isDragging } from './utils'
import * as $ from 'jquery'

export type globalComponent = (gl: goldenLayout, container: any, state: any)=> void;
var globalComponents: Dictionary<globalComponent> = {};

function unobserve(obj: any, key: string = 'prototype') {
	obj[key]._isVue = true;
}

unobserve(GoldenLayout);
unobserve((<any>GoldenLayout).__lm.items.AbstractContentItem);

export const genericTemplate = 'Generic.Vue';
export function registerGlobalComponent(name: string, comp: globalComponent) {
	console.assert(!globalComponents[name], `Component name "${name}" unused`);
	globalComponents[name] = comp;
}

interface slotComponent {
	customVueComponent: VueConstructor
	content: any
}

const componentEvents = ['open', 'destroy', 'close', 'tab', 'hide', 'show', 'resize'];
const itemEvents = ['stateChanged', 'titleChanged', 'activeContentItemChanged', 'beforeItemDestroyed', 'itemDestroyed', 'itemCreated'];
const layoutEvents = ['itemCreated', 'stackCreated', 'rowCreated', 'tabCreated', 'columnCreated', 'componentCreated',
	'selectionChanged', 'windowOpened', 'windowClosed', 'itemDestroyed', 'initialised', 'activeContentItemChanged'];

@Component({directives: {resize}})
export default class goldenLayout extends goldenContainer {
	$router : any
	isSubWindow: boolean = isSubWindow
	//Settings
	@Prop({default: true}) hasHeaders: boolean
	@Prop({default: true}) reorderEnabled: boolean
	@Prop({default: false}) selectionEnabled: boolean
	@Prop({default: true}) popoutWholeStack: boolean
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

	@Prop({default: 5}) popupTimeout: number

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

	gotState(state: any) {
		state = localWindow(state);
		if(!isSubWindow && !statusChange.unloading)
			this.$emit('state', GoldenLayout.minifyConfig(state), state);
	}
/*
	labels: {
		close: 'close',
		maximise: 'maximise',
		minimise: 'minimise',
		popout: 'open in new window'
	},*/

	gl: GoldenLayout
	
	//#region vNode helpers
	
	appendVNodes(container: any, vNodes: any, state?: any) {
		var el = document.createElement('div');
		container.getElement().append(el);
		renderVNodes(this, el, vNodes, {
			class: 'glComponent'
		}, state);
	}
	slotComponentWrap(slot: any) {
		return (container: any, state: any) => this.appendVNodes(container, slot, state);
	}
	globalComponentWrap(globComponent: globalComponent) {
		return async (container: any, state: any) => {
			await this.glo;
			globComponent(this, container, state);
		};
	}

	//#endregion
	//cached by Vue
	get glo(): Semaphore<any> {
		return newSemaphore();
	}
	get definedVueComponent() { return this; }
	@Provide() get layout() { return this; }
	@Provide() groupColor: string|null = null
	
	getSubChild(path: string): goldenChild {
		if(!isSubWindow) return this.getChild(path);
		var rootPathLength: number = 0, rootPathComponent: goldenItem|null = null;
		for(let compPath in this.rootPath) {
			let compPathLength: number = compPath.length;
			if(path.substring(0, compPathLength) === compPath &&
				compPathLength  > rootPathLength)
					[rootPathLength, rootPathComponent] = [compPathLength, this.rootPath[compPath]];
		}
		rootPathComponent = (<goldenItem>rootPathComponent).childMe;
		var remainingPath = path.substr(rootPathLength+1);
		return remainingPath ?
			(<goldenContainer>rootPathComponent).getChild(remainingPath) :
			<goldenChild>rootPathComponent;
	}
	rootPath?: {[path: string]: goldenItem}
	parentLayout?: goldenLayout
	async mounted() {
		var me = this, gl: GoldenLayout,
			state = this.state instanceof Promise ?
				this.state : Promise.resolve(this.state);

		state
			.then(async (state: any)=> {
			if(state && !isSubWindow) {
				this.config = state.content ?
					state :
					GoldenLayout.unminifyConfig(state);
			} else {
				this.config.settings = {
					hasHeaders: this.hasHeaders,
					reorderEnabled: this.reorderEnabled,
					selectionEnabled: this.selectionEnabled,
					popoutWholeStack: this.popoutWholeStack,
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
			this.gl = gl = new GoldenLayout(this.config, $(<HTMLElement>this.$refs.layoutRoot));
			(<any>gl).vueObject = this;
			var poppedoutVue = (<any>window).poppedoutVue;
			if(poppedoutVue) {
				this.rootPath = poppedoutVue.path;
				this.parentLayout = poppedoutVue.layout;
			}
			//#region Register gl-components
			// In a popup, use parents's registrations
			if(this.parentLayout)
				(<any>gl)._components = (<any>this.parentLayout.gl)._components
			else {
				gl.registerComponent(genericTemplate, 
					(container: any, state: any)=> {
						var component = this.getSubChild(container._config.vue)
						container.getElement().append(component.$el);
						forwardEvt(container, component, componentEvents);
						component.container = container;
					});
				// Register global components given by other vue-components
				for(var tpl in globalComponents)
					gl.registerComponent(tpl, this.globalComponentWrap(globalComponents[tpl]));
			}
			//#endregion
				
			//#region Events
			var raiseStateChanged: (arg?: number)=> void;
			//TODO: have only one raiseStateChanged function ?
			if(this.popupTimeout) {
				const maxRetries = 10 * this.popupTimeout;
				raiseStateChanged = (retry?: number)=> {
					if('number'!== typeof retry) retry = 0;
					setTimeout(()=> {
						var config;
						try {
							//gl.toConfig() raise exceptions when opening a popup
							//it allso raise a 'stateChanged' event when closing a popup => inf call
							config = gl.toConfig();
						}
						catch(e) {
							if(<number>retry < maxRetries)
								raiseStateChanged(++(<number>retry));
							else
								throw e;
						}
						if(config) {
							this.gotState(config);
						}
					}, 100);
				};
			} else {
				raiseStateChanged = ()=> {
					var config;
					try {
						//gl.toConfig() raise exceptions when opening a popup
						//it allso raise a 'stateChanged' event when closing a popup => inf call
						config = gl.toConfig();
					}
					catch(e) {}
					if(config) {
						this.gotState(config);
					}
				};
			}
			gl.on('stateChanged', raiseStateChanged);
			gl.on('initialised', () => {
				this.glo.resolve(gl);
			});
			function colorizeTab(tab: any, color: string) {
				tab.element.css('background-color', color);
			}
			gl.on('itemCreated', (itm: any) => {
				itm.vueObject = itm === gl.root ? this :
					itm.config.vue ?
						this.getSubChild(itm.config.vue) :
						{};
				itm.vueObject.glObject = itm;
				if(itm.config.vue && itm.vueObject.nodePath && !isSubWindow) {
					itm.config.__defineGetter__('vue', ()=> itm.vueObject.nodePath);
				}
				if(itm.vueObject.initialState)
					itm.vueObject.initialState(itm.config);
				if(itm.vueObject.$emit)
					forwardEvt(itm, itm.vueObject, itemEvents);
				var color = itm.vueObject.childMe && itm.vueObject.childMe.tabColor;
				if(color && itm.tab)
					colorizeTab(itm.tab, color);
			});
			gl.on('tabCreated', (itm: any) => {
				var vo = itm.contentItem.vueObject,
					color = vo && vo.childMe.tabColor;
				if(color)
					colorizeTab(itm, color);
			});
			gl.on('itemDestroyed', (itm: any) => {
				if(!isDragging()) {
					itm.emit('destroyed', itm);

					if(!statusChange.poppingOut && !statusChange.poppingIn &&
							!itm.vueObject._isBeingDestroyed && !itm.vueObject._isDestroyed ) {
						itm.vueObject.glObject = null;
						itm.vueObject.delete && itm.vueObject.delete();
					}
				}
				//Bugfix: when destroying a tab before itm, stack' activeItemIndex is not updated and become invalid
				if(itm.parent && itm.parent.isStack && itm.parent.contentItems.indexOf(itm) < itm.parent.config.activeItemIndex)
					setTimeout(()=> {
						--itm.parent.config.activeItemIndex;
					});
			});
			forwardEvt(gl, this, layoutEvents);
			//#endregion
			try{
				gl.init();
			} catch(e) {
				this.glo.reject(e);
				if(e.type === 'popoutBlocked')
					alert('The browser has blocked the pop-up you requested. Please allow pop-ups for this site.');
			}
		});
	}
	onResize() {
		this.gl && this.gl.updateSize(10, 10);
		this.gl && this.gl.updateSize();
	}
	destroyed() {
		statusChange.unloading = true;
		this.gl.destroy();
		statusChange.unloading = false;
	}
}

export function renderVNodes(parent: any, el: any, vNodes: any, options?: any, state?: any) {
	return new Vue({
		render: function(ce): VNode {
			var vn = 'function'=== typeof vNodes ?
				vNodes(state) : vNodes;
			return ce('div', options, vn instanceof Array ? vn : [vn]);
		},
		parent,
		el
	});
}
function forwardEvt(from: any, toward: any, events: any) {
	for(let event of events)
		from.on(event, (...args : any[] ) =>
			'object'=== typeof event?
				toward.$emit(event.type, event):
				toward.$emit(event, ...args));
}
</script>
