<template>
	<gl-dstack :dstack-id="dstackId" v-model="activeRoute">
		<slot />
		<gl-route v-for="route in routes" :key="route.path"
			:path="route.path" :name="route.name"
			:tab-id="route.path" @destroy="destroyedRoute"
			:closable="!isEmpty(route)" :reorder-enabled="!isEmpty(route)" />
	</gl-dstack>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Model, Prop, Watch, Emit, Provide } from 'vue-property-decorator'
import { glCustomContainer } from '../roles'
import glDstack from '../gl-dstack'
import glRoute from './gl-route.vue'
import { defaultTitler, UsingRoutes } from './utils'
import { UsingSlots } from '../roles'
import VueRouter, { Location, Route } from 'vue-router'

function opened(location: Location) {
	return (l: Location)=> (l.path && l.path === location.path) || (l.name && l.name === location.name)
}

@Component({components: {glRoute, glDstack}})
@UsingRoutes
@UsingSlots('route')
export default class glRouter extends glCustomContainer {
	$router : VueRouter
	$route : Route
	activeRoute: string = null
	@Prop({
		default: defaultTitler,
		type: Function
	})
	@Provide() titler: (route: any)=> string
	@Provide() get _glRouter() { return this; }
	@Prop({default: '/'}) emptyRoute: string
	@Prop({default: 'router'}) dstackId: string
	@Prop({default: ()=> []})
	routes: Location[]

	async mounted() {
		//With immediate: true, the watch is called before $refs are initialised
		await this.layout.glo;
		this.change(this.$route);
	}
	isEmpty(route: Location) {
		return route.path === this.emptyRoute;
	}
	@Watch('activeRoute') setPath(path: string) {
		if(path != this.$route.fullPath)
			this.$router.replace(path);
	}
	@Watch('$route')
	async change(route: Route) {
		if(route) {
			var location: Location = {path: route.fullPath};
			if(!route.matched.length) {
				if(route.path === '/') location = {path: this.emptyRoute};
				else return;
			}
			var already = this.routes.find(opened(location));
			if(!already)
				this.routes.push(location);
			this.activeRoute = location.path;
		}
	}
	destroyedRoute(route: glRoute) {
		if(route.closable) {
			var ndx = this.routes.findIndex(opened(route.location))
			console.assert(~ndx, 'Closed route is in the array');
			this.routes.splice(ndx, 1);
		}
	}
}
</script>