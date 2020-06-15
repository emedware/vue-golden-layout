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
	
	getChildConfig() : any {
		return {
			type: 'component',
			isClosable: this.closable,
			reorderEnabled: this.reorderEnabled
		};
	}
}
</script>