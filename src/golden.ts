import * as Vue from 'vue'
import {Component, Inject, Model, Prop, Watch} from 'vue-property-decorator'
import * as GoldenLayout from 'golden-layout'
import 'golden-layout/src/css/goldenlayout-base.css'
import 'golden-layout/src/css/goldenlayout-light-theme.css'
import {goldenContainer} from './gl-roles'
import * as resize from 'vue-resize-directive'

@Component({
	template: '<div ref="layoutRoot" v-resize="onResize"><slot /></div>',
	directives: {resize}
})
export class layoutGolden extends goldenContainer {
	//Settings
	@Prop({type: Boolean, default: true}) hasHeaders
	@Prop({type: Boolean, default: true}) reorderEnabled
	@Prop({type: Boolean, default: false}) selectionEnabled
	@Prop({type: Boolean, default: true}) popoutWholeStack
	@Prop({type: Boolean, default: true}) blockedPopoutsThrowError
	@Prop({type: Boolean, default: true}) closePopoutsOnUnload
	@Prop({type: Boolean, default: true}) showPopoutIcon
	@Prop({type: Boolean, default: true}) showMaximiseIcon
	@Prop({type: Boolean, default: true}) showCloseIcon

	
	@Watch('hasHeaders') @Watch('reorderEnabled') @Watch('selectionEnabled') @Watch('popoutWholeStack')
	@Watch('blockedPopoutsThrowError') @Watch('closePopoutsOnUnload') @Watch('showPopoutIcon')
	@Watch('showMaximiseIcon') @Watch('showCloseIcon')
	settingsChanged() {
		//TODO: change settings in this.gl
	}


	@Prop({type: Number, default: 5}) borderWidth
	@Prop({type: Number, default: 10}) minItemHeight
	@Prop({type: Number, default: 10}) minItemWidth
	@Prop({type: Number, default: 20}) headerHeight
	@Prop({type: Number, default: 300}) dragProxyWidth
	@Prop({type: Number, default: 200}) dragProxyHeight

	@Watch('borderWidth') @Watch('minItemHeight') @Watch('minItemWidth')
	@Watch('headerHeight') @Watch('dragProxyWidth') @Watch('dragProxyHeight')
	dimensionsChanged() {
		//TODO: change settings in this.gl
	}
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
	mounted() {
		var layoutRoot = this.$refs.layoutRoot, gl, comps = this.comps;
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
		this.gl = gl = new GoldenLayout(this.config, /*$*/(<Element>layoutRoot));
		gl.registerComponent('template', function(container, state) {
			var id = state.templateId.split('-');
			console.assert('lgc'=== id[0] && 2=== id.length, "GoldenLayout consistency: components are registered with a lgc-xxx id")
			var comp = comps[id[1]-1];
			container.getElement().append(comp.childEl);
			forwardEvt(container, comp, comp.events);
			comp.container = container;
		});

		gl.init();
		gl.on('stateChanged', () => this.$emit('stateChanged', gl.toConfig()));
		
		forwardEvt(gl, this, ['itemCreated', 'stackCreated', 'rowCreated', 'tabCreated', 'columnCreated', 'componentCreated', 'selectionChanged',
			'windowOpened', 'windowClosed', 'itemDestroyed', 'initialised',
			'activeContentItemChanged']);
	}
	contentItem() { return this.gl && this.gl.root; }
	get state() { return this.gl.config(); }
	onResize() { this.gl && this.gl.updateSize(); }
}

function forwardEvt(from, toward, events) {
	for(let event of events)
		from.on(event, (...args) =>
			'object'=== typeof event?
				toward.$emit(event.type, event):
				toward.$emit(event, ...args));
}