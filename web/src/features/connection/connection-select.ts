import { html, customElement, property, LitElement, css } from 'lit-element';


import { Connection, fetchConnections, Environment, fetchEnvironments } from './connection-actions';

import '@aaronanderson/lwdc/wc/lwdc-form-field';
import '@aaronanderson/lwdc/wc/lwdc-select';
import '@aaronanderson/lwdc/wc/lwdc-button';
import SelectElement from '@aaronanderson/lwdc/wc/lwdc-select';


import { ETLUStore, store, connect } from '../../app/store';
import { ifDefined } from 'lit-html/directives/if-defined';


@customElement('etlu-connection-select')
export class ConnectionSelectElement extends connect<ETLUStore>(store)(LitElement) {

	@property({ type: Boolean, attribute: true, reflect: true })
	disabled = false;

	@property({ type: Array })
	connections: Array<Connection> = [];

	@property({ type: Array })
	envs: Array<Environment> = [];

	_connectionId?: String | undefined;


	//disable shadow DOM so containing wdc-form class relative css can be applied
	//https://github.com/Polymer/lit-element/issues/824#issuecomment-536093753
	createRenderRoot() {
		return this;
	}

	static get styles() {
		return [css`:host {
			display: contents;
		}`];
	}

	firstUpdated() {
		this.dispatch(fetchConnections());
		this.dispatch(fetchEnvironments());
	}


	render() {

		return html`<lwdc-form-field label="Connection">
						<lwdc-select name="connection" required ?disabled=${this.disabled} .options=${this.connections} .nameSelector=${this.nameSelector.bind(this)} .valueId=${this._connectionId}></lwdc-select>
					</lwdc-form-field>`;
	}

	set connectionId(connectionId: String | undefined) {
		this._connectionId = connectionId;
	}

	get connectionId() {
		return this.connectionSelect!.value;
	}

	get connectionSelect() {
		return this.querySelector('lwdc-select') as SelectElement<any>;
	}

	nameSelector(c: Connection) {
		if (this.envs) {
			let env = this.envs.find((e: Environment) => c.envId === e.id);
			let envName = env ? env.name : undefined;
			return envName ? c.tenant + " - " + envName : c.tenant;
		}
		return;
	}

	stateChanged(state: ETLUStore) {
		this.connections = state.connection.connections;
		this.envs = state.connection.environments;
	}

}



export default ConnectionSelectElement;