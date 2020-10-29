import { Component, Provide, Prop } from 'vue-property-decorator'
import { goldenChild, goldenItem } from "./index"
import { allocateColor, freeColor } from '../colors'
import { genericTemplate } from '../golden.vue'

@Component({mixins: [{
	data(vm: any) {
		if(vm.colorGroup)
			vm.groupColor = allocateColor();
		else if(vm.belongGroupColor)
			vm.groupColor = vm.belongGroupColor;
		return {}
	}
}]})
export class goldenContainer extends goldenItem {
	@Provide() groupColor: string|null
	@Prop({default: false}) colorGroup: boolean
	get definedVueComponent(): goldenContainer { throw 'Not overriden'; }
	config: any = {
		content: []
	}
	// Hack to force child-path re-computation
	watchComputeChildrenPath: number = 0
	computeChildrenPath() { ++this.watchComputeChildrenPath; }
	childPath(comp: goldenChild): string {
		this.computeChildrenPath();
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
				child.componentName = genericTemplate;
			if(!child.componentState)
				child.componentState = {};
		}
		var ci = this.glChildrenTarget;
		if(ci)
			ci.addChild(child);
		else
			this.config.content.push(child);
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
	destroyed() {
		if(this.groupColor)
			freeColor(this.groupColor);
	}
}