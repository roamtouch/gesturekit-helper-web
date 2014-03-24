# GestureKit Helper

> A GestureKit plugin to show the gesture drawing to the user at runtime.

<img src="https://i.cloudup.com/ijtx3QomJW.gif" alt="Helper examples">

## Usage

### Add the dependency into your HTML file.
You should download the dependency and reference the JavaScript file using a `<script>` tag somewhere on your HTML pages.
```html
<script src="gesturekit.min.js"></script>
```

### Add gesturekit.helper.js into your HTML file.
You should download the library and reference the JavaScript file using a `<script>` tag somewhere on your HTML pages.
```html
<script src="gesturekit.helper.min.js"></script>
```

### Initialize Helper.
Initializes a new instance of `Helper`.
```js
var Helper = new Helper();
```

## API

#### Helper([options])
Initialize an instance of Helper. You could customize a Helper instance using the following options, and shown is their default value.
- `options`: A given options to customize an instance.
    - `size`: A given number indicating the size of the helper in `px`. Default: `60`.
    - `container`: An HTMLElement to use as helper's container. Default: `document.body`.
    - `drag`: Enable or disable if you want to drag the helper. Default: `true`.
    - `snap`: Enable or disable if you want to snap helper to the container. Default: `true`.

```js
var helper = new Helper({
    'size': 120,
    'drag': true,
    'snap': false
});
```

#### Helper#show()
Shows an instance of Helper.

```js
helper.show();
```

#### Helper#hide()
Hides an instance of Helper.

```js
helper.hide();
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