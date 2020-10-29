import { Watch, Component, Prop, Inject } from 'vue-property-decorator'
import { goldenLink } from '../roles'
import { defaultTitler } from './utils'
import VueRouter, { Location, Route } from 'vue-router';

// TODO 2 route-base created for each route
@Component
export default class glRouteBase extends goldenLink {
	$router: VueRouter
	$route: Route
	@Prop() path: string
	@Prop() name: string
	@Prop({default: false}) closable: boolean
	@Prop({default: false}) reorderEnabled: boolean
	@Inject() titler: (route: any)=> string
	@Inject() _glRouter: any
	@Prop() title: string
	get compTitle(): string {
		return this.title || 
			(this.titler.bind(this)||defaultTitler)(this.$router.resolve(this.location).route);
	}
	
	get location(): Location {
		console.assert(!!this.name || !!this.path, 'At least one route specification - `name` or `path` is given.');
		if(!this.syncedState.path && !this.syncedState.name) {
			// TODO Find out why this is necessary
			this.syncedState.name = this.name;
			this.syncedState.path = this.path;
		}
		var rv: Location = {};
		if(this.name) rv.name = this.name;
		if(this.path) rv.path = this.path;
		return rv;
	}

	@Watch('compTitle') setTitle(title: any) {
		if(this.container) this.container.setTitle(title);
	}
}
