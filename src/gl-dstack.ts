import { Watch, Component, Prop, Emit } from 'vue-property-decorator'
import { glRow } from './gl-groups'
import Vue from 'vue'
import goldenLayout, {renderVNodes} from './golden.vue'

@Component
export default class glDstack extends glRow {
	@Prop({required: true}) dstackId: string

	get glChildrenTarget() { return this.stack; }

	getChildConfig() {
		var config = (<any>glRow).extendOptions.methods.getChildConfig.apply(this);  //super is a @Component
		config.content = [{
			type: 'stack',
			content: config.content
		}];
		return config;
	}
	get stack() {
		//TODO: cache the stack not to retrieve any first stack but the one we created
		var ci = this.glObject, rv;
		if(!ci) return null;
		rv = ci.contentItems.find(x => 'stack'=== x.type);
		if(!rv) {
			ci.addChild({
				type: 'stack',
				content: []
			}, 0);
			rv = ci.contentItems[0];
		}
		return rv;
	}
	
	@Watch('stack.vueObject.glObject')
	observe(obj) {
		//stacks created by the users are created without an activeItemIndex
		//set `activeItemIndex` observed
		var config = obj.config, aii = config.activeItemIndex;
		delete config.activeItemIndex;
		this.$set(config, 'activeItemIndex', aii);
	}

	created() {
		this.onGlInitialise(gl=> {
			if(gl.isSubWindow)
				(<any>window).dstackId = this.dstackId;
			else
				gl.on('windowOpened', (popup)=> {
					if(popup._popoutWindow.dstackId === this.dstackId) {
						this.stack;
					}
				});
			this.stack;
		});
	}
}
