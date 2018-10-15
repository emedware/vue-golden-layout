<template>
	<golden ref="layout" :state="state" @state="gotState" :ll-components="routeComponents" class="golden-router">
		<gl-row ref="container" />
	</golden>
</template>
<style>
.golden-router .lm_content {
	overflow-y: auto;
}
</style>
<script lang="ts">
import golden from './golden.vue'
import { Vue } from './imports'
import { Watch, Component, Prop, Emit } from 'vue-property-decorator'
import { glRow } from './gl-group'

//TODO: there might be a type for route
function defaultTitle(route: any): string {
	//The last case is to warn the programmer who would have forgotten that detail
	return (route.meta && route.meta.title) || 'set $route.meta.title';
}

@Component({components: {golden, glRow}})
export default class router extends Vue {
	get ci() { return this.container.contentItem(); }
	get gl() { return this.layout.gl; }
	get container(): glRow { return <glRow>this.$refs.container; }
	get layout(): golden { return <golden>this.$refs.layout; }
	@Prop({default: defaultTitle}) titler : (route: any)=> string
	@Prop({default: null}) state: any

	@Emit('state')
	gotState(state) {}
	
	stack: any = null
	stackConfig: any = null
	unwatchStack: ()=> void
	
	@Watch('$route')
	change(route) {
		if(route && route.matched.length)
			this.layout.onGlInitialise(()=> {
				var stack = this.ci.contentItems.find(x => 'stack'=== x.type),
					itemConfig = {
						type: 'component',
						componentName: 'route',
						componentState: route,
						title: this.titler(route)
					};

				if(stack) {
					var already = stack.contentItems.find(x=> x.config.componentState.path == route.fullPath);
					if(already) stack.setActiveContentItem(already);
					else stack.addChild(itemConfig);
				} else {
					this.ci.addChild({
						type: 'stack',
						content: [itemConfig]
					}, 0);
					stack = this.ci.contentItems[0];
				}
				if(this.stack != stack) {
					if(this.unwatchStack) this.unwatchStack();
					this.stack = stack;
					//this.stackConfig = this.stack.config;	//in order to watch the elements
					this.unwatchStack = this.$watch(()=> this.stack.config.activeItemIndex, v=> {
						var path = this.stack.contentItems[v].config.componentState.path;
						if(path != this.$route.fullPath)
							this.$router.replace(path);
					});
				}
			});
	}
	get routeComponents() {
		var me= this;
		return {}; /*{
			route: function(container, state) {
				var layout = me.layout;
				var comp = layout.$router.getMatchedComponents(state.path)[0];
				//TODO: comp can be a string too
				if('object'=== typeof comp)
					comp = Vue.extend(comp);
				var div = document.createElement('div');
				container.getElement().append(div);
				new comp({el: div, parent: layout});
			}
		};*/
	}
	//TODO: $destroy on tab-close/stack-close
	mounted() {
		//With immediate: true, the watch is called before $refs are initialised
		this.change(this.$route);
	}
}
</script>
