import { Watch, Component, Prop, Emit, Model } from 'vue-property-decorator'
import { glRow } from './gl-groups'
import { isSubWindow } from './utils'
import Vue from 'vue'

@Component
export default class glDstack extends glRow {
	/**
	 * Used to syncronise among different windows
	 */
	@Prop({required: true}) dstackId: string
	
	@Model('tab-change') activeTab: string
	@Emit() tabChange(tabId: string) { }
	@Watch('activeTab', {immediate: true}) async progTabChange(tabId: any) {
		if(!isSubWindow) {
			await this.layout.glo;
			var stack: any = this.stack
			for(var child of stack.contentItems)
				if(child.vueObject && child.vueObject.givenTabId === tabId)
					stack.setActiveContentItem(child.container?(<any>child).container.parent:child);
		}
	}

	get glChildrenTarget() { return this.stack; }
	content: any[]
	getChildConfig(): any {
		var that = this,
			config = (<any>glRow).extendOptions.methods.getChildConfig.apply(this);  //super is a @Component
		this.content = config.content.filter((x: any) => !x.isClosable && !x.reorderEnabled);
		config.content = [{
			type: 'stack',
			content: config.content.slice(0),
			dstackId: this.dstackId/*,
			get vue() { return that.nodePath }*/
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
					this.tabChange(vueObject.givenTabId);
			}
		}).bind(this);
	}
	cachedStack: any = null
	get stack() {
		var ci = this.glObject , rv: any, that = this;
		if(!ci) return null;
		if(this.cachedStack && this.cachedStack.vueObject.glObject)
			return this.cachedStack;
		rv = ci.contentItems.find((x: any) => x.isStack && x.config.dstackId === this.dstackId);
		if(!rv) {
			ci.addChild({
				type: 'stack',
				content: this.content.slice(0),
				dstackId: this.dstackId/*,
				get vue() { return that.nodePath }*/
			}, 0);
			rv = ci.contentItems[0];
			rv.on('activeContentItemChanged', this.activeContentItemChanged);
			this.activeContentItemChanged();
		}
		rv.on('destroy', ()=> Vue.nextTick(()=> {
			this.cachedStack = null;
			this.stack;
		}));
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
		var glo = await this.layout.glo;
		glo.on('windowOpened', (popup: any)=> {
			var rootChild = popup.getGlInstance().root.contentItems[0];
			if(rootChild.config.dstackId === this.dstackId) {
				//re-create the stack object
				rootChild.contentItems
					.filter((x: any)=> !x.config.isClosable && !x.reorderEnabled)
					.map((comp: any)=> rootChild.removeChild(comp));
			}
		});
		this.stack;
	}
}
