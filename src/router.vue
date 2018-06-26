<template>
	<golden ref="layout">
		<gl-stack ref="container" :showPopoutIcon="false" />
	</golden>
</template>
<script lang="ts">
import golden from './golden.vue'
import Vue from 'vue'
import { Watch, Component, Prop } from 'vue-property-decorator'
import { glStack } from './gl-group'

//TODO: there might be a type for route
function defaultTitle(route: any): string {
	//The last case is to warn the programmer who would have forgotten that detail
	return (route.meta && route.meta.title) || 'set $route.meta.title';
}

@Component({components: {golden, glStack}})
export default class router extends Vue {
	get ci() { return this.container.contentItem(); }
	get gl() { return this.layout.gl; }
	get container(): glStack { return <glStack>this.$refs.container; }
	get layout(): golden { return <golden>this.$refs.layout; }
	
	@Prop({default: defaultTitle}) titler : (route: any)=> string

	@Watch('$route')
	change(route) {
		if(route.matched.length)
			this.layout.onGlInitialise(()=> {
				this.ci.addChild({
					type: 'component',
					componentName: 'route',
					componentState: { route },
					title: this.titler(route)
				});
			});
	}
	mounted() {
		//With immediate: true, the watch is called before $refs are initialised
		this.change(this.$route);
		
		this.gl.registerComponent('route', function(container, state) {
			var comp = state.route.matched[0].components.default;
			if('function'=== typeof comp)
				comp = new comp();
			else
				comp = new Vue(comp);
			comp.$mount(container._element[0]);
		});
	}
}
</script>
