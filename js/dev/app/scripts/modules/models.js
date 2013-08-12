define(['backbone', 'underscore', 'jqueryChosen', 'arrowsWidget', 'distanceWidget', 'modules/config', 'modules/views'], function (Backbone, _) {

  /*
  |-----------------------------------------------------------------------
  | Map Model
  |-----------------------------------------------------------------------
   */
  App.Models.Map = Backbone.Model.extend({
    _fitBounds: false,

    initialize: function () {
      this.mapLatLang = new google.maps.LatLng(-3.71969, -38.52562);
      this.mapOptions = {
        zoom: 13,
        center: this.mapLatLang,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      this.map = new google.maps.Map(document.getElementById('map_canvas'), this.mapOptions);
      this.setArrows = new ArrowHandler(this.map);
      this.lines = [];

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
        App.busMap._markerList.add(marker);
      });

      this.drawingManager.setMap(this.map);

      $(".addmarker").bind("touchstart click", function () {
        App.busMap._markerList.add(new google.maps.Marker({
          position: App.busMap.getMap().center,
          map: App.busMap.getMap(),
          draggable: true
        }));
      });

      $("#searchAddress").bind("submit", function (e) {
        var address = document.getElementById('address').value;
        var address2 = document.getElementById('address2').value;
        App.busMap._mapAddressFinder.addMarkerAtAddress(address, address2);
        e.preventDefault();
      });

    },
    url: function () {
      //HACK because etufor data set is not consistent
      if (this.name != 'undefined' && this.name.length == 2) {
        this.name = this.name + " -";
      }
      return App.Configs.urlFusionTable + "?sql=SELECT geometry FROM " + App.Configs.idFusionTable + " WHERE name STARTS WITH '" + this.name + "'&key=" + App.Configs.keyFusionTable + "&callback=?";
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

      App.busMap.ready();

      this._fitBounds = false;
    },
    displayLine: function (name) {
      App.busMap.loading();
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

  App.Models.MapAddressFinder = Backbone.Model.extend({
    _geocoder: new google.maps.Geocoder(),
    _fortalezaBounds: new google.maps.LatLngBounds(new google.maps.LatLng(-3.87, -38.65), new google.maps.LatLng(-3.691682, -38.4)),

    addMarkerAtAddress: function (address, secondAddress) {
      var self = this;
      this.locationForAddress(address, function (firstHitLocation) {
        App.busMap.getMap().setCenter(firstHitLocation);
        App.busMap._markerList.add(new google.maps.Marker({
          position: firstHitLocation,
          map: App.busMap.getMap(),
          draggable: true
        }));
        if (secondAddress) {
          self.secondAddress(secondAddress);
        }
      });
    },

    secondAddress: function (address) {
      this.addMarkerAtAddress(address);
    },

    forceResultsInBounds: function (results, bounds) {
      return _.select(results, function (result) {
        return bounds.contains(result.geometry.location);
      });
    },

    locationForAddress: function (address, callback) {
      var addressFinder = this;
      this._geocoder.geocode({
        'address': address,
        'bounds': this._fortalezaBounds,
        'region': 'br'
      }, function (results, status) {

        var resultsInFortaleza = addressFinder.forceResultsInBounds(results, addressFinder._fortalezaBounds);

        if (status == google.maps.GeocoderStatus.OK && resultsInFortaleza.length > 0) {
          $(".noaddressfound").addClass("hidden");
          callback(resultsInFortaleza[0].geometry.location);
        } else {
          $(".noaddressfound").removeClass("hidden");
        }
      });
    }
  });

  App.Models.Marker = Backbone.Model.extend({
    initialize: function (marker) {
      var me = this;
      this.marker = marker;
      this._radius = 500; //initialize radius
      this.name = marker.name;

      this.markerOptions = {
        map: this.marker.map,
        distance: 0.5, // Starting distance in km.
        maxDistance: 2500, // Twitter has a max distance of 2500km.
        color: '#000000',
        fillColor: '#5599bb',
        fillOpacity: '0.3',
        activeColor: '#5599bb',
        sizerIcon: new google.maps.MarkerImage('img/resize-off.png'),
        activeSizerIcon: new google.maps.MarkerImage('img/resize.png')
      };

      //Attach DistanceWidgetto the marker
      this.distanceWidget = new DistanceWidget(this.marker, this.markerOptions);
      var currentDistanceWidget = this.distanceWidget;

      google.maps.event.addListener(currentDistanceWidget.radiusWidget.circle, 'active_changed', function () {
        me._radius = currentDistanceWidget.get('distance') * 1000;
        me.fetchLines();
      });


      google.maps.event.addListener(this.marker, 'dragend', function (mouse) {
        me.fetchLines();

      });

      this.fetchLines();
    },
    url: function () {
      return App.Configs.urlFusionTable + "?sql=SELECT name FROM " + App.Configs.idFusionTable + " WHERE ST_INTERSECTS(geometry,CIRCLE(LATLNG(" + this.marker.getPosition().lat() + "," + this.marker.getPosition().lng() + ")," + this._radius + "))&key=" + App.Configs.keyFusionTable + "&callback=?";
    },
    parse: function (response) {
      response.rows = _.flatten(response.rows);
      //we remove the last part of the
      response.rows = _.map(response.rows, function (row) {
        var array = row.split("-");
        return array[0] + "-" + array[1];
      });
      //throw away duplicate values
      response.rows = _.uniq(response.rows);

      return response;
    },
    fetchLines: function () {
      App.busMap.loading();
      this.fetch({
        success: function (model, response) {
          App.busMap._markerList.updateLineList();
        },
        error: function () {}
      });
    }

  });

  App.Models.LineList = Backbone.Model.extend({
    _viewSelect: null,
    _viewSidebar: null,
    _totalLines: null,

    initialize: function () {
      var me = this;
      this.bind("change", function () {
        me.updateViews();
      });
      this.fetch();
    },
    url: function () {
      return App.Configs.urlFusionTable + "?sql=SELECT name FROM " + App.Configs.idFusionTable + "&key=" + App.Configs.keyFusionTable + "&callback=?";
    },
    parse: function (response) {
      response.rows = _.flatten(response.rows);

      //if line found
      if (response.rows.length > 0) {
        App.busMap.maintenanceMode(false);
      } else {
        App.busMap.maintenanceMode(true);
      }

      var rowTampon = "";
      response.rows = _.reject(response.rows, function (row) {
        if (row.split("-")[2] == " Volta" && row.split("-")[1] == rowTampon) {
          rowTampon = row.split("-")[1];
          return true;
        } else {
          rowTampon = row.split("-")[1];
          return false;
        }
      });

      response.rows = _.map(response.rows, function (row) {
        var array = row.split("-");
        return {
          num: array[0],
          label: array[0] + array[1]
        };
      });

      response._totalLines = response.rows.length;

      return response;
    },
    reinit: function () {
      this.fetch();
      this.updateViews();
      App.busMap._map.clear();
    },
    updateViews: function () {
      var self = this;
      this._viewSelect = new App.Views.LineListSelect({
        model: self
      });
      this._viewSelect.render();
      this._viewSidebar = new App.Views.LineListSidebar({
        model: self
      });
      this._viewSidebar.render();
      App.busMap.trigger("finishListLoading");
    }
  });

});
