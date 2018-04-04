import {Component, Inject, Model, Prop, Watch} from 'vue-property-decorator'


import group from './gl-group.vue'
//We have to re-define : ts is lost with Vue files
class glGroup extends group {
	closable: boolean
	config: any
}
@Component
export class glRow extends glGroup {
	get childConfig() { return {isClosable: this.closable, type: 'row', ...this.config}; }
}
@Component
export class glCol extends glGroup {
	get childConfig() { return {isClosable: this.closable, type: 'column', ...this.config}; }
}
@Component
export class glStack extends glGroup {
	type = 'stack'
	@Prop({default: 0, type: Number}) activeItemIndex
	get childConfig() {
		return {
			activeItemIndex: this.activeItemIndex,
			isClosable: this.closable,
			type: 'stack'
		, ...this.config};
	}
}
