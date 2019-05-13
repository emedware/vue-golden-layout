<template>
	<div class="glComponent">
		<slot />
	</div>
</template>
<style>
.glComponent {
	width: 100%;
	height: 100%;
	overflow: auto;
}
</style>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Model, Prop, Watch, Emit } from 'vue-property-decorator'
import {goldenContainer, goldenChild} from './roles'
import { Dictionary } from './golden.vue'

@Component
export default class glComponent extends goldenChild {
	@Prop() template: string
	@Model('state') state: Dictionary
	toggleMaximise() {
		this.container && this.container.toggleMaximise();
	}
	@Emit('state') initialState(state: Dictionary) {}
	
	getChildConfig() : any {
		return {
			type: 'component',
			isClosable: this.closable,
			reorderEnabled: this.reorderEnabled,
			componentName: this.template,
			componentState: this.state
		};
	}
}
</script>