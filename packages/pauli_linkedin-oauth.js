(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var OAuth = Package.oauth.OAuth;
var Oauth = Package.oauth.Oauth;
var HTTP = Package.http.HTTP;
var HTTPInternals = Package.http.HTTPInternals;
var _ = Package.underscore._;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Linkedin;

var require = meteorInstall({"node_modules":{"meteor":{"pauli:linkedin-oauth":{"linkedin-server.js":function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/pauli_linkedin-oauth/linkedin-server.js                                                          //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
Linkedin = {};

const getImage = profilePicture => {
  const image = [];

  if (profilePicture !== undefined) {
    for (const element of profilePicture['displayImage~'].elements) {
      for (const identifier of element.identifiers) {
        image.push(identifier.identifier);
      }
    }
  }

  return {
    displayImage: profilePicture ? profilePicture.displayImage : null,
    identifiersUrl: image
  };
}; // Request for email, returns array


const getEmails = function (accessToken) {
  const url = encodeURI(`https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))&oauth2_access_token=${accessToken}`);
  const response = HTTP.get(url).data;
  const emails = [];

  for (const element of response.elements) {
    emails.push(element['handle~'].emailAddress);
  }

  return emails;
}; // checks whether a string parses as JSON


const isJSON = function (str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}; // returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds


const getTokenResponse = function (query) {
  const config = ServiceConfiguration.configurations.findOne({
    service: 'linkedin'
  });
  if (!config) throw new ServiceConfiguration.ConfigError('Service not configured');
  let responseContent;

  try {
    // Request an access token
    responseContent = HTTP.post('https://api.linkedin.com/uas/oauth2/accessToken', {
      params: {
        grant_type: 'authorization_code',
        client_id: config.clientId,
        client_secret: OAuth.openSecret(config.secret),
        code: query.code,
        redirect_uri: OAuth._redirectUri('linkedin', config)
      }
    }).content;
  } catch (err) {
    throw new Error(`Failed to complete OAuth handshake with Linkedin. ${err.message}`);
  } // If 'responseContent' does not parse as JSON, it is an error.


  if (!isJSON(responseContent)) {
    throw new Error(`Failed to complete OAuth handshake with Linkedin. ${responseContent}`);
  } // Success! Extract access token and expiration


  const parsedResponse = JSON.parse(responseContent);
  const accessToken = parsedResponse.access_token;
  const expiresIn = parsedResponse.expires_in;

  if (!accessToken) {
    throw new Error('Failed to complete OAuth handshake with Linkedin ' + `-- can't find access token in HTTP response. ${responseContent}`);
  }

  return {
    accessToken,
    expiresIn
  };
}; // Request available fields from r_liteprofile


const getIdentity = function (accessToken) {
  try {
    const url = encodeURI(`https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))&oauth2_access_token=${accessToken}`);
    return HTTP.get(url).data;
  } catch (err) {
    throw new Error(`Failed to fetch identity from Linkedin. ${err.message}`);
  }
};

OAuth.registerService('linkedin', 2, null, query => {
  const response = getTokenResponse(query);
  const accessToken = response.accessToken;
  const identity = getIdentity(accessToken);
  const {
    id,
    firstName,
    lastName,
    profilePicture
  } = identity;

  if (!id) {
    throw new Error('Linkedin did not provide an id');
  }

  const serviceData = {
    id,
    accessToken,
    expiresAt: +new Date() + 1000 * response.expiresIn
  };
  const emails = getEmails(accessToken);
  const fields = {
    linkedinId: id,
    firstName,
    lastName,
    profilePicture: getImage(profilePicture),
    emails
  };

  if (emails.length) {
    const primaryEmail = emails[0];
    fields.emailAddress = primaryEmail; // for backward compatibility with previous versions of this package

    fields.email = primaryEmail;
  }

  _.extend(serviceData, fields);

  return {
    serviceData,
    options: {
      profile: fields
    }
  };
});

Linkedin.retrieveCredential = function (credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/pauli:linkedin-oauth/linkedin-server.js");

/* Exports */
Package._define("pauli:linkedin-oauth", {
  Linkedin: Linkedin
});

})();

//# sourceURL=meteor://💻app/packages/pauli_linkedin-oauth.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcGF1bGk6bGlua2VkaW4tb2F1dGgvbGlua2VkaW4tc2VydmVyLmpzIl0sIm5hbWVzIjpbIkxpbmtlZGluIiwiZ2V0SW1hZ2UiLCJwcm9maWxlUGljdHVyZSIsImltYWdlIiwidW5kZWZpbmVkIiwiZWxlbWVudCIsImVsZW1lbnRzIiwiaWRlbnRpZmllciIsImlkZW50aWZpZXJzIiwicHVzaCIsImRpc3BsYXlJbWFnZSIsImlkZW50aWZpZXJzVXJsIiwiZ2V0RW1haWxzIiwiYWNjZXNzVG9rZW4iLCJ1cmwiLCJlbmNvZGVVUkkiLCJyZXNwb25zZSIsIkhUVFAiLCJnZXQiLCJkYXRhIiwiZW1haWxzIiwiZW1haWxBZGRyZXNzIiwiaXNKU09OIiwic3RyIiwiSlNPTiIsInBhcnNlIiwiZSIsImdldFRva2VuUmVzcG9uc2UiLCJxdWVyeSIsImNvbmZpZyIsIlNlcnZpY2VDb25maWd1cmF0aW9uIiwiY29uZmlndXJhdGlvbnMiLCJmaW5kT25lIiwic2VydmljZSIsIkNvbmZpZ0Vycm9yIiwicmVzcG9uc2VDb250ZW50IiwicG9zdCIsInBhcmFtcyIsImdyYW50X3R5cGUiLCJjbGllbnRfaWQiLCJjbGllbnRJZCIsImNsaWVudF9zZWNyZXQiLCJPQXV0aCIsIm9wZW5TZWNyZXQiLCJzZWNyZXQiLCJjb2RlIiwicmVkaXJlY3RfdXJpIiwiX3JlZGlyZWN0VXJpIiwiY29udGVudCIsImVyciIsIkVycm9yIiwibWVzc2FnZSIsInBhcnNlZFJlc3BvbnNlIiwiYWNjZXNzX3Rva2VuIiwiZXhwaXJlc0luIiwiZXhwaXJlc19pbiIsImdldElkZW50aXR5IiwicmVnaXN0ZXJTZXJ2aWNlIiwiaWRlbnRpdHkiLCJpZCIsImZpcnN0TmFtZSIsImxhc3ROYW1lIiwic2VydmljZURhdGEiLCJleHBpcmVzQXQiLCJEYXRlIiwiZmllbGRzIiwibGlua2VkaW5JZCIsImxlbmd0aCIsInByaW1hcnlFbWFpbCIsImVtYWlsIiwiXyIsImV4dGVuZCIsIm9wdGlvbnMiLCJwcm9maWxlIiwicmV0cmlldmVDcmVkZW50aWFsIiwiY3JlZGVudGlhbFRva2VuIiwiY3JlZGVudGlhbFNlY3JldCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBQSxRQUFRLEdBQUcsRUFBWDs7QUFFQSxNQUFNQyxRQUFRLEdBQUdDLGNBQWMsSUFBSTtBQUNqQyxRQUFNQyxLQUFLLEdBQUcsRUFBZDs7QUFDQSxNQUFJRCxjQUFjLEtBQUtFLFNBQXZCLEVBQWlDO0FBQy9CLFNBQUssTUFBTUMsT0FBWCxJQUFzQkgsY0FBYyxDQUFDLGVBQUQsQ0FBZCxDQUFnQ0ksUUFBdEQsRUFBZ0U7QUFDOUQsV0FBSyxNQUFNQyxVQUFYLElBQXlCRixPQUFPLENBQUNHLFdBQWpDLEVBQThDO0FBQzVDTCxhQUFLLENBQUNNLElBQU4sQ0FBV0YsVUFBVSxDQUFDQSxVQUF0QjtBQUNEO0FBQ0Y7QUFDRjs7QUFDRCxTQUFPO0FBQ0xHLGdCQUFZLEVBQUVSLGNBQWMsR0FBR0EsY0FBYyxDQUFDUSxZQUFsQixHQUFpQyxJQUR4RDtBQUVMQyxrQkFBYyxFQUFFUjtBQUZYLEdBQVA7QUFJRCxDQWJELEMsQ0FlQTs7O0FBQ0EsTUFBTVMsU0FBUyxHQUFHLFVBQVNDLFdBQVQsRUFBc0I7QUFDdEMsUUFBTUMsR0FBRyxHQUFHQyxTQUFTLENBQ2xCLDBHQUF5R0YsV0FBWSxFQURuRyxDQUFyQjtBQUdBLFFBQU1HLFFBQVEsR0FBR0MsSUFBSSxDQUFDQyxHQUFMLENBQVNKLEdBQVQsRUFBY0ssSUFBL0I7QUFDQSxRQUFNQyxNQUFNLEdBQUcsRUFBZjs7QUFDQSxPQUFLLE1BQU1mLE9BQVgsSUFBc0JXLFFBQVEsQ0FBQ1YsUUFBL0IsRUFBeUM7QUFDdkNjLFVBQU0sQ0FBQ1gsSUFBUCxDQUFZSixPQUFPLENBQUMsU0FBRCxDQUFQLENBQW1CZ0IsWUFBL0I7QUFDRDs7QUFDRCxTQUFPRCxNQUFQO0FBQ0QsQ0FWRCxDLENBWUE7OztBQUNBLE1BQU1FLE1BQU0sR0FBRyxV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QUFJVCxLQUFKLENBQVUsZ0NBQVYsQ0FBTjtBQUNEOztBQUNELFFBQU1ZLFdBQVcsR0FBRztBQUNsQkgsTUFEa0I7QUFFbEI5QyxlQUZrQjtBQUdsQmtELGFBQVMsRUFBRSxDQUFDLElBQUlDLElBQUosRUFBRCxHQUFjLE9BQU9oRCxRQUFRLENBQUNzQztBQUh2QixHQUFwQjtBQU1BLFFBQU1sQyxNQUFNLEdBQUdSLFNBQVMsQ0FBQ0MsV0FBRCxDQUF4QjtBQUVBLFFBQU1vRCxNQUFNLEdBQUc7QUFDYkMsY0FBVSxFQUFFUCxFQURDO0FBRWJDLGFBRmE7QUFHYkMsWUFIYTtBQUliM0Qsa0JBQWMsRUFBRUQsUUFBUSxDQUFDQyxjQUFELENBSlg7QUFLYmtCO0FBTGEsR0FBZjs7QUFRQSxNQUFJQSxNQUFNLENBQUMrQyxNQUFYLEVBQW1CO0FBQ2pCLFVBQU1DLFlBQVksR0FBR2hELE1BQU0sQ0FBQyxDQUFELENBQTNCO0FBQ0E2QyxVQUFNLENBQUM1QyxZQUFQLEdBQXNCK0MsWUFBdEIsQ0FGaUIsQ0FFa0I7O0FBQ25DSCxVQUFNLENBQUNJLEtBQVAsR0FBZUQsWUFBZjtBQUNEOztBQUVERSxHQUFDLENBQUNDLE1BQUYsQ0FBU1QsV0FBVCxFQUFzQkcsTUFBdEI7O0FBRUEsU0FBTztBQUNMSCxlQURLO0FBRUxVLFdBQU8sRUFBRTtBQUNQQyxhQUFPLEVBQUVSO0FBREY7QUFGSixHQUFQO0FBTUQsQ0E3Q0Q7O0FBK0NBakUsUUFBUSxDQUFDMEUsa0JBQVQsR0FBOEIsVUFDNUJDLGVBRDRCLEVBRTVCQyxnQkFGNEIsRUFHNUI7QUFDQSxTQUFPbEMsS0FBSyxDQUFDZ0Msa0JBQU4sQ0FDTEMsZUFESyxFQUVMQyxnQkFGSyxDQUFQO0FBSUQsQ0FSRCxDIiwiZmlsZSI6Ii9wYWNrYWdlcy9wYXVsaV9saW5rZWRpbi1vYXV0aC5qcyIsInNvdXJjZXNDb250ZW50IjpbIkxpbmtlZGluID0ge31cblxuY29uc3QgZ2V0SW1hZ2UgPSBwcm9maWxlUGljdHVyZSA9PiB7XG4gIGNvbnN0IGltYWdlID0gW11cbiAgaWYgKHByb2ZpbGVQaWN0dXJlICE9PSB1bmRlZmluZWQpe1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBwcm9maWxlUGljdHVyZVsnZGlzcGxheUltYWdlfiddLmVsZW1lbnRzKSB7XG4gICAgICBmb3IgKGNvbnN0IGlkZW50aWZpZXIgb2YgZWxlbWVudC5pZGVudGlmaWVycykge1xuICAgICAgICBpbWFnZS5wdXNoKGlkZW50aWZpZXIuaWRlbnRpZmllcilcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBkaXNwbGF5SW1hZ2U6IHByb2ZpbGVQaWN0dXJlID8gcHJvZmlsZVBpY3R1cmUuZGlzcGxheUltYWdlIDogbnVsbCxcbiAgICBpZGVudGlmaWVyc1VybDogaW1hZ2VcbiAgfVxufVxuXG4vLyBSZXF1ZXN0IGZvciBlbWFpbCwgcmV0dXJucyBhcnJheVxuY29uc3QgZ2V0RW1haWxzID0gZnVuY3Rpb24oYWNjZXNzVG9rZW4pIHtcbiAgY29uc3QgdXJsID0gZW5jb2RlVVJJKFxuICAgIGBodHRwczovL2FwaS5saW5rZWRpbi5jb20vdjIvZW1haWxBZGRyZXNzP3E9bWVtYmVycyZwcm9qZWN0aW9uPShlbGVtZW50cyooaGFuZGxlfikpJm9hdXRoMl9hY2Nlc3NfdG9rZW49JHthY2Nlc3NUb2tlbn1gLFxuICApXG4gIGNvbnN0IHJlc3BvbnNlID0gSFRUUC5nZXQodXJsKS5kYXRhXG4gIGNvbnN0IGVtYWlscyA9IFtdXG4gIGZvciAoY29uc3QgZWxlbWVudCBvZiByZXNwb25zZS5lbGVtZW50cykge1xuICAgIGVtYWlscy5wdXNoKGVsZW1lbnRbJ2hhbmRsZX4nXS5lbWFpbEFkZHJlc3MpXG4gIH1cbiAgcmV0dXJuIGVtYWlsc1xufVxuXG4vLyBjaGVja3Mgd2hldGhlciBhIHN0cmluZyBwYXJzZXMgYXMgSlNPTlxuY29uc3QgaXNKU09OID0gZnVuY3Rpb24oc3RyKSB7XG4gIHRyeSB7XG4gICAgSlNPTi5wYXJzZShzdHIpXG4gICAgcmV0dXJuIHRydWVcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbi8vIHJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmc6XG4vLyAtIGFjY2Vzc1Rva2VuXG4vLyAtIGV4cGlyZXNJbjogbGlmZXRpbWUgb2YgdG9rZW4gaW4gc2Vjb25kc1xuY29uc3QgZ2V0VG9rZW5SZXNwb25zZSA9IGZ1bmN0aW9uKHF1ZXJ5KSB7XG4gIGNvbnN0IGNvbmZpZyA9IFNlcnZpY2VDb25maWd1cmF0aW9uLmNvbmZpZ3VyYXRpb25zLmZpbmRPbmUoXG4gICAgeyBzZXJ2aWNlOiAnbGlua2VkaW4nIH0sXG4gIClcbiAgaWYgKCFjb25maWcpXG4gICAgdGhyb3cgbmV3IFNlcnZpY2VDb25maWd1cmF0aW9uLkNvbmZpZ0Vycm9yKFxuICAgICAgJ1NlcnZpY2Ugbm90IGNvbmZpZ3VyZWQnLFxuICAgIClcblxuICBsZXQgcmVzcG9uc2VDb250ZW50XG4gIHRyeSB7XG4gICAgLy8gUmVxdWVzdCBhbiBhY2Nlc3MgdG9rZW5cbiAgICByZXNwb25zZUNvbnRlbnQgPSBIVFRQLnBvc3QoXG4gICAgICAnaHR0cHM6Ly9hcGkubGlua2VkaW4uY29tL3Vhcy9vYXV0aDIvYWNjZXNzVG9rZW4nLFxuICAgICAge1xuICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICBncmFudF90eXBlOiAnYXV0aG9yaXphdGlvbl9jb2RlJyxcbiAgICAgICAgICBjbGllbnRfaWQ6IGNvbmZpZy5jbGllbnRJZCxcbiAgICAgICAgICBjbGllbnRfc2VjcmV0OiBPQXV0aC5vcGVuU2VjcmV0KGNvbmZpZy5zZWNyZXQpLFxuICAgICAgICAgIGNvZGU6IHF1ZXJ5LmNvZGUsXG4gICAgICAgICAgcmVkaXJlY3RfdXJpOiBPQXV0aC5fcmVkaXJlY3RVcmkoXG4gICAgICAgICAgICAnbGlua2VkaW4nLFxuICAgICAgICAgICAgY29uZmlnLFxuICAgICAgICAgICksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICkuY29udGVudFxuICB9IGNhdGNoIChlcnIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgRmFpbGVkIHRvIGNvbXBsZXRlIE9BdXRoIGhhbmRzaGFrZSB3aXRoIExpbmtlZGluLiAke1xuICAgICAgICBlcnIubWVzc2FnZVxuICAgICAgfWAsXG4gICAgKVxuICB9XG5cbiAgLy8gSWYgJ3Jlc3BvbnNlQ29udGVudCcgZG9lcyBub3QgcGFyc2UgYXMgSlNPTiwgaXQgaXMgYW4gZXJyb3IuXG4gIGlmICghaXNKU09OKHJlc3BvbnNlQ29udGVudCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgRmFpbGVkIHRvIGNvbXBsZXRlIE9BdXRoIGhhbmRzaGFrZSB3aXRoIExpbmtlZGluLiAke3Jlc3BvbnNlQ29udGVudH1gLFxuICAgIClcbiAgfVxuXG4gIC8vIFN1Y2Nlc3MhIEV4dHJhY3QgYWNjZXNzIHRva2VuIGFuZCBleHBpcmF0aW9uXG4gIGNvbnN0IHBhcnNlZFJlc3BvbnNlID0gSlNPTi5wYXJzZShyZXNwb25zZUNvbnRlbnQpXG4gIGNvbnN0IGFjY2Vzc1Rva2VuID0gcGFyc2VkUmVzcG9uc2UuYWNjZXNzX3Rva2VuXG4gIGNvbnN0IGV4cGlyZXNJbiA9IHBhcnNlZFJlc3BvbnNlLmV4cGlyZXNfaW5cblxuICBpZiAoIWFjY2Vzc1Rva2VuKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ0ZhaWxlZCB0byBjb21wbGV0ZSBPQXV0aCBoYW5kc2hha2Ugd2l0aCBMaW5rZWRpbiAnICtcbiAgICAgICAgYC0tIGNhbid0IGZpbmQgYWNjZXNzIHRva2VuIGluIEhUVFAgcmVzcG9uc2UuICR7cmVzcG9uc2VDb250ZW50fWAsXG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBhY2Nlc3NUb2tlbixcbiAgICBleHBpcmVzSW4sXG4gIH1cbn1cblxuLy8gUmVxdWVzdCBhdmFpbGFibGUgZmllbGRzIGZyb20gcl9saXRlcHJvZmlsZVxuY29uc3QgZ2V0SWRlbnRpdHkgPSBmdW5jdGlvbihhY2Nlc3NUb2tlbikge1xuICB0cnkge1xuICAgIGNvbnN0IHVybCA9IGVuY29kZVVSSShcbiAgICAgIGBodHRwczovL2FwaS5saW5rZWRpbi5jb20vdjIvbWU/cHJvamVjdGlvbj0oaWQsZmlyc3ROYW1lLGxhc3ROYW1lLHByb2ZpbGVQaWN0dXJlKGRpc3BsYXlJbWFnZX46cGxheWFibGVTdHJlYW1zKSkmb2F1dGgyX2FjY2Vzc190b2tlbj0ke2FjY2Vzc1Rva2VufWAsXG4gICAgKVxuICAgIHJldHVybiBIVFRQLmdldCh1cmwpLmRhdGFcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYEZhaWxlZCB0byBmZXRjaCBpZGVudGl0eSBmcm9tIExpbmtlZGluLiAke1xuICAgICAgICBlcnIubWVzc2FnZVxuICAgICAgfWAsXG4gICAgKVxuICB9XG59XG5cbk9BdXRoLnJlZ2lzdGVyU2VydmljZSgnbGlua2VkaW4nLCAyLCBudWxsLCBxdWVyeSA9PiB7XG4gIGNvbnN0IHJlc3BvbnNlID0gZ2V0VG9rZW5SZXNwb25zZShxdWVyeSlcbiAgY29uc3QgYWNjZXNzVG9rZW4gPSByZXNwb25zZS5hY2Nlc3NUb2tlblxuICBjb25zdCBpZGVudGl0eSA9IGdldElkZW50aXR5KGFjY2Vzc1Rva2VuKVxuXG4gIGNvbnN0IHtcbiAgICBpZCxcbiAgICBmaXJzdE5hbWUsXG4gICAgbGFzdE5hbWUsXG4gICAgcHJvZmlsZVBpY3R1cmUsXG4gIH0gPSBpZGVudGl0eVxuXG4gIGlmICghaWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0xpbmtlZGluIGRpZCBub3QgcHJvdmlkZSBhbiBpZCcpXG4gIH1cbiAgY29uc3Qgc2VydmljZURhdGEgPSB7XG4gICAgaWQsXG4gICAgYWNjZXNzVG9rZW4sXG4gICAgZXhwaXJlc0F0OiArbmV3IERhdGUoKSArIDEwMDAgKiByZXNwb25zZS5leHBpcmVzSW4sXG4gIH1cblxuICBjb25zdCBlbWFpbHMgPSBnZXRFbWFpbHMoYWNjZXNzVG9rZW4pXG5cbiAgY29uc3QgZmllbGRzID0ge1xuICAgIGxpbmtlZGluSWQ6IGlkLFxuICAgIGZpcnN0TmFtZSxcbiAgICBsYXN0TmFtZSxcbiAgICBwcm9maWxlUGljdHVyZTogZ2V0SW1hZ2UocHJvZmlsZVBpY3R1cmUpLFxuICAgIGVtYWlscyxcbiAgfVxuXG4gIGlmIChlbWFpbHMubGVuZ3RoKSB7XG4gICAgY29uc3QgcHJpbWFyeUVtYWlsID0gZW1haWxzWzBdXG4gICAgZmllbGRzLmVtYWlsQWRkcmVzcyA9IHByaW1hcnlFbWFpbCAvLyBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eSB3aXRoIHByZXZpb3VzIHZlcnNpb25zIG9mIHRoaXMgcGFja2FnZVxuICAgIGZpZWxkcy5lbWFpbCA9IHByaW1hcnlFbWFpbFxuICB9XG5cbiAgXy5leHRlbmQoc2VydmljZURhdGEsIGZpZWxkcylcblxuICByZXR1cm4ge1xuICAgIHNlcnZpY2VEYXRhLFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIHByb2ZpbGU6IGZpZWxkcyxcbiAgICB9LFxuICB9XG59KVxuXG5MaW5rZWRpbi5yZXRyaWV2ZUNyZWRlbnRpYWwgPSBmdW5jdGlvbihcbiAgY3JlZGVudGlhbFRva2VuLFxuICBjcmVkZW50aWFsU2VjcmV0LFxuKSB7XG4gIHJldHVybiBPQXV0aC5yZXRyaWV2ZUNyZWRlbnRpYWwoXG4gICAgY3JlZGVudGlhbFRva2VuLFxuICAgIGNyZWRlbnRpYWxTZWNyZXQsXG4gIClcbn1cbiJdfQ==
