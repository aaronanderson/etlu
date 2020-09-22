import { ViewElement } from '../../components/etlu-view';
import '@aaronanderson/lwdc/wc/lwdc-table';
import '@aaronanderson/lwdc/wc/lwdc-action-bar';
import '@aaronanderson/lwdc/wc/lwdc-button';
import '@aaronanderson/lwdc/wc/lwdc-layout-section';
import { Project, Environment } from './project-actions';
import { ETLUStore } from '../../app/store';
export declare class ProjectsPageElement extends ViewElement {
    projects: Array<Project>;
    envs: Array<Environment>;
    editMode: boolean;
    firstUpdated(): void;
    render(): import("lit-element").TemplateResult;
    projectRenderer(c: Project): import("lit-element").TemplateResult;
    envRenderer(c: Project): string | undefined;
    addProject(e: CustomEvent): void;
    editProject(e: CustomEvent): void;
    removeProject(e: CustomEvent): void;
    handleEdit(e: MouseEvent): void;
    handleDone(e: MouseEvent): void;
    stateChanged(state: ETLUStore): void;
}
export default ProjectsPageElement;
