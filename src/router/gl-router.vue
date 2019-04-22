<template>
	<gl-dstack :dstack-id="dstackId" v-model="activeRoute">
		<slot />
		<gl-route v-for="route in routes" :key="route.path"
			:path="route.path" :name="route.name"
			:tab-id="route.path"
			:closable="!isEmpty(route)" :reorder-enabled="!isEmpty(route)" />
	</gl-dstack>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Model, Prop, Watch, Emit, Provide } from 'vue-property-decorator'
import { glCustomContainer } from '../roles'
import glDstack from '../gl-dstack'
import glRoute from './gl-route'
import { defaultTitler, UsingRoutes } from './utils'
import { UsingSlots } from '../roles'
import VueRouter, { Location, Route } from 'vue-router'

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
	@Prop({default: ()=>[]})
	routes: Location[]


	mounted() {
		//With immediate: true, the watch is called before $refs are initialised
		//this.change(this.$route);
	}

	isEmpty(route: Location) {
		return route.path === this.emptyRoute;
	}
	@Watch('activeRoute') setPath(path: string) {
		if(path != this.$route.fullPath)
			this.$router.replace(path);
	}
	@Watch('$route', {immediate: true})
	async change(route: Route) {
		if(route) {
			var location: Location = route;
			if(!route.matched.length) {
				if(route.path === '/') location = {path: this.emptyRoute};
				else return;
			}
			var already = this.routes.find((l: Location)=> l.path === location.path || l.name === location.name);
			if(already) {
				this.activeRoute = location.path;
			} else {
				this.routes.push({path: location.path});
			}
		}
	}
}
</script>