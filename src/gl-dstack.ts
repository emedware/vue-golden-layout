import { Watch, Component, Prop, Emit, Model } from 'vue-property-decorator'
import { glRow } from './gl-groups'
import { isSubWindow } from './utils'
import Vue from 'vue'
import * as $ from 'jquery'

@Component
export default class glDstack extends glRow {
	//TODO: `closable` should be forced true for the row, and forwarded to the created stack
	@Prop({default: false}) closable: boolean
	
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
			content: config.content.slice(0)
		}];
		return config;
	}
	initialState() {
		this.initStack(this.stack);
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
	initStack(item: any) {
		item.on('activeContentItemChanged', this.activeContentItemChanged);
		item.on('beforePopOut', stack=> {
			stack.contentItems
				.filter((x: any)=> !x.config.isClosable && !x.config.reorderEnabled)
				.forEach((comp: any, index: number)=> {
					stack.removeChild(comp);
					if(index < stack.config.activeItemIndex)
						--stack.config.activeItemIndex;
				});
		});
		item.on('poppedOut', bw=> bw.on('beforePopIn', ()=> {
			var bwGl = bw.getGlInstance(),
				childConfig = $.extend( true, {}, bwGl.toConfig() ).content[ 0 ],
				parent = this.stack;
			for(let item of childConfig.content)
				parent.addChild(item);
			bwGl.root.contentItems = [];
		}));
	}
	cachedStack: any = null
	get stack() {
		var ci = this.glObject , rv: any, that = this;
		if(!ci) return null;
		if(this.cachedStack && this.cachedStack.vueObject.glObject)
			return this.cachedStack;
		rv = ci.contentItems.find((x: any) => x.isStack);
		if(!rv) {
			ci.addChild({
				type: 'stack',
				content: this.content.slice(0)
			}, 0);
			rv = ci.contentItems[0];
			this.initStack(rv);
			this.activeContentItemChanged();
		}
		rv.on('destroyed', ()=> Vue.nextTick(()=> {
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
		this.stack;
	}
}
