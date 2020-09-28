import { html, css, customElement, property } from 'lit-element';
import { Router } from '@vaadin/router'
import { ifDefined } from 'lit-html/directives/if-defined.js';

import { ViewElement } from '../../components/etlu-view';

import { Project, cancelProject, saveProject, readProject, fetchEnvironments, Environment, createUUID, editProject, testProject, TestProjectResult } from './project-actions';
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




@customElement('etlu-project-page')
export class ProjectPageElement extends ViewElement {

	@property({ type: Object })
	targetProject?: Project;

	@property({ type: String })
	mode: string = 'view';

	@property({ type: String })
	finishLabel = "Cancel";

	@property({ type: Array })
	envs: Array<Environment> = [];



	firstUpdated() {

		switch (this.mode) {
			case 'add': {
				this.pageTitle = 'Add Project';
				break
			}
			case 'edit': {
				this.pageTitle = 'Edit Project';
				break
			}
			default:
				this.pageTitle = 'View Project';
		}


		if (this.location && this.location.params && this.location.params.projectId) {
			this.dispatch(readProject(this.location!.params.projectId));
		} else if (this.mode == 'view') {
			Router.go('/projects');
		}

		this.dispatch(fetchEnvironments());

	}

	//https://glitch.com/edit/#!/cotton-felidae?path=app.js:116:13
	render() {
		let content = null;
		if (this.targetProject) {
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
								<span>${this.targetProject!.description}</span>
						</lwdc-form-field>
						

						<lwdc-form-field label="Tenant">
								<span>${this.targetProject!.tenant}</span>
						</lwdc-form-field>

						<lwdc-form-field label="Environment">
								<span>${this.envRenderer(this.targetProject)}</span>
						</lwdc-form-field>

						<lwdc-form-field label="Account">
								<span>${this.targetProject!.account}</span>
						</lwdc-form-field>


			</lwdc-form>

			<lwdc-action-bar>
				<lwdc-button @click="${this.handleEdit}">Edit</lwdc-button>
			</lwdc-action-bar>

		
		`;

	}

	envRenderer(c?: Project) {
		if (c) {
			let env = this.envs.find((e: Environment) => c.envId === e.id);
			return env ? env.name : undefined;
		}
	}

	handleEdit(e: MouseEvent) {
		this.dispatch(editProject(this.targetProject!.id));
	}

	//<form position-left>
	get modifyTemplate() {
		const { description, tenant, envId, account, password, ejwt, ...rest } = <Project>this.targetProject;

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
				this.targetProject = <Project>{
					id: this.mode == 'add' && !this.targetProject!.id ? createUUID() : this.targetProject!.id,
					tenant: (<TextElement>form.elements.namedItem('tenant'))!.value,
					description: (<TextElement>form.elements.namedItem('description'))!.value,
					envId: (<SelectElement<Project>>form.elements.namedItem('env'))!.value,
					account: (<TextElement>form.elements.namedItem('account'))!.value,
					password: (<TextElement>form.elements.namedItem('password'))!.value
				}
				await this.dispatch(saveProject(this.targetProject));
				this.finishLabel = "Done";
				this.openToast('Project Saved.');
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
			if (form.checkValidity() && this.targetProject) {
				this.targetProject = <Project>{
					id: this.targetProject.id,
					tenant: (<TextElement>form.elements.namedItem('tenant'))!.value,
					description: (<TextElement>form.elements.namedItem('description'))!.value,
					envId: (<SelectElement<Project>>form.elements.namedItem('env'))!.value,
					account: (<TextElement>form.elements.namedItem('account'))!.value,
					password: (<TextElement>form.elements.namedItem('password'))!.value,
					ejwt: this.targetProject!.ejwt
				}
				await this.dispatch(testProject(this.targetProject));
				this.openToast('Test Project Successful');
				//form.reset();
			}

		}
	}

	handleCancel(e: MouseEvent) {
		this.dispatch(cancelProject());
	}


	stateChanged(state: ETLUStore) {
		this.loading = state.project.loading;
		if (state.project.mode) {
			this.mode = state.project.mode;
		}
		if (state.project.targetProject) {
			this.targetProject = state.project.targetProject;
			this.subPageTitle = state.project.targetProject.tenant;
		}
		if (state.project.environments) {
			this.envs = state.project.environments;
		}
		this.errorMessage = state.project.errorMessage;


	}
}





export default ProjectPageElement;