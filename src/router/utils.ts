import { Route } from 'vue-router'
import goldenLayout, { renderVNodes, registerGlobalComponent, Dictionary } from '../golden.vue'
import Vue, { ComponentOptions, Component, AsyncComponent, VueConstructor } from 'vue'

export function defaultTitler(route: Route): string {
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

function freezeRoute(component: Vue, route: Route) {
	//Simulate a _routerRoot object so that all children have a $route object set to this route object
	var routerRoot = (<any>component)._routerRoot = Object.create((<any>component)._routerRoot);
	freezeValue(routerRoot, '_route', route);
	freezeValue(routerRoot, '_router.history.current', route);
}
interface RouterSpec {
	template: any
	parent: any
}
function routeParent(container: any, route: Route): RouterSpec {
	var  template: any, parent = container.parent.parent;
	while(!parent.vueObject || !parent.vueObject._isVue) parent = parent.parent;
	parent = parent.vueObject;
	if(parent.isRouter)
		template = parent.$scopedSlots.route ?
			parent.$scopedSlots.route(route) :
			parent.$slots.route;
	return {template, parent};
}

type ComponentSpec = Component<any, any, any, any> | AsyncComponent<any, any, any, any>;

async function vueComponent(comp: ComponentSpec|string, namedComponents: Dictionary<ComponentSpec>): Promise<VueConstructor> {
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

function createRouteComponent(comp: VueConstructor, routerSpec: RouterSpec) : Vue {
	const {parent, template} = routerSpec,
		component = template ? new Vue({
			render(ce) {
				return template instanceof Array ?
					ce('div', {class: 'glComponent'}, template) :
					template;
			},
			mounted() {
				new comp({el: component.$el.querySelector('main') || undefined, parent: component});
			},
			parent
		}) : new comp({parent});
	return component;
}

function renderInContainer(container: any, component: Vue) {
	var el = document.createElement('div');
	container.getElement().append(el);
	component.$mount(el);
}

async function renderRoute(gl: goldenLayout, container: any, state: any) {
	var route = gl.$router.resolve(state).route,
		compSpec = gl.$router.getMatchedComponents(state)[0],
		component: Vue;
	
	console.assert(compSpec, `State resolves to a component: ${state}`);
	component = createRouteComponent(
			await vueComponent(compSpec!, gl.$options.components || {}),
			routeParent(container, route));
	freezeRoute(component, route);
	renderInContainer(container, component)
}

export function UsingRoutes(target: any) {	//This function should be called once and only once if we are using the router
	registerGlobalComponent(RouteComponentName, renderRoute);
}