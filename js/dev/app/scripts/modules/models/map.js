define(['backbone', 'underscore', 'jquery', 'modules/config'], function (Backbone, _) {
  App.Models.Map = Backbone.Model.extend({

    _fitBounds: false,

    initialize: function () {
      this.myLatlng = new google.maps.LatLng(-3.71969, -38.52562);
      this.myOptions = {
        zoom: 13,
        center: this.myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      this.map = new google.maps.Map(document.getElementById('map_canvas'), this.myOptions);
      this.setArrows = new ArrowHandler(this.map);
      this.lines = [];

      var theMap = this;

      this.drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_LEFT,
          drawingModes: [google.maps.drawing.OverlayType.MARKER]
        },
        markerOptions: {
          draggable: true
        }
      });

      google.maps.event.addListener(this.drawingManager, 'markercomplete', function (marker) {
        busMap._markerList.add(marker);

      });

      this.drawingManager.setMap(this.map);
      var drawingManager = this.drawingManager;

      $(".addmarker").bind("touchstart click", function () {
        busMap._markerList.add(new google.maps.Marker({
          position: busMap.getMap().center,
          map: busMap.getMap(),
          draggable: true
        }));
      });

      $("#searchAddress").bind("submit", function (e) {
        var address = document.getElementById('address').value;
        busMap._mapAddressFinder.addMarkerAtAddress(address);
        e.preventDefault();
      });

    },
    url: function () {
      //HACK because etufor data set is not consistent
      if (this.name != 'undefined' && this.name.length == 2) {
        this.name = this.name + " -";
      }
      return app.params.urlFusionTable + "?sql=SELECT geometry FROM " + app.params.idFusionTable + " WHERE name STARTS WITH '" + this.name + "'&key=" + app.params.keyFusionTable + "&callback=?";
    },
    parse: function (response) {
      //Clear map
      this.clear();

      var lines = this.lines;
      var setArrows = this.setArrows;
      var map = this.map;

      //Parse response
      response.rows = _.flatten(response.rows);

      //if line found
      if (response.rows.length > 0) {

        //Bounds to get the center of the line
        var bounds = new google.maps.LatLngBounds();

        //For each coordinate, create a gmap.Latlng object, and display it
        response.rows = _.each(response.rows, function (row) {
          row.geometry.coordinates = _.map(row.geometry.coordinates, function (coord) {
            var coordinate = new google.maps.LatLng(coord[1], coord[0]);
            bounds.extend(coordinate);
            return coordinate;

          });
          lines.push(createPoly(row.geometry.coordinates, "midline", setArrows, map));
        });

        if (this._fitBounds) {
          this.map.fitBounds(bounds);
        }

      }

      busMap.ready();

      this._fitBounds = false;
    },
    displayLine: function (name) {
      busMap.loading();
      this.name = name;
      this.fetch();
    },
    getMap: function () {
      return this.map;
    },
    clear: function () {
      //remove previous lines
      _.each(this.lines, function (line) {
        line.setMap(null);
      });

      //remove all previous arrows
      _.each(this.setArrows.arrows, function (arrow) {
        arrow.setMap(null);
      });
      //reinit set of arrows
      this.setArrows.arrows = [];
    }
  });
});
