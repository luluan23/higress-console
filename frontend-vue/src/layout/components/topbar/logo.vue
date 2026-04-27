<script lang="jsx">
  export default {
    name: "MenuItem",
    functional: true,
    props: {
      icon: {
        type: String,
        default: "",
      },
      title: {
        type: String,
        default: "",
      },
    },
    render() {
      const title = this.title;
      const icon = this.icon;
      const vnodes = [];
      if (icon) {
        let spaniconclass = "svg-icon  iconfont " + icon + " ";
        vnodes.push(
          <i class={spaniconclass} title={title} style="margin-right:5px;" />
        );
        // vnodes.push(<svg-icon icon-class={icon}/>)
      }

      if (title) {
        vnodes.push(<span slot="title">{title}</span>);
      }
      return vnodes;
    },
  };
</script>
