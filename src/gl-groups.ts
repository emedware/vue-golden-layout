import { Component, Model, Watch, Emit } from 'vue-property-decorator'
import { UsingSlots } from './roles'
import group from './gl-group.vue'

//We have to re-define : ts is lost with Vue files
@UsingSlots('default')
export class glGroup extends group {
	closable: boolean
	config: any
}
@Component
export class glRow extends glGroup {
	getChildConfig(): any { return {
		isClosable: this.closable,
		type: 'row',
		...this.config
	}; }
}
@Component
export class glCol extends glGroup {
	getChildConfig(): any { return {
		isClosable: this.closable,
		type: 'column',
		...this.config
	}; }
}
@Component
export class glStack extends glGroup {
	type = 'stack'
	@Model('tab-change') activeTab: string
	@Emit() tabChange(tabId: string) { }
	@Watch('activeTab') progTabChange(tabId: any) {
		for(var child of this.glChildren)
			if(child.givenTabId === tabId)
				(<any>this).glObject.setActiveContentItem((<any>child).container.parent);
	}
	async watchActiveIndex() {
		await this.layout.glo;
		
		if(this.glObject) this.glObject.on('activeContentItemChanged', (item: any)=> {
			var v = this.glObject.config.activeItemIndex;
			if('number'=== typeof v)
				this.tabChange(item.vueObject.givenTabId);
		});
	}
	getChildConfig(): any {
		this.watchActiveIndex();
		return {	//we can use $children as it is on-load : when the user still didn't interract w/ the layout
			activeItemIndex: Math.max(0, (<any>this.$children).findIndex((c: any) => c.givenTabId === this.activeTab)),
			isClosable: this.closable,
			type: 'stack',
			...this.config};
	}
}
