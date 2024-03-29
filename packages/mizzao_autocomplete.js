(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"mizzao:autocomplete":{"server":{"index.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                        //
// packages/mizzao_autocomplete/server/index.js                                           //
//                                                                                        //
////////////////////////////////////////////////////////////////////////////////////////////
                                                                                          //
module.link("./autocomplete-server");
////////////////////////////////////////////////////////////////////////////////////////////

},"autocomplete-server.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                        //
// packages/mizzao_autocomplete/server/autocomplete-server.js                             //
//                                                                                        //
////////////////////////////////////////////////////////////////////////////////////////////
                                                                                          //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 1);
// This also attaches an onStop callback to sub, so we don't need to worry about that.
// https://github.com/meteor/meteor/blob/devel/packages/mongo/collection.js
const Autocomplete = class {
  publishCursor(cursor, sub) {
    Mongo.Collection._publishCursor(cursor, sub, 'autocompleteRecords');
  }

};
Meteor.publish('autocomplete-recordset', function (selector, options, collName) {
  const collection = global[collName]; // This is a semi-documented Meteor feature:
  // https://github.com/meteor/meteor/blob/devel/packages/mongo-livedata/collection.js

  if (!collection) {
    throw new Error(`${collName} is not defined on the global namespace of the server.`);
  }

  if (!collection._isInsecure()) {
    Meteor._debug(`${collName} is a secure collection, therefore no data was returned because the client could compromise security by subscribing to arbitrary server collections via the browser console. Please write your own publish function.`);

    return []; // We need this for the subscription to be marked ready
  }

  if (options.limit) {
    // guard against client-side DOS: hard limit to 50
    options.limit = Math.min(50, Math.abs(options.limit));
  } // Push this into our own collection on the client so they don't interfere with other publications of the named collection.
  // This also stops the observer automatically when the subscription is stopped.


  Autocomplete.publishCursor(collection.find(selector, options), this); // Mark the subscription ready after the initial addition of documents.

  this.ready();
});
////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/mizzao:autocomplete/server/index.js");

/* Exports */
Package._define("mizzao:autocomplete", exports);

})();

//# sourceURL=meteor://💻app/packages/mizzao_autocomplete.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWl6emFvOmF1dG9jb21wbGV0ZS9zZXJ2ZXIvaW5kZXguanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21penphbzphdXRvY29tcGxldGUvc2VydmVyL2F1dG9jb21wbGV0ZS1zZXJ2ZXIuanMiXSwibmFtZXMiOlsibW9kdWxlIiwibGluayIsIk1ldGVvciIsInYiLCJNb25nbyIsIkF1dG9jb21wbGV0ZSIsInB1Ymxpc2hDdXJzb3IiLCJjdXJzb3IiLCJzdWIiLCJDb2xsZWN0aW9uIiwiX3B1Ymxpc2hDdXJzb3IiLCJwdWJsaXNoIiwic2VsZWN0b3IiLCJvcHRpb25zIiwiY29sbE5hbWUiLCJjb2xsZWN0aW9uIiwiZ2xvYmFsIiwiRXJyb3IiLCJfaXNJbnNlY3VyZSIsIl9kZWJ1ZyIsImxpbWl0IiwiTWF0aCIsIm1pbiIsImFicyIsImZpbmQiLCJyZWFkeSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQUEsTUFBTSxDQUFDQyxJQUFQLENBQVksdUJBQVosRTs7Ozs7Ozs7Ozs7QUNBQSxJQUFJQyxNQUFKO0FBQVdGLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZLGVBQVosRUFBNEI7QUFBQ0MsUUFBTSxDQUFDQyxDQUFELEVBQUc7QUFBQ0QsVUFBTSxHQUFDQyxDQUFQO0FBQVM7O0FBQXBCLENBQTVCLEVBQWtELENBQWxEO0FBQXFELElBQUlDLEtBQUo7QUFBVUosTUFBTSxDQUFDQyxJQUFQLENBQVksY0FBWixFQUEyQjtBQUFDRyxPQUFLLENBQUNELENBQUQsRUFBRztBQUFDQyxTQUFLLEdBQUNELENBQU47QUFBUTs7QUFBbEIsQ0FBM0IsRUFBK0MsQ0FBL0M7QUFFMUU7QUFDQTtBQUNBLE1BQU1FLFlBQVksR0FBRyxNQUFNO0FBQzFCQyxlQUFhLENBQUNDLE1BQUQsRUFBU0MsR0FBVCxFQUFjO0FBQzFCSixTQUFLLENBQUNLLFVBQU4sQ0FBaUJDLGNBQWpCLENBQWdDSCxNQUFoQyxFQUF3Q0MsR0FBeEMsRUFBNkMscUJBQTdDO0FBQ0E7O0FBSHlCLENBQTNCO0FBTUFOLE1BQU0sQ0FBQ1MsT0FBUCxDQUFlLHdCQUFmLEVBQXlDLFVBQVNDLFFBQVQsRUFBbUJDLE9BQW5CLEVBQTRCQyxRQUE1QixFQUFzQztBQUM5RSxRQUFNQyxVQUFVLEdBQUdDLE1BQU0sQ0FBQ0YsUUFBRCxDQUF6QixDQUQ4RSxDQUc5RTtBQUNBOztBQUNBLE1BQUksQ0FBQ0MsVUFBTCxFQUFpQjtBQUNoQixVQUFNLElBQUlFLEtBQUosQ0FBVyxHQUFHSCxRQUFVLHdEQUF4QixDQUFOO0FBQ0E7O0FBQ0QsTUFBSSxDQUFDQyxVQUFVLENBQUNHLFdBQVgsRUFBTCxFQUErQjtBQUM5QmhCLFVBQU0sQ0FBQ2lCLE1BQVAsQ0FBZSxHQUFHTCxRQUFVLHNOQUE1Qjs7QUFDQSxXQUFPLEVBQVAsQ0FGOEIsQ0FFbkI7QUFDWDs7QUFDRCxNQUFJRCxPQUFPLENBQUNPLEtBQVosRUFBbUI7QUFDbEI7QUFDQVAsV0FBTyxDQUFDTyxLQUFSLEdBQWdCQyxJQUFJLENBQUNDLEdBQUwsQ0FBUyxFQUFULEVBQWFELElBQUksQ0FBQ0UsR0FBTCxDQUFTVixPQUFPLENBQUNPLEtBQWpCLENBQWIsQ0FBaEI7QUFDQSxHQWY2RSxDQWlCOUU7QUFDQTs7O0FBQ0FmLGNBQVksQ0FBQ0MsYUFBYixDQUEyQlMsVUFBVSxDQUFDUyxJQUFYLENBQWdCWixRQUFoQixFQUEwQkMsT0FBMUIsQ0FBM0IsRUFBK0QsSUFBL0QsRUFuQjhFLENBb0I5RTs7QUFDQSxPQUFLWSxLQUFMO0FBQ0EsQ0F0QkQsRSIsImZpbGUiOiIvcGFja2FnZXMvbWl6emFvX2F1dG9jb21wbGV0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnLi9hdXRvY29tcGxldGUtc2VydmVyJztcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgTW9uZ28gfSBmcm9tICdtZXRlb3IvbW9uZ28nO1xuLy8gVGhpcyBhbHNvIGF0dGFjaGVzIGFuIG9uU3RvcCBjYWxsYmFjayB0byBzdWIsIHNvIHdlIGRvbid0IG5lZWQgdG8gd29ycnkgYWJvdXQgdGhhdC5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tZXRlb3IvbWV0ZW9yL2Jsb2IvZGV2ZWwvcGFja2FnZXMvbW9uZ28vY29sbGVjdGlvbi5qc1xuY29uc3QgQXV0b2NvbXBsZXRlID0gY2xhc3Mge1xuXHRwdWJsaXNoQ3Vyc29yKGN1cnNvciwgc3ViKSB7XG5cdFx0TW9uZ28uQ29sbGVjdGlvbi5fcHVibGlzaEN1cnNvcihjdXJzb3IsIHN1YiwgJ2F1dG9jb21wbGV0ZVJlY29yZHMnKTtcblx0fVxufTtcblxuTWV0ZW9yLnB1Ymxpc2goJ2F1dG9jb21wbGV0ZS1yZWNvcmRzZXQnLCBmdW5jdGlvbihzZWxlY3Rvciwgb3B0aW9ucywgY29sbE5hbWUpIHtcblx0Y29uc3QgY29sbGVjdGlvbiA9IGdsb2JhbFtjb2xsTmFtZV07XG5cblx0Ly8gVGhpcyBpcyBhIHNlbWktZG9jdW1lbnRlZCBNZXRlb3IgZmVhdHVyZTpcblx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL21ldGVvci9tZXRlb3IvYmxvYi9kZXZlbC9wYWNrYWdlcy9tb25nby1saXZlZGF0YS9jb2xsZWN0aW9uLmpzXG5cdGlmICghY29sbGVjdGlvbikge1xuXHRcdHRocm93IG5ldyBFcnJvcihgJHsgY29sbE5hbWUgfSBpcyBub3QgZGVmaW5lZCBvbiB0aGUgZ2xvYmFsIG5hbWVzcGFjZSBvZiB0aGUgc2VydmVyLmApO1xuXHR9XG5cdGlmICghY29sbGVjdGlvbi5faXNJbnNlY3VyZSgpKSB7XG5cdFx0TWV0ZW9yLl9kZWJ1ZyhgJHsgY29sbE5hbWUgfSBpcyBhIHNlY3VyZSBjb2xsZWN0aW9uLCB0aGVyZWZvcmUgbm8gZGF0YSB3YXMgcmV0dXJuZWQgYmVjYXVzZSB0aGUgY2xpZW50IGNvdWxkIGNvbXByb21pc2Ugc2VjdXJpdHkgYnkgc3Vic2NyaWJpbmcgdG8gYXJiaXRyYXJ5IHNlcnZlciBjb2xsZWN0aW9ucyB2aWEgdGhlIGJyb3dzZXIgY29uc29sZS4gUGxlYXNlIHdyaXRlIHlvdXIgb3duIHB1Ymxpc2ggZnVuY3Rpb24uYCk7XG5cdFx0cmV0dXJuIFtdOyAvLyBXZSBuZWVkIHRoaXMgZm9yIHRoZSBzdWJzY3JpcHRpb24gdG8gYmUgbWFya2VkIHJlYWR5XG5cdH1cblx0aWYgKG9wdGlvbnMubGltaXQpIHtcblx0XHQvLyBndWFyZCBhZ2FpbnN0IGNsaWVudC1zaWRlIERPUzogaGFyZCBsaW1pdCB0byA1MFxuXHRcdG9wdGlvbnMubGltaXQgPSBNYXRoLm1pbig1MCwgTWF0aC5hYnMob3B0aW9ucy5saW1pdCkpO1xuXHR9XG5cblx0Ly8gUHVzaCB0aGlzIGludG8gb3VyIG93biBjb2xsZWN0aW9uIG9uIHRoZSBjbGllbnQgc28gdGhleSBkb24ndCBpbnRlcmZlcmUgd2l0aCBvdGhlciBwdWJsaWNhdGlvbnMgb2YgdGhlIG5hbWVkIGNvbGxlY3Rpb24uXG5cdC8vIFRoaXMgYWxzbyBzdG9wcyB0aGUgb2JzZXJ2ZXIgYXV0b21hdGljYWxseSB3aGVuIHRoZSBzdWJzY3JpcHRpb24gaXMgc3RvcHBlZC5cblx0QXV0b2NvbXBsZXRlLnB1Ymxpc2hDdXJzb3IoY29sbGVjdGlvbi5maW5kKHNlbGVjdG9yLCBvcHRpb25zKSwgdGhpcyk7XG5cdC8vIE1hcmsgdGhlIHN1YnNjcmlwdGlvbiByZWFkeSBhZnRlciB0aGUgaW5pdGlhbCBhZGRpdGlvbiBvZiBkb2N1bWVudHMuXG5cdHRoaXMucmVhZHkoKTtcbn0pO1xuIl19
