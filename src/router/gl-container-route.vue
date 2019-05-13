<template>
	<div style="display: none;"></div>
</template>
<script lang="ts">
import { glCustomContainer } from '../roles'
import glComponentRoute from './gl-component-route'
import {Component, Inject, Model, Prop, Watch} from 'vue-property-decorator'
import glRouteBase from './gl-route-base'

@Component
export default class glContainerRoute extends glCustomContainer {
	@Prop() component
	mounted() {
		new this.component({
			parent: this,
			el: this.$el,
			propsData: {
				tabId: this.tabId,
				title: this.title
			}
		});
	}
	render(v : any) {}
}
</script>