define(['backbone', 'underscore', 'jquery'], function (Backbone, _) {
  'use strict';

  window.App = {
    Models: {},
    Views: {},
    Collections: {},
    Routers: {}
  };

  window.vent = _.extend({}, Backbone.Events);

  window.template = function (id) {
      return _.template($('#' + id).html());
  };

  Backbone.history.start();
});
