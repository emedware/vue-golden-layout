import { Vue } from './imports'
import {Component, Prop, Watch} from 'vue-property-decorator'

@Component
export class goldenContainer extends Vue {
	config: any = {
		content: []
	}
	registerComp(component): string { return null; }

	addGlChild(child, comp, index?: number) {
		if(comp) child = {componentState: { templateId: this.registerComp(comp) }, ...child};
		var ci = this.contentItem();
		if(ci)
			ci.addChild(child, index);
		else if(undefined=== index)
			this.config.content.push(child);
		else
			this.config.content.splice(index, 0, child);
	}
	removeGlChild(index: number) {
		var ci = this.contentItem();
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
	contentItem(): any { throw 'Not implemented'; }
	onGlInitialise(cb: ()=> void): void { throw 'Not implemented'; }
}

@Component
export class goldenChild extends Vue {
	@Prop() width: number
	@Prop() height: number
	@Watch('width') reWidth(w) { this.container && this.container.setSize(w, false); }
	@Watch('height') reHeight(h) { this.container && this.container.setSize(false, h); }
	
	@Prop() tabId: string

	get childConfig() { return null; }
	get childEl() { return null; }
	container = null;

	hide() { this.container && this.container.hide(); }
	show() { this.container && this.container.show(); }
	@Prop({default: false}) hidden: boolean

	@Watch('container')
	@Watch('hidden')
	setContainer(c) {
		this.container && this.container[this.hidden?'hide':'show']();
	}

	@Prop({default: true}) closable: boolean
	close() {
		this.container && this.container.close();
	}
	$parent: goldenContainer
	created() {
		if(!this.$parent.addGlChild)
			throw new Error('gl-component can only appear directly in a layout-golden container');
	}
	mounted() {
		var dimensions:any = {};
		if(undefined!== this.width) dimensions.width = this.width;
		if(undefined!== this.height) dimensions.height = this.height;
		this.$parent.addGlChild({...dimensions, ...this.childConfig}, this, this.$parent.$children.indexOf(this));
	}
	beforeDestroy() {
		this.$parent.removeGlChild(this.$parent.$children.indexOf(this));
	}
	events: string[] = ['show', 'shown', 'maximised', 'minimised', 'resize', 'hide', 'close', 'open', 'destroy']
}
