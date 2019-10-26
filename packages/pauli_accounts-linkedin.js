(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var Accounts = Package['accounts-base'].Accounts;
var Linkedin = Package['pauli:linkedin-oauth'].Linkedin;
var HTTP = Package.http.HTTP;
var HTTPInternals = Package.http.HTTPInternals;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"pauli:accounts-linkedin":{"notice.js":function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                       //
// packages/pauli_accounts-linkedin/notice.js                                                            //
//                                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                         //
if (Package['accounts-ui'] && !Package['service-configuration'] && !Package.hasOwnProperty('pauli:linkedin-config-ui')) {
  console.warn("Note: You're using accounts-ui and pauli:accounts-linkedin,\n" + "but didn't install the configuration UI for the Linkedin\n" + "OAuth. You can install it with:\n" + "\n" + "    meteor add pauli:linkedin-config-ui" + "\n");
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////

},"linkedin.js":function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                       //
// packages/pauli_accounts-linkedin/linkedin.js                                                          //
//                                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                         //
Accounts.oauth.registerService('linkedin');

if (Meteor.isClient) {
  const loginWithLinkedin = function (options, callback) {
    // support a callback without options
    if (!callback && typeof options === 'function') {
      callback = options;
      options = null;
    }

    const credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
    Linkedin.requestCredential(options, credentialRequestCompleteCallback);
  };

  Accounts.registerClientLoginFunction('linkedin', loginWithLinkedin);

  Meteor.loginWithLinkedin = (...args) => Accounts.applyLoginFunction('linkedin', args);
} else {
  Accounts.addAutopublishFields({
    forLoggedInUser: ['services.linkedin']
  });
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/pauli:accounts-linkedin/notice.js");
require("/node_modules/meteor/pauli:accounts-linkedin/linkedin.js");

/* Exports */
Package._define("pauli:accounts-linkedin");

})();

//# sourceURL=meteor://💻app/packages/pauli_accounts-linkedin.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcGF1bGk6YWNjb3VudHMtbGlua2VkaW4vbm90aWNlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9wYXVsaTphY2NvdW50cy1saW5rZWRpbi9saW5rZWRpbi5qcyJdLCJuYW1lcyI6WyJQYWNrYWdlIiwiaGFzT3duUHJvcGVydHkiLCJjb25zb2xlIiwid2FybiIsIkFjY291bnRzIiwib2F1dGgiLCJyZWdpc3RlclNlcnZpY2UiLCJNZXRlb3IiLCJpc0NsaWVudCIsImxvZ2luV2l0aExpbmtlZGluIiwib3B0aW9ucyIsImNhbGxiYWNrIiwiY3JlZGVudGlhbFJlcXVlc3RDb21wbGV0ZUNhbGxiYWNrIiwiY3JlZGVudGlhbFJlcXVlc3RDb21wbGV0ZUhhbmRsZXIiLCJMaW5rZWRpbiIsInJlcXVlc3RDcmVkZW50aWFsIiwicmVnaXN0ZXJDbGllbnRMb2dpbkZ1bmN0aW9uIiwiYXJncyIsImFwcGx5TG9naW5GdW5jdGlvbiIsImFkZEF1dG9wdWJsaXNoRmllbGRzIiwiZm9yTG9nZ2VkSW5Vc2VyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLElBQUlBLE9BQU8sQ0FBQyxhQUFELENBQVAsSUFDRyxDQUFDQSxPQUFPLENBQUMsdUJBQUQsQ0FEWCxJQUVHLENBQUNBLE9BQU8sQ0FBQ0MsY0FBUixDQUF1QiwwQkFBdkIsQ0FGUixFQUU0RDtBQUMxREMsU0FBTyxDQUFDQyxJQUFSLENBQ0Usa0VBQ0EsNERBREEsR0FFQSxtQ0FGQSxHQUdBLElBSEEsR0FJQSx5Q0FKQSxHQUtBLElBTkY7QUFRRCxDOzs7Ozs7Ozs7OztBQ1hEQyxRQUFRLENBQUNDLEtBQVQsQ0FBZUMsZUFBZixDQUErQixVQUEvQjs7QUFFQSxJQUFJQyxNQUFNLENBQUNDLFFBQVgsRUFBcUI7QUFDbkIsUUFBTUMsaUJBQWlCLEdBQUcsVUFBU0MsT0FBVCxFQUFrQkMsUUFBbEIsRUFBNEI7QUFDcEQ7QUFDQSxRQUFJLENBQUNBLFFBQUQsSUFBYSxPQUFPRCxPQUFQLEtBQW1CLFVBQXBDLEVBQWdEO0FBQzlDQyxjQUFRLEdBQUdELE9BQVg7QUFDQUEsYUFBTyxHQUFHLElBQVY7QUFDRDs7QUFDRCxVQUFNRSxpQ0FBaUMsR0FBR1IsUUFBUSxDQUFDQyxLQUFULENBQWVRLGdDQUFmLENBQ3hDRixRQUR3QyxDQUExQztBQUdBRyxZQUFRLENBQUNDLGlCQUFULENBQ0VMLE9BREYsRUFFRUUsaUNBRkY7QUFJRCxHQWJEOztBQWNBUixVQUFRLENBQUNZLDJCQUFULENBQ0UsVUFERixFQUVFUCxpQkFGRjs7QUFLQUYsUUFBTSxDQUFDRSxpQkFBUCxHQUEyQixDQUFDLEdBQUdRLElBQUosS0FDekJiLFFBQVEsQ0FBQ2Msa0JBQVQsQ0FBNEIsVUFBNUIsRUFBd0NELElBQXhDLENBREY7QUFFRCxDQXRCRCxNQXNCTztBQUNMYixVQUFRLENBQUNlLG9CQUFULENBQThCO0FBQzVCQyxtQkFBZSxFQUFFLENBQUMsbUJBQUQ7QUFEVyxHQUE5QjtBQUdELEMiLCJmaWxlIjoiL3BhY2thZ2VzL3BhdWxpX2FjY291bnRzLWxpbmtlZGluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaWYgKFBhY2thZ2VbJ2FjY291bnRzLXVpJ11cbiAgICAmJiAhUGFja2FnZVsnc2VydmljZS1jb25maWd1cmF0aW9uJ11cbiAgICAmJiAhUGFja2FnZS5oYXNPd25Qcm9wZXJ0eSgncGF1bGk6bGlua2VkaW4tY29uZmlnLXVpJykpIHtcbiAgY29uc29sZS53YXJuKFxuICAgIFwiTm90ZTogWW91J3JlIHVzaW5nIGFjY291bnRzLXVpIGFuZCBwYXVsaTphY2NvdW50cy1saW5rZWRpbixcXG5cIiArXG4gICAgXCJidXQgZGlkbid0IGluc3RhbGwgdGhlIGNvbmZpZ3VyYXRpb24gVUkgZm9yIHRoZSBMaW5rZWRpblxcblwiICtcbiAgICBcIk9BdXRoLiBZb3UgY2FuIGluc3RhbGwgaXQgd2l0aDpcXG5cIiArXG4gICAgXCJcXG5cIiArXG4gICAgXCIgICAgbWV0ZW9yIGFkZCBwYXVsaTpsaW5rZWRpbi1jb25maWctdWlcIiArXG4gICAgXCJcXG5cIlxuICApO1xufVxuIiwiQWNjb3VudHMub2F1dGgucmVnaXN0ZXJTZXJ2aWNlKCdsaW5rZWRpbicpXG5cbmlmIChNZXRlb3IuaXNDbGllbnQpIHtcbiAgY29uc3QgbG9naW5XaXRoTGlua2VkaW4gPSBmdW5jdGlvbihvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIC8vIHN1cHBvcnQgYSBjYWxsYmFjayB3aXRob3V0IG9wdGlvbnNcbiAgICBpZiAoIWNhbGxiYWNrICYmIHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjYWxsYmFjayA9IG9wdGlvbnNcbiAgICAgIG9wdGlvbnMgPSBudWxsXG4gICAgfVxuICAgIGNvbnN0IGNyZWRlbnRpYWxSZXF1ZXN0Q29tcGxldGVDYWxsYmFjayA9IEFjY291bnRzLm9hdXRoLmNyZWRlbnRpYWxSZXF1ZXN0Q29tcGxldGVIYW5kbGVyKFxuICAgICAgY2FsbGJhY2ssXG4gICAgKVxuICAgIExpbmtlZGluLnJlcXVlc3RDcmVkZW50aWFsKFxuICAgICAgb3B0aW9ucyxcbiAgICAgIGNyZWRlbnRpYWxSZXF1ZXN0Q29tcGxldGVDYWxsYmFjayxcbiAgICApXG4gIH1cbiAgQWNjb3VudHMucmVnaXN0ZXJDbGllbnRMb2dpbkZ1bmN0aW9uKFxuICAgICdsaW5rZWRpbicsXG4gICAgbG9naW5XaXRoTGlua2VkaW4sXG4gIClcblxuICBNZXRlb3IubG9naW5XaXRoTGlua2VkaW4gPSAoLi4uYXJncykgPT5cbiAgICBBY2NvdW50cy5hcHBseUxvZ2luRnVuY3Rpb24oJ2xpbmtlZGluJywgYXJncylcbn0gZWxzZSB7XG4gIEFjY291bnRzLmFkZEF1dG9wdWJsaXNoRmllbGRzKHtcbiAgICBmb3JMb2dnZWRJblVzZXI6IFsnc2VydmljZXMubGlua2VkaW4nXSxcbiAgfSlcbn1cbiJdfQ==
