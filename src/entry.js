// Import vue component
import VueGooglePlaces from './VueGooglePlaces';

// install function executed by Vue.use()
function install(Vue) {
  if (install.installed) return;
  install.installed = true;
  Vue.component('VueGooglePlaces', VueGooglePlaces);
}

// Create module definition for Vue.use()
const plugin = {
  install
};

// To auto-install when vue is found
/* global window global */
let GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}

export { default as VueGooglePlaces } from './VueGooglePlaces';
export { default as VuetifyGooglePlaces } from './VuetifyGooglePlaces';
export default plugin
