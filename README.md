# GestureKit Helper

> A GestureKit plugin to show the gesture drawing to the user at runtime.

<img src="https://i.cloudup.com/ijtx3QomJW.gif" alt="Helper examples">

## Usage

### Add the dependency into your HTML file.
You should download the dependency and reference the JavaScript file using a `<script>` tag somewhere on your HTML pages.
```html
<script src="gesturekit.min.js"></script>
```

### Add gesturekit.helper.css into your HTML file.
You should download the library and reference the CSS file on your HTML pages.
```html
<link rel="stylesheet" href="gesturekit.helper.min.css">
```

### Add gesturekit.helper.js into your HTML file.
You should download the library and reference the JavaScript file using a `<script>` tag somewhere on your HTML pages.
```html
<script src="gesturekit.helper.min.js"></script>
```

### Initialize Helper.
Initializes a new instance of `Helper`.
```js
var helper = gesturekit.helper();
```

## API

#### gesturekit.helper([options])
Initialize an instance of Helper. You could customize a Helper instance using the following options, and shown is their default value.
- `options`: A given options to customize an instance.
    - `size`: A given number indicating the size of the helper in `px`. Default: `60`.
    - `container`: An HTMLElement to use as helper's container. Default: `document.body`.
    - `drag`: Enable or disable if you want to drag the helper. Default: `true`.
    - `snap`: Enable or disable if you want to snap helper to the container. Default: `true`.
    - `title`: The title of the available gestures. Default: `Gestures`.

```js
var helper = gesturekit.helper({
    'size': 120,
    'drag': true,
    'snap': false,
    'title': 'Gestures'
});
```

#### gesturekit.helper#show()
Shows the helper visor.

```js
helper.show();
```

#### gesturekit.helper#hide()
Hides the helper visor.

```js
helper.hide();
```

#### gesturekit.helper#showGestures()
Shows the available gestures.

```js
helper.showGestures();
```

#### gesturekit.helper#hideGestures()
Hides the available gestures.

```js
helper.hideGestures();
```

#### gesturekit.helper#loadGestures([uiid])
Loads the available gestures from a given `uiid`.

```js
helper.loadGestures('xxx-xxx-xxx-xxx');
```

## Maintained by
- Guille Paz (Front-end developer | Web standards lover)
- E-mail: [guille87paz@gmail.com](mailto:guille87paz@gmail.com)
- Twitter: [@pazguille](http://twitter.com/pazguille)
- Web: [http://pazguille.me](http://pazguille.me)

## Credits
<img src="http://www.gesturekit.com/assets/img/roamtouch.png" width="200" alt="RoamTouch logo">

## License
Licensed under Apache v2 License.

Copyright (c) 2014 [RoamTouch](http://github.com/RoamTouch).