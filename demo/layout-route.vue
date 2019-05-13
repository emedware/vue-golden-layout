<template>
	<gl-col id="lr-col">
		<gl-component title="Master">
			<p-head :title="title" />
			Master: <input type="checkbox" v-model="checked" />
		</gl-component>
		<gl-stack>
			<gl-component title="Slave A">
				Slave A: {{ checked ? 'checked' : 'unchecked' }}
			</gl-component>
			<gl-component title="Slave B">
				Slave B: {{ checked ? 'checked' : 'unchecked' }}
			</gl-component>
		</gl-stack>
	</gl-col>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Model, Prop, Watch } from 'vue-property-decorator'
import { glContainerRoute, glCustomContainer } from 'vue-golden-layout'
import PHead from './p-head.vue'

@Component({components: {PHead}})
export default class LayoutRoute extends glCustomContainer {
	checked: boolean = false
}
</script>
