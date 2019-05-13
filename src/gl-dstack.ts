import { Watch, Component, Prop, Emit, Model } from 'vue-property-decorator'
import { glRow } from './gl-groups'
import Vue from 'vue'
import goldenLayout, {renderVNodes} from './golden.vue'
import { goldenChild } from './roles'

@Component
export default class glDstack extends glRow {
	@Prop({required: true}) dstackId: string
	
	@Model('tab-change') activeTab: string
	@Emit() tabChange(tabId: any) { }
	@Watch('activeTab', {immediate: true}) async progTabChange(tabId: any) {
		await this.layout.glo;
		var stack: any = this.stack
		for(var child of stack.contentItems)
			if(child.vueObject && child.vueObject.tabId === tabId)
				stack.setActiveContentItem((<any>child).container.parent);
	}

	get glChildrenTarget() { return this.stack; }
	content: any[]
	getChildConfig(): any {
		var config = (<any>glRow).extendOptions.methods.getChildConfig.apply(this);  //super is a @Component
		this.content = config.content.filter((x: any) => !x.isClosable && !x.reorderEnabled);
		config.content = [{
			type: 'stack',
			content: config.content.slice(0),
			dstackId: this.dstackId
		}];
		return config;
	}
	initialState() {
		this.stack.on('activeContentItemChanged', this.activeContentItemChanged);
	}
	get activeContentItemChanged() {
		return (()=> {
			var v = this.stack.config.activeItemIndex;
			if('number'=== typeof v) {
				var vueObject = this.stack.contentItems[v].vueObject;
				if(vueObject)
					this.tabChange(vueObject.tabId);
			}
		}).bind(this);
	}
  	cachedStack: any = null
	get stack() {
		var ci = this.glObject , rv: any;
		if(!ci) return null;
		if(this.cachedStack && this.cachedStack.vueObject.glObject)
			return this.cachedStack;
		rv = ci.contentItems.find((x: any) => x.isStack && x.config.dstackId === this.dstackId);
		if(!rv) {
			ci.addChild({
				type: 'stack',
				content: this.content.slice(0),
				dstackId: this.dstackId
			}, 0);
			rv = ci.contentItems[0];
			rv.on('activeContentItemChanged', this.activeContentItemChanged);
			this.activeContentItemChanged();
		}
		return this.cachedStack = rv;
	}
	
	@Watch('stack.vueObject.glObject')
	observe(obj: any) {
		//stacks created by the users are created without an activeItemIndex
		//set `activeItemIndex` observed
		if(obj) {
			var config = obj.config, aii = config.activeItemIndex;
			delete config.activeItemIndex;
			this.$set(config, 'activeItemIndex', aii);
		}
	}
	async created() {
		const that = this;
		function onWindowPopout(popup: any) {
			if(popup._popoutWindow.dstackId === that.dstackId) {
				//re-create the stack object
				that.cachedStack = null;
				that.stack;
			}
		}
		var glo = await this.layout.glo,
			root_child = glo.root.contentItems[0];
		if(glo.isSubWindow && root_child.config.dstackId === this.dstackId) {
			(<any>window).dstackId = this.dstackId;
			root_child.contentItems
				.filter((x: any)=> !x.config.isClosable && !x.reorderEnabled)
				.map((comp: any)=> comp.close());
		}
		glo.on('windowOpened', onWindowPopout);
		this.stack;
	}
}
