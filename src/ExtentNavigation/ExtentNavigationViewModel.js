define([
  "esri/core/Accessor", 
  "esri/core/HandleRegistry",
  "esri/core/watchUtils"
], function(Accessor, HandleRegistry, watchUtils) {

  var state = {
    disabled: "disabled",
    ready: "ready"
  };

  return Accessor.createSubclass({

    declaredClass: "custom.widgets.ExtentNavigationViewModel",
    properties: {
      state: {
        dependsOn: ["view.ready"],
        readOnly: !0
      },
      canGoToPrevious: {
        dependsOn: ["view.ready", "view.extent", "view.viewpoint", "view.zoom", "view.interacting"],
        readOnly: !0
      },
      canGoToNext: {
        dependsOn: ["view.ready", "view.extent", "view.viewpoint", "view.zoom", "view.interacting"],
        readOnly: !0
      },
      view: {},
      numberOfExtentsToStore: 20
    },

    constructor: function() {

      this._handles = new HandleRegistry;
      this.goToPrevious = this.goToPrevious.bind(this);   
      this.goToNext = this.goToNext.bind(this);   
      this._viewExtentChanged =  this._debounce(this._viewExtentChanged.bind(this), 250);
      this._interactingChanged =  this._interactingChanged.bind(this);
      this._addAndUpdateExtentState = this._addAndUpdateExtentState.bind(this);
    },

    initialize: function() {

      this._handles.add(watchUtils.watch(this, "view", function(view) {

        if (view) {
          
          this._handles.remove("view-watcher");

          this._handles.add(watchUtils.init(this, "state", function(stateVal) {
            
            if (stateVal === state.ready) {

              this._handles.remove("view-ready-watcher");

              this._addAndUpdateExtentState(this.view.extent);              
              this._handles.add(watchUtils.watch(this.view, "interacting", this._interactingChanged), "interaction-watcher");
              this._handles.add(watchUtils.watch(this.view, "extent", this._viewExtentChanged), "extent-watcher");
            }            
          }.bind(this)), "view-ready-watcher");
        }                
      }.bind(this)), "view-watcher");
    },

    destroy: function() {
            
      this._handles.destroy();
      this._handles = null;
    },
    
    _handles: null,

    state: state.disabled,
    _stateGetter: function() {

      return this.get("view.ready") ? state.ready : state.disabled
    },
      
    view: null,

    _numberOfExtentsToStoreGetter: function() {

      return this._get("numberOfExtentsToStore");
    },
    _numberOfExtentsToStoreSetter: function(numberOfExtentsToStore) {

      this._set("numberOfExtentsToStore", numberOfExtentsToStore)
    },

    _extentHistory: [],

    _currentExtentIndex: 0,

    _interactingChanged: function (newValue, oldValue, propertyName, target) {
    
      if (newValue) {
        return;
      }

      this._addAndUpdateExtentState(this.view.extent);
    },

    _viewExtentChanged: function (newValue, oldValue, propertyName, target) {

      if (this.view.interacting) {
        return;
      }

      this._addAndUpdateExtentState(newValue);
    },

    _addAndUpdateExtentState: function (newValue) {
      
      var newExtent = newValue.clone();

      if (newExtent.equals(this._extentHistory[this._currentExtentIndex])) {
        return;
      }

      console.log(newValue.toJSON());

      this._extentHistory.splice(this._currentExtentIndex === 0 && this._extentHistory.length === 0 ? 0 : this._currentExtentIndex + 1, 0, newExtent); 

      if (this._extentHistory.length > this.numberOfExtentsToStore + 1) {

        this._extentHistory.splice(0, 1);
      }

      this._currentExtentIndex = 0;
      for (var i = this._extentHistory.length - 1; i > 0; i--) {

        var test = this._extentHistory[i];

        if (newExtent.equals(test)) {

          this._currentExtentIndex = i;
          break;
        }
      }
    },

    canGoToPrevious: false,
    _canGoToPreviousGetter: function() {
      
      return this._currentExtentIndex > 0;
    },

    _canGoToNextGetter: function() {
      
      return this._currentExtentIndex + 1 < this._extentHistory.length;
    },    
    
    goToPrevious: function(e) {

      if (this.state === state.disabled) {
        return;
      }

      this.get("canGoToPrevious") && this._goToExtent(this._currentExtentIndex - 1);
    },

    goToNext: function(e) {

      if (this.state === state.disabled) {
        return;
      }

      this.get("canGoToNext") && this._goToExtent(this._currentExtentIndex + 1);
    },

    _goToExtent: function(extentIndex) {     

      this._handles.remove("extent-watcher");

      this._currentExtentIndex = extentIndex;
      this.view.extent = this._extentHistory[this._currentExtentIndex];

      this._handles.add(watchUtils.watch(this.view, "extent", this._viewExtentChanged), "extent-watcher");
    },

    _debounce: function(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this, args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    }   
  })
});
