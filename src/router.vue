<template>
	<golden :selection-enabled="true" ref="layout">
		<gl-row ref="container" />
	</golden>
</template>
<script lang="ts">
import golden from './golden.vue'
import Vue from 'vue'
import { Watch, Component, Prop } from 'vue-property-decorator'
import { glRow } from './gl-group'

@Component({components: {golden, glRow}})
export default class router extends Vue {
	get ci() { return this.container.contentItem(); }
	get gl() { return this.layout.gl; }
	get container(): glRow { return <glRow>this.$refs.container; }
	get layout(): golden { return <golden>this.$refs.layout; }
	@Watch('$route')
	change(route) {
		var stack = this.gl.selectedItem;
		debugger;
		if(!stack)
			this.layout.onGlInitialise(()=> {
				stack = this.ci;//.addChild;
			});
	}
	mounted() {
		//With immediate: true, the watch is called before $refs are initialised
		this.change(this.$route);
		
		this.gl.registerComponent('route', function(container, state) {
			/*state.route.comp.childEl
			container.getElement().append(comp.childEl);*/
			debugger;
		});
	}
}
</script>
