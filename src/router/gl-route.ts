import { Watch, Component, Prop, Emit, Provide, Inject } from 'vue-property-decorator'
import { goldenChild } from '../roles'
import { defaultTitler, RouteComponentName } from './utils'

@Component
export default class glRoute extends goldenChild {
	$router: any
	@Prop() path: string
	@Prop() name: string
	@Prop({default: false}) closable: boolean
	@Prop({default: false}) reorderEnabled: boolean
	@Inject() titler: (route: any)=> string
	@Inject() _glRouter: any
	@Prop() title: string
	get compTitle() {
		return this.title || 
			(this.titler.bind(this)||defaultTitler)(this.$router.resolve(this.routeSpec).route);
	}
	
	get routeSpec() {
		console.assert(!!this.name || !!this.path, 'At least one route specification - `name` or `path` is given.');
		var rv: any = {};
		if(this.name) rv.name = this.name;
		if(this.path) rv.path = this.path;
		return rv;
	}

	@Watch('compTitle') setTitle(title: any) {
		if(this.container) this.container.setTitle(title);
	}

	getChildConfig(): any {
		return {
			type: 'component',
			title: this.compTitle,
			isClosable: this.closable,
			reorderEnabled: this.reorderEnabled,
			componentName: RouteComponentName,
			componentState: this.routeSpec
		};
	}
	render(v : any) {}
}
