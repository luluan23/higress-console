import { setPagestate } from "./autoSavePageStateFun";
export default {
  updated: function (el, binding) {
    if (binding.value) {
      if (binding.value != binding.oldValue) {
        setPagestate(binding.arg, binding.value);
      }
    }
  },
};
