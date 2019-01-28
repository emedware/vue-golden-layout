import { Watch, Component, Prop, Emit, Provide, Inject } from 'vue-property-decorator'
import glDstack from './gl-dstack'
import Vue, { ComponentOptions, Component as VueComponent, AsyncComponent, VueConstructor } from 'vue'
import goldenLayout, { renderVNodes, registerGlobalComponent, Dictionary } from './golden.vue'
import { goldenChild } from './roles'
import { Route } from 'vue-router'

function defaultTitler(route: Route): string {
	//The last case is to warn the programmer who would have forgotten that detail
	return route ? ((route.meta && route.meta.title) || 'set $route.meta.title') : '';
}

export const RouteComponentName = '$router-route';

function freezeValue(object: Dictionary, path: string, value?: any) {
	const props = path.split('.'),
		forced = props.pop()!;
	for(let property of props)
		Object.defineProperty(object, property, {
			value: object = Object.create(object[property]),
			writable: false
		});
	Object.defineProperty(object, forced, {
		value,
		writable: false
	});
}



function routeParent(container: any, route: Route): any {
	var  template: any, parent = container.parent.parent;
	while(!parent.vueObject || !parent.vueObject._isVue) parent = parent.parent;
	parent = parent.vueObject;
	if(parent.isRouter)
		template = parent.$scopedSlots.route ?
			parent.$scopedSlots.route(route) :
			parent.$slots.route;
	return {template, parent};
}

type ComponentSpec = VueComponent<any, any, any, any> | AsyncComponent<any, any, any, any>;

async function vueComponent(comp: ComponentSpec|string, namedComponents: Dictionary<ComponentSpec>): Promise<VueConstructor> {
	console.assert(comp, 'State resolves to a component');
	var component: ComponentSpec = 'string'=== typeof comp?namedComponents[<string>comp]:<ComponentSpec>comp;
	function componentIsVueConstructor() { return (<any>component).prototype instanceof Vue; }
	console.assert(`Component registered : "${comp}".`);
	if('function'=== typeof component && !componentIsVueConstructor)
		//AsyncComponentFactory<any, any, any, any> | FunctionalComponentOptions<any, PropsDefinition<any>>
		component = (<()=> ComponentSpec>component)();
	if(component instanceof Promise)
		component = await (<Promise<ComponentSpec>>component);
	return componentIsVueConstructor() ?
		<VueConstructor>component :
		Vue.extend(<ComponentOptions<Vue>>component);
}

function createRouteComponent(comp: VueConstructor, parent: any, template: any) : Vue {
	const component = template ? new Vue({
			render(ce) {
				return template instanceof Array ?
					ce('div', {class: 'glComponent'}, template) :
					template;
			},
			mounted() {
				new comp({el: component.$el.querySelector('main'), parent: component});
			},
			parent
		}) : new comp({parent});
	return component;
}

registerGlobalComponent(RouteComponentName, async function(gl: goldenLayout, container: any, state: any) {
	var comp: VueConstructor = await vueComponent(gl.$router.getMatchedComponents(state)[0], gl.$options.components),
		route = gl.$router.resolve(state).route,
		{template, parent} = routeParent(container, route),
		component = createRouteComponent(comp, parent, template);
	//Simulate a _routerRoot object so that all children have a $route object set to this route object
	var routerRoot = (<any>component)._routerRoot = Object.create((<any>component)._routerRoot);
	freezeValue(routerRoot, '_route', route);
	freezeValue(routerRoot, '_router.history.current', route);
	var el = document.createElement('div');
	container.getElement().append(el);
	component.$mount(el);
});

@Component
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

@Component
export class glRoute extends goldenChild {
	$router: any
	@Prop() path: string
	@Prop() name: string
	@Prop({default: false}) closable: boolean
	@Prop({default: false}) reorderEnabled: boolean
	@Inject() titler: (route: any)=> string
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
