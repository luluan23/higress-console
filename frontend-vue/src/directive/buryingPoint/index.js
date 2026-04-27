import buryingPoint from './buryingPoint.js';

const install = function(Vue) {
    Vue.directive('tc-burying-point', buryingPoint);
};

buryingPoint.install = install;
export default buryingPoint;
