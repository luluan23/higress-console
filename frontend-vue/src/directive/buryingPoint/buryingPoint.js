import { Buried } from './buryingPointFun.js';
export default {
    bind(
        el,
        { value: { pagename = '', actionname = '', stop = false } },
        vnode  // eslint-disable-line
    ) {
        el.addEventListener(
            'click',
            event => {
                Buried(pagename, actionname);
                if (stop) {
                    event.stopPropagation(); //是否禁止click冒泡
                }
            },
            false
        );
    }
};
