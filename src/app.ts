import {
    KioskApp,
    fetchConstants,
    getRecordTypeAliases,
    FetchException,
    handleCommonFetchErrors,
    Constant, AnyDict, BeforeEvent,
} from "kiosktsapplib";
import {TemplateResult, unsafeCSS} from "lit";
import "@vaadin/grid"
import "@vaadin/combo-box"
import "@vaadin/dialog"
import { html } from "lit/static-html.js";
import "./kiosktzcombobox.ts"
import "./kioskcontextselector.ts"
import "./kiosklightbox.ts";



// import { SlDropdown } from "@shoelace-style/shoelace";

// @ts-ignore
import local_css from "./styles/test-app.sass?inline";
import { KioskContextSelector } from "./kioskcontextselector.ts";
import { state } from "lit/decorators.js";
import { KioskLightbox } from "./kiosklightbox.ts";

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
        // setTimeout(() => {this.openDialog()},0)
    }

    kioskDialogClosed(e: CustomEvent) {
        console.log(e.detail)
    }

    openDialog() {
        let selector: KioskContextSelector | undefined | null = this.shadowRoot?.querySelector("kiosk-context-selector")
        selector?.openDialog()
    }

    openLightbox() {
        let lightBox: KioskLightbox | undefined | null = this.shadowRoot?.querySelector("kiosk-lightbox")
        if (!lightBox) return
        const urlProvider = {
            url: "",
            apiContext: this.apiContext,
            get width() {
                return 5000;
            },
            get height() {
                return 5000;
            },
            bof: function () {return true},
            eof: function () {return false},
            prev: function() { return false},
            next: function () {
                const url = this.apiContext.getFetchURL(
                    "",
                    `files/file`,
                    {
                        method: "GET",
                        caller: "kioskview.fetchFileFromApi",
                    },
                    "v1",
                    new URLSearchParams({
                        uuid: "e70c9939-3e67-43e7-845c-e36b5a4e88e0",
                    })).url;
                if (url) {
                    this.url = url
                    return true
                }
                return false
            }
        }
        lightBox.setURLProvider(urlProvider)
        lightBox.resolutions = ["Best", "8K", "Master", "medium", "small"]
        lightBox.addEventListener("ResolutionChanged", (() => {
            alert("Resolution has changed")
        }))
        lightBox?.openDialog()
    }

    showHideLightbox() {
        let lightBox: KioskLightbox | undefined | null = this.shadowRoot?.querySelector("kiosk-lightbox")
        lightBox?.showHideUI()
    }


    beforeCloseLightbox(e: BeforeEvent) {
        const defObj = e.detail.defer(e)
        setTimeout(()=>defObj.finish(),1000)
    }

    lightBoxClosed() {
        alert("Ligthbox closed")
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
            <div class="">
                <kiosk-tz-combo-box style="display:block;max-width: 500px"
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
                    <div class="toolbar-button"
                         @click="${this.openLightbox}">
                        <i class="fas fa-dragon"></i>
                    </div>
                    <div class="toolbar-button"
                         style="z-index: 200"
                         @click="${this.showHideLightbox}">
                        
                        <i class="fas fa-hide"></i>
                    </div>
                </div>
                <div class="toolbar-buttons">
                </div>
            </div>`;
    }

    imageOpened(e: CustomEvent) {
        if (e.detail.result)
            alert("opened")
        else
            alert("open failed")
    }

    imageBeforeOpen( ) {
        // const defObj = e.detail.defer(e)
        // setTimeout(() => {
        //     defObj.finish()
        // }, 3000)
    }

    renderKioskLightbox() {
        return html`
            <kiosk-lightbox .apiContext="${this.apiContext}" hasData 
                            @opened="${this.imageOpened}"
                            @beforeOpen="${this.imageBeforeOpen}"
                            @beforeClose="${this.beforeCloseLightbox}" 
                            @closed="${this.lightBoxClosed}">
                <form>
                    <label for="i1">input 1</label><input name="i1" type="text"/>
                    <label for="i2">input 2</label><input type="i2"/>
<!--                    <label for="i3">input 3</label><input type="i3"/>-->
<!--                    <label for="i4">input 4</label><input type="i4"/>-->
                </form>
            </kiosk-lightbox>
        `
    }


    // apiRender is only called once the api is connected.
    apiRender() {
        let dev: TemplateResult
        // @ts-ignore
        if (import.meta.env.DEV) {
            dev = html`
                <div>
                    <div class="logged-in-message">logged in! Api is at ${this.apiContext.getApiUrl()}</div>
                    <div class="dev-tool-bar"><label>Open identifier:</label>
                    </div>
                </div>`;
        } else {
            dev = html``;

        }
        let toolbar = this.renderToolbar();
        // const app = html``
        const app = html`
            ${this.renderContextSelectorApp()}
            ${this.renderKioskTZComboBoxApp()}
            ${this.renderKioskLightbox()}
        `;
        return html`<div class="header-frame">${dev}${toolbar}</div>${app}`;
    }
}

window.customElements.define("test-app", TestApp);
