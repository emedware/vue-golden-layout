import { Component, Prop, Watch, Inject, PropSync } from 'vue-property-decorator'
import { xInstanceOf, statusChange } from '../utils'
import { goldenContainer, goldenItem } from "./index"
import goldenLayout from "../golden"
import { Dictionary } from '../utils.js'

@Component
export class goldenChild extends goldenItem {
	@Inject() layout: goldenLayout
	@Inject({from: 'groupColor'}) belongGroupColor: string
	@Prop() width: number
	@Prop() height: number
	@Watch('width') reWidth(w:number) { this.container && this.container.setSize(w, false); }
	@Watch('height') reHeight(h:number) { this.container && this.container.setSize(false, h); }
	$parent: goldenContainer
	getChildConfig(): any { return null; }
	get glParent() { return this.glObject.parent.vueObject; }
	/**
	  * Gets the Vue container that is not a component definition and therefore actually contains this
	  */ 
	get vueParent(): goldenContainer {
		return this.$parent.parentMe;
	}
	
	get definedVueComponent(): goldenContainer {
		return this.$parent.definedVueComponent;
	}
	container: any = null;
	
	@Prop() tabId: string
	get givenTabId() { return this.givenProp('tabId'); }
	@Prop() title: string
	@Watch('title') setTitle(title: any): void {
		if(this.container) this.container.setTitle(title);
	}

	givenProp(prop: string): any {
		var itr: any = this;
		while(!itr[prop] && xInstanceOf(itr.$parent, 'glCustomContainer'))
			itr = itr.$parent;
		return itr[prop];
	}

	rootProp(prop: string): any {
		var itr: any = this, rv = itr[prop];
		while(xInstanceOf(itr.$parent, 'glCustomContainer')) {
			itr = itr.$parent;
			if(prop in itr) rv = itr[prop];
		}
		return rv;
	}

	get tabColor(): string|null {
		return this.belongGroupColor;
	}

	hide() { this.container && this.container.hide(); }
	show() { this.container && this.container.show(); }
	shouldFocus: boolean
	focus() {
		var brwsr = this.childMe.glObject, doc;
		if(brwsr) {
			// TODO: cfr layout.selectionEnabled
			this.show();
			for(; !brwsr.isRoot; brwsr = brwsr.parent) {
				if(brwsr.parent.isStack)
					brwsr.parent.setActiveContentItem(brwsr);
			}
			doc = brwsr.layoutManager.container[0].ownerDocument;
			(doc.defaultView || doc.parentWindow).focus();
		} else
			this.shouldFocus = true;
	}
	@Watch('glObject') glObjectSet(v:boolean) {
		if(!v) this.delete();
		else if(this.shouldFocus) {
			this.shouldFocus = false;
			this.focus();
		}
	}

	@Prop({default: false}) hidden: boolean

	@Watch('container')
	@Watch('hidden')
	setContainer() {
		if(this.glObject) {
			var parent = this.glObject.parent;
			this.container && (
					!parent.isStack ||
					parent.contentItems[parent.config.activeItemIndex] === this.glObject
				) && this.container[this.hidden ? "hide" : "show"]();
		}
	}

	@Prop({default: true}) closable: boolean
	@Prop({default: true}) reorderEnabled: boolean
	_isDestroyed?: boolean
	delete() {
		if(!statusChange.unloading && !this._isDestroyed) {	// If unloading, it might persist corrupted data
			this.$parent.computeChildrenPath()
			//this.$emit('destroy', this); //Already emited as a forward-event.
			this.$destroy();
		}
	}
	created() {
		if(!this.vueParent.addGlChild)
			throw new Error('gl-child can only appear directly in a golden-layout container');
	}

	// Don't remove: goldenItem is weirdly inherited in popouts
	get childMe(): goldenChild { return this; }
	// Defined when this is a pop-out mirror component
	get nodePath() {
		return this.vueParent.childPath(this.childMe);
	}

	// State object available to vue objects
	@PropSync('state', {default: null}) syncedState: Dictionary
	@Watch('state', {deep: true}) innerStateChanged() {
		this.glObject.emitBubblingEvent('stateChanged');
	}

	mounted() {
		var dimensions: any = {};
		if(undefined!== this.width) dimensions.width = this.width;
		if(undefined!== this.height) dimensions.height = this.height;
		let childConfig: any = this.getChildConfig();
		if(childConfig) //glCustomContainer shouldn't mount as their child is already mounted in the vueParent
			this.vueParent.addGlChild({
				...dimensions,
				...childConfig,
				isClosable: this.rootProp('closable'),
				reorderEnabled: this.rootProp('reorderEnabled'),
				title: childConfig.title||this.givenProp('title'),
				vue: this.nodePath,
				componentState: this.syncedState
			}, this);
	}
	destroyed() {
		if(this.glObject && this.glObject.parent && ~this.glObject.parent.contentItems.indexOf(this.glObject))
			this.glObject.parent.removeChild(this.glObject);
	}
}