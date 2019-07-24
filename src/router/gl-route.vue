<template>
	<gl-component-route v-if="type === 'component'" :path="path" :name="name" :component="component"
		:closable="closable" :reorder-enabled="reorderEnabled" :tab-id="fullPath">
		<slot />
	</gl-component-route>
	<gl-container-route v-else-if="type === 'container'" :component="component"
		:closable="closable" :reorder-enabled="reorderEnabled" :tab-id="fullPath" :title="compTitle" />
	<gl-component v-else :title="compTitle" :tab-id="fullPath">
		{{loading}}...
	</gl-component>
</template>
<style>
</style>
<script lang="ts">
import Vue, { ComponentOptions, AsyncComponent } from 'vue'
import { Component, Inject, Model, Prop, Watch, Emit, Provide } from 'vue-property-decorator'
import { glCustomContainer } from '../roles'
import glComponentRoute from './gl-component-route'
import glContainerRoute from './gl-container-route.vue'
import glComponent from '../gl-component.vue'
import glRouteBase from './gl-route-base'
import VueRouter, { Location } from 'vue-router';
import { freezeRoute } from './utils'

type VueComponent = ComponentOptions<Vue> | typeof Vue | AsyncComponent;

@Component({
	mixins: [glRouteBase],
	components: {glComponentRoute, glContainerRoute, glComponent}
})
export default class glRoute extends glCustomContainer {
	closable: boolean
	location: Location
	@Prop({default: 'Loading'}) loading: string
	type: string|null = null
	component: VueComponent
	get fullPath() { return this.$route.fullPath; }
	async created() {
		var route = this.$router.resolve(this.location).route,
			comp = this.$router.getMatchedComponents(route)[0];
		// In case of AsyncComponent
		if('function'=== typeof comp && !(comp.prototype instanceof Vue)) {
			comp = (<()=> any>comp)().component;
			//TODO: use AsyncComponentFactory loading/error rv
		}
		if(comp instanceof Promise) comp = await comp;
		this.component = comp;
		//TODO: ComponentOptions.extends
		//TODO: `instanceof glCustomContainer` fails in popout windows
		this.type = 'function'=== typeof comp && comp.prototype instanceof glCustomContainer ?
			'container' : 'component';
		freezeRoute(this, route);
	}
}
</script>