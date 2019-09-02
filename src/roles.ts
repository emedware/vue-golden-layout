import Vue from 'vue'
import { Component, Prop, Watch, Inject } from 'vue-property-decorator'
import { isSubWindow } from './utils'

export const instanciatedItem: {[uid: number]: goldenItem } = {};

export function UsingSlots(...slots: string[]) {
	return function(target: any) {
		//TODO: find another way than to use the prototype (browse throught the lineage) not to have this accessible in the component's data
		target.prototype.usedSlots = target.prototype.usedSlots ?
			slots.concat(target.prototype.usedSlots) : slots;
	}
}

export class goldenItem extends Vue {
	glObject: any = null
	// To be overriden
	get childMe() { return <goldenChild><unknown>this; }
	get parentMe() { return <goldenContainer><unknown>this; }
	get nodePath(): string { return ''; }
}

@Component
@UsingSlots('default')
export class goldenContainer extends goldenItem {
	readonly definedVueComponent: goldenContainer
	config: any = {
		content: []
	}
	layout: any
	childPath(comp: goldenChild): string {
		var rv = this.childMe.nodePath?`${this.childMe.nodePath}.`:'';
		var ndx = this.vueChildren().indexOf(comp);
		console.assert(!!~ndx, 'Child exists');
		return rv+ndx;
	}
	getChild(path: string): goldenChild {
		var nrs = path.split('.');
		var ndx_string : string | undefined  = nrs.shift();

		if (ndx_string === undefined) {
			throw "Invalid operation";
		}
		let ndx= parseInt(ndx_string);
		var next = this.vueChild(ndx);
		console.assert(next !== undefined && next !== null, "Vue structure correspond to loaded GL configuration");
		return nrs.length ? (<goldenContainer><goldenItem>next).getChild(nrs.join('.')) : next;
	}
	//In order to be overriden
	get glChildrenTarget() { return this.glObject; }

	addGlChild(child : any, comp : any) {
		if(comp && 'component'=== child.type) {
			if(!child.componentName)
				child.componentName = this.layout.registerComponent(comp, null, this.definedVueComponent.$options.name);
			if(!child.componentState)
				child.componentState = {};
		}
		var ci = this.glChildrenTarget;
		if(ci)
			ci.addChild(child);
		else
			this.config.content.push(child);
	}
	removeGlChild(index: number) {
		var ci = this.glObject;
		if(ci) {
			ci.removeChild(ci.contentItems[index]);
			for(; index< ci.contentItems.length; ++index)
				ci.contentItems[index].index = index;
		} else {
			this.config.content.splice(index, 1);
			for(; index< this.config.content.length; ++index)
				this.config.content[index].index = index;
		}
	}
	get glChildren(): goldenChild[] {
		return this.glObject.contentItems.map((x : any)=> x.vueObject);
	}
	vueChild(child: number): goldenChild {
		return (<goldenItem>this.$children[child]).childMe;
	}
	/**
	  * Get the list of Vue children and not their definition abstract component
	  */ 
	vueChildren(): goldenChild[] {
		return <goldenChild[]>this.$children.map(comp=> (<goldenItem>comp).childMe).filter(x=> x instanceof goldenItem);
	}
	events: string[] = ['open', 'resize', 'destroy', 'close', 'tab', 'hide', 'show']
	mounted() {
		this.layout.useSlotTemplates(this);
	}
}

@Component
export class goldenChild extends goldenItem {
	@Inject() layout: any
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
		while(!itr[prop] && itr.$parent.constructor.name === 'glCustomContainer')
			itr = itr.$parent;
		return itr[prop];
	}

	hide() { this.container && this.container.hide(); }
	show() { this.container && this.container.show(); }
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
	close() {
		this.container && this.container.close();
	}
	
	created() {
		if(!this.vueParent.addGlChild)
			throw new Error('gl-child can only appear directly in a golden-layout container');
		if(!isSubWindow)
			instanciatedItem[(<any>this)._uid] = this;
	}

	// Don't remove: goldenItem is weirdly inherited in popouts
	get childMe(): goldenChild { return this; }
	get nodePath() {
		// this.$data._nodePath is defined when this is a pop-out mirror component
		return this.$data._nodePath || this.vueParent.childPath(this.childMe);
	}
	mounted() {
		var dimensions: any = {};
		if(undefined!== this.width) dimensions.width = this.width;
		if(undefined!== this.height) dimensions.height = this.height;
		let childConfig: any = this.getChildConfig();
		if(childConfig)	//glCustomContainer shouldn't mount as their child is already mounted in the vueParent
			this.vueParent.addGlChild({
				...dimensions,
				...childConfig,
				title: childConfig.title||this.givenProp('title'),
				vue: this.nodePath
			}, this);
	}
	beforeDestroy() {
		if(this.glObject) 	//It can be destroyed in reaction of the removal of the glObject too
			this.glObject.parent.removeChild(this.glObject);
	}
	@Watch('glObject') destroy(v:boolean) {
		if(!v) this.$emit('destroy', this);
	}
	events: string[] = ['stateChanged', 'titleChanged', 'activeContentItemChanged', 'beforeItemDestroyed', 'itemDestroyed', 'itemCreated']
}

@Component({mixins: [goldenContainer]})
export class goldenLink extends goldenChild implements goldenContainer {
	//TODO: `implements` should help avoid props redeclaration - but does not

	// declaration of goldenContainer properties
	readonly definedVueComponent: goldenContainer
	config: any
	layout: any
	childPath:(comp: goldenChild)=> string
	getChild: (path: string)=> goldenChild
	readonly glChildrenTarget: any
	addGlChild: (child : any, comp : any)=> void
	removeGlChild: (index: number)=> void
	readonly glChildren: goldenChild[]
	vueChild: (child: number)=> goldenChild
	vueChildren: ()=> goldenChild[]
	events: string[]
}

@Component
export class glCustomContainer extends goldenLink {
	get definedVueComponent(): goldenContainer { return this; }
	get childMe() {
		return (<goldenItem>this.$children[0]).childMe;
	}
	get parentMe() {
		return this.vueParent;
	}
	getChildConfig(): any { return null; }
}