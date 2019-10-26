(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"mizzao:timesync":{"server":{"index.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////
//                                                                              //
// packages/mizzao_timesync/server/index.js                                     //
//                                                                              //
//////////////////////////////////////////////////////////////////////////////////
                                                                                //
module.link("./timesync-server");
//////////////////////////////////////////////////////////////////////////////////

},"timesync-server.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////
//                                                                              //
// packages/mizzao_timesync/server/timesync-server.js                           //
//                                                                              //
//////////////////////////////////////////////////////////////////////////////////
                                                                                //
let WebApp;
module.link("meteor/webapp", {
  WebApp(v) {
    WebApp = v;
  }

}, 0);
// Use rawConnectHandlers so we get a response as quickly as possible
// https://github.com/meteor/meteor/blob/devel/packages/webapp/webapp_server.js
var syncUrl = "/_timesync";

if (__meteor_runtime_config__.ROOT_URL_PATH_PREFIX) {
  syncUrl = __meteor_runtime_config__.ROOT_URL_PATH_PREFIX + syncUrl;
}

WebApp.rawConnectHandlers.use(syncUrl, function (req, res, next) {
  // Never ever cache this, otherwise weird times are shown on reload
  // http://stackoverflow.com/q/18811286/586086
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", 0); // Avoid MIME type warnings in browsers

  res.setHeader("Content-Type", "text/plain");
  res.end(Date.now().toString());
});
//////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/mizzao:timesync/server/index.js");

/* Exports */
Package._define("mizzao:timesync", exports);

})();

//# sourceURL=meteor://💻app/packages/mizzao_timesync.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWl6emFvOnRpbWVzeW5jL3NlcnZlci9pbmRleC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWl6emFvOnRpbWVzeW5jL3NlcnZlci90aW1lc3luYy1zZXJ2ZXIuanMiXSwibmFtZXMiOlsibW9kdWxlIiwibGluayIsIldlYkFwcCIsInYiLCJzeW5jVXJsIiwiX19tZXRlb3JfcnVudGltZV9jb25maWdfXyIsIlJPT1RfVVJMX1BBVEhfUFJFRklYIiwicmF3Q29ubmVjdEhhbmRsZXJzIiwidXNlIiwicmVxIiwicmVzIiwibmV4dCIsInNldEhlYWRlciIsImVuZCIsIkRhdGUiLCJub3ciLCJ0b1N0cmluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBQSxNQUFNLENBQUNDLElBQVAsQ0FBWSxtQkFBWixFOzs7Ozs7Ozs7OztBQ0FBLElBQUlDLE1BQUo7QUFBV0YsTUFBTSxDQUFDQyxJQUFQLENBQVksZUFBWixFQUE0QjtBQUFDQyxRQUFNLENBQUNDLENBQUQsRUFBRztBQUFDRCxVQUFNLEdBQUNDLENBQVA7QUFBUzs7QUFBcEIsQ0FBNUIsRUFBa0QsQ0FBbEQ7QUFDWDtBQUNBO0FBRUEsSUFBSUMsT0FBTyxHQUFHLFlBQWQ7O0FBQ0EsSUFBSUMseUJBQXlCLENBQUNDLG9CQUE5QixFQUFvRDtBQUNuREYsU0FBTyxHQUFHQyx5QkFBeUIsQ0FBQ0Msb0JBQTFCLEdBQWlERixPQUEzRDtBQUNBOztBQUVERixNQUFNLENBQUNLLGtCQUFQLENBQTBCQyxHQUExQixDQUE4QkosT0FBOUIsRUFDRSxVQUFTSyxHQUFULEVBQWNDLEdBQWQsRUFBbUJDLElBQW5CLEVBQXlCO0FBQ3ZCO0FBQ0E7QUFDQUQsS0FBRyxDQUFDRSxTQUFKLENBQWMsZUFBZCxFQUErQixxQ0FBL0I7QUFDQUYsS0FBRyxDQUFDRSxTQUFKLENBQWMsUUFBZCxFQUF3QixVQUF4QjtBQUNBRixLQUFHLENBQUNFLFNBQUosQ0FBYyxTQUFkLEVBQXlCLENBQXpCLEVBTHVCLENBT3ZCOztBQUNBRixLQUFHLENBQUNFLFNBQUosQ0FBYyxjQUFkLEVBQThCLFlBQTlCO0FBRUFGLEtBQUcsQ0FBQ0csR0FBSixDQUFRQyxJQUFJLENBQUNDLEdBQUwsR0FBV0MsUUFBWCxFQUFSO0FBQ0QsQ0FaSCxFIiwiZmlsZSI6Ii9wYWNrYWdlcy9taXp6YW9fdGltZXN5bmMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4vdGltZXN5bmMtc2VydmVyJzsiLCJpbXBvcnQgeyBXZWJBcHAgfSBmcm9tICdtZXRlb3Ivd2ViYXBwJztcbi8vIFVzZSByYXdDb25uZWN0SGFuZGxlcnMgc28gd2UgZ2V0IGEgcmVzcG9uc2UgYXMgcXVpY2tseSBhcyBwb3NzaWJsZVxuLy8gaHR0cHM6Ly9naXRodWIuY29tL21ldGVvci9tZXRlb3IvYmxvYi9kZXZlbC9wYWNrYWdlcy93ZWJhcHAvd2ViYXBwX3NlcnZlci5qc1xuXG52YXIgc3luY1VybCA9IFwiL190aW1lc3luY1wiO1xuaWYgKF9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18uUk9PVF9VUkxfUEFUSF9QUkVGSVgpIHtcblx0c3luY1VybCA9IF9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18uUk9PVF9VUkxfUEFUSF9QUkVGSVggKyBzeW5jVXJsO1xufVxuXG5XZWJBcHAucmF3Q29ubmVjdEhhbmRsZXJzLnVzZShzeW5jVXJsLFxuICBmdW5jdGlvbihyZXEsIHJlcywgbmV4dCkge1xuICAgIC8vIE5ldmVyIGV2ZXIgY2FjaGUgdGhpcywgb3RoZXJ3aXNlIHdlaXJkIHRpbWVzIGFyZSBzaG93biBvbiByZWxvYWRcbiAgICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcS8xODgxMTI4Ni81ODYwODZcbiAgICByZXMuc2V0SGVhZGVyKFwiQ2FjaGUtQ29udHJvbFwiLCBcIm5vLWNhY2hlLCBuby1zdG9yZSwgbXVzdC1yZXZhbGlkYXRlXCIpO1xuICAgIHJlcy5zZXRIZWFkZXIoXCJQcmFnbWFcIiwgXCJuby1jYWNoZVwiKTtcbiAgICByZXMuc2V0SGVhZGVyKFwiRXhwaXJlc1wiLCAwKTtcblxuICAgIC8vIEF2b2lkIE1JTUUgdHlwZSB3YXJuaW5ncyBpbiBicm93c2Vyc1xuICAgIHJlcy5zZXRIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJ0ZXh0L3BsYWluXCIpO1xuXG4gICAgcmVzLmVuZChEYXRlLm5vdygpLnRvU3RyaW5nKCkpO1xuICB9XG4pO1xuIl19
