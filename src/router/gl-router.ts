import { Watch, Component, Prop, Emit, Provide, Inject } from 'vue-property-decorator'
import glDstack from '../gl-dstack'
import { defaultTitler, RouteComponentName, UsingRoutes } from './utils'
import { UsingSlots } from '../roles'

@Component
@UsingRoutes
@UsingSlots('route')
export default class glRouter extends glDstack {
	$router : any
	$route : any
	@Prop({
		default: defaultTitler,
		type: Function
	})
	@Provide() titler: (route: any)=> string
	@Prop({default: '/'}) emptyRoute: string
	@Prop({default: 'router'}) dstackId: string

	@Watch('stack')
	//TODO: like in glStack, use the glObject events : `stack.config.activeItemIndex` cannot be watched
	@Watch('stack.config.activeItemIndex')
	setPath(v: any) {
		var path;
		var aci = this.stack.getActiveContentItem();
		if(aci && RouteComponentName=== aci.config.componentName) {
			path = aci.config.componentState;
		} else
			path = this.emptyRoute;
		if(path != this.$route.fullPath)
			this.$router.replace(path);
	}

	@Watch('$route')
	async change(route: any) {
		await this.layout.glo;
		if(route && route.matched.length) {
			var stack = this.stack,
				already = stack.contentItems.find((x: any)=> x.config.componentState.path == route.fullPath);
			if(already) stack.setActiveContentItem(already);
			else stack.addChild({
				type: 'component',
				componentName: RouteComponentName,
				componentState: {
					path: route.fullPath
				},
				title: this.titler(route)
			});
		}
	}
	isRouter: boolean = true
	mounted() {
		//With immediate: true, the watch is called before $refs are initialised
		this.change(this.$route);
	}
}