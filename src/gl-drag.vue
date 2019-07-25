<template>
  <div class="glDrag" ref="handle">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { ComponentConfig } from "golden-layout";
import { glCustomContainer } from "./roles";

// finds the nearest parent that has a layout object
function getGLO(component: any): any {
  if (component.layout && component.layout.glo) {
    return component.layout.glo;
  } else {
    if (component.$parent) {
      return getGLO(component.$parent);
    } else {
      return null;
    }
  }
}

@Component
export default class glDrag extends Vue {
  @Prop() component: glCustomContainer;
  @Prop() componentName: string;
  @Prop() data: any;
  dragSource: any = null;
  constructor() {
    super();
  }

  async mounted() {
    const handle: HTMLElement = <HTMLElement>this.$refs.handle;
    const glo = await getGLO(this);
    console.log(this)
    console.log(glo)

    glo.registerComponent(this.componentName, this.component);

    this.dragSource = glo.createDragSource(handle, <ComponentConfig>{
      type: "component",
      componentName: this.componentName,
      componentState: this.data
    });
  }

  async beforeDestroy() {
    this.dragSource._dragListener.destroy();
  }
}
</script>