import { Component } from 'vue-property-decorator'
import { goldenContainer, goldenChild, goldenItem } from "./index"
import goldenLayout from "../golden"

@Component({mixins: [goldenContainer]})
export class goldenLink extends goldenChild implements goldenContainer {
	//TODO: `implements` should help avoid props redeclaration - but does not

	// declaration of goldenContainer properties
	readonly definedVueComponent: goldenContainer
	config: any
	layout: goldenLayout
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
	constructor() {
		super();
		this.destructor = this.delete.bind(this);
	}
	get definedVueComponent(): goldenContainer { return this; }
	cachedChildMe: goldenChild
	destructor: any
	get childMe() {
		var sub = <goldenItem>this.$children[0], rv = sub && sub.childMe;

		if(this.cachedChildMe) this.cachedChildMe.$off('destroy', this.destructor);
		if(rv) rv.$on('destroy', this.destructor);
		return rv;
	}
	get parentMe() {
		return this.vueParent;
	}
	getChildConfig(): any { return null; }
}