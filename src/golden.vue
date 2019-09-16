<template>
	<div ref="layoutRoot" v-resize="onResize">
		<slot v-if="!isSubWindow" />
	</div>
</template>
<script lang="ts">
////TODO2: Trouver un moyen pour retrouver de quel sous-composant un tab s'agit dans un popup, quand les composants ont bougé
//         Peut se faire en donnant une image de l'arbre des nodePath
////TODO3: Trouver un moyen de faire de même quand l'élément est crée dynamiquement
import Vue, { VNode, VueConstructor } from 'vue'
import { Component, Model, Prop, Watch, Emit, Provide } from 'vue-property-decorator'
import * as GoldenLayout from 'golden-layout'
import { goldenContainer, goldenChild, goldenItem } from './roles'
import * as resize from 'vue-resize-directive'
import { isSubWindow, Dictionary, Semaphore, newSemaphore, poppingOut, poppingIn } from './utils'
import { Object } from 'core-js';

export type globalComponent = (gl: goldenLayout, container: any, state: any)=> void;
var globalComponents: Dictionary<globalComponent> = {};

//This is necessary as in poped-out windows, an observed config has arrays that return `instanceof Array` false
//avoid the objects being observed
(<any>GoldenLayout.prototype)._isVue = true;
(<any>GoldenLayout).__lm.items.AbstractContentItem.prototype._isVue = true;

export function registerGlobalComponent(name: string, comp: globalComponent) {
	console.assert(!globalComponents[name], `Component name "${name}" unused`);
	globalComponents[name] = comp;
}

interface slotComponent {
	customVueComponent: VueConstructor
	content: any
}

@Component({directives: {resize}})
export default class goldenLayout extends goldenContainer {
	$router : any
	isSubWindow: boolean = isSubWindow
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

	@Emit('state')
	gotState(state: any, expanded: any) {}
/*
	labels: {
		close: 'close',
		maximise: 'maximise',
		minimise: 'minimise',
		popout: 'open in new window'
	},*/

	gl: GoldenLayout
	tplCount: Dictionary<number> = {}
	tplPreload : Dictionary<any> = {}
	
	registerComponent(component: any/*: Vue|()=>any*/, name?: string, prefix?: string): string {
		if(!name) {
			if(!prefix) prefix = '';
			if(!this.tplCount[prefix]) this.tplCount[prefix] = 0;
			name = `${prefix}.tpl`+(++this.tplCount[prefix]);
		}
		var tplData = 'function'=== typeof component ?
			component :
			function(container: any, state: any) {
				container.getElement().append(component.$el);
				//TODO: `events` should not be an instance property
				forwardEvt(container, component, component.events);
				component.container = container;
			};
		if(this.gl) {
			this.gl.registerComponent(name, tplData);
			//TODO: The warning might be relevant even with prefix, if loaded after the prefix-object has been constructed
			if(!prefix) console.warn('Dynamic golden-layout components should be named templates instead.');
		} else this.tplPreload[name] = tplData;
		return name;
	}
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
	
	slotTemplates: Dictionary<slotComponent> = {}
	registerSlotTemplates(name: string, customVueComponent: VueConstructor, content: any) {
		var already = this.slotTemplates[name];
		if(already) {
			console.assert(
				already.customVueComponent === customVueComponent,
				`Custom gl-component registered by '${already.customVueComponent.name}' then '${customVueComponent.name}'`);
		} else {
			this.slotTemplates[name] = {customVueComponent, content};
			if(this.gl)
				this.gl.registerComponent(name, this.slotComponentWrap(content));
		}
	}
	useSlotTemplates(customComponent: Vue) {
		var ctr = <VueConstructor>customComponent.constructor,
			hackyCC = <any>customComponent,
			slots = hackyCC.$slots,
			scopedSlots = hackyCC.$scopedSlots;
			
		// Register direct-children templates
		for(var tpl in slots)
			if(!~hackyCC.usedSlots.indexOf(tpl))
				this.registerSlotTemplates(tpl, ctr, slots[tpl]);
		// Register direct-children templates with a scope
		for(var tpl in scopedSlots)
			if(!~hackyCC.usedSlots.indexOf(tpl))
				this.registerSlotTemplates(tpl, ctr, scopedSlots[tpl]);
	}
	//cached by Vue
	get glo(): Semaphore<any> {
		return newSemaphore();
	}
	get definedVueComponent() { return this; }
	@Provide() get layout() { return this; }
	
	getSubChild(path: string): goldenChild {
		var rootPathLength: number = 0, rootPathComponent: goldenItem = null;
		for(let compPath in this.rootPath) {
			let compPathLength: number = compPath.length;
			if(path.substring(0, compPathLength) === compPath &&
				compPathLength  > rootPathLength)
					[rootPathLength, rootPathComponent] = [compPathLength, this.rootPath[compPath]];
		}
		rootPathComponent = rootPathComponent.childMe;
		var remainingPath = path.substr(rootPathLength+1);
		return remainingPath ?
			(<goldenContainer>rootPathComponent).getChild(remainingPath) :
			<goldenChild>rootPathComponent;
	}
	rootPath?: {[path: string]: goldenItem}
	parentLayout?: goldenLayout
	async mounted() {
		var me = this, layoutRoot = this.$refs.layoutRoot, gl: GoldenLayout,
			state = this.state instanceof Promise ?
				this.state : Promise.resolve(this.state);

		//Used to debug poped-up windows
		var sleep = (timeout: number, rv: any)=> new Promise(function(resolve: (value: any)=> void, _: any) {
			setTimeout(()=> resolve(rv), timeout);
		});
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
				// Components registered with this.registerComponent(...)
				for(var tpl in this.tplPreload)
					gl.registerComponent(tpl, this.tplPreload[tpl]);
				delete this.tplPreload;
				// Register direct-children templates
				for(var tpl in this.slotTemplates)
					gl.registerComponent(tpl, this.slotComponentWrap(this.slotTemplates[tpl].content));
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
							this.gotState(GoldenLayout.minifyConfig(config), config);
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
						this.gotState(GoldenLayout.minifyConfig(config), config);
					}
				};
			}
			gl.on('stateChanged', raiseStateChanged);
			gl.on('initialised', () => {
				this.glo.resolve(gl);
			});
			gl.on('itemCreated', (itm: any) => {
				itm.vueObject = itm === gl.root ? this :
					itm.config.vue ?
						isSubWindow ?
							this.getSubChild(itm.config.vue) :
							this.getChild(itm.config.vue) :
					{};
				itm.vueObject.glObject = itm;
				if(itm.config.vue && itm.vueObject.nodePath && !isSubWindow) {
					itm.config.__defineGetter__('vue', ()=> itm.vueObject.nodePath);
				}
				if(itm.vueObject.initialState)
					itm.vueObject.initialState(itm.config.componentState);
			});
			gl.on('itemDestroyed', (itm: any) => {
				itm.emit('destroyed', itm);

				if(!poppingOut && !poppingIn) {
					itm.vueObject.glObject = null;
					itm.vueObject.delete && itm.vueObject.delete();
				}
				//Bugfix: when destroying a tab before itm, stack' activeItemIndex is not updated and become invalid
				if(itm.parent && itm.parent.isStack && itm.parent.contentItems.indexOf(itm) < itm.parent.config.activeItemIndex)
					setTimeout(()=> {
						--itm.parent.config.activeItemIndex;
					});
			});
			forwardEvt(gl, this, ['itemCreated', 'stackCreated', 'rowCreated', 'tabCreated', 'columnCreated', 'componentCreated',
				'selectionChanged', 'windowOpened', 'windowClosed', 'itemDestroyed', 'initialised', 'activeContentItemChanged']);
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
	onResize() { this.gl && this.gl.updateSize(); }
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
