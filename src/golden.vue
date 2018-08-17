<template>
	<div ref="layoutRoot" v-resize="onResize">
		<slot />
	</div>
</template>
<script lang="ts">
import { Vue } from './imports'
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
	comps = []
	//We generate IDs for the layout to be able to save/load
	registerComp(component): string {
		this.comps.push(component);
		return 'lgc-'+this.comps.length;
	}
	initialisedCB: (()=> void)[]
	onGlInitialise(cb: ()=> void) {
		if(this.contentItem()) cb();
		else (this.initialisedCB || (this.initialisedCB=[])).push(cb);
	}
	mounted() {
		var me = this, layoutRoot = this.$refs.layoutRoot, gl, comps = this.comps;
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
		gl.registerComponent('template', function(container, state) {
			var id = state.templateId.split('-');
			console.assert('lgc'=== id[0] && 2=== id.length, "GoldenLayout consistency: components are registered with a lgc-xxx id")
			var comp = comps[id[1]-1];
			container.getElement().append(comp.childEl);
			forwardEvt(container, comp, comp.events);
			comp.container = container;
		});
		//TODO: find a way to register these component programatically, knowing the problem is when it is poped-out,
		// it doesn't come with the wrapping vue component
		gl.registerComponent('route', function(container, state) {
			var comp = me.$router.getMatchedComponents(state.path)[0];
			//TODO: comp can be a string too
			if('object'=== typeof comp)
				comp = Vue.extend(comp);
			var div = document.createElement('div');
			container.getElement().append(div);
			new comp({el: div, parent: me});
		});

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
