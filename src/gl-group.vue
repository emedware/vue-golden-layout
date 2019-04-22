<template>
	<div style="display: none;" ref="hiddenContainer">
		<slot />
	</div>
</template>
<script lang="ts">
import Vue from 'vue'
import {Component, Inject, Model, Prop, Watch} from 'vue-property-decorator'
import {goldenContainer, goldenChild} from './roles'

@Component({mixins: [goldenChild]})
export default class glGroup extends goldenContainer {
	//child properties
	$parent: goldenContainer
	@Prop({default: false}) closable: boolean
}
</script>
