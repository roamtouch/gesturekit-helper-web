/**
 * @author Guille Paz <guille87paz@gmail.com>
 */

(function (window, gesturekit) {
    'use strict';

    var doc = window.document,

        helperImage = 'https://i.cloudup.com/xGIfnHRDjw-1200x1200.png', // https://i.cloudup.com/6xhE1qpu0r.gif,

        viewport = doc.documentElement,

        defaults = {
            'size': 60,
            'container': doc.body,
            'drag': true,
            'snap': true
        },

        prefix = (function prefix() {
            var regex = /^(Webkit|Khtml|Moz|ms|O)(?=[A-Z])/,
                styleDeclaration = doc.getElementsByTagName('script')[0].style,
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
     * Creates a new instance of Helper.
     * @constructor
     * @returns {helper}
     */
    function Helper(options) {
        this._init(options);

        return this;
    }

    /**
     * Initializes a new instance of Helper.
     * @memberof! Helper.prototype
     * @function
     * @private
     * @returns {helper}
     */
    Helper.prototype._init = function (options) {

        this._options = customizeOptions(options || {});

        this.container = this._options.container;

        this.lastPoint = {};

        this._motion = false;

        this.currentOffset = {
            'x': 2,
            'y': 60
        };

        this._createDisplay();

        this._defineEvents();

        if (this._options.drag) {
            this.drag();
        }

        return this;
    };

    /**
     * Creates a display to draw gestures.
     * @memberof! Helper.prototype
     * @function
     * @private
     * @returns {helper}
     */
    Helper.prototype._createDisplay = function () {
        var styles = [
            'background-color: #626366;',
            'background-image: url("' + helperImage + '");',
            'background-size: cover;',
            'border-radius: 10px;',
            'position: fixed;',
            'top: 0;',
            'left: 0;',
            'z-index: 999;'
        ];

        this.display = doc.createElement('canvas');
        this.display.width = this.display.height = this._options.size;
        this.display.style.cssText = styles.join('');

        this.display.className = 'gk-helper-display';

        this.display.style[prefix + 'transform'] = 'translate(' + this.currentOffset.x + 'px,' + this.currentOffset.y + 'px)';

        this._ctx = this.display.getContext('2d');

        this.container.appendChild(this.display);

        return this;
    };

    /**
     *
     * @memberof! Helper.prototype
     * @function
     * @private
     * @returns {helper}
     */
    Helper.prototype._defineEvents = function () {
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
     * @memberof! Helper.prototype
     * @function
     * @private
     * @returns {helper}
     */
    Helper.prototype.drag = function () {
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
     * @memberof! Helper.prototype
     * @function
     * @private
     * @returns {helper}
     */
    Helper.prototype._scalePoints = function (x, y) {
        var offset = {},
            point = {},
            ratio = {},
            display = this.display,
            viewportWidth = viewport.clientWidth,
            viewportHeight = viewport.clientHeight,
            localWidth = this.display.width,
            localHeight = this.display.height;

        if (viewportWidth > viewportHeight) {
            localHeight = (viewportHeight * display.width) / viewportWidth;
            offset.x = 0;
            offset.y = (display.height - localHeight) / 2;

        } else {
            localWidth = (viewportWidth * display.height) / viewportHeight;
            offset.y = 0;
            offset.x = (display.width - localWidth) / 2;
        }

        ratio.x = viewportWidth / localWidth;
        ratio.y = viewportHeight / localHeight;

        point.x = (x / ratio.x) + offset.x;
        point.y = (y / ratio.y) + offset.y;

        return point;
    };

    /**
     *
     * @memberof! Helper.prototype
     * @function
     * @private
     * @returns {helper}
     */
    Helper.prototype._draw = function (touches) {

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
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.stroke();
            }

            this.lastPoint[id] = {x: point.x, y: point.y};
        }

        return this;
    };

    /**
     *
     * @memberof! Helper.prototype
     * @function
     * @private
     * @returns {helper}
     */
    Helper.prototype._finishDrawing = function (eve) {

        this.lastPoint = {};
        this._ctx.clearRect(0, 0, this.display.width, this.display.height);

        this.display.style.backgroundImage = 'url("' + helperImage +'")';

        return this;
    };


    /**
     * Snap helper to the container.
     * @memberof! Helper.prototype
     * @function
     * @private
     * @returns {helper}
     */
    Helper.prototype._snap = function () {

        var that = this,
            viewportWidth = viewport.clientWidth,
            viewportHeight = viewport.clientHeight,
            displayWidth = this.display.clientWidth,
            displayHeight = this.display.clientHeight,
            y = this.currentOffset.y,
            x = this.currentOffset.x;

        if (this.currentOffset.x < displayWidth / 2) {
            x = 2;

        } else if (this.currentOffset.x + displayWidth > viewportWidth - displayWidth / 2) {
            x = viewportWidth - displayWidth - 2;
        }

        if (this.currentOffset.y < displayHeight) {
            y = 2;

        } else if (this.currentOffset.y + displayHeight > viewportHeight - displayHeight) {
            y =  viewportHeight - displayHeight - 2;

        } else {
            x = (this.currentOffset.x + (displayWidth / 2) > viewportWidth / 2)
                ? viewportWidth - displayWidth - 2
                : 2;
        }

        this.currentOffset.y = y;
        this.currentOffset.x = x;

        this.display.style.transition = prefix + 'transform 200ms ease-in-out';
        this.display.style[prefix + 'transform'] = 'translate(' + this.currentOffset.x + 'px,' + this.currentOffset.y + 'px)';

        window.setTimeout(function () {
            that.display.style.transition = 'none';
        }, 200);

        return this;
    };

    /**
     * Show helper.
     * @memberof! Helper.prototype
     * @function
     * @returns {helper}
     * @example
     * // Show helper.
     * helper.show();
     */
    Helper.prototype.show = function () {
        this._enabled = true;
        this.display.style.display = 'block';

        return this;
    };

    /**
     * Hide helper.
     * @memberof! Helper.prototype
     * @function
     * @returns {helper}
     * @example
     * // Hide helper.
     * helper.hide();
     */
    Helper.prototype.hide = function () {
        this._enabled = false;
        this.display.style.display = 'none';

        return this;
    };

    /**
     * Expose Helper
     */
    // AMD suppport
    if (typeof window.define === 'function' && window.define.amd !== undefined) {
        window.define('Helper', [], function () {
            return Helper;
        });

    // CommonJS suppport
    } else if (typeof module !== 'undefined' && module.exports !== undefined) {
        module.exports = Helper;

    // Default
    } else {
        window.Helper = Helper;
    }

}(this, this.gesturekit));