import { Watch, Component, Prop, Emit } from 'vue-property-decorator'
import { glRow } from './gl-groups'
import Vue from 'vue'
import goldenLayout, {renderVNodes} from './golden.vue'

@Component
export default class glDstack extends glRow {
	@Prop({required: true}) dstackId: string

	get glChildrenTarget() { return this.stack; }
	content: any[]
	getChildConfig() {
		var config = (<any>glRow).extendOptions.methods.getChildConfig.apply(this);  //super is a @Component
		this.content = config.content.filter((x: any) => !x.isClosable && !x.reorderEnabled);
		config.content = [{
			type: 'stack',
			content: config.content.slice(0),
			dstackId: this.dstackId
		}];
		return config;
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
