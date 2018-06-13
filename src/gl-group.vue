<template>
	<div style="display: none;">
		<slot />
	</div>
</template>
<script lang="ts">
import Vue from 'vue'
import {Component, Inject, Model, Prop, Watch} from 'vue-property-decorator'
import {goldenContainer, goldenChild} from './gl-roles'

@Component({mixins: [goldenChild]})
export default class glGroup extends goldenContainer {
	//child properties
	$parent: goldenContainer
	@Prop({default: false}) closable: boolean
	/// Only the layout object centralise the components
	registerComp(component): string {
		return this.$parent.registerComp(component);
	}
	onGlInitialise(cb: ()=> void) {
		this.$parent.onGlInitialise(cb);
	}
	contentItem() {
		var ci = this.$parent.contentItem();
		//Math.min because the root has only one `contentItems` (me) but I am not the only child
		return ci && ci.contentItems[Math.min(this.$parent.$children.indexOf(this), ci.contentItems.length)];
	}
}
</script>
