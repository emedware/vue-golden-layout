import {Component, Model, Watch, Emit} from 'vue-property-decorator'
import {goldenChild} from './gl-roles'
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
	@Model('tab-change') activeTab: string
	@Emit() tabChange(tabId) { }
	@Watch('activeTab') progTabChange(tabId) {
		for(var child of this.$children)
			if((<goldenChild>child).tabId === tabId)
				(<any>this).contentItem().setActiveContentItem((<any>child).container.parent);
	}
	get childConfig() {
		(<any>this).onGlInitialise(()=> {
			this.$watch(()=> (<any>this).contentItem().config.activeItemIndex, v=> {
				this.tabChange((<goldenChild>this.$children[v]).tabId);
			});
		});
		return {
			//TODO: initialisation with an activeItemIndex different from 0 makes a bug (renders wrongly tab 0)
			activeItemIndex: Math.max(0, (<any>this.$children).findIndex(c => c.tabId === this.activeTab)),
			isClosable: this.closable,
			type: 'stack'
		, ...this.config};
	}
}
