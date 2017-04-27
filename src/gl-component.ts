import Vue = require('Vue');
import {Component, Inject, Model, Prop, Watch} from 'vue-property-decorator'
import {goldenContainer, goldenChild} from './gl-roles'


@Component({
	template: '<div><div ref="glCompRoot"><slot /></div></div>'
})
export class glComponent extends goldenChild {
	@Prop() title: string
	@Watch('title') setTitle(title) {
		if(this.container) this.container.setTitle(title);
	}
	get childEl() { return this.$refs.glCompRoot; }
	toggleMaximise() {
		this.container && this.container.toggleMaximise();
	}
	get childConfig() {
		return {
			type: 'component',
			title: this.title,
			isClosable: this.closable,
			componentName: 'template'
		}
	}
}