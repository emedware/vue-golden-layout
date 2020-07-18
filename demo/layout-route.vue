<template>
	<gl-row id="lr-row">
		<gl-dstack>
			<gl-component title="Master" :closable="false" :reorderEnabled="false">
				<p-head :title="$route.meta.title" />
				Master: <input type="checkbox" v-model="checked" />
			</gl-component>
		</gl-dstack>
		<gl-stack>
			<gl-component title="Slave A">
				Slave A: <input type="checkbox" v-model="checked" />
			</gl-component>
			<gl-component title="Slave B">
				Slave B: <input type="checkbox" v-model="checked" />
			</gl-component>
		</gl-stack>
	</gl-row>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { glCustomContainer } from 'vue-golden-layout'
import PHead from './p-head.vue'

@Component({components: {PHead}})
export default class LayoutRoute extends glCustomContainer {
	checked: boolean = false
}
</script>
