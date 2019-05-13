<template>
	<div>Title: {{title}}</div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Model, Prop, Watch } from 'vue-property-decorator'

@Component
export default class PHead extends Vue {
	@Prop() title: string
	created() {
		console.assert(!!this.$parent.$parent, 'Vue object linked to root');
	}
}
</script>
