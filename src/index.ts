import {layoutGolden} from './golden'
import glComponent from './gl-component.vue'
import {glRow, glCol, glStack} from './gl-group'

export {layoutGolden, glComponent, glRow, glCol, glStack}

var components = {layoutGolden, glComponent, glRow, glCol, glStack}
export default {
	install(Vue, options) {
		for(let i in components)
			Vue.component(i, components[i]);
	}
};