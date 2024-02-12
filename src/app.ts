import {KioskApp} from "kiosktsapplib";
import {nothing, TemplateResult, unsafeCSS} from "lit";
import {state, property} from "lit/decorators.js"
import "@vaadin/grid"
import "@vaadin/dialog"
import { html } from "lit/static-html.js";
import "./kioskdialog.ts"

// import { SlDropdown } from "@shoelace-style/shoelace";

// @ts-ignore
import local_css from "./styles/test-app.sass?inline";
import { KioskDialog } from "./kioskdialog.ts";

// noinspection CssUnresolvedCustomProperty
export class TestApp extends KioskApp {
    static styles = unsafeCSS(local_css);
    _messages: { [key: string]: object } = {};

    static properties = {
        ...super.properties,
    };


    constructor() {
        super();
    }

    firstUpdated(_changedProperties: any) {
        console.log("App first updated.");
        super.firstUpdated(_changedProperties);
    }

    apiConnected() {
        console.log("api is connected");
        // this.fetchConstants();
    }

    connectedCallback() {
        super.connectedCallback();
    }


    updated(_changedProperties: any) {
        super.updated(_changedProperties);
        console.log("updated: ", _changedProperties);
        if (_changedProperties.has("relations")) {
            if (this.apiContext) {
                const hm = this.renderRoot.querySelector("#hm");
                // @ts-ignore
                hm.hmNodes = this.relations;
            }
        }
    }

    kioskDialogClosed(e: CustomEvent) {
        alert(e.detail)
    }

    openDialog() {
        let dialog: KioskDialog | undefined | null = this.shadowRoot?.querySelector("#dialog1")
        dialog?.openDialog()
    }

    openDialog2() {
        let dialog: KioskDialog | undefined | null = this.shadowRoot?.querySelector("#dialog2")
        dialog?.openDialog()
    }

    protected renderApp() {
        return html`
            <div class="app-frame dialog-1">
                <kiosk-dialog id="dialog1" heading="this is dialog 1" @kiosk-dialog-closed="${this.kioskDialogClosed}">
                    <!--svg slot="dialog-image" xmlns="http://www.w3.org/2000/svg" width="auto" height="auto" viewBox="0 0 24 24" style="fill: rgba(0, 0, 0, 1);transform: ;msFilter:;"><path d="M11 19.91 10 22h4l-1-2.09c4-.65 7-5.28 7-9.91a8 8 0 0 0-16 0c0 4.63 3.08 9.26 7 9.91zm1-15.66v1.5A4.26 4.26 0 0 0 7.75 10h-1.5A5.76 5.76 0 0 1 12 4.25z"></path></svg-->
                    <div class="dialog-image-icon" slot="dialog-image">
                        <i class="fas fa-lightbulb"></i>
                    </div>
                    <div slot="dialog-content">
                        <span style="color: var(--col-accent-bg-1)">in the Kiosk dialog</span>
                    </div>
                </kiosk-dialog>
                <div style="background-color: black">
                    <span style="color: var(--col-accent-bg-1)">Not in the component</span>
                </div>
                <kiosk-dialog id="dialog2" heading="this is dialog 2" @kiosk-dialog-closed="${this.kioskDialogClosed}">
                    <!--svg slot="dialog-image" xmlns="http://www.w3.org/2000/svg" width="auto" height="auto" viewBox="0 0 24 24" style="fill: rgba(0, 0, 0, 1);transform: ;msFilter:;"><path d="M11 19.91 10 22h4l-1-2.09c4-.65 7-5.28 7-9.91a8 8 0 0 0-16 0c0 4.63 3.08 9.26 7 9.91zm1-15.66v1.5A4.26 4.26 0 0 0 7.75 10h-1.5A5.76 5.76 0 0 1 12 4.25z"></path></svg-->
                    <div class="dialog-image-icon" slot="dialog-image">
                        <i class="fas fa-lightbulb"></i>
                    </div>
                    <div slot="dialog-content">
                        <span style="color: var(--col-accent-bg-1)">in the second Kiosk dialog</span>
                    </div>
                </kiosk-dialog>
            </div>
        `
    }

    protected renderToolbar() {
        return html`
            <div class="toolbar">
                <div class="toolbar-section">
                    <div class="toolbar-button"
                         @click="${this.openDialog}">
                        <i class="fas fa-expand"></i>
                    </div>
                    <div class="toolbar-button"
                         @click="${this.openDialog2}">
                        <i class="fas fa-reload"></i>
                    </div>
                </div>
                <div class="toolbar-buttons">
                </div>
            </div>`;
    }

    // apiRender is only called once the api is connected.
    apiRender() {
        let dev: TemplateResult | typeof nothing = html``;
        // @ts-ignore
        if (import.meta.env.DEV) {
            dev = html`
                <div>
                    <div class="logged-in-message">logged in! Api is at ${this.apiContext.getApiUrl()}</div>
                    <div class="dev-tool-bar"><label>Open identifier:</label>
                    </div>
                </div>`;
        } else {
            dev = nothing;

        }
        let toolbar = this.renderToolbar();
        const app = html`${this.renderApp()}`;
        return html`<div class="header-frame">${dev}${toolbar}</div>${app}`;
    }
}

window.customElements.define("test-app", TestApp);
