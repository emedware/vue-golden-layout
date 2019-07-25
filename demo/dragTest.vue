<template>
	<gl-component>
		<div>Title: {{title}}</div>
	</gl-component>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { glCustomContainer } from '../src';

@Component
export default class DragTest extends glCustomContainer {
	title: string = "You dragged me!";
}
</script>
