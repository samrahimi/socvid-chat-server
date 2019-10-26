(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"rocketchat:mongo-config":{"server":{"index.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////
//                                                                                       //
// packages/rocketchat_mongo-config/server/index.js                                      //
//                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////
                                                                                         //
let tls;
module.link("tls", {
  default(v) {
    tls = v;
  }

}, 0);
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 1);
// FIX For TLS error see more here https://github.com/RocketChat/Rocket.Chat/issues/9316
// TODO: Remove after NodeJS fix it, more information
// https://github.com/nodejs/node/issues/16196
// https://github.com/nodejs/node/pull/16853
// This is fixed in Node 10, but this supports LTS versions
tls.DEFAULT_ECDH_CURVE = 'auto';
const mongoOptionStr = process.env.MONGO_OPTIONS;

if (typeof mongoOptionStr !== 'undefined') {
  const mongoOptions = JSON.parse(mongoOptionStr);
  Mongo.setConnectionOptions(mongoOptions);
}

process.env.HTTP_FORWARDED_COUNT = process.env.HTTP_FORWARDED_COUNT || '1';
///////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/rocketchat:mongo-config/server/index.js");

/* Exports */
Package._define("rocketchat:mongo-config", exports);

})();

//# sourceURL=meteor://💻app/packages/rocketchat_mongo-config.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcm9ja2V0Y2hhdDptb25nby1jb25maWcvc2VydmVyL2luZGV4LmpzIl0sIm5hbWVzIjpbInRscyIsIm1vZHVsZSIsImxpbmsiLCJkZWZhdWx0IiwidiIsIk1vbmdvIiwiREVGQVVMVF9FQ0RIX0NVUlZFIiwibW9uZ29PcHRpb25TdHIiLCJwcm9jZXNzIiwiZW52IiwiTU9OR09fT1BUSU9OUyIsIm1vbmdvT3B0aW9ucyIsIkpTT04iLCJwYXJzZSIsInNldENvbm5lY3Rpb25PcHRpb25zIiwiSFRUUF9GT1JXQVJERURfQ09VTlQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLElBQUlBLEdBQUo7QUFBUUMsTUFBTSxDQUFDQyxJQUFQLENBQVksS0FBWixFQUFrQjtBQUFDQyxTQUFPLENBQUNDLENBQUQsRUFBRztBQUFDSixPQUFHLEdBQUNJLENBQUo7QUFBTTs7QUFBbEIsQ0FBbEIsRUFBc0MsQ0FBdEM7QUFBeUMsSUFBSUMsS0FBSjtBQUFVSixNQUFNLENBQUNDLElBQVAsQ0FBWSxjQUFaLEVBQTJCO0FBQUNHLE9BQUssQ0FBQ0QsQ0FBRCxFQUFHO0FBQUNDLFNBQUssR0FBQ0QsQ0FBTjtBQUFROztBQUFsQixDQUEzQixFQUErQyxDQUEvQztBQUkzRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FKLEdBQUcsQ0FBQ00sa0JBQUosR0FBeUIsTUFBekI7QUFFQSxNQUFNQyxjQUFjLEdBQUdDLE9BQU8sQ0FBQ0MsR0FBUixDQUFZQyxhQUFuQzs7QUFDQSxJQUFJLE9BQU9ILGNBQVAsS0FBMEIsV0FBOUIsRUFBMkM7QUFDMUMsUUFBTUksWUFBWSxHQUFHQyxJQUFJLENBQUNDLEtBQUwsQ0FBV04sY0FBWCxDQUFyQjtBQUVBRixPQUFLLENBQUNTLG9CQUFOLENBQTJCSCxZQUEzQjtBQUNBOztBQUVESCxPQUFPLENBQUNDLEdBQVIsQ0FBWU0sb0JBQVosR0FBbUNQLE9BQU8sQ0FBQ0MsR0FBUixDQUFZTSxvQkFBWixJQUFvQyxHQUF2RSxDIiwiZmlsZSI6Ii9wYWNrYWdlcy9yb2NrZXRjaGF0X21vbmdvLWNvbmZpZy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0bHMgZnJvbSAndGxzJztcblxuaW1wb3J0IHsgTW9uZ28gfSBmcm9tICdtZXRlb3IvbW9uZ28nO1xuXG4vLyBGSVggRm9yIFRMUyBlcnJvciBzZWUgbW9yZSBoZXJlIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2NrZXRDaGF0L1JvY2tldC5DaGF0L2lzc3Vlcy85MzE2XG4vLyBUT0RPOiBSZW1vdmUgYWZ0ZXIgTm9kZUpTIGZpeCBpdCwgbW9yZSBpbmZvcm1hdGlvblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2lzc3Vlcy8xNjE5NlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL3B1bGwvMTY4NTNcbi8vIFRoaXMgaXMgZml4ZWQgaW4gTm9kZSAxMCwgYnV0IHRoaXMgc3VwcG9ydHMgTFRTIHZlcnNpb25zXG50bHMuREVGQVVMVF9FQ0RIX0NVUlZFID0gJ2F1dG8nO1xuXG5jb25zdCBtb25nb09wdGlvblN0ciA9IHByb2Nlc3MuZW52Lk1PTkdPX09QVElPTlM7XG5pZiAodHlwZW9mIG1vbmdvT3B0aW9uU3RyICE9PSAndW5kZWZpbmVkJykge1xuXHRjb25zdCBtb25nb09wdGlvbnMgPSBKU09OLnBhcnNlKG1vbmdvT3B0aW9uU3RyKTtcblxuXHRNb25nby5zZXRDb25uZWN0aW9uT3B0aW9ucyhtb25nb09wdGlvbnMpO1xufVxuXG5wcm9jZXNzLmVudi5IVFRQX0ZPUldBUkRFRF9DT1VOVCA9IHByb2Nlc3MuZW52LkhUVFBfRk9SV0FSREVEX0NPVU5UIHx8ICcxJztcbiJdfQ==
