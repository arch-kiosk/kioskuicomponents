// @ts-ignore
import local_css from "./styles/kiosk-lightbox.sass?inline";

// @ts-ignore
import { html, css, TemplateResult, unsafeCSS, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { AnyDict, KioskAppComponent } from "kiosktsapplib";
import "./kioskdialog.ts";
import OpenSeadragon from "openseadragon";

export type KioskLightboxFileDirection = "prev" | "next"

export interface KioskLightboxUrlProvider {
    prev: () => boolean
    next: () => boolean
    bof: () => boolean
    eof: () => boolean
    height: number,
    width: number
    url?: string
}

@customElement("kiosk-lightbox")
export class KioskLightbox extends KioskAppComponent {
    static styles = unsafeCSS(local_css);
    static properties = {
        ...super.properties,
    };
    private rotationValues = new Map<string, number>()

    private firstTile = false;

    // constructor() {
    // }
    private viewer?: OpenSeadragon.Viewer = undefined;

    /**
     *  a callback that returns the url of the next image to show
     *  @param direction: either "next" or "prev"
     *  @returns an object consisting of a url to load or an empty string if there isn't any in that direction and a bookmark that will be
     *  @throws exceptions if something goes wrong
     */
    public openseadragonImagePath = "/static/assets/images/lightbox/"
        // private onNextFileCallback?: KioskLightboxOnNextFileCallback<unknown>
    private urlProvider?: KioskLightboxUrlProvider;

    // public onNextFile?: <T>KioskLightboxOnNextFileCallback<T>

    @state()
    private viewerError?: string;

    @state()
    private eof = false

    @state()
    private bof = false

    @state()
    private hideUI = false

    @state()
    private navDeferred?: boolean = false

    @state()
    private darkMode = true

    @property({ type: Boolean, reflect: true })
    open: boolean = false;

    @property()
    dataVisible = false;

    @property({ type: Boolean })
    hasData = false;

    // private disableRotationCacheOnce = false

    public setURLProvider(value: KioskLightboxUrlProvider) {
        this.urlProvider = value;
    }

    initOpenSeaDragon() {
        this.viewer && this.viewer.destroy();
        this.navDeferred = false;
        const el = this.shadowRoot?.getElementById("open-sea-dragon");
        const headers: Headers = this.apiContext.getHeaders("application/json");
        let headerObject: AnyDict = {};
        headers.forEach((value, key) => {
            headerObject[key] = value;
        });
        if (el) {
            this.firstTile = false;
            this.viewer = OpenSeadragon({
                element: el,
                id: "open-sea-dragon",
                prefixUrl: this.openseadragonImagePath,
                showFullPageControl: false,
                showRotationControl: true,
                loadTilesWithAjax: true,
                ajaxHeaders: headerObject,
                crossOriginPolicy: "Anonymous",

            });

            this.viewer.addHandler("open", () => {
                console.log("success")
            });
            this.viewer.addHandler("open-failed", (e) => {
                this.opened(false, e.message);
            });
            this.viewer.addHandler("tile-load-failed", (e) => {
                console.log("tile load failure")
                if (this.firstTile) this.opened(false, e.message);
                this.firstTile = false
            });
            this.viewer.addHandler("tile-loaded", () => {
                console.log("tile loaded successfully")
                if (this.firstTile) this.opened(true, "");
                this.firstTile = false
            });
            this.viewer.addHandler("rotate", (e: {degrees: number}) => {
                // if (this.disableRotationCacheOnce) {
                //     console.log("rotation skipped:", e);
                //     this.disableRotationCacheOnce = false
                //     return
                // }
                // console.log("rotation cached:", e);
                if (this.urlProvider?.url) {
                    // console.log(`rotation fired with ${e.degrees})`)
                    if (e.degrees % 360 === 0)
                        this.rotationValues.delete(this.urlProvider.url)
                    else
                        this.rotationValues.set(this.urlProvider.url, e.degrees % 360)
                }
                // console.log("rotation values", this.rotationValues)
            });

        }
    }

    nextFile(direction: KioskLightboxFileDirection) {
        let canGo: boolean;
        this.viewerError = undefined

        if (!this.viewer) {
            this.viewerError = "The viewer instance was not successfully initialized, so I can't show anything.";
            return;
        }

        if (!this.urlProvider) {
            this.viewerError = "The urlProvider is missing. That's a programming error.";
            return;
        }
        try {
            if (direction == "next")
                canGo = this.urlProvider.next();
            else
                canGo = this.urlProvider.prev();
        } catch (e) {
            this.viewerError = `An error occurred, so I don't know what file to fetch: ${e}`;
            return;
        }
        if (canGo) {
            this._openFile();
        } else {
            this.viewerError = "there is nowhere to go";
        }
    }

    reloadFile() {
        this._openFile()
    }

    showHideUI(hide: boolean | null = null) {
        this.hideUI = (hide === null) ? !this.hideUI : hide
    }

    private _openFile() {
        this.tryOpen( () => {
            if (this.urlProvider?.url && this.viewer) {
                this.eof = this.urlProvider.eof();
                this.bof = this.urlProvider.bof();
                let height=0;
                let width=0;
                try {
                    height = this.urlProvider.height;
                    width = this.urlProvider.width;
                } catch {}
                if (height === 0 || width === 0){
                    height = 5000;
                    width = 5000;
                }

                try {
                    console.log(this.rotationValues);
                    const degrees = this.rotationValues.get(this.urlProvider.url)??0
                    console.log(`will set to ${degrees} degrees`);
                    if (this.viewer.viewport.getRotation() != degrees) {
                        // this.disableRotationCacheOnce = true
                        this.viewer.viewport.setRotation(degrees)
                    }
                    this.firstTile = true;
                    this.viewer.open(
                        {
                            tileSource: {
                                type: "legacy-image-pyramid",
                                levels: [
                                    {
                                        url: this.urlProvider.url,
                                        height: height,
                                        width: width,
                                    },
                                ],
                            },
                            // degrees: degrees, //this could be used to set the EXIF degrees!
                            collectionImmediately: true
                        },
                    );

                    // this.viewer.viewport.
                } catch (e) {
                    this.viewerError = `An error occurred: ${e}`;
                }
            } else {
                this.viewerError = `An error occurred: no url provider or no viewer in _openFile.`;
            }
        })
    }

    disconnectedCallback() {
        this.viewer && this.viewer.destroy();
    }

    updated(_changedProperties: any) {
        if (_changedProperties.has("open")) {
            if (this.open) {
                this.initOpenSeaDragon();
                this.nextFile("next");
            } else {
                if (this.viewer) {
                    this.viewer.destroy();
                    setTimeout(() => {
                        const event = new CustomEvent("closed", {
                            bubbles: true,
                            cancelable: true,
                            detail: this,
                        });
                        this.dispatchEvent(event);
                    }, 10);
                }
            }
        }
        if (_changedProperties.has("dataVisible")) {
            if (!this.dataVisible) {
                this.scroll(0, 0);
            }
        }
    }

    willUpdate(_changedProperties: any) {
    }

    apiConnected() {
    }

    public openDialog() {
        this.open = true;
    }

    private tryOpen(proceed: () => void) {
        if (!this.emitBeforeEvent("beforeOpen", {},
            () => {
                this.navDeferred = false
            },
            () => {
                this.navDeferred = false
                proceed()
            })
        ) this.navDeferred = true
    }

    opened(result: boolean, errMsg: string) {
        setTimeout(() => {
            const event = new CustomEvent("opened", {
                bubbles: true,
                cancelable: false,
                detail: {
                    component: this,
                    result: result,
                    errMsg: errMsg
                },
            });
            this.dispatchEvent(event);
        }, 10);
    }

    splitterClicked() {
        this.dataVisible = !this.dataVisible;
    }

    renderError() {
        return this.viewerError ? html`
            <div class="kiosk-lightbox-error">
                <p>${this.viewerError}</p>
            </div>` : nothing;
    }

    private doClose() {
            this.open = false
        this.navDeferred = false
    }

    private doNext() {
        try {
            this.nextFile("next")
        } catch (e) {
            console.log(e)
        }
        this.navDeferred = false
    }

    private doPrev() {
        try {
            this.nextFile("prev")
        } catch (e) {
            console.log(e)
        }
        this.navDeferred = false
    }

    private tryClose() {
        if (!this.emitBeforeEvent("beforeClose", {},
            () => {
                this.navDeferred = false
            },
            () => {
                this.doClose()
            })
        ) this.navDeferred = true
    }

    private tryNext() {
        if (!this.urlProvider?.eof()) {
            if (!this.emitBeforeEvent("beforeNext", {},
                () => {
                    this.navDeferred = false
                },
                () => {
                    this.doNext()
                })
            ) this.navDeferred = true
        }
    }

    private tryPrev() {
        if (!this.urlProvider?.bof()) {
            if (!this.emitBeforeEvent("beforePrev", {},
                () => {
                    this.navDeferred = false
                },
                () => {
                    this.doPrev()
                })
            ) this.navDeferred = true
        }
    }

    public close(deferIt: boolean=false){
        this.navDeferred = false
        if (deferIt) {
            this.tryClose()
        } else {
            this.doClose()
        }
    }
    public toggleBackground() {
        this.darkMode = !this.darkMode
    }

    renderNavButtons() {
        return html`<div class="kiosk-lightbox-buttons ${this.hideUI?'hide-ui':''}">
                        <div class="kiosk-lightbox-button" @click="${this.toggleBackground}"><i class="fa-circle-half-stroke"></i></div>
                        <div class = "kiosk-lightbox-button ${this.bof?'nav-button-deactivated':''}" @click="${this.tryPrev}"><i class="fa-prev"></i> </div>
                        <div class = "kiosk-lightbox-button ${this.eof?'nav-button-deactivated':''}" @click="${this.tryNext}"> <i class="fa-next"></i></div>
                        <div class="kiosk-lightbox-button" @click="${this.tryClose}"><i class="fa-close"></i></div>
                    </div>
                `
    }

    renderOpenSeaDragon(): TemplateResult {
        const dataViewerClasses = { expanded: this.dataVisible, collapsed: !this.dataVisible, nodata: !this.hasData };

        return html`
            <div class="kiosk-lightbox-outer ${this.darkMode?'background-dark':'background-light'}">
                ${this.navDeferred ? nothing : this.renderNavButtons()}
                ${this.renderError()}
                <div class="kiosk-lightbox-inner ${this.hideUI?'hide-ui':nothing}" 
                     style="${this.viewerError?'visibility: hidden':nothing}">
                    <div id="open-sea-dragon"
                         class="kiosk-lightbox-viewer ${classMap(dataViewerClasses)}">
                    </div>
                </div>
                ${this.hasData ? html`
                    <div class="kiosk-lightbox-data" style="${this.viewerError?'visibility: hidden':nothing}">
                        <div class="kiosk-lightbox-splitter" @click="${this.splitterClicked}">
                            <i class="fa-view-list"></i>
                        </div>
                        <slot></slot>
                    </div>` : nothing}
            </div>`
    }


    apiRender(): TemplateResult {
        if (this.open) {
            return html`${this.renderOpenSeaDragon()}`;
        } else
            return html``;
    }
}