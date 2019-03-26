import { Component, Model, Watch, Emit } from 'vue-property-decorator'
import { goldenChild, UsingSlots } from './roles'
import group from './gl-group.vue'

//We have to re-define : ts is lost with Vue files
@UsingSlots('default')
export class glGroup extends group {
	closable: boolean
	config: any
}
@Component
export class glRow extends glGroup {
	getChildConfig() { return {
		isClosable: this.closable,
		type: 'row',
		...this.config
	}; }
}
@Component
export class glCol extends glGroup {
	getChildConfig() { return {
		isClosable: this.closable,
		type: 'column',
		...this.config
	}; }
}
@Component
export class glStack extends glGroup {
	type = 'stack'
	@Model('tab-change') activeTab: string
	@Emit() tabChange(tabId: any) { }
	@Watch('activeTab') progTabChange(tabId: any) {
		for(var child of this.glChildren)
			if((<goldenChild>child).tabId === tabId)
				(<any>this).glObject.setActiveContentItem((<any>child).container.parent);
	}
	async watchActiveIndex() {
		await this.layout.glo;
		
		this.glObject.on('activeContentItemChanged', (comp: any)=> {
			var v = this.glObject.config.activeItemIndex;
			if('number'=== typeof v)
				this.tabChange((<goldenChild>this.glChildren[v]).tabId);
		});
	}
	getChildConfig() {
		this.watchActiveIndex();
		return {	//we can use $children as it is on-load : when the user still didn't interract w/ the layout
			activeItemIndex: Math.max(0, (<any>this.$children).findIndex((c: any) => c.tabId === this.activeTab)),
			isClosable: this.closable,
			type: 'stack',
			...this.config};
	}
}
