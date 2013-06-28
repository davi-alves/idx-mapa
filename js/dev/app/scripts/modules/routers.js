define(['backbone', 'underscore', 'jquery', 'modules/config', 'modules/models', 'modules/collections'], function (Backbone, _) {
  App.Routers.Map = Backbone.Router.extend({

    routes: {
      "": "index",
      "linha/:num": "displayLine",
      "default": "notFound"
    },

    initialize: function () {
      this.loading();
      this._lineList = new App.Models.LineList();
      this._markerList = new App.Collections.MarkerList();
      this._map = new App.Models.Map({
        _fitBounds: true
      });
      this._mapAddressFinder = new App.Models.MapAddressFinder();
      this.ready();
    },

    index: function () {
      this.switchToPage("main");
    },

    getMap: function () {
      return this._map.getMap();
    },

    displayLine: function (num) {
      this.on("finishListLoading", function () {
        this._lineList._viewSelect.setSelected(num);
        this._lineList._viewSidebar.setSelected(num);
      });
      App.busMap.navigate("#/linha/" + num);
      this._map.displayLine(num);
      this._lineList._viewSelect.setSelected(num);
      this._lineList._viewSidebar.setSelected(num);
    },

    noLinesFound: function () {
      $(".nolinesfound").removeClass("hidden");
      this._map.ready();
      this._map.clear();
    },

    linesFound: function () {
      $(".nolinesfound").addClass("hidden");
      $(".noaddressfound").addClass("hidden");
    },

    maintenanceMode: function (active) {
      if (active) {
        $(".maintenance").removeClass("hidden");
      } else {
        $(".maintenance").addClass("hidden");
      }
    },

    about: function () {
      console.log('not found');
    },

    switchToPage: function (destination) {
      $(".page").hide();
      $(".nav li").removeClass("active");
      $("#" + destination).show();
      $("." + destination).addClass("active");
    },
    loading: function () {
      $("body").css("cursor", "progress"); //TODO : Refacto in Less file
      $(".loading").removeClass("hidden");
    },
    ready: function () {
      $(".loading").addClass("hidden");
      $("body").css("cursor", "auto");
    }
  });

  App.busMap = new App.Routers.Map();
});
