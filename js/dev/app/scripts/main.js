/*global require*/
require.config({
  shim: {
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: [
        'underscore',
        'jquery'
      ],
      exports: 'Backbone'
    },
    jqueryChosen: {
      deps: [
        'jquery'
      ]
    }
  },
  paths: {
    jquery: 'vendor/jquery-1.8.0-min',
    backbone: 'vendor/backbone-amd/backbone',
    underscore: 'vendor/underscore-amd/underscore',
    jqueryChosen: 'vendor/chosen.jquery.min',
    icanhaz: 'vendor/icanhaz.min',
    distanceWidget: 'helpers/distanceWidget',
    arrowsWidget: 'helpers/arrows'
  }
});

require(['modules/routers', 'icanhaz'], function () {
  ich.grabTemplates();
});
