<template>
	<gl-component>
		<div>Title: {{title}}</div>
	</gl-component>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { glCustomContainer, registerGlobalComponent } from '../src';

@Component
export default class DragTest extends Vue {
	title: string = "NaM";
}

registerGlobalComponent("DragTest", (gl, container, state) => {
	console.log("Container:", container)
	const dt : DragTest = new DragTest({
		parent: gl.$root,
		inject: {
			layout: {
				default: gl
			}
		}
	});
	dt.$mount(container._element)
})
</script>
