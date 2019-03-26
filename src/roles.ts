import Vue from 'vue'
import {Component, Prop, Watch, Emit, Inject} from 'vue-property-decorator'

export class goldenItem extends Vue {
	glObject: any = null
}

export function UsingSlots(...slots: string[]) {
	return function(target: any) {
		target.prototype.usedSlots = target.prototype.usedSlots ?
			slots.concat(target.prototype.usedSlots) : slots;
	}
}

@Component
@UsingSlots('default')
export class goldenContainer extends goldenItem {
	config: any = {
		content: []
	}
	layout: any
	childPath(comp: goldenChild): string {
		var childMe = <goldenChild><any>this;
		var rv = childMe.nodePath?`${childMe.nodePath()}.`:'';
		var ndx = this.vueChildren().indexOf(comp);
		console.assert(!!~ndx, 'Children exists');
		return rv+ndx;
	}
	getChild(path: string): goldenChild {
		var nrs = path.split('.');
		var ndx_string : string | undefined  = nrs.shift();

		if ( ndx_string === undefined) {
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
				child.componentName = this.layout.registerComponent(comp);
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
	vueChild(child: number|Vue): goldenChild {
		var rv = 'number'=== typeof child ? this.$children[child] : <Vue>child;
		while(rv instanceof glCustomContainer)
			rv = rv.$children[0];
		return <goldenChild>rv;
	}
	/**
	  * Get the list of Vue children and not their definition abstract component
	  */ 
	vueChildren(): goldenChild[] {
		return this.$children.map(this.vueChild.bind(this));
	}
	events: string[] = ['open', 'resize', 'destroy', 'close', 'tab', 'hide', 'show']
	mounted() {
		this.layout.useSlotTemplates(this);
	}
}

@Component
export class goldenChild extends goldenItem {
	@Prop() width: number
	@Prop() height: number
	@Watch('width') reWidth(w:number) { this.container && this.container.setSize(w, false); }
	@Watch('height') reHeight(h:number) { this.container && this.container.setSize(false, h); }

	@Prop() title: string
	@Watch('title') setTitle(title: any) {
		if(this.container) this.container.setTitle(title);
	}
	
	@Prop() tabId: string

	getChildConfig() { return {
		
	}; }
	get glParent() { return this.glObject.parent.vueObject; }
	/**
	  * Gets the Vue container that is not a component definition and therefore actually contains this
	  */ 
	get vueParent(): goldenContainer {
		var rv = this.$parent;
		while(rv instanceof glCustomContainer)
			rv = rv.$parent;
		return <goldenContainer>rv;
	}
	
	container: any = null;

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
		if(!(this.vueParent instanceof goldenContainer))
			throw new Error('gl-component can only appear directly in a golden-layout container');
	}
	nodePath() {
		return this.vueParent.childPath(this);
	}
	mounted() {
		var dimensions: any = {};
		if(undefined!== this.width) dimensions.width = this.width;
		if(undefined!== this.height) dimensions.height = this.height;
		let childConfig : any = this.getChildConfig();
		if(childConfig)	//glCustomContainer shouldn't mount as their child is already mounted in the vueParent
			this.vueParent.addGlChild({
				...dimensions,
				...childConfig,
				vue: this.nodePath()
			}, this);
	}
	beforeDestroy() {
		if(this.glObject)   //It can be destroyed in reaction of the removal of the glObject too
		{
			this.glObject.parent.removeChild(this.glObject);
		}
	}
	@Watch('glObject') destroy(v:boolean) {
		if(!v) this.$emit('destroy');
	}
	@Inject() layout: any
	events: string[] = ['stateChanged', 'titleChanged', 'activeContentItemChanged', 'beforeItemDestroyed', 'itemDestroyed', 'itemCreated']
}


@Component({mixins: [goldenChild]})
export class glCustomContainer extends goldenContainer {
	nodePath() {
		return (<any>this).vueParent.childPath(this.$children[0]);
	}
	getChildConfig() { return null; }
}