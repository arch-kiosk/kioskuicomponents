// @ts-ignore
import local_css from "./styles/kiosk-context-selector.sass?inline";

import { html, css, TemplateResult, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
    ApiResultContextsFull,
    KioskAppComponent,
    FetchException,
    handleCommonFetchErrors,
    ApiResultContextsFullIdentifierInformation,
    recordType2Name,
} from "kiosktsapplib";
import { registerStyles } from "@vaadin/vaadin-themable-mixin/register-styles.js";
import "./kioskdialog.ts";
import { KioskDialog } from "./kioskdialog";
import { AnyDict } from "kiosktsapplib";
import { GridActiveItemChangedEvent } from "@vaadin/grid";
import { columnBodyRenderer, GridColumnBodyLitRenderer } from "@vaadin/grid/lit";

@customElement("kiosk-context-selector")
export class KioskContextSelector extends KioskAppComponent {
    static styles = unsafeCSS(local_css);

    static properties = {
        ...super.properties,
    };

    @property()
    protected constants: AnyDict = {};

    @property()
    protected accessor identifiers: Array<ApiResultContextsFullIdentifierInformation> = [];

    @state()
    protected accessor _identifiers: Array<ApiResultContextsFullIdentifierInformation> = [];

    @property()
    private searchIdentifier: string = "";

    @property()
    heading: string = "select archaeological entity";

    @property()
    identifierColumnTitle: string = "entity";

    @property()
    initialRecordType: string = "unit";

    @property()
    private accessor selectedItems: Array<ApiResultContextsFullIdentifierInformation> = [];

    @property()
    public accessor recordTypeAliases: AnyDict = {};

    @property()
    public recordTypeFilter: Array<string> = [];

    constructor() {
        super();
        registerStyles("vaadin-grid", css`
            :host [part~="header-cell"] ::slotted(vaadin-grid-cell-content), [part~="footer-cell"] ::slotted(vaadin-grid-cell-content), [part~="reorder-ghost"] {
                font-weight: bold
            }
        `);
    }

    updated(_changedProperties: any) {
        super.updated(_changedProperties);
        if (_changedProperties.has("apiContext")) {
            this.apiConnected();
        }
        if (_changedProperties.has("selectedItems")) {
            if (this.selectedItems.length > 0) {
                const dlg: KioskDialog | undefined | null = this.shadowRoot?.querySelector("kiosk-dialog") as KioskDialog;
                if (dlg) {
                    setTimeout(() => {
                        const event = new CustomEvent("closeSelection", {
                            detail: this.selectedItems[0]
                        })
                        this.dispatchEvent(event);
                        dlg.closeDialog()
                    }, 250);
                }
            }
        }
    }

    willUpdate(_changedProperties: any) {
        if (_changedProperties.has("identifiers") || _changedProperties.has("recordTypeFilter")) {
            this.prepareIdentifiers();
        }
    }

    apiConnected() {
        console.log("fetching identifiers");
        if (!this.identifiers || this.identifiers.length == 0)
            this.fetchIdentifiers();
    }

    fetchIdentifiers() {
        this.apiContext.fetchFromApi(
            "",
            "contexts/full",
            {
                method: "GET",
                caller: "app.fetchIdentifiers",
            })
            .then((json: ApiResultContextsFull) => {
                this.identifiers = json.identifiers;
                console.log("identifier information fetched", this.identifiers);
            })
            .catch((e: FetchException) => {
                this.showProgress = false;
                // handleFetchError(msg)
                console.log("fetching identifier information failed");
                handleCommonFetchErrors(this, e, "loadConstants");
            });
    }

    prepareIdentifiers() {
        console.log("prepare identifiers");
        if (this.recordTypeFilter.length > 0) {
            this._identifiers = this.identifiers.filter((identifier) => this.recordTypeFilter.includes(identifier.record_type.toLowerCase()));
        } else {
            this._identifiers = this.identifiers;
        }
    }

    filterIdentifiers() {
        if (this.searchIdentifier === "" && this.initialRecordType !== "") {
            return this._identifiers.filter((identifier) => identifier.record_type === this.initialRecordType);
        } else {
            if (this.searchIdentifier || this._identifiers.length < 50)
                return this._identifiers.filter((identifier) => identifier.identifier.toLowerCase().startsWith(this.searchIdentifier));
            else
                return []
        }
    }


    public openDialog() {
        let dlg: KioskDialog | undefined | null = this.shadowRoot?.querySelector("kiosk-dialog") as KioskDialog;
        dlg.openDialog();
    }

    searchChanged(e: Event) {
        let text = (<HTMLInputElement>e.target).value;
        this.searchIdentifier = text.toLowerCase();

    }

    private cellRenderer: GridColumnBodyLitRenderer<AnyDict> = (row) => {
        const cellValue = recordType2Name(this.recordTypeAliases, row["record_type"]);
        return html`
            <div>
                ${cellValue}
            </div>`;
    };

    activeItemChanged(e: GridActiveItemChangedEvent<ApiResultContextsFullIdentifierInformation>) {
        const item = e.detail.value;
        if (item) {
            this.selectedItems = [item];
        }
    }



    renderGrid() {
        return html`
            <vaadin-grid id="grid" class="selection-grid"
                         .items=${this.filterIdentifiers()}
                         .selectedItems="${this.selectedItems}"
                         @active-item-changed="${this.activeItemChanged}">
                <vaadin-grid-column header="${this.identifierColumnTitle}" path="identifier"></vaadin-grid-column>
                <vaadin-grid-column header="type" ${columnBodyRenderer(this.cellRenderer, [])}></vaadin-grid-column>
            </vaadin-grid>
        `;
    }

    apiRender(): TemplateResult {
        return html`
            <kiosk-dialog api heading="${this.heading}">
                <!--svg slot="dialog-image" xmlns="http://www.w3.org/2000/svg" width="auto" height="auto" viewBox="0 0 24 24" style="fill: rgba(0, 0, 0, 1);transform: ;msFilter:;"><path d="M11 19.91 10 22h4l-1-2.09c4-.65 7-5.28 7-9.91a8 8 0 0 0-16 0c0 4.63 3.08 9.26 7 9.91zm1-15.66v1.5A4.26 4.26 0 0 0 7.75 10h-1.5A5.76 5.76 0 0 1 12 4.25z"></path></svg-->
                <div slot="dialog-image">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                         style="fill: rgba(0, 0, 0, 1);transform: ;msFilter:;">
                        <path d="M4 22h12v-2H4V8H2v12c0 1.103.897 2 2 2z"></path>
                        <path
                            d="M20 2H8c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm-2 9h-3v3h-2v-3h-3V9h3V6h2v3h3v2z"></path>
                    </svg>
                </div>
                <div slot="dialog-content">
                    <label for="identifier">search word expands selection</label>
                    <input id="identifier" type="text" @input="${this.searchChanged}" autofocus>
                    ${this.renderGrid()}
                </div>
            </kiosk-dialog>
        `;
    }
}