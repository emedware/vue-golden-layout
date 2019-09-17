<template>
	<div style="display: none;"></div>
</template>
<script lang="ts">
import { glCustomContainer, goldenChild } from '../roles'
import glComponentRoute from './gl-component-route'
import { Component, Inject, Model, Prop, Watch } from 'vue-property-decorator'
import glRouteBase from './gl-route-base'
import Vue from 'vue'

@Component
export default class glContainerRoute extends glCustomContainer {
	@Prop() component: typeof Vue
	subComponent: goldenChild = null
	get childMe() { return this.subComponent && this.subComponent.childMe; }
	mounted() {
		this.subComponent = new this.component({
			parent: this,
			propsData: {
				tabId: this.tabId,
				title: this.title
			}
		});
		// We must mount after the hyerarchy is known
		this.subComponent.$mount(this.$el);
	}
	render(v : any) {}
}
</script>