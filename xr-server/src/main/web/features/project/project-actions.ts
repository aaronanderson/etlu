import { Router } from '@vaadin/router'

export const FETCH_ENVIRONMENTS = 'FETCH_ENVIRONMENTS'
export const FETCH_ENVIRONMENTS_SUCCESS = 'FETCH_ENVIRONMENTS_SUCCESS'
export const FETCH_ENVIRONMENTS_ERROR = 'FETCH_ENVIRONMENTS_ERROR'


export const TEST_PROJECT = 'TEST_PROJECT'
export const TEST_PROJECT_SUCCESS = 'TEST_PROJECT_SUCCESS'
export const TEST_PROJECT_ERROR = 'TEST_PROJECT_ERROR'

export const SAVE_PROJECT = 'SAVE_PROJECT'
export const SAVE_PROJECT_SUCCESS = 'SAVE_PROJECT_SUCCESS'
export const SAVE_PROJECT_ERROR = 'SAVE_PROJECT_ERROR'

export const READ_PROJECT = 'READ_PROJECT'
export const CANCEL_PROJECT = 'CANCEL_PROJECT'
export const ADD_PROJECT = 'ADD_PROJECT'
export const EDIT_PROJECT = 'EDIT_PROJECT'
export const REMOVE_PROJECT = 'REMOVE_PROJECT'


export const FETCH_PROJECTS = 'FETCH_PROJECTS'



export interface ProjectState {
	mode: string;
	loading: boolean;
	projects: Array<Project>;
	environments: Array<Environment>;
	targetProject?: Project;
	errorMessage?: string;
}


export const fetchEnvironments: any = () => async (dispatch: any, getState: any) => {

	//lazy load
	if (getState().project.environments.length == 0) {
		dispatch({ type: FETCH_ENVIRONMENTS });

		try {
			const response = await fetch("/api/project/envs", {
				method: 'GET'
			});
			const environments: Array<Environment> = await response.json();
			if (!response.ok) {
				throw Error(response.statusText);
			}
			//console.log('Success:', JSON.stringify(result));
			dispatch({ type: FETCH_ENVIRONMENTS_SUCCESS, payload: { environments: environments } })
		} catch (error) {
			console.error('Error:', error);
			dispatch({ type: FETCH_ENVIRONMENTS_ERROR, payload: { error: error } })
		}
	}


}


export const testProject: any = (project: Project) => async (dispatch: any) => {
	//console.log("testProject");
	dispatch({ type: TEST_PROJECT, payload: { targetProject: project } });

	try {
		const response = await fetch("/api/project/test", {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(project)
		});
		const result: TestProjectResult = await response.json();
		if (!response.ok) {
			throw Error(response.statusText);
		}
		if (result.status != "ok") {
			throw Error(result.message);
		}
		//console.log('Success:', JSON.stringify(result));
		dispatch({ type: TEST_PROJECT_SUCCESS, payload: { targetProject: project } })
	} catch (error) {
		console.error('Error:', error);
		dispatch({ type: TEST_PROJECT_ERROR, payload: { error: error } })
	}


}

export const fetchProjects: any = () => async (dispatch: any) => {
	//console.log("fetchProjects");
	let projectsValue = window.localStorage.getItem('projects');
	let projects = projectsValue ? JSON.parse(projectsValue) : {};
	dispatch({ type: FETCH_PROJECTS, payload: { projects: Object.values(projects) } })
}

export const readProject: any = (projectId: string) => async (dispatch: any) => {
	let projectsValue = window.localStorage.getItem('projects');
	let projects = projectsValue ? JSON.parse(projectsValue) : {};
	let project = projects[projectId];
	dispatch({ type: READ_PROJECT, payload: { project: project } });
}

export const addProject: any = () => async (dispatch: any) => {
	dispatch({ type: ADD_PROJECT });
	Router.go('/project');
}

export const saveProject: any = (project: Project) => async (dispatch: any) => {
	dispatch({ type: SAVE_PROJECT, payload: { project: project } });
	try {
		const response = await fetch("/api/project/ejwt", {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(project)
		});
		const result: ProjectEncryptResult = await response.json();
		if (!response.ok) {
			throw Error(response.statusText);
		}
		project.ejwt = result.ejwt;
		project.password = undefined;
		//console.log('Success:', JSON.stringify(result));
		let projectsValue = window.localStorage.getItem('projects');
		let projects = projectsValue ? JSON.parse(projectsValue) : {};
		projects[project.id] = project;
		window.localStorage.setItem('projects', JSON.stringify(projects));
		dispatch({ type: SAVE_PROJECT_SUCCESS, payload: { targetProject: project, projects: Object.values(projects) } });
	} catch (error) {
		console.error('Error:', error);
		dispatch({ type: SAVE_PROJECT_ERROR, payload: { error: error } })
	}



}

export const editProject: any = (projectId: string) => async (dispatch: any) => {
	let projectsValue = window.localStorage.getItem('projects');
	let projects = projectsValue ? JSON.parse(projectsValue) : {};
	let project = projects[projectId];
	dispatch({ type: EDIT_PROJECT, payload: { targetProject: project } });
	Router.go(`/project/${projectId}`);
}

export const removeProject: any = (projectId: string) => async (dispatch: any) => {
	let projectsValue = window.localStorage.getItem('projects');
	let projects = projectsValue ? JSON.parse(projectsValue) : {};
	delete projects[projectId];
	window.localStorage.setItem('projects', JSON.stringify(projects));
	dispatch({ type: REMOVE_PROJECT, payload: { projects: Object.values(projects) } });
}

export const cancelProject: any = () => async (dispatch: any) => {
	dispatch({ type: CANCEL_PROJECT });
	Router.go('/projects');
}



export interface Project {
	id: string
	tenant: string;
	description?: string;
	envId: string;
	account: string;
	password?: string;
	ejwt?: string;

}

export interface Credential {
	projectId: string
	account: string;
	password: string;

}

export interface Environment {
	id: string
	name: string
}

export interface TestProjectResult {
	status: string
	message: string
}

export interface ProjectEncryptResult {
	ejwt: string
}

export const createUUID = function () {
	var dt = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (dt + Math.random() * 16) % 16 | 0;
		dt = Math.floor(dt / 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
	return uuid;
}
