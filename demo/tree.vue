<template>
	<div>
		<span class="tree-name">{{tree.name}}</span>
		<div v-if="tree.children.length" class="sub-tree">
			<tree v-for="(child, ndx) in tree.children" :key="ndx" />
		</div>
	</div>
</template>
<style>
.sub-tree {
	padding-left: 12px;
}
</style>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

export interface TreeBranch {
	readonly name: string;
	readonly children: TreeBranch[]
}

@Component({name: 'tree'})
export default class Tree extends Vue {
	@Prop() tree: TreeBranch
}
</script>
