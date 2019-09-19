<template>
	<gl-col :tab-id="tabId" :title="title" :closable="false" >
		<component v-bind:is="{extends: component}" />
	</gl-col>
</template>
<script lang="ts">
import { glCustomContainer } from '../roles'
import { Component, Prop } from 'vue-property-decorator'
import Vue from 'vue'

@Component
export default class glContainerRoute extends glCustomContainer {
	@Prop() component: typeof Vue
}
</script>