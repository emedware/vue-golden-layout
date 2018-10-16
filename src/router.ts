import { Watch, Component, Prop, Emit } from 'vue-property-decorator'
import { glRow } from './gl-group'
import { Vue } from './imports'
import goldenLayout from './golden.vue'

//TODO: there might be a type for route
function defaultTitle(route: any): string {
	//The last case is to warn the programmer who would have forgotten that detail
	return (route.meta && route.meta.title) || 'set $route.meta.title';
}
		
goldenLayout.registerGlobalComponent('route', gl=> function(container, state) {
    var comp = gl.$router.getMatchedComponents(state.fullPath)[0];
    //TODO: comp can be a string too
    if('object'=== typeof comp)
        comp = Vue.extend(comp);
    var router = gl.$parent, div,
        template = router.$scopedSlots.default ?
            router.$scopedSlots.default(state) :
            router.$slots.default;
    if(template) {   //template is a VNode
        var dob = renderVNodes(container.getElement()[0], [template]);
        div = dob.$el.querySelector('main');
    } else {
        div = document.createElement('main');
        container.getElement().append(div);
    }
    if(div) new comp({el: div, parent: gl});
    else console.error('Missing <main /> tag in route-page design');
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
        if(aci && 'route'=== aci.config.componentName) {
            path = aci.config.componentState.fullPath;
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
                        componentName: 'route',
                        componentState: route,
                        title: this.titler(route)
                    });
                }
			});
	}
    
	mounted() {
		//With immediate: true, the watch is called before $refs are initialised
		this.change(this.$route);
	}
}
