import { LitElement, html, css, customElement, property } from 'lit-element';

import { connect, store, ETLUStore } from '../app/store';

import '@aaronanderson/lwdc/wc/lwdc-loading';
import '@aaronanderson/lwdc/wc/lwdc-toast';
import '@aaronanderson/lwdc/wc/lwdc-page-header';
import { coreStyle } from '@aaronanderson/lwdc/wc/lwdc-core';

import { checkIcon, xIcon } from '@workday/canvas-system-icons-web';


import ToastElement from '@aaronanderson/lwdc/wc/lwdc-toast';
import { Router } from '@vaadin/router';



export class ViewElement extends connect<ETLUStore>(store)(LitElement) {

	@property({ type: String, attribute: 'page-title', reflect: true })
	pageTitle?: string;

	@property({ type: String, attribute: 'page-sub-title', reflect: true })
	subPageTitle?: string;

	@property({ type: Boolean })
	loading?: boolean = false;

	@property({ type: String })
	loadingMessage = "";

	@property({ type: String })
	errorMessage?: string;

	location?: Router.Location;

	//lwdc-section-row

	static get styles() {
		return [coreStyle, viewStyle, css`
		
			lwdc-section-row {
				display: block;
				margin: 16px 0px;
			}
		
		`];
	}

	get pageTitleTemplate() {
		return html`<lwdc-page-header title="${this.pageTitle}" ?sub-title="${this.subPageTitle}"></lwdc-page-header>`;
	}


	get subPageTitleTemplate() {
		if (this.subPageTitle) {
			return html`<div class="wdc-page-sub-header-title">${this.subPageTitle}</div>`;
		}
	}

	get loadingTemplate() {
		if (this.loading) {
			return html`<div class="etlu-loading-container">
							<h3 class="wdc-type-h3">${this.loadingMessage}</h3>
							<lwdc-loading></lwdc-loading>
						</div>`;
		}
	}

	get toast() {
		return this.shadowRoot && this.shadowRoot.querySelector("lwdc-toast") as ToastElement;
	}

	get toastTemplate() {
		return html`<lwdc-toast class="etlu-toast"></lwdc-toast>`;
	}

	closeToast() {
		closeToast(this.shadowRoot);
	}

	openToast(message: string = 'Success') {
		openToast(this.errorMessage ? this.errorMessage : message, !!this.errorMessage, this.shadowRoot);

	}


}

export const openToast = (message: string, isError: boolean = false, shadowRoot: ShadowRoot | null, ) => {
	const toast = shadowRoot && shadowRoot.querySelector("lwdc-toast") as ToastElement;
	if (toast) {
		if (!isError) {
			toast.icon = checkIcon;
			toast.iconColor = 'greenApple400';
			toast.message = message;
		} else {
			toast.icon = xIcon;
			toast.iconColor = 'cinnamon500';
			toast.message = message;
		}
		toast.open();
	}
}

export const closeToast = (shadowRoot: ShadowRoot | null) => {
	const toast = shadowRoot && shadowRoot.querySelector("lwdc-toast") as ToastElement;
	if (toast) {
		toast.close();
	}
}

export const viewStyle = css`

	.etlu-main {
		position: relative; 
		margin-top: 10vh; 
		display: flex; 
		flex-flow: column; 
		align-items: center;
		height: 80vh;
	} 

	.etlu-main > * {
		margin-bottom: 24px;
	}

	.etlu-main > lwdc-action-bar {
		margin-top: auto;
		margin-bottom: 10vh;
	}

	.etlu-toast {
		position:absolute; 
		z-index: 1;
		top:-125px;  
		left: 50%; 
		margin-left: -150px;
	}
	
	.etlu-scroll-container {
		display: block;
		overflow: auto;
		max-height: 500px;
		width: 80%;

	}
	
	.etlu-loading-container {
		display: flex;
		align-items: center;	
		margin: 16px;
	}

	.etlu-loading-container > *{
		margin: 8px;
	}
	

`;



