// @ts-ignore
import local_css from "./styles/kiosk-tz-combo-box.sass?inline";

import { html, TemplateResult, unsafeCSS } from "lit";
import { customElement, state, property } from "lit/decorators.js";
import {
    KioskAppComponent,
    KioskTimeZones, TimeZone,
} from "kiosktsapplib";
// import { registerStyles } from "@vaadin/vaadin-themable-mixin/register-styles.js";
import "./kioskdialog.ts";
import { AnyDict } from "kiosktsapplib";

@customElement("kiosk-tz-combo-box")
export class KioskTZComboBox extends KioskAppComponent {
    static styles = unsafeCSS(local_css);

    static properties = {
        ...super.properties,
    };

    private kioskTimeZones: KioskTimeZones | undefined

    // @state()
    // private favouriteTimeZones: AnyDict | undefined

    @state()
    public timeZones: Array<AnyDict> = []

    @property({type: Number, reflect: true })
    public value: number|null = null

    @property({type: String, reflect: true })
    public text: string = ""

    @property({attribute: true, type: Boolean, reflect: true})
    public disabled: boolean = false

    // @property()
    // public timeZone: string;

    constructor() {
        super();
        // registerStyles("vaadin-grid", css`
        //     :host [part~="header-cell"] ::slotted(vaadin-grid-cell-content), [part~="footer-cell"] ::slotted(vaadin-grid-cell-content), [part~="reorder-ghost"] {
        //         font-weight: bold
        //     }
        // `);
    }

    updated(_changedProperties: any) {
        super.updated(_changedProperties);
        if (_changedProperties.has("apiContext")) {
            this.apiConnected();
        }
        if (_changedProperties.has("value")) {
            console.log(`value updated to ${this.value}`)
            const e = this.shadowRoot?.querySelector("vaadin-combo-box")
            if (e && !this.value) e.value = ""
        }

        // if (_changedProperties.has("selectedItems")) {
        //     if (this.selectedItems.length > 0) {
        //         const dlg: KioskDialog | undefined | null = this.shadowRoot?.querySelector("kiosk-dialog") as KioskDialog;
        //         if (dlg) {
        //             setTimeout(() => {
        //                 const event = new CustomEvent("closeSelection", {
        //                     detail: this.selectedItems[0]
        //                 })
        //                 this.dispatchEvent(event);
        //                 dlg.closeDialog()
        //             }, 250);
        //         }
        //     }
        //
        // }
    }

    // willUpdate(_changedProperties: any) {
    //     // if (_changedProperties.has("identifiers") || _changedProperties.has("recordTypeFilter")) {
    //     //     this.prepareIdentifiers();
    //     // }
    // }

    apiConnected() {
        console.log("fetching time zone information");
        this.kioskTimeZones = new KioskTimeZones(this.apiContext)
        this.fetchFavouriteTimeZones()
        // if (!this.identifiers || this.identifiers.length == 0)
        //     this.fetchIdentifiers();
    }

    fetchFavouriteTimeZones() {
        if (this.kioskTimeZones) {
            this.kioskTimeZones.getFavouriteTimeZones(false, false)
                .then((favouriteTimeZones) => {
                    console.log(`about to add ${favouriteTimeZones.length} favourites`)
                    this.addTimeZones(favouriteTimeZones, true)
                    if (this.kioskTimeZones) {
                        this.kioskTimeZones.getAllTimeZones()
                            .then((allTimeZones) => {
                                if (allTimeZones) this.addTimeZones(allTimeZones, false)
                            })
                    }
                })
        }
    }

    private addTimeZones(newTimeZones: Array<TimeZone>, favourites=false) {
        const timeZones = newTimeZones.filter(tz => favourites || tz.favourite == 1).map(tz => {return { "label": tz.tz_long, "value": tz.id }})
        console.log(`kiosktzcombobox: added ${timeZones.length} favourite timezones`)
        if (!favourites) {
            timeZones.push({ "label": "------", "value": -1 })
            timeZones.push(...newTimeZones.filter(tz => tz.favourite != 1).map(tz => {
                return { "label": tz.tz_long, "value": tz.id }
            }))
            console.log(`now we have ${timeZones.length} overall timezones`)
        }
        this.timeZones = timeZones
    }

    timeZoneChanged(e: Event) {
        const vaadinCB= e.target as any
        console.log(vaadinCB.selectedItem)
        if (vaadinCB.selectedItem && vaadinCB.selectedItem.value > -1) {
            this.value = vaadinCB.selectedItem.value
            this.text = vaadinCB.selectedItem.label
        } else {
            this.value = null
            this.text = ""
            this.requestUpdate("value", -1)
        }
        e.preventDefault()
        const event = new CustomEvent("change")
        this.dispatchEvent(event);

    }

    onKeyUp(e: KeyboardEvent) {
        if (e.key === "Escape" || e.key === "Enter") {
            e.stopPropagation()
        }
    }


    apiRender(): TemplateResult {
        return html`
            <vaadin-combo-box id="kiosk-tz-combo-box" ?disabled="${this.disabled || this.timeZones.length==0}" .value=${(this.value && this.value>-1)?this.value:""} @change=${this.timeZoneChanged} .items="${this.timeZones}" @keyup="${this.onKeyUp}"></vaadin-combo-box>
        `;
    }
}