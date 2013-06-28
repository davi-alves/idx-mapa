define(['backbone', 'underscore', 'jquery'], function (Backbone, _) {
  /*
  |-----------------------------------------------------------------------
  | Application init
  |-----------------------------------------------------------------------
   */
  window.App = {
    Models: {},
    Views: {},
    Collections: {},
    Routers: {}
  };

  /*
  |-----------------------------------------------------------------------
  | Configs
  |-----------------------------------------------------------------------
   */
   App.Configs = {
    urlFusionTable: "https://www.googleapis.com/fusiontables/v1/query",
    idFusionTable: "1ugP-dIxvkhmfuMNfZo_NyIQs5kMGpaFMbP7YG2o",
    keyFusionTable: "AIzaSyBRyScJQs2pPRyapmYmZzDPZvClbet2Bdc"
  };

  /*
  |-----------------------------------------------------------------------
  | Helpers
  |-----------------------------------------------------------------------
   */
  // global event extension
  window.vent = _.extend({}, Backbone.Events);

  /*
  |-----------------------------------------------------------------------
  | Inits
  |-----------------------------------------------------------------------
   */
  Backbone.history.start();
});
