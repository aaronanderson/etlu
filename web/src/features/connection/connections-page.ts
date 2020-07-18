import { html, css, customElement, property } from 'lit-element';

import { ViewElement } from '../../components/etlu-view';
import '@aaronanderson/lwdc/wc/lwdc-table';
import '@aaronanderson/lwdc/wc/lwdc-action-bar';
import '@aaronanderson/lwdc/wc/lwdc-button';
import '@aaronanderson/lwdc/wc/lwdc-layout-section';

import { Connection, fetchConnections, addConnection, editConnection, removeConnection, fetchEnvironments, Environment } from './connection-actions';


import { ETLUStore } from '../../app/store';

@customElement('etlu-connections-page')
export class ConnectionsPageElement extends ViewElement {

	@property({ type: Array })
	connections: Array<Connection> = [];

	@property({ type: Array })
	envs: Array<Environment> = [];

	@property({ type: Boolean })
	editMode: boolean = false;


	firstUpdated() {
		this.pageTitle = 'Connections';
		this.dispatch(fetchConnections());
		this.dispatch(fetchEnvironments());


	}

	render() {

		return html`
			${this.pageTitleTemplate}

			<section class="etlu-main">
				<div class="etlu-scroll-container">
						<lwdc-table name="Connections" .entries=${this.connections} .editMode=${this.editMode} @lwdc-table-add=${this.addConnection} @lwdc-table-edit=${this.editConnection} @lwdc-table-remove=${this.removeConnection}>
								<lwdc-table-col key="description" header="Description"></lwdc-table-col>
								<lwdc-table-col key="tenant" header="Tenant"></lwdc-table-col>
								<lwdc-table-col header="Environment" .renderer=${this.envRenderer.bind(this)}></lwdc-table-col>
								<lwdc-table-col key="account" header="Account"></lwdc-table-col>
						</lwdc-table>
				</div>
			
			
				${this.editMode ?
				html`						
						<lwdc-action-bar>
							<lwdc-button @click="${this.handleDone}">Done</lwdc-button>
						</lwdc-action-bar>		
					`
				: html`
						<lwdc-action-bar>
							<lwdc-button @click="${this.handleEdit}">Edit</lwdc-button>
						</lwdc-action-bar>
					`
			}
			</section>
    `;
	}


	connectionRenderer(c: Connection) {
		return html`<a class="wdc-type-variant-link" href="/connection/${c.id}">${c.id}</a>`;
	}

	envRenderer(c: Connection) {
		let env = this.envs.find((e: Environment) => c.envId === e.id);
		return env ? env.name : undefined;
	}


	addConnection(e: CustomEvent) {
		this.dispatch(addConnection());
	}

	editConnection(e: CustomEvent) {
		console.log(e.detail.entry.id);
		this.dispatch(editConnection(e.detail.entry.id));

	}

	removeConnection(e: CustomEvent) {
		this.dispatch(removeConnection(e.detail.entry.id));
	}




	handleEdit(e: MouseEvent) {
		this.editMode = true;
	}


	handleDone(e: MouseEvent) {
		this.editMode = false;
	}


	stateChanged(state: ETLUStore) {
		this.connections = state.connection.connections;
		this.envs = state.connection.environments;
	}
}



export default ConnectionsPageElement;