import {
    KioskApp,
    fetchConstants,
    getRecordTypeAliases,
    FetchException,
    handleCommonFetchErrors,
    Constant, AnyDict,
} from "kiosktsapplib";
import {nothing, TemplateResult, unsafeCSS} from "lit";
import "@vaadin/grid"
import "@vaadin/combo-box"
import "@vaadin/dialog"
import { html } from "lit/static-html.js";
import "./kiosktzcombobox.ts"


// import { SlDropdown } from "@shoelace-style/shoelace";

// @ts-ignore
import local_css from "./styles/test-app.sass?inline";
import { KioskContextSelector } from "./kioskcontextselector.ts";
import { state } from "lit/decorators.js";

// noinspection CssUnresolvedCustomProperty
export class TestApp extends KioskApp {
    static styles = unsafeCSS(local_css);
    _messages: { [key: string]: object } = {};

    static properties = {
        ...super.properties,
    };

    private constants: Constant[] = [];

    @state()
    private recordTypeAliases: AnyDict = {};


    constructor() {
        super();
    }

    firstUpdated(_changedProperties: any) {
        console.log("App first updated.");
        super.firstUpdated(_changedProperties);
    }

    apiConnected() {
        console.log("api is connected");
        fetchConstants(this.apiContext)
        .then((constants) => {
            this.constants = constants
            this.recordTypeAliases = getRecordTypeAliases(this.constants)
            console.log(`record type aliases fetched`,this.recordTypeAliases)
        })
        .catch((e: FetchException) => {
            this.showProgress = false
            // handleFetchError(msg)
            handleCommonFetchErrors(this, e, "loadConstants");
        });
    }

    connectedCallback() {
        super.connectedCallback();
    }

    updated(_changedProperties: any) {
        super.updated(_changedProperties);
        setTimeout(() => {this.openDialog()},0)
    }

    kioskDialogClosed(e: CustomEvent) {
        console.log(e.detail)
    }

    openDialog() {
        let selector: KioskContextSelector | undefined | null = this.shadowRoot?.querySelector("kiosk-context-selector")
        selector?.openDialog()
    }

    protected renderContextSelectorApp() {
        return html`
            <div class="app-frame dialog-1">
                <kiosk-context-selector 
                    .apiContext="${this.apiContext}" 
                    .recordTypeAliases="${this.recordTypeAliases}"
                    .recordTypeFilter="${['unit','locus']}"
                    initialRecordType=""
                    @closeSelection="${this.kioskDialogClosed}"></kiosk-context-selector>
            </div>
        `
    }

    protected renderKioskTZComboBoxApp() {
        return html`
            <div class="app-frame dialog-1">
                <kiosk-tz-combo-box disabled style="display:block;max-width: 500px"
                    .apiContext="${this.apiContext}" 
                </kiosk-tz-combo-box>
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
                </div>
                <div class="toolbar-buttons">
                </div>
            </div>`;
    }

    // apiRender is only called once the api is connected.
    apiRender() {
        let dev: TemplateResult | typeof nothing;
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
        const app = html`${this.renderKioskTZComboBoxApp()}`;
        return html`<div class="header-frame">${dev}${toolbar}</div>${app}`;
    }
}

window.customElements.define("test-app", TestApp);
