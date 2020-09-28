import {
	FETCH_PROJECTS, ProjectState, READ_PROJECT, CANCEL_PROJECT, SAVE_PROJECT, ADD_PROJECT, EDIT_PROJECT, REMOVE_PROJECT, Project, FETCH_ENVIRONMENTS_SUCCESS, TEST_PROJECT, TEST_PROJECT_SUCCESS, TEST_PROJECT_ERROR, TestProjectResult, SAVE_PROJECT_SUCCESS, SAVE_PROJECT_ERROR
} from './project-actions'

import produce from 'immer'



const initialState: ProjectState = {
	projects: [],
	environments: [],
	mode: 'view',
	loading: false,

}

const project = (state: ProjectState = initialState, action: any) => {
	return produce(state, (draft: ProjectState) => {
		//console.log("client reducer", action);
		switch (action.type) {
			case CANCEL_PROJECT: {
				draft.mode = 'view';
				draft.targetProject = undefined;
				break
			}
			case ADD_PROJECT: {
				draft.mode = 'add';
				draft.targetProject = <Project>{};
				break
			}
			case SAVE_PROJECT: {
				draft.loading = true;
				break
			}
			case SAVE_PROJECT_SUCCESS: {
				draft.errorMessage = undefined;
				draft.targetProject = action.payload.targetProject;
				draft.projects = action.payload.projects;
				draft.loading = false;
				break
			}
			case SAVE_PROJECT_ERROR: {
				draft.errorMessage = action.payload.error;
				draft.loading = false;
				break
			}
			case EDIT_PROJECT: {
				draft.mode = 'edit';
				draft.targetProject = action.payload.targetProject;
				break
			}
			case REMOVE_PROJECT: {
				draft.projects = action.payload.projects;
				break
			}
			case FETCH_PROJECTS: {
				draft.projects = action.payload.projects;
				break
			}
			case READ_PROJECT: {
				draft.targetProject = action.payload.project;
				break
			}
			case FETCH_ENVIRONMENTS_SUCCESS: {
				draft.environments = action.payload.environments;
				break
			}			
			default:
				return draft
		}
	});
}



export default project