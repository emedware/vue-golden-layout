<template>
	<div ref="glSource">
		<div class="glComponent" ref="glCompRoot">
			<slot />
		</div>
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
import * as Vue from 'vue'
import {Component, Inject, Model, Prop, Watch} from 'vue-property-decorator'
import {goldenContainer, goldenChild} from './gl-roles'

@Component
	//glSource stays in the display:none hierarchy
	//glCompRoot is displaced as a golden-layout element
export default class glComponent extends goldenChild {
	@Prop() title: string
	@Watch('title') setTitle(title) {
		if(this.container) this.container.setTitle(title);
	}
	get childEl() { return this.$refs.glCompRoot; }
	toggleMaximise() {
		this.container && this.container.toggleMaximise();
	}
	//TODO2: Forward glSource' class, styles, etc. toward glCompRoot
	get childConfig() {
		return {
			type: 'component',
			title: this.title,
			isClosable: this.closable,
			componentName: 'template'
		}
	}
}
</script>