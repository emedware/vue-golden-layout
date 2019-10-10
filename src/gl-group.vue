<template>
	<div style="display: none;">
		<slot />
	</div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { goldenLink } from './roles'

@Component
export default class glGroup extends goldenLink {
}
</script>
