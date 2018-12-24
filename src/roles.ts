import Vue from 'vue'
import {Component, Prop, Watch, Emit} from 'vue-property-decorator'

export class goldenItem extends Vue {
	glObject: any = null
}

@Component
export class goldenContainer extends goldenItem {
	config: any = {
		content: []
	}
	registerComponent(component : any/*: Vue|()=>any*/, name?: string): string { throw 'unimplemented'; }
	childPath(comp: Vue): string {
		var childMe = <goldenChild><any>this;
		var rv = childMe.nodePath?`${childMe.nodePath()}.`:'';
		var ndx = this.$children.indexOf(comp);
		console.assert(!!~ndx, 'Children exists');
		return rv+ndx;
	}
	getChild(path: string) :goldenContainer{
		var nrs = path.split('.');
		var ndx_string : string | undefined  = nrs.shift();

		if ( ndx_string === undefined)
		{
			throw "Invalid operation";
		}
		let ndx= parseInt(ndx_string);
		var next = this.$children[ndx] as goldenContainer;
		console.assert(next !== undefined && next !== null, "Vue structure correspond to loaded GL configuration");
		return nrs.length ? next.getChild(nrs.join('.')) : next;
	}
	//In order to be overriden
	get glChildrenTarget() { return this.glObject; }

	addGlChild(child : any, comp : any) {
		if(comp && 'component'=== child.type) {
			if(!child.componentName)
				child.componentName = this.registerComponent(comp);
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
	get glChildren() {
		return this.glObject.contentItems.map((x : any)=> x.vueObject);
	}
	onGlInitialise(cb: (_:any)=> void): void { throw 'Not implemented'; }
	events: string[] = ['open', 'resize', 'destroy', 'close', 'tab', 'hide', 'show']
}

@Component
export class goldenChild extends goldenItem {
	@Prop() width: number
	@Prop() height: number
	@Watch('width') reWidth(w:number) { this.container && this.container.setSize(w, false); }
	@Watch('height') reHeight(h:number) { this.container && this.container.setSize(false, h); }
	
	@Prop() tabId: string

	getChildConfig() { return null; }
	get glParent() { return this.glObject.parent.vueObject; }
	container:any = null;

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
	$parent: goldenContainer
	created() {
		if(!(this.$parent instanceof goldenContainer))
			throw new Error('gl-component can only appear directly in a golden-layout container');
	}
	nodePath() {
		return this.$parent.childPath(this);
	}
	mounted() {
		var dimensions:any = {};
		if(undefined!== this.width) dimensions.width = this.width;
		if(undefined!== this.height) dimensions.height = this.height;
		let childConfig : any = this.getChildConfig();
		this.$parent.addGlChild({
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

	events: string[] = ['stateChanged', 'titleChanged', 'activeContentItemChanged', 'itemDestroyed', 'itemCreated',
		'componentCreated', 'rowCreated', 'columnCreated', 'stackCreated', 'destroy', 'destroyed']
}
