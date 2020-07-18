import { LitElement, html, css, customElement, property } from 'lit-element';

import { Router } from '@vaadin/router';

import { homeIcon, endpointsIcon, exportIcon, starIcon, rocketIcon, dataInputIcon, uploadCloudIcon, configureIcon, toolsIcon, downloadIcon, projectsIcon } from '@workday/canvas-system-icons-web';

//import {EnvLabelElement} from '@aaaronanderson/lwdc';

//import '../features/admin/admin-page';
//import '../features/home/home-page';
import '../features/connection/connections-page';
import '../features/connection/connection-page';
import '../features/project/projects-page';
import '../features/project/project-page';



import '@aaronanderson/lwdc/wc/lwdc-tooltip';
import '@aaronanderson/lwdc/wc/lwdc-fonts';
import '@aaronanderson/lwdc/wc/lwdc-header';
import '@aaronanderson/lwdc/wc/lwdc-side-panel';
import '@aaronanderson/lwdc/wc/lwdc-icon';
import '@aaronanderson/lwdc/wc/lwdc-env-label';
import '@aaronanderson/lwdc/wc/lwdc-button';
import '@aaronanderson/lwdc/wc/lwdc-modal';
import { ButtonType } from '@aaronanderson/lwdc/wc/lwdc-button';
import ModalElement from '@aaronanderson/lwdc/wc/lwdc-modal';


const style = css(<any>[require('./etlu-app.scss').default]);


const logo = require('../assets/etlu-logo.png').default;
//console.log('fonts', fonts);
//  fonts.loadWDCFonts2();

const menu = [{ title: "Home", icon: homeIcon, path: "/" }, { title: "Connections", icon: endpointsIcon, path: "/connections" }, { title: "Projects", icon: projectsIcon, path: "/projects" },];
//{ title: "Template Archive", icon: dataInputIcon, path: "/archive-template" }, { title: "Template Load", icon: uploadCloudIcon, path: "/load-template" }, { title: "Transform", icon: configureIcon, path: "/transform" }, { title: "Utilities", icon: toolsIcon, path: "/utilities" }];



@customElement('etlu-app')
export class AppElement extends LitElement {

  //@property({ type: Boolean })
  opened: boolean = true;


  firstUpdated() {
    console.log("first updated", this.shadowRoot);
    if (this.shadowRoot) {
      
      let mainContent: HTMLElement = this.shadowRoot.getElementById('main-content') as HTMLElement;
      let router = new Router(mainContent);
      router.setRoutes([
        { path: '/', component: 'etlu-home-page' },
        { path: '/admin', component: 'etlu-admin-page' },

        { path: '/connections', component: 'etlu-connections-page' },
        { path: '/connection/:connectionId?', component: 'etlu-connection-page' },
        { path: '/projects', component: 'etlu-projects-page' },
        { path: '/project/:projectId?', component: 'etlu-project-page' }

      ]);


    }

  }


  static get styles() {
    return [style];
  }


  render() {
    console.log('render');
    return html`
     
      <lwdc-fonts></lwdc-fonts>
         
      
      <lwdc-header imgURL="${logo}" title="Extract Transform Load Universe"></lwdc-header>
      <main>
        <lwdc-side-panel @lwdc-side-panel-toggle=${(e: CustomEvent) => { this.opened = e.detail.opened; }} style="--lwdc-sidebar-height: 50vh" >${this.sidePanelContent}</lwdc-side-panel>
        <section class="main-content" id="main-content"></section>
      </main>
      

   
    `;
  }




  get sidePanelContent() {
    const itemClass = this.opened ? "opened" : "closed";

    return html`
      <ul>
      ${menu.map((i: any) => {
      return html`
          <li class="${itemClass}" @click=${(e: Event) => Router.go(i.path)}>
            <lwdc-tooltip message="${i.title}">	
              <lwdc-icon .icon=${i.icon}></lwdc-icon>
            </lwdc-tooltip>
            ${this.opened ? html`<span class="listTitle">${i.title}</span>` : undefined}				    
			    </li>
        `;
    })}
		  </ul>`

  }


  updated(changedProperties: Map<string, any>) {
    //console.log(changedProperties);
    //initializeIcons(null, '.wdc-icon', this.shadowRoot);

  }


}



export default AppElement;
