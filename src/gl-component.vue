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
import { Component, Model, Watch } from 'vue-property-decorator'
import { goldenChild } from './roles'
import { Dictionary } from './utils.js'

@Component
export default class glComponent extends goldenChild {
	toggleMaximise() {
		this.container && this.container.toggleMaximise();
	}
	
	initialState(config: Dictionary) {
		this.$emit('load-state', config.componentState);
	}
	// State object available to vue objects
	@Model('load-state', {default: null}) state: Dictionary
	@Watch('state', {deep: true}) innerStateChanged() {
		this.glObject.emitBubblingEvent('stateChanged');
	}
	getChildConfig() : any {
		return {
			type: 'component',
			isClosable: this.closable,
			reorderEnabled: this.reorderEnabled,
			componentState: this.state
		};
	}
}
</script>