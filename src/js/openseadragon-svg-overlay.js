// OpenSeadragon SVG Overlay plugin 0.0.5
import OpenSeadragon from "openseadragon";

export function OSDSVGOverlay($)  {

    var svgNS = 'http://www.w3.org/2000/svg';

    // ----------
    $.Viewer.prototype.svgOverlay = function() {
        if (this._svgOverlayInfo) {
            return this._svgOverlayInfo;
        }

        this._svgOverlayInfo = new Overlay(this);
        return this._svgOverlayInfo;
    };

    // ----------
    var Overlay = function(viewer) {
        var self = this;

        this._viewer = viewer;
        this._containerWidth = 0;
        this._containerHeight = 0;

        this._svg = document.createElementNS(svgNS, 'svg');
        this._svg.style.position = 'absolute';
        this._svg.style.left = 0;
        this._svg.style.top = 0;
        this._svg.style.width = '100%';
        this._svg.style.height = '100%';

        this._viewer.canvas.appendChild(this._svg);

        this._node = document.createElementNS(svgNS, 'g');
        this._svg.appendChild(this._node);
        this.svgWidth = 0
        this.debugMode = false


        this._viewer.addHandler('animation', function() {
            self.resize();
        });

        this._viewer.addHandler('open', () => {
            let center =this._viewer.viewport.getCenter()
            const helper = this._viewer.imagingHelper
            self.resize();
            // let p = new OpenSeadragon.Point(helper.dataToLogicalX(200), helper.dataToLogicalY(285))
            // console.log("center point", p)
            // helper.centerAboutLogicalPoint(p)
        });

        this._viewer.addHandler('rotate', function(evt) {
            self.resize();
        });

        this._viewer.addHandler('flip', function() {
            self.resize();
        });

        this._viewer.addHandler('resize', function() {
            self.resize();
        });
        this.resize();
        this.hide();
    };

    // ----------
    Overlay.prototype = {
        // ----------
        node: function() {
            return this._node;
        },
        svg: function() {
            return this._svg
        },
        hide() {this._svg.style.display="none"},
        show() {this._svg.style.display="unset"},
        isVisible() {
            return (this._svg.style.display !== "none")
        },
        clear() {
            this._node.replaceChildren()
        },
        activateDebugMode() {
            if (!this.debugMode) {
                this.debugMode = true
                this.addInfoBox()
                this._svg.style.backgroundColor = "rgba(255,50,50,.1)"
                this._svg.style.border = "8px solid rgba(255,50,50,.5)"
                this._svg.style.boxSizing = "border-box"
            }
        },
        addInfoBox() {
            if (this.debugMode) {
                this._infoBox = document.createElement('div');
                this._infoBox.id = "info-box"
                this._infoBox.style.position = 'absolute';
                this._infoBox.style.left = "auto";
                this._infoBox.style.right = "1em";
                this._infoBox.style.top = "1em";
                this._infoBox.style.width = '25%';
                this._infoBox.style.height = 'auto';
                this._infoBox.style.backgroundColor = "rgba(50,50,250,.1)"
                this._infoBox.style.boxSizing = "border-box"

                this._viewer.canvas.appendChild(this._infoBox);
            }
        },
        /**
         *
         * @param node SVGSVGElement A SVGElement that will be loaded into the overlay
         */
        loadSVG(node) {
            // this._svg.style.backgroundColor = "rgba(200,200,200,.5)"
            let width = node.attributes["width"]
            if (width) {
                width = width.value
            } else {
                width = node.viewBox.baseVal.width
            }
            this.svgWidth = width

            let height = node.attributes["height"]
            if (height) {
                height = height.value
            } else {
                height = node.viewBox.baseVal.height
            }
            this.svgHeight = height

            // this._svg.setAttribute("width",width.value )
            // this._svg.setAttribute("height", node.attributes["height"].value)
            if (this._node.firstChild) this._node.replaceChildren()
            // let normalizer = document.createElementNS(svgNS, "svg")
            // normalizer.setAttribute("width", "1")
            // normalizer.setAttribute("height", "1")
            // normalizer.innerHTML = node.outerHTML
            // node.width.baseVal.valueAsString=""
            // node.height.baseVal.valueAsString=""
            this._node.replaceChildren(...node.children)
            return new $.Point(parseFloat(width), parseFloat(height))
        },

        // ----------
        resize: function() {
            // if (this._containerWidth !== this._viewer.container.clientWidth) {
            //     this._containerWidth = this._viewer.container.clientWidth;
            //     this._svg.setAttribute('width', this._containerWidth);
            // }
            //
            // if (this._containerHeight !== this._viewer.container.clientHeight) {
            //     this._containerHeight = this._viewer.container.clientHeight;
            //     this._svg.setAttribute('height', this._containerHeight);
            // }
            var centerPoint = this._viewer.viewport.getCenter(true)
            const v = this._viewer
            var containerSizeX = v.viewport._containerInnerSize.x
            var zoom = v.viewport.getZoom(true);
            var scaleX = containerSizeX * zoom;
            var scaleY = scaleX;
            let svgWidth = this.svgWidth / 2
            let svgHeight = this.svgHeight / 2
            let pRaw = new $.Point(this._viewer.imagingHelper.imgWidth / 2, this._viewer.imagingHelper.imgHeight/2)
            let p = v.viewport.imageToViewportCoordinates(pRaw.x, pRaw.y)
            p.x = p.x - svgWidth
            p.y = p.y- svgHeight
            p = this._viewer.viewport.pixelFromPoint(p, true);

            // var center = this._viewer.viewport.pixelFromPoint(pRaw, true);
            // p = v.viewport.imageToViewportCoordinates(p.x, p.y)
            // p.x += this._viewer.viewport.pixelFromPoint(new $.Point(1024,1024), true).x
            // console.log(centerPoint, p)
            var rotation = v.viewport.getRotation();
            var flipped = v.viewport.getFlip();
            // TODO: Expose an accessor for _containerInnerSize in the OSD API so we don't have to use the private variable.


            if(flipped){
                // Makes the x component of the scale negative to flip the svg
                scaleX = -scaleX;
                // Translates svg back into the correct coordinates when the x scale is made negative.
                p.x = -p.x + containerSizeX;
            }

            // center = new $.Point(this._viewer.imagingHelper.imgWidth/2, this._viewer.imagingHelper.imgHeight/2 - this.svgHeight/2)

            // let xright = (center.x - this.svgWidth/2) * scaleX
            // let yright = (center.y - this.svgHeight / 2) * scaleY
            // rotation = 0
            // let mitte = p.x+((xright.x-p.x)/2)
            if (this._node.firstChild) {
                const transformation = 'translate(' + (p.x) + 'px,' + (p.y) + 'px) scale(' + scaleX + ') rotate(' + rotation + 'deg)'
                console.log(transformation)
                // this._node.style.transformOrigin = "bottom right"
                this._node.style.transform = transformation;
                // this._node.firstChild.style.backgroundColor = "pink"
            }
            if (this.debugMode) {
                this._infoBox.innerHTML = `
                <div>ImageWidth: ${this._viewer.imagingHelper.imgWidth}</div>
                <div>svgWidth: ${this.svgWidth}</div>
                <div>viewPortWidth: ${this._viewer.viewport.getContainerSize().x}</div>
                <div>ViewerContainerSize: ${this._viewer.imagingHelper.getViewerContainerSize()}</div>
                <div>DataWidth: ${this._viewer.imagingHelper.logicalToDataX(1)}</div>
                <div>zoom: ${scaleX}</div>
                <div>p.x: ${p.x}</div>
                <div>pRaw: ${pRaw}</div>
                <div>svgWidth: ${svgWidth}</div>
                <div>p: ${p}</div>
            `
            }
        },
        // ----------
        onClick: function(node, handler) {
            // TODO: Fast click for mobile browsers

            new $.MouseTracker({
                element: node,
                clickHandler: handler
            }).setTracking(true);
        }
    };

};
