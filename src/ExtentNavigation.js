
define([
  "dojo/dom-class",
  "dojo/dom-attr",
  "dojo/on",

  "dijit/_TemplatedMixin",
  "dijit/a11yclick",

  "esri/core/watchUtils",

  "esri/widgets/support/viewModelWiring",
  "esri/widgets/Widget",

  "./ExtentNavigation/ExtentNavigationViewModel",

  "dojo/i18n!./ExtentNavigation/nls/ExtentNavigation",

  "dojo/text!./ExtentNavigation/templates/ExtentNavigation.html"
],
function (
  domClass, domAttr, on,
  _TemplatedMixin, a11yclick,
  watchUtils,
  viewModelWiring, Widget, 
  ExtentNavigationViewModel,
  i18n,
  templateString
) {

  var CSS = {
    base: "esri-extentnavigation-toggle",
    button: "esri-extentnavigation-toggle__button esri-widget-button",
    text: "esri-icon-font-fallback-text",
    disabled: "esri-disabled",
    borderLeft: "esri-extentnavigation-border-left",
    // icons
    extentNavigationPreviousIcon: "esri-icon-extentnavigation-previous",
    extentNavigationNextIcon: "esri-icon-extentnavigation-next"   
  };

  return Widget.createSubclass([_TemplatedMixin],
  {
    properties: {
      view: {
        dependsOn: ["viewModel.view"]
      },
      viewModel: {
        type: ExtentNavigationViewModel
      },      
      numberOfExtentsToStore: {
        dependsOn: ["viewModel.numberOfExtentsToStore"]
      }
    },

    declaredClass: "custom.widgets.ExtentNavigation",

    baseClass: CSS.base,

    templateString: templateString,

    postCreate: function () {
      this.inherited(arguments);

      this.own(
        watchUtils.init(this, "viewModel.state", this._handleState),
        watchUtils.init(this, "viewModel.canGoToPrevious", this._updatePreviousButton),
        watchUtils.init(this, "viewModel.canGoToNext", this._updateNextButton),
        on(this._previousButtonNode, a11yclick, this.viewModel.goToPrevious),
        on(this._nextButtonNode, a11yclick, this.viewModel.goToNext)
      );
    },

    _css: CSS,

    _i18n: i18n,

    _getViewAttr: viewModelWiring.createGetterDelegate("view"),
    _setViewAttr: viewModelWiring.createSetterDelegate("view"),

    _getNumberOfExtentsToStoreAttr: viewModelWiring.createGetterDelegate("numberOfExtentsToStore"),
    _setNumberOfExtentsToStoreAttr: viewModelWiring.createSetterDelegate("numberOfExtentsToStore"),

    goToPrevious: viewModelWiring.createMethodDelegate("goToPrevious"),

    goToNext: viewModelWiring.createMethodDelegate("goToNext"),

    _handleState: function (value) {
      var disabled = value === "disabled";

      domClass.toggle(this.domNode, CSS.disabled, disabled);
      domAttr.set(this.domNode, "tabindex", disabled ? "" : 0);
    },

    _updatePreviousButton: function (canGoToPrevious) {
      
      domClass.toggle(this._previousButtonNode, CSS.disabled, !canGoToPrevious);
    },

    _updateNextButton: function (canGoToNext) {
      
      domClass.toggle(this._nextButtonNode, CSS.disabled, !canGoToNext);
    }
  });
});