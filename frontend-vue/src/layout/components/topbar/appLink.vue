<template>
    <!-- eslint-disable vue/require-component-is -->
    <component :is="getComponetName(to)" v-bind="linkProps(to)">
        <slot />
    </component>
</template>

<script>
  import { isExternal } from "../../../utils/utilTool";

  export default {
    name: "app-link",
    props: {
      to: {
        type: String,
        required: true,
      },
    },
    methods: {
      getComponetName(url) {
        if (isExternal(url)) {
          return "a";
        }
        return "router-link";
      },
      linkProps(url) {
        if (isExternal(url)) {
          return {
            is: "a",
            href: url,
            target: "_blank",
            rel: "noopener",
          };
        }
        return {
          is: "router-link",
          to: url,
        };
      },
    },
  };
</script>
