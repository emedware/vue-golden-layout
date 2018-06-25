<template>
	<golden ref="layout">
		<gl-stack ref="container" :closable="false" />
	</golden>
</template>
<script lang="ts">
import golden from './golden.vue'
import Vue from 'vue'
import { Watch, Component, Prop } from 'vue-property-decorator'
import { glStack } from './gl-group'

@Component({components: {golden, glStack}})
export default class router extends Vue {
	get ci() { return this.container.contentItem(); }
	get gl() { return this.layout.gl; }
	get container(): glStack { return <glStack>this.$refs.container; }
	get layout(): golden { return <golden>this.$refs.layout; }
	@Watch('$route')
	change(route) {
		this.layout.onGlInitialise(()=> {
			this.ci.addChild({
				type: 'component',
				componentName: 'route',
				componentState: { route }
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
