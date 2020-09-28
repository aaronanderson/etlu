import { html, css, customElement, property } from 'lit-element';

import { ViewElement } from '../../components/etlu-view';
import '@aaronanderson/lwdc/wc/lwdc-table';
import '@aaronanderson/lwdc/wc/lwdc-action-bar';
import '@aaronanderson/lwdc/wc/lwdc-button';
import '@aaronanderson/lwdc/wc/lwdc-layout-section';

import { Project, fetchProjects, addProject, editProject, removeProject, fetchEnvironments, Environment } from './project-actions';


import { ETLUStore } from '../../app/store';

@customElement('etlu-projects-page')
export class ProjectsPageElement extends ViewElement {

	@property({ type: Array })
	projects: Array<Project> = [];

	@property({ type: Array })
	envs: Array<Environment> = [];

	@property({ type: Boolean })
	editMode: boolean = false;


	firstUpdated() {
		this.pageTitle = 'Projects';
		this.dispatch(fetchProjects());
		this.dispatch(fetchEnvironments());


	}

	render() {

		return html`
			${this.pageTitleTemplate}

			<section class="etlu-main">
				<div class="etlu-scroll-container">
						<lwdc-table name="Projects" .entries=${this.projects} .editMode=${this.editMode} @lwdc-table-add=${this.addProject} @lwdc-table-edit=${this.editProject} @lwdc-table-remove=${this.removeProject}>
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


	projectRenderer(c: Project) {
		return html`<a class="wdc-type-variant-link" href="/project/${c.id}">${c.id}</a>`;
	}

	envRenderer(c: Project) {
		let env = this.envs.find((e: Environment) => c.envId === e.id);
		return env ? env.name : undefined;
	}


	addProject(e: CustomEvent) {
		this.dispatch(addProject());
	}

	editProject(e: CustomEvent) {
		console.log(e.detail.entry.id);
		this.dispatch(editProject(e.detail.entry.id));

	}

	removeProject(e: CustomEvent) {
		this.dispatch(removeProject(e.detail.entry.id));
	}




	handleEdit(e: MouseEvent) {
		this.editMode = true;
	}


	handleDone(e: MouseEvent) {
		this.editMode = false;
	}


	stateChanged(state: ETLUStore) {
		this.projects = state.project.projects;
		this.envs = state.project.environments;
	}
}



export default ProjectsPageElement;