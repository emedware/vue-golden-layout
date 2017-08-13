import * as Vue from 'vue'
import {Component, Inject, Model, Prop, Watch} from 'vue-property-decorator'
import {goldenContainer, goldenChild} from './gl-roles'
import * as extend from 'extend'

@Component({
	template: '<div style="display: none;"><slot /></div>',
	mixins: [goldenChild]
})
export class glGroup extends goldenContainer {
	//child properties
	$parent: goldenContainer
	@Prop({default: false}) closable: boolean
	/// Only the layout object centralise the components
	registerComp(component): string {
		return this.$parent.registerComp(component);
	}
	contentItem() {
		var ci = this.$parent.contentItem();
		//Math.min because the root has only one `contentItems` (me) but I am not the only child
		return ci && ci.contentItems[Math.min(this.$parent.$children.indexOf(this), ci.contentItems.length)];
	}
}

@Component
export class glRow extends glGroup {
	get childConfig() { return extend({isClosable: this.closable, type: 'row'}, this.config); }
}
@Component
export class glCol extends glGroup {
	get childConfig() { return extend({isClosable: this.closable, type: 'column'}, this.config); }
}
@Component
export class glStack extends glGroup {
	type = 'stack'
	@Prop({default: 0, type: Number}) activeItemIndex
	get childConfig() {
		return extend({
			activeItemIndex: this.activeItemIndex,
			isClosable: this.closable,
			type: 'stack'
		}, this.config);
	}
}
