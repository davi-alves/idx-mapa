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
    }
  },
  paths: {
    jquery: 'vendor/jquery/jquery',
    backbone: 'vendor/backbone-amd/backbone',
    underscore: 'vendor/underscore-amd/underscore'
  }
});

require(['modules/models/map'], function () {

});
