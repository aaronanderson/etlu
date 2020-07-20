import { html, css, customElement, property } from 'lit-element';
import { Router } from '@vaadin/router'
import { ifDefined } from 'lit-html/directives/if-defined.js';

import { ViewElement } from '../../components/etlu-view';

import { Connection, cancelConnection, saveConnection, readConnection, fetchEnvironments, Environment, createUUID, editConnection, testConnection, TestConnectionResult } from './connection-actions';
import { ETLUStore } from '../../app/store';

import '@aaronanderson/lwdc/wc/lwdc-form-field';
import '@aaronanderson/lwdc/wc/lwdc-text';
import '@aaronanderson/lwdc/wc/lwdc-select';
import '@aaronanderson/lwdc/wc/lwdc-form';
import '@aaronanderson/lwdc/wc/lwdc-button';
import '@aaronanderson/lwdc/wc/lwdc-action-bar';
import '@aaronanderson/lwdc/wc/lwdc-layout-section';



import TextElement from '@aaronanderson/lwdc/wc/lwdc-text';
import SelectElement from '@aaronanderson/lwdc/wc/lwdc-select';
import { ButtonType } from '@aaronanderson/lwdc/wc/lwdc-button'; 




@customElement('etlu-connection-page')
export class ConnectionPageElement extends ViewElement {

	@property({ type: Object })
	targetConnection?: Connection;

	@property({ type: String })
	mode: string = 'view';

	@property({ type: String })
	finishLabel = "Cancel";

	@property({ type: Array })
	envs: Array<Environment> = [];



	firstUpdated() {

		switch (this.mode) {
			case 'add': {
				this.pageTitle = 'Add Connection';
				break
			}
			case 'edit': {
				this.pageTitle = 'Edit Connection';
				break
			}
			default:
				this.pageTitle = 'View Connection';
		}


		if (this.location && this.location.params && this.location.params.connectionId) {
			this.dispatch(readConnection(this.location!.params.connectionId));
		} else if (this.mode == 'view') {
			Router.go('/connections');
		}

		this.dispatch(fetchEnvironments());

	}

	//https://glitch.com/edit/#!/cotton-felidae?path=app.js:116:13
	render() {
		let content = null;
		if (this.targetConnection) {
			content = (this.mode == 'add' || this.mode == 'edit') ? this.modifyTemplate : this.viewTemplate;
		}
		return html`
			
			${this.pageTitleTemplate}
			 
			<section class="etlu-main">
					${this.loadingTemplate}

					${content}
			</section>
			`;
	}

	get viewTemplate() {

		return html`
				<lwdc-form>
						
						<lwdc-form-field label="Description">
								<span>${this.targetConnection!.description}</span>
						</lwdc-form-field>
						

						<lwdc-form-field label="Tenant">
								<span>${this.targetConnection!.tenant}</span>
						</lwdc-form-field>

						<lwdc-form-field label="Environment">
								<span>${this.envRenderer(this.targetConnection)}</span>
						</lwdc-form-field>

						<lwdc-form-field label="Account">
								<span>${this.targetConnection!.account}</span>
						</lwdc-form-field>


			</lwdc-form>

			<lwdc-action-bar>
				<lwdc-button @click="${this.handleEdit}">Edit</lwdc-button>
			</lwdc-action-bar>

		
		`;

	} 

	envRenderer(c?: Connection) {
		if (c) {
			let env = this.envs.find((e: Environment) => c.envId === e.id);
			return env ? env.name : undefined;
		}
	}

	handleEdit(e: MouseEvent) {
		this.dispatch(editConnection(this.targetConnection!.id));
	}

	//<form position-left>
	get modifyTemplate() {
		const { description, tenant, envId, account, password, ejwt, ...rest } = <Connection>this.targetConnection;

		return html`
				${this.toastTemplate}								
				<lwdc-form>
						
					<lwdc-form-field label="Description">
						<lwdc-text name="description" value=${ifDefined(description)}></lwdc-text>
					</lwdc-form-field>

					<lwdc-form-field label="Tenant">
						<lwdc-text name="tenant" required minlength="5" value=${ifDefined(tenant)}></lwdc-text>
					</lwdc-form-field>

					<lwdc-form-field label="Environment">
						<lwdc-select name="env" required  .options=${this.envs} valueId=${ifDefined(envId)}></lwdc-select>
					</lwdc-form-field>

					<lwdc-form-field label="Account">
						<lwdc-text name="account" required minlength="5"  value=${ifDefined(account)}></lwdc-text>
					</lwdc-form-field>

					<lwdc-form-field label="Password">
						<lwdc-text name="password" ?required=${!ejwt} minlength="${ifDefined(!ejwt ? "5" : undefined)}" password="true" value=${ifDefined(password)}></lwdc-text>
					</lwdc-form-field>

					
				</lwdc-form>

		
				<lwdc-action-bar>
					<lwdc-button @click="${this.handleSave}">Save</lwdc-button>
					<lwdc-button @click="${this.handleTest}">Test</lwdc-button>
					<lwdc-button .type=${ButtonType.default} @click="${this.handleCancel}">${this.finishLabel}</lwdc-button>
				</lwdc-action-bar>
		
		`;
	}


	async handleSave(e: MouseEvent) {
		//could use button type="submit but keep it consistent"
		//(this.shadowRoot!.querySelector("form") as HTMLFormElement)!.reset();
		let form = this.shadowRoot!.querySelector("form") as HTMLFormElement;
		if (form) {

			for (let element of Array.from(form.elements)) {
				!element.hasAttribute('formnovalidate') && (<any>element).checkValidity && (<any>element).checkValidity();
			}
			if (form.checkValidity()) {
				this.targetConnection = <Connection>{
					id: this.mode == 'add' && !this.targetConnection!.id ? createUUID() : this.targetConnection!.id,
					tenant: (<TextElement>form.elements.namedItem('tenant'))!.value,
					description: (<TextElement>form.elements.namedItem('description'))!.value,
					envId: (<SelectElement<Connection>>form.elements.namedItem('env'))!.value,
					account: (<TextElement>form.elements.namedItem('account'))!.value,
					password: (<TextElement>form.elements.namedItem('password'))!.value
				}
				await this.dispatch(saveConnection(this.targetConnection));
				this.finishLabel = "Done";
				this.openToast('Connection Saved.');
				//form.reset();
			}

		}
	}

	async handleTest(e: MouseEvent) {
		//could use button type="submit but keep it consistent"
		//(this.shadowRoot!.querySelector("form") as HTMLFormElement)!.reset();
		let form = this.shadowRoot!.querySelector("form") as HTMLFormElement;
		if (form) {

			for (let element of Array.from(form.elements)) {
				!element.hasAttribute('formnovalidate') && (<any>element).checkValidity && (<any>element).checkValidity();
			}
			if (form.checkValidity() && this.targetConnection) {
				this.targetConnection = <Connection>{
					id: this.targetConnection.id,
					tenant: (<TextElement>form.elements.namedItem('tenant'))!.value,
					description: (<TextElement>form.elements.namedItem('description'))!.value,
					envId: (<SelectElement<Connection>>form.elements.namedItem('env'))!.value,
					account: (<TextElement>form.elements.namedItem('account'))!.value,
					password: (<TextElement>form.elements.namedItem('password'))!.value,
					ejwt: this.targetConnection!.ejwt
				}
				await this.dispatch(testConnection(this.targetConnection));
				this.openToast('Test Connection Successful');
				//form.reset();
			}

		}
	}

	handleCancel(e: MouseEvent) {
		this.dispatch(cancelConnection());
	}


	stateChanged(state: ETLUStore) {
		this.loading = state.connection.loading;
		if (state.connection.mode) {
			this.mode = state.connection.mode;
		}
		if (state.connection.targetConnection) {
			this.targetConnection = state.connection.targetConnection;
			this.subPageTitle = state.connection.targetConnection.tenant;
		}
		if (state.connection.environments) {
			this.envs = state.connection.environments;
		}
		this.errorMessage = state.connection.errorMessage;


	}
}





export default ConnectionPageElement;