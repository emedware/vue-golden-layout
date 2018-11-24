import { Watch, Component, Prop, Emit, Provide, Inject } from 'vue-property-decorator'
import glDstack from './gl-dstack'
import Vue from 'vue'
import goldenLayout, {renderVNodes} from './golden.vue'
import { goldenChild } from './roles'

//TODO: there might be a type for route
function defaultTitle(route: any): string {
	//The last case is to warn the programmer who would have forgotten that detail
	return (route.meta && route.meta.title) || 'set $route.meta.title';
}

export const RouteComponentName = '$router-route';

goldenLayout.registerGlobalComponent(RouteComponentName, gl=> function(container, state) {
	gl.onGlInitialise(()=> {
		var comp: Vue|any = gl.$router.getMatchedComponents(state)[0],
			route = gl.$router.resolve(state.path).route,
			component;
		//TODO: comp can be a string too
		if('object'=== typeof comp)
			comp = Vue.extend(comp);
		var div, template, parent = container.parent.parent;
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
					ce('div', {}, template) :
					template;
			},
			mounted() {
				this.cachedComp = new comp({el: component.$el.querySelector('main'), parent: component});
			},
			parent
		}) : new comp({parent});
		if(!(create instanceof Promise)) create = Promise.resolve(create);
		create.then(c=> {
			component = c instanceof Vue ? c : new Vue({parent, ...c});
			//Simulate a _routerRoot object so that all children have a $route object set to this route object
			component._routerRoot = Object.create(component._routerRoot);
			Object.defineProperty(component._routerRoot, '_route', {
				value: route,
				writable: false
			});
			Object.defineProperty(component._routerRoot, '_router', {
				value: Object.create(component._routerRoot._router),
				writable: false
			});
			Object.defineProperty(component._routerRoot._router, 'history', {
				value: Object.create(component._routerRoot._router.history),
				writable: false
			});
			Object.defineProperty(component._routerRoot._router.history, 'current', {
				value: route,
				writable: false
			});
			var el = document.createElement('div');
			container.getElement().append(el);
			component.$mount(el);
		});
	});
});

@Component
export default class glRouter extends glDstack {
	$router
	$route
	@Prop({default: defaultTitle})
	@Provide() titler: (route: any)=> string
	@Prop({default: '/'}) emptyRoute: string
	@Prop({default: 'router'}) dstackId: string

	@Watch('stack')
	@Watch('stack.config.activeItemIndex')
	setPath(v) {
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
	change(route) {
		if(route && route.matched.length)
			this.onGlInitialise(()=> {
				var ci = this.glObject;
				if(ci) {
					var stack = this.stack;

					var already = stack.contentItems.find(x=> x.config.componentState.path == route.fullPath);
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
			});
	}
	isRouter: boolean = true
	mounted() {
		//With immediate: true, the watch is called before $refs are initialised
		this.change(this.$route);
	}
}

@Component
export class glRoute extends goldenChild {
	@Prop() path: string
	@Prop() name: string
	@Prop({default: false}) closable: boolean
	@Prop({default: false}) reorderEnabled: boolean
	@Inject() titler: (route: any)=> string
	@Prop() title: string
	get compTitle() {
		return this.title || 
			(this.titler.bind(this)||defaultTitle)(this.$router.resolve(this.routeSpec).route);
	}
	
	get routeSpec() {
		console.assert(!!this.name || !!this.path, 'At least one route specification - `name` or `path` is given.');
		var rv: any = {};
		if(this.name) rv.name = this.name;
		if(this.path) rv.path = this.path;
		return rv;
	}

	@Watch('compTitle') setTitle(title) {
		if(this.container) this.container.setTitle(title);
	}

	getChildConfig() {
		return {
			type: 'component',
			title: this.compTitle,
			isClosable: this.closable,
			reorderEnabled: this.reorderEnabled,
			componentName: RouteComponentName,
			componentState: this.routeSpec
		};
	}
	render(v) {}
}
