define(['backbone', 'underscore', 'jquery', 'icanhaz', 'modules/config'], function (Backbone, _) {
  App.Views.MarkerList = Backbone.View.extend({
    el: $("#listmarkers"),

    render: function () {
      $(this.$el).html(ich.markerList(this.model.toJSON()));

      return this;
    }
  });

  App.Views.LineListSelect = Backbone.View.extend({
    el: $("#linelistselect"),

    render: function () {
      $(this.$el).html(ich.lineListSelect(this.model.toJSON()));
      $(".chzn-select").chosen().change(function () {
        App.busMap._map._fitBounds = true;
        var num = $(".chzn-select").val();
        App.busMap.displayLine(num);
      });

      return this;
    },

    setSelected: function (numLine) {
      $(".chzn-select").val(numLine + ' ');
      $(".chzn-select").trigger("liszt:updated");
    }
  });

  App.Views.LineListSidebar = Backbone.View.extend({
    el: $("#linelistsidebar"),

    render: function () {
      $(this.$el).html(ich.lineListSidebar(this.model.toJSON()));
      $("#linelistsidebar td").bind("click touchstart", function (e) {
        var num = $(this).attr("data-num");
        App.busMap._map._fitBounds = true;
        App.busMap.displayLine(num);
        return false;
      });

      return this;
    },

    setSelected: function (numLine) {
      $("#linelistsidebar tr").removeClass("selected");
      $("#linelistsidebar td:contains(" + numLine + ")").parent().addClass("selected");
    }
  });
});
