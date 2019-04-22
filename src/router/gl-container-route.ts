import { glCustomContainer } from '../roles'
import glRoute from './gl-route'
import {Component, Inject, Model, Prop, Watch} from 'vue-property-decorator'

@Component({mixins:[glRoute]})
export default class glContainerRoute extends glCustomContainer {
	created() {
		debugger;
	}
	mounted() {
		debugger;
	}
	getChildConfig(): any {
        return null;
    };
}