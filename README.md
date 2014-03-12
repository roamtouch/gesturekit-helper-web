# GestureKit Visor Plugin

> A GestureKit plugin to show the gesture drawing to the user at runtime.

<img src="https://i.cloudup.com/ijtx3QomJW.gif" alt="Visor examples">

## Usage

### Add the dependency into your HTML file.
You should download the dependency and reference the JavaScript file using a `<script>` tag somewhere on your HTML pages.
```html
<script src="gesturekit.min.js"></script>
```

### Add visor.js into your HTML file.
You should download the library and reference the JavaScript file using a `<script>` tag somewhere on your HTML pages.
```html
<script src="visor.min.js"></script>
```

### Initialize Visor.
Initializes a new instance of `Visor`.
```js
var visor = new Visor();
```

## API

#### Visor([options])
Initialize an instance of Visor. You could customize a Visor instance using the following options, and shown is their default value.
- `options`: A given options to customize an instance.
    - `size`: A given number indicating the size of the visor in `px`. Default: `60`.
    - `container`: An HTMLElement to use as visor's container. Default: `document.body`.
    - `drag`: Enable or disable if you want to drag the visor. Default: `true`.
    - `snap`: Enable or disable if you want to snap visor to the container. Default: `true`.

```js
var visor = new Visor({
    'size': 120,
    'drag': true,
    'snap': false
});
```

#### Visor#show()
Shows an instance of Visor.

```js
visor.show();
```

#### Visor#hide()
Hides an instance of Visor.

```js
visor.hide();
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