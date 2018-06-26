<template>
	<golden ref="layout">
		<gl-row ref="container" />
	</golden>
</template>
<script lang="ts">
import golden from './golden.vue'
import Vue from 'vue'
import { Watch, Component, Prop } from 'vue-property-decorator'
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
//TODO: on tab change, url change
	@Watch('$route')
	change(route) {
		if(route.matched.length)
			this.layout.onGlInitialise(()=> {
				var stack = this.ci.contentItems.find(x => 'stack'=== x.type),
					itemConfig = {
						type: 'component',
						componentName: 'route',
						componentState: { route },
						title: this.titler(route)
					};

				if(stack) {
					var already = stack.contentItems.find(x=> x.config.componentState.route.fullPath == route.fullPath);
					if(already) stack.setActiveContentItem(already);
					else stack.addChild(itemConfig);
				} else
					this.ci.addChild({
						type: 'stack',
						content: [itemConfig]
					}, 0);
			});
	}
	mounted() {
		//With immediate: true, the watch is called before $refs are initialised
		this.change(this.$route);
	}
}
</script>
