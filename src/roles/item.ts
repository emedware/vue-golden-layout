import Vue from 'vue'
import goldenLayout from "../golden"
import { goldenContainer, goldenChild } from "./index"

export class goldenItem extends Vue {
	glObject: any = null
	layout: goldenLayout
	// To be overriden
	get childMe() { return <goldenChild><unknown>this; }
	get parentMe() { return <goldenContainer><unknown>this; }
	get nodePath(): string { return ''; }
}