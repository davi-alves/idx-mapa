define(['backbone', 'underscore', 'jquery', 'modules/config', 'modules/models'], function (Backbone, _) {

  /*
  |-----------------------------------------------------------------------
  | List of Markers
  |-----------------------------------------------------------------------
   */
  App.Collections.MarkerList = Backbone.Collection.extend({
    _view: null,
    model: App.Models.Marker,
    updateLineList: function () {
      this._view = new App.Views.MarkerList({
        model: this
      });
      this._view.render();
      var listLines = this.computeLineList();
      //if there is marker on the map
      if (this.models.length > 0) {
        App.busMap._lineList.set(this.computeLineList());
        App.busMap._lineList.updateViews();
        //if there are lines corresponding
        if (listLines.rows.length > 0) {
          App.busMap.displayLine(listLines.rows[0].num);
          //HACK: no more marker TODO: change the logic
          App.busMap.linesFound();
        } else {
          App.busMap.noLinesFound();
        }
      } else {
        App.busMap._lineList.reinit();
        //HACK: no more marker TODO: change the logic
        App.busMap.linesFound();
      }

    },
    computeLineList: function () {
      var markers_routes = this.models.map(function (mark) {
        return mark.attributes.rows;
      });
      var linesIntersection = _.intersection.apply(this, markers_routes);
      var response = {
        rows: linesIntersection.map(function (row) {
          var array = row.split("-");
          return {
            num: array[0],
            label: array[0] + array[1]
          };
        }),
        _totalLines: linesIntersection.length
      };
      return response;
    },
    toJSON: function () {
      var listMarkers = this.models;
      return {
        models: _.map(listMarkers, function (mark, i) {
          if (mark.name) {
            return {
              name: mark.name,
              index: i
            };
          } else {
            return {
              name: 'Ponto ' + (i + 1),
              index: i
            };
          }
        })
      };
    },
    removeByIndex: function (index) {
      var markerToRemove = this.at(index);
      this.remove(markerToRemove);
      markerToRemove.marker.setMap(null);
      markerToRemove.distanceWidget = null;
      this.updateLineList();
    }
  });

});
