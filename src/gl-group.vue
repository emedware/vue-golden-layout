<template>
	<div style="display: none;" ref="hiddenContainer">
		<slot />
	</div>
</template>
<script lang="ts">
import Vue from 'vue'
import {Component, Inject, Model, Prop, Watch} from 'vue-property-decorator'
import {goldenLink, goldenContainer} from './roles'

@Component
export default class glGroup extends goldenLink {
	//child properties
	$parent: goldenContainer
	@Prop({default: false}) closable: boolean
}
</script>
