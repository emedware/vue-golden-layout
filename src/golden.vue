<template>
	<div ref="layoutRoot" v-resize="onResize">
		<slot />
	</div>
</template>
<script lang="ts">
//import { Vue } from './imports'
import Vue from 'vue'
import {Component, Inject, Model, Prop, Watch, Emit} from 'vue-property-decorator'
import * as GoldenLayout from 'golden-layout'
import {goldenContainer} from './gl-roles'
import * as resize from 'vue-resize-directive'

@Component({directives: {resize}})
export default class layoutGolden extends goldenContainer {
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
	@Prop({default: null}) state: any

	
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
	gotState(state) {}
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
	//We generate IDs for the layout to be able to save/load
	registerComp(component): string {
		var tpl = 'tpl'+(++this.tplCount);
		var tplData = function(container, state) {
			container.getElement().append(component.childEl);
			forwardEvt(container, component, component.events);
			component.container = container;
		};
		if(this.gl) {
			this.gl.registerComponent(tpl, tplData);
			/*if DEBUG*/ console.warn('Dynamic golden-layout components should be named templates instead.');
		} else this.tplPreload[tpl] = tplData;
		return tpl;
	}
	initialisedCB: (()=> void)[]
	onGlInitialise(cb: ()=> void) {
		if(this.contentItem()) cb();
		else (this.initialisedCB || (this.initialisedCB=[])).push(cb);
	}
	mounted() {
		var me = this, layoutRoot = this.$refs.layoutRoot, gl;
		if(this.state) {
			this.config = this.state;
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
		}
		this.gl = gl = new GoldenLayout(this.config, <Element>layoutRoot);
		
		for(var tpl in this.tplPreload)
			gl.registerComponent(tpl, this.tplPreload[tpl]);
		delete this.tplPreload;
		var slots = (<any>this).$slots;
		for(var tpl in slots) if('default'!== tpl) ((tpl)=> {
			gl.registerComponent(tpl, function(container) {
				new Vue({
					render: function(ce) {
						return ce('div', slots[tpl]);
					},
					el: container.getElement()[0]
				});
			});
		})(tpl);
		var scopedSlots = (<any>this).$scopedSlots;
		for(var tpl in scopedSlots) ((tpl)=> {
			gl.registerComponent(tpl, function(container, state) {
				new Vue({
					render: function(ce) {
						return ce('div', scopedSlots[tpl](state));
					},
					el: container.getElement()[0]
				});
			});
		})(tpl);
		gl.init();
		gl.on('stateChanged', ()=> this.gotState(gl.config));
		gl.on('initialised', () => {
			if(this.initialisedCB) for(let cb of this.initialisedCB) cb();
			delete this.initialisedCB;
		});
		forwardEvt(gl, this, ['itemCreated', 'stackCreated', 'rowCreated', 'tabCreated', 'columnCreated', 'componentCreated', 'selectionChanged',
			'windowOpened', 'windowClosed', 'itemDestroyed', 'initialised',
			'activeContentItemChanged']);
	}
	contentItem() { return this.gl && this.gl.root; }
	onResize() { this.gl && this.gl.updateSize(); }
}

function forwardEvt(from, toward, events) {
	for(let event of events)
		from.on(event, (...args) =>
			'object'=== typeof event?
				toward.$emit(event.type, event):
				toward.$emit(event, ...args));
}
</script>
