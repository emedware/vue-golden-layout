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
		this.content = config.content.filter(x => !x.isClosable && !x.reorderEnabled);
		config.content = [{
			type: 'stack',
			content: config.content.slice(0),
			dstackId: this.dstackId
		}];
		return config;
	}
  	cachedStack: any
	get stack() {
		var ci = this.glObject, rv;
		if(!ci) return null;
		if(this.cachedStack && this.cachedStack.vueObject.glObject)
			return this.cachedStack;
		rv = ci.contentItems.find(x => x.isStack && x.config.dstackId === this.dstackId);
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
	observe(obj) {
		//stacks created by the users are created without an activeItemIndex
		//set `activeItemIndex` observed
		if(obj) {
			var config = obj.config, aii = config.activeItemIndex;
			delete config.activeItemIndex;
			this.$set(config, 'activeItemIndex', aii);
		}
	}

	created() {
		this.onGlInitialise(gl=> {
			if(gl.isSubWindow) {
				var onlyStack = gl.root.contentItems[0];
				if(onlyStack.config.dstackId === this.dstackId) {
					(<any>window).dstackId = this.dstackId;
					onlyStack.contentItems
						.filter(x=> !x.config.isClosable && !x.reorderEnabled)
						.map(comp=> comp.close());
				}
			} else
				gl.on('windowOpened', (popup)=> {
					if(popup._popoutWindow.dstackId === this.dstackId) {
						this.stack;
					}
				});
			this.stack;
		});
	}
}
