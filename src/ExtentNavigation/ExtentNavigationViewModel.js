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
        dependsOn: ["view.ready", "view.viewpoint", "view.stationary"],
        readOnly: !0
      },
      canGoToNext: {
        dependsOn: ["view.ready", "view.viewpoint", "view.stationary"],
        readOnly: !0
      },
      view: {},
      numberOfExtentsToStore: 20
    },

    constructor: function() {

      this._handles = new HandleRegistry;
      this.goToPrevious = this.goToPrevious.bind(this);   
      this.goToNext = this.goToNext.bind(this);   
      this._stationaryChanged =  this._stationaryChanged.bind(this);
      this._addAndUpdateExtentState = this._addAndUpdateExtentState.bind(this);
    },

    initialize: function() {


      watchUtils.whenOnce(this, "view").then(function(view) { 

        this._handles.add(watchUtils.init(this, "state", function(stateVal) {

          this._handles.remove("view-ready-watcher");

          if (stateVal === state.ready) {

            this._addAndUpdateExtentState(this.view.viewpoint);             
            this._handles.add(watchUtils.whenTrue(this.view, "stationary", this._stationaryChanged), "stationary-watcher");  
          }
        }.bind(this)), "view-ready-watcher");
      }.bind(this));
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

    _viewpointHistory: [],

    _currentIndex: 0,

    _stationaryChanged: function (obj, prop, callback) {
    
      this._addAndUpdateExtentState(this.view.viewpoint);
    },  

    _addAndUpdateExtentState: function (newValue) {
      
      var newExtent = newValue.clone();

      var current = this._viewpointHistory.length > 0 ? this._viewpointHistory[this._currentIndex] : null;

      if (current && newExtent.targetGeometry.equals(current.targetGeometry) && newExtent.scale === current.scale) {
        return;
      }

      console.log(newValue.toJSON());

      this._viewpointHistory.splice(this._currentIndex === 0 && this._viewpointHistory.length === 0 ? 0 : this._currentIndex + 1, 0, newExtent); 

      if (this._viewpointHistory.length > this.numberOfExtentsToStore + 1) {

        this._viewpointHistory.splice(0, 1);
      }

      this._currentIndex = 0;
      for (var i = this._viewpointHistory.length - 1; i > 0; i--) {

        var test = this._viewpointHistory[i];

        if (newExtent.targetGeometry.equals(test.targetGeometry)) {

          this._currentIndex = i;
          break;
        }
      }
    },

    canGoToPrevious: false,
    _canGoToPreviousGetter: function() {
      
      return this._currentIndex > 0;
    },

    _canGoToNextGetter: function() {
      
      return (this._currentIndex + 1) < this._viewpointHistory.length;
    },    
    
    goToPrevious: function(e) {

      e.preventDefault();

      if (this.state === state.disabled) {
        return;
      }

      this.get("canGoToPrevious") && this._goToExtent(this._currentIndex - 1);
    },

    goToNext: function(e) {

      e.preventDefault();

      if (this.state === state.disabled) {
        return;
      }

      this.get("canGoToNext") && this._goToExtent(this._currentIndex + 1);
    },

    _goToExtent: function(extentIndex) {     

      this._currentIndex = extentIndex;
      this.view.goTo(this._viewpointHistory[this._currentIndex]);
    }
  })
});
