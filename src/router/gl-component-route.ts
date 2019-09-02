import { Watch, Component, Prop, Emit, Provide, Inject } from 'vue-property-decorator'
import { goldenChild } from '../roles'
import { defaultTitler, RouteComponentName } from './utils'
import glRouteBase from './gl-route-base'
import Vue from 'vue'
@Component
export default class glComponentRoute extends glRouteBase {
	@Prop() component: typeof Vue
	getChildConfig(): any {
		return {
			type: 'component',
			title: this.compTitle,
			isClosable: this.closable,
			reorderEnabled: this.reorderEnabled,
			componentName: RouteComponentName,
			componentState: this.location
		};
	}
	render(v : any) {}
}
