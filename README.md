# arcgis-extentnavigation-widget
:milky_way: An ArcGIS JS V4 widget that travels through extents.

[![npm](https://img.shields.io/npm/v/arcgis-extentnavigation-widget.svg?maxAge=2592000)](https://www.npmjs.com/package/arcgis-extentnavigation-widget)

Include the style, create the widget, then add it to your map UI

```js
require([
  "custom-widgets/ExtentNavigation"
], function(ExtentNavigation) {

  // create your map and view

  var extentNav = new ExtentNavigation({
    view: view,
    numberOfExtentsToStore: 10 // default is 20
  });
  view.ui.add(extentNav, "top-right");
```

Get it from here or via npm `npm install arcgis-extentnavigation-widget --save`

#### Running locally

Download / clone this repository then run `npm install` > `npm start`
