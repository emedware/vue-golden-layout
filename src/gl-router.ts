import { Watch, Component, Prop, Emit, Provide, Inject } from 'vue-property-decorator'
import glDstack from './gl-dstack'
import Vue from 'vue'
import goldenLayout, {renderVNodes, registerGlobalComponent} from './golden.vue'
import { goldenChild } from './roles'

//TODO: there might be a type for route
function defaultTitler(route: any): string {
	//The last case is to warn the programmer who would have forgotten that detail
	return route ? ((route.meta && route.meta.title) || 'set $route.meta.title') : '';
}

export const RouteComponentName = '$router-route';

function freezeValue(object: {[key: string]: any}, path: string, value?: any) {
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

registerGlobalComponent(RouteComponentName, function(gl: goldenLayout, container: any, state: any) {
	var comp: Vue|any = gl.$router.getMatchedComponents(state)[0],
		route = gl.$router.resolve(state.path).route,
		component : any;
	//TODO: comp can be a string too => vue globally registered component (cf router API)
	if('object'=== typeof comp)
		comp = Vue.extend(comp);
	var div, template: any, parent = container.parent.parent;
	while(!parent.vueObject || !parent.vueObject._isVue) parent = parent.parent;
	parent = parent.vueObject;
	if(parent.isRouter)
		template = parent.$scopedSlots.route ?
			parent.$scopedSlots.route(route) :
			parent.$slots.route;
	// template is <VNode?>
	var create = template ? new Vue({
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
	if(!(create instanceof Promise)) create = Promise.resolve(create);
	create.then((c: any)=> {
		component = c instanceof Vue ? c : new Vue({parent, ...c});
		//Simulate a _routerRoot object so that all children have a $route object set to this route object
		component._routerRoot = Object.create(component._routerRoot);
		freezeValue(component._routerRoot, '_route', route);
		freezeValue(component._routerRoot, '_router.history.current', route);
		var el = document.createElement('div');
		container.getElement().append(el);
		component.$mount(el);
	});
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
