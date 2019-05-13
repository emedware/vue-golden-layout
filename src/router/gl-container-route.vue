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
	created() {
		debugger;
	}
	mounted() {
		debugger;
		var dob = new this.component({parent: this, el: this.$el})
	}
	render(v : any) {}
}
</script>