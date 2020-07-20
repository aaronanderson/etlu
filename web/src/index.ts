import { applyPolyfill, ReflowStrategy, rerenderInnerHTML } from 'custom-elements-hmr-polyfill';

const appMount = document.querySelector("#etlu-container");
if (appMount) {

  const appRender = () => {
    require('./app/etlu-app');
    if (appMount.firstChild) {
      appMount.removeChild(appMount.firstChild);
    }
    appMount.appendChild(document.createElement("etlu-app"));
  };

  if (process.env.NODE_ENV === 'development' && (module as any).hot) {
    //Custom elements can't be redefined (i.e. hot module replacement) once they are defined. The HMR polyfill works around this issue by overriding the customElements.define() method and substitutes in proxies.
    (window as any).HMR_SKIP_DEEP_PATCH = true;
    applyPolyfill();
    (module as any).hot.accept('./app/etlu-app', appRender);
  }

  appRender();
}




