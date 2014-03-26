/**
 * @author Guille Paz <guille87paz@gmail.com>
 */

(function (window, gesturekit) {
    'use strict';

    var doc = window.document,

        helperImage = 'https://i.cloudup.com/jAmu8s95gF-3000x3000.png',

        url = 'http://api.gesturekit.com/v1.1/index.php/sdk/getgestures_help/',

        viewport = doc.documentElement,

        defaults = {
            'size': 60,
            'container': doc.body,
            'drag': true,
            'snap': true,
            'title': 'Gestures'
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

    function render(gesture) {
        return [
            '<div class="gk-helper-gesture">',
            '<img src="data:image/png;base64,' + gesture.img + '" height="150">',
            '<p class="gk-helper-label">' +  gesture.method + '</p>',
            '<p class="gk-helper-label">' +  gesture.img_description + '</p>',
            '</div>'
        ].join('');
    }

    function createNode(tag, classes, parent) {
        parent = parent || doc.body;

        var node = document.createElement(tag);
        node.className = classes;

        parent.appendChild(node);

        return node;
    }

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

        this._move = false;

        this.currentOffset = {
            'x': 2,
            'y': 60
        };

        this._createDisplay();

        this._defineEvents();

        if (this._options.drag) {
            this.drag();
        }

        this._createShowroom();

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
            'background-color: #999999;',
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

                that._move = true;

                return;
            }
        });

        gesturekit.on('pointerend', function (eve) {
            if (eve.target === that.display) {

                if (that._options.snap) {
                    that._snap();
                }

                gesturekit.enable();

                if (!that._move) {
                    that.showShowroom();
                }

                that._move = false;
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

            ctx.beginPath();

            if (this.lastPoint[id]) {
                ctx.moveTo(this.lastPoint[id].x, this.lastPoint[id].y);
                ctx.lineTo(point.x, point.y);
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.stroke();
            } else {
                ctx.arc(point.x, point.y, 3.5, 0, 2*Math.PI);
                ctx.fillStyle = '#FFF';
                ctx.fill();
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
     * Create a helper showroom.
     * @memberof! Helper.prototype
     * @function
     * @private
     * @returns {helper}
     */
    Helper.prototype._createShowroom = function (options) {
        var that = this,
            showroom = {};

        showroom.container = createNode('div', 'gk-helper-container gk-helper-hide');
        showroom.title = createNode('h2', 'gk-helper-title', showroom.container);
        showroom.title.innerHTML = this._options.title;
        showroom.closeBtn = createNode('button', 'gk-helper-close', showroom.container);
        showroom.closeBtn.addEventListener('touchend', function () {
            that.hideShowroom();
        });

        this.showroom = showroom;

        this.loadGestures();

        return this;
    };

    /**
     * Show helper showroom.
     * @memberof! Helper.prototype
     * @function
     * @returns {helper}
     * @example
     * // Show help.
     * helper.showShowroom();
     */
    Helper.prototype.showShowroom = function () {
        this.showroom.container.style.display = 'block';
        gesturekit.disable();

        return this;
    };

    /**
     * Hide helper showroom.
     * @memberof! Helper.prototype
     * @function
     * @returns {helper}
     * @example
     * // Hide Helper showroom.
     * Helper.hideShowroom();
     */
    Helper.prototype.hideShowroom = function () {
        this.showroom.container.style.display = 'none';
        gesturekit.enable();

        return this;
    };

    /**
     * Loads gestures.
     * @memberof! Helper.prototype
     * @function
     * @returns {Helper} Returns a new instance of Helper.
     */
    Helper.prototype.loadGestures = function (uid) {
        var that = this,
            xhr = new window.XMLHttpRequest(),
            status,
            response;

        uid = uid || gesturekit._options.uid;

        xhr.open('GET', url + uid);

        // Add events
        xhr.onreadystatechange = function () {
            if (xhr.readyState === xhr.DONE) {
                status = xhr.status;

                if ((status >= 200 && status < 300) || status === 304 || status === 0) {
                    response = JSON.parse(xhr.response || xhr.responseText);
                    that.renderGestures(response.gestureset.gestures);
                }
            }
        };

        xhr.send();

        return this;
    };

    /**
     * Render a given collection of gestures.
     * @memberof! Helper.prototype
     * @function
     * @returns {helper}
     */
    Helper.prototype.renderGestures = function (gestures) {
        var tmp = '';

        gestures.forEach(function (gesture) {
            tmp += render(gesture);
        });

        this.showroom.container.insertAdjacentHTML('beforeend', tmp);

        return this;
    };

    function helper(options) {
        return new Helper(options);
    };

    /**
     * Expose Helper
     */
    // AMD suppport
    if (typeof window.define === 'function' && window.define.amd !== undefined) {
        window.define('helper', [], function () {
            return helper;
        });

    // CommonJS suppport
    } else if (typeof module !== 'undefined' && module.exports !== undefined) {
        module.exports = helper;

    // Default
    } else {
        window.gesturekit.helper = helper;
    }

}(this, this.gesturekit));