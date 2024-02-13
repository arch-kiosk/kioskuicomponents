// @ts-ignore
import local_css from "./styles/kiosk-dialog.sass?inline";

import { html, TemplateResult, unsafeCSS, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("kiosk-dialog")
export class KioskDialog extends LitElement {
    static styles = unsafeCSS(local_css);

    static properties = {
        ...super.properties,
    };

    @property()
    private heading: string = ""

    firstUpdated(_changedProperties: any) {
        console.log("KioskDialog first updated", _changedProperties);
        super.firstUpdated(_changedProperties);
    }

    openDialog() {
        let dialog = this.shadowRoot?.querySelector("dialog")
        if (dialog) dialog.showModal()
    }

    closeDialog(returnValue?: string) {
        let dialog = this.shadowRoot?.querySelector("dialog")
        if (dialog) dialog.close(returnValue)
    }

    _overlayClicked(e: PointerEvent) {
        if (e.target == this.shadowRoot?.querySelector(".dialog-outer-zone"))
            this.closeDialog()
    }

    _onCloseDialog() {
        let dialog = this.shadowRoot?.querySelector("dialog")
        let closeEvent = new CustomEvent ("kiosk-dialog-closed", {
            bubbles: false,
            cancelable: false,
            composed:false,
            detail: dialog?.returnValue
        })
        this.dispatchEvent(closeEvent)
    }

    render(): TemplateResult {
        return html`
            <dialog id="my-dialog" @close="${this._onCloseDialog}">
                <div class="dialog-outer-zone" @click="${this._overlayClicked}">
                    <div class="dialog-frame">
                        <div class="dialog-header">
                            <div class="dialog-image">
                                <slot name="dialog-image"></slot>
                            </div>
                            <div class="dialog-name">
                                <h3 class="dialog-title">${this.heading}</h3>
                            </div>
                            <div class="close-button" @click="${this.closeDialog}">
                                <i class="fa"></i>
                            </div>
                        </div>
                        <slot name="dialog-content">
                        </slot>
                    </div>
                </div>
            </dialog>
        `;
    }
}
