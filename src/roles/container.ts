import { Component } from 'vue-property-decorator'
import { goldenChild, goldenItem } from "./index"

export function UsingSlots(...slots: string[]) {
	return function(target: any) {
		//TODO: find another way than to use the prototype (browse throught the lineage) not to have this accessible in the component's data
		target.prototype.usedSlots = target.prototype.usedSlots ?
			slots.concat(target.prototype.usedSlots) : slots;
	}
}

@Component
@UsingSlots('default')
export class goldenContainer extends goldenItem {
	readonly definedVueComponent: goldenContainer
	config: any = {
		content: []
	}
	// Hack to force child-path re-computation
	watchComputeChildrenPath: number = 0
	computeChildrenPath() { ++this.watchComputeChildrenPath; }
	created() { 
		var x = 2;
	 }
	childPath(comp: goldenChild): string {
		this.watchComputeChildrenPath;
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