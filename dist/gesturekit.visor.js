/*!
 * GestureKit Visor v1.0.0
 * http://gesturekit.com/
 *
 * Copyright (c) 2014, RoamTouch
 * Released under the Apache v2 License.
 * http://gesturekit.com/
 */
(function (window, gesturekit) {
    'use strict';

    var defaults = {
            'size': 60,
            'container': window.document.documentElement,
            'drag': true,
            'snap': true
        },

        prefix = (function prefix() {
            var regex = /^(Webkit|Khtml|Moz|ms|O)(?=[A-Z])/,
                styleDeclaration = document.getElementsByTagName('script')[0].style,
                prop;

            for (prop in styleDeclaration) {
                if (regex.test(prop)) {
                    return '-' + prop.match(regex)[0].toLowerCase() + '-';
                }
            }

            // Nothing found so far? Webkit does not enumerate over the CSS properties of the style object.
            // However (prop in style) returns the correct value, so we'll have to test for
            // the precence of a specific property
            if ('WebkitOpacity' in styleDeclaration) { return '-webkit-'; }
            if ('KhtmlOpacity' in styleDeclaration) { return '-khtml-'; }

            return '';
        }());

    function customizeOptions(options) {
        var prop;
        for (prop in defaults) {
            if (!options.hasOwnProperty(prop)) {
                options[prop] = defaults[prop];
            }
        }
        return options;
    }

    /**
     * Creates a new instance of Visor.
     * @constructor
     * @returns {visor}
     */
    function Visor(options) {
        this._init(options);

        return this;
    }

    /**
     * Initializes a new instance of Visor.
     * @memberof! Visor.prototype
     * @function
     * @private
     * @returns {visor}
     */
    Visor.prototype._init = function (options) {

        this._options = customizeOptions(options || {});

        this.container = this._options.container;

        this.lastPoint = {};

        this._motion = false;

        this.currentOffset = {
            'x': 2,
            'y': 2
        };

        this._createDisplay();

        this._defineEvents();

        if (this._options.drag) {
            this.drag();
        };

        return this;
    };

    /**
     * Creates a display container to draw gestures.
     * @memberof! Visor.prototype
     * @function
     * @private
     * @returns {visor}
     */
    Visor.prototype._createDisplay = function () {
        var styles = [
            'background-color: #909090;',
            'background-image: url("visor/assets/gk.png");',
            'background-size: cover;',
            'border-radius: 10px;',
            'position: fixed;',
            'z-index: 999;'
        ];

        this.display = document.createElement('canvas');
        this.display.width = this.display.height = this._options.size;
        this.display.style.cssText = styles.join('');

        this.display.style[prefix + 'transform'] = 'translate(' + this.currentOffset.x + 'px,' + this.currentOffset.y + 'px)';

        this._ctx = this.display.getContext('2d');

        this.container.appendChild(this.display);

        return this;
    };

    /**
     *
     * @memberof! Visor.prototype
     * @function
     * @private
     * @returns {visor}
     */
    Visor.prototype._defineEvents = function () {
        var that = this;

        gesturekit.on('gesturemotion', function (eve) {
            that._motion = true;
            that._draw(eve.touches);
        });

        gesturekit.on('gestureend', function () {
            if (that._motion) {
                that._motion = false;
                that._finishDrawing();
            }
        });

        return this;
    };

    /**
     *
     * @memberof! Visor.prototype
     * @function
     * @private
     * @returns {visor}
     */
    Visor.prototype.drag = function () {
        var that = this,
            startOffset = {
                'x': 0,
                'y': 0
            };

        gesturekit.on('pointerstart', function (eve) {
            if (eve.target === that.display) {
                gesturekit.disable();

                startOffset.x = eve.touches[0].pageX - that.currentOffset.x;
                startOffset.y = eve.touches[0].pageY - that.currentOffset.y;
            }
        });

        gesturekit.on('pointermove', function (eve) {
            if (eve.target === that.display) {
                eve.preventDefault();

                var x = eve.touches[0].pageX - startOffset.x,
                    y = eve.touches[0].pageY - startOffset.y;

                that.display.style[prefix + 'transform'] = 'translate(' + x + 'px,' + y + 'px)';

                that.currentOffset.x = x;
                that.currentOffset.y = y;

                return;
            }
        });

        gesturekit.on('pointerend', function (eve) {
            if (eve.target === that.display) {

                if (that._options.snap) {
                    that._snap();
                }

                gesturekit.enable();
            }
        });

        return this;
    };

    /**
     *
     * @memberof! Visor.prototype
     * @function
     * @private
     * @returns {visor}
     */
    Visor.prototype._scalePoints = function (x, y) {
        var offset = {},
            point = {},
            ratio = {},
            display = this.display,
            containerWidth = this.container.clientWidth,
            containerHeight = this.container.clientHeight,
            localWidth = this.display.width,
            localHeight = this.display.height;

         if (containerWidth > containerHeight) {
            localHeight = (containerHeight * display.width) / containerWidth;
            offset.x = 0;
            offset.y = (display.height - localHeight) / 2;

        } else {
            localWidth = (containerWidth * display.height) / containerHeight;
            offset.y = 0;
            offset.x = (display.width - localWidth) / 2;
        }

        ratio.x = containerWidth / localWidth;
        ratio.y = containerHeight / localHeight;

        point.x = (x / ratio.x) + offset.x;
        point.y = (y / ratio.y) + offset.y;

        return point;
    };

    /**
     *
     * @memberof! Visor.prototype
     * @function
     * @private
     * @returns {visor}
     */
    Visor.prototype._draw = function (touches) {

        this.display.style.backgroundImage = 'none';

        var i = 0,
            len = touches.length,
            ctx = this._ctx,
            id,
            touch,
            point;

        for (i; i < len; i += 1) {

            touch = touches[i];
            id = touch.identifier;
            point = this._scalePoints(touch.pageX, touch.pageY);

            if (this.lastPoint[id]) {
                ctx.beginPath();
                ctx.moveTo(this.lastPoint[id].x, this.lastPoint[id].y);
                ctx.lineTo(point.x, point.y);
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.stroke();
            }

            this.lastPoint[id] = {x: point.x, y: point.y};
        }

        return this;
    };

    /**
     *
     * @memberof! Visor.prototype
     * @function
     * @private
     * @returns {visor}
     */
    Visor.prototype._finishDrawing = function (eve) {

        this.lastPoint = {};
        this._ctx.clearRect(0, 0, this.display.width, this.display.height);

        this.display.style.backgroundImage = 'url("visor/assets/gk.png")';

        return this;
    };


    /**
     * Snap visor to the container.
     * @memberof! Visor.prototype
     * @function
     * @private
     * @returns {visor}
     */
    Visor.prototype._snap = function () {

        var that = this,
            containerWidth = this.container.clientWidth,
            containerHeight = this.container.clientHeight,
            displayWidth = this.display.clientWidth,
            displayHeight = this.display.clientHeight,
            y = this.currentOffset.y,
            x = this.currentOffset.x;

        if (this.currentOffset.x < displayWidth / 2) {
            x = 2;

        } else if (this.currentOffset.x + displayWidth > containerWidth - displayWidth / 2) {
            x = containerWidth - displayWidth - 2;
        }

        if (this.currentOffset.y < displayHeight) {
            y = 2;

        } else if (this.currentOffset.y + displayHeight > containerHeight - displayHeight) {
            y =  containerHeight - displayHeight - 2;

        } else {
            x = (this.currentOffset.x + (displayWidth / 2) > containerWidth / 2)
                ? containerWidth - displayWidth - 2
                : 2;
        }

        this.currentOffset.y = y;
        this.currentOffset.x = x;

        this.display.style['transition'] = prefix + 'transform 200ms ease-in-out';
        this.display.style[prefix + 'transform'] = 'translate(' + this.currentOffset.x + 'px,' + this.currentOffset.y + 'px)';

        window.setTimeout(function () {
            that.display.style['transition'] = 'none';
        }, 200);

        return this;
    };

    /**
     * Show visor.
     * @memberof! Visor.prototype
     * @function
     * @returns {visor}
     * @example
     * // Show visor.
     * visor.show();
     */
    Visor.prototype.show = function () {
        this._enabled = true;
        this.display.style.display = 'block';

        return this;
    };

    /**
     * Hide visor.
     * @memberof! Visor.prototype
     * @function
     * @returns {visor}
     * @example
     * // Hide visor.
     * visor.hide();
     */
    Visor.prototype.hide = function () {
        this._enabled = false;
        this.display.style.display = 'none';

        return this;
    };

    /**
     * Expose Visor
     */
    // AMD suppport
    if (typeof window.define === 'function' && window.define.amd !== undefined) {
        window.define('Visor', [], function () {
            return Visor;
        });

    // CommonJS suppport
    } else if (typeof module !== 'undefined' && module.exports !== undefined) {
        module.exports = Visor;

    // Default
    } else {
        window.Visor = Visor;
    }

}(this, gesturekit));