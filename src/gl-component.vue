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
import {Component, Inject, Model, Prop, Watch} from 'vue-property-decorator'
import {goldenContainer, goldenChild} from './roles'

@Component
export default class glComponent extends goldenChild {
	@Prop() title: string
	@Prop() template: string
	@Prop() state: any

	@Watch('title') setTitle(title) {
		if(this.container) this.container.setTitle(title);
	}
	toggleMaximise() {
		this.container && this.container.toggleMaximise();
	}
    
	get childConfig() {
		return {
			type: 'component',
			title: this.title,
			isClosable: this.closable,
			componentName: this.template,
			componentState: this.state
		};
	}
}
</script>