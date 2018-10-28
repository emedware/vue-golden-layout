import { Watch, Component, Prop, Emit } from 'vue-property-decorator'
import { glRow } from './gl-group'
import { Vue } from './imports'
import goldenLayout, {renderVNodes} from './golden.vue'

//TODO: there might be a type for route
function defaultTitle(route: any): string {
	//The last case is to warn the programmer who would have forgotten that detail
	return (route.meta && route.meta.title) || 'set $route.meta.title';
}

const RouteComponentName = '$router-route';

goldenLayout.registerGlobalComponent(RouteComponentName, gl=> function(container, state) {
	gl.onGlInitialise(()=> {
		var comp = gl.$router.getMatchedComponents(state.path)[0],
            route = gl.$router.resolve(state.path).route;
		//TODO: comp can be a string too
		if('object'=== typeof comp)
			comp = Vue.extend(comp);
		var div, template, parent = container.parent.parent;
		while(!parent.vueObject || !parent.vueObject._isVue) parent = parent.parent;
        parent = parent.vueObject;
        if(parent.isRouter)
            template = parent.$scopedSlots.default ?
                parent.$scopedSlots.default(route) :
                parent.$slots.default;
        parent = new Vue({
            render(ce) {
                return !template ?
                    ce('main') :
                    template instanceof Array ?
                    ce('div', {}, template) :
                    template;
            },
            mounted() {
                this.cachedComp = new comp({el: parent.$el.querySelector('main'), parent: parent});
            },
            updated() {
                this.cachedComp.$mount(parent.$el.querySelector('main'));
            },
            parent: parent
        });
        //Simulate a _routerRoot object so that all children have a $route object set to this route object
        parent._routerRoot = Object.create(parent._routerRoot);
        Object.defineProperty(parent._routerRoot, '_route', {
            value: route,
            writable: false
        });
        Object.defineProperty(parent._routerRoot, '_router', {
            value: Object.create(parent._routerRoot._router),
            writable: false
        });
        Object.defineProperty(parent._routerRoot._router, 'history', {
            value: Object.create(parent._routerRoot._router.history),
            writable: false
        });
        Object.defineProperty(parent._routerRoot._router.history, 'current', {
            value: route,
            writable: false
        });
        parent.$mount(container.getElement()[0]);
	});
});

@Component()
export default class glRouter extends glRow {
	@Prop({default: defaultTitle}) titler : (route: any)=> string
	@Prop({default: '/'}) emptyRoute: string
	
	get stack() {
		var ci = this.glObject, rv;
		if(!ci) return null;
		rv = ci.contentItems.find(x => 'stack'=== x.type);
		if(!rv) {
			ci.addChild({
				type: 'stack',
				content: []
			}, 0);
			rv = ci.contentItems[0];
		}
		return rv;
	}

	@Watch('stack.vueObject.glObject')
	@Watch('stack.config.activeItemIndex')
	setPath(v) {
		var path;
		//stacks created by the users are created without an activeItemIndex
		if(v && 'object'=== typeof v) { //set `activeItemIndex` observed
			var config = v.config, aii = config.activeItemIndex;
			delete config.activeItemIndex;
			this.$set(config, 'activeItemIndex', aii);
		}
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
	
	mounted() {
        this.isRouter = true;
		//With immediate: true, the watch is called before $refs are initialised
		this.change(this.$route);
	}
}
