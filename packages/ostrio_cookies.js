(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"ostrio:cookies":{"cookies.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ostrio_cookies/cookies.js                                                                                 //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
module.export({
  Cookies: () => Cookies
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let HTTP;
let WebApp;

if (Meteor.isServer) {
  WebApp = require('meteor/webapp').WebApp;
} else {
  HTTP = require('meteor/http').HTTP;
}

const NoOp = () => {};

const urlRE = /\/___cookie___\/set/;
const rootUrlRE = Meteor.isServer ? process.env.ROOT_URL : window.__meteor_runtime_config__.ROOT_URL || window.__meteor_runtime_config__.meteorEnv.ROOT_URL || false;
const mobileRootUrlRE = Meteor.isServer ? process.env.MOBILE_ROOT_URL : window.__meteor_runtime_config__.MOBILE_ROOT_URL || window.__meteor_runtime_config__.meteorEnv.MOBILE_ROOT_URL || false;
const originRE = new RegExp(`^https?:\/\/(localhost:12\\d\\d\\d${rootUrlRE ? '|' + rootUrlRE : ''}${mobileRootUrlRE ? '|' + mobileRootUrlRE : ''})$`);
const helpers = {
  isUndefined(obj) {
    return obj === void 0;
  },

  isArray(obj) {
    return Array.isArray(obj);
  },

  clone(obj) {
    if (!this.isObject(obj)) return obj;
    return this.isArray(obj) ? obj.slice() : Object.assign({}, obj);
  }

};
const _helpers = ['Number', 'Object', 'Function'];

for (let i = 0; i < _helpers.length; i++) {
  helpers['is' + _helpers[i]] = function (obj) {
    return Object.prototype.toString.call(obj) === '[object ' + _helpers[i] + ']';
  };
}
/*
 * @url https://github.com/jshttp/cookie/blob/master/index.js
 * @name cookie
 * @author jshttp
 * @license
 * (The MIT License)
 *
 * Copyright (c) 2012-2014 Roman Shtylman <shtylman@gmail.com>
 * Copyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


const decode = decodeURIComponent;
const encode = encodeURIComponent;
const pairSplitRegExp = /; */;
/*
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */

const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
/*
 * @function
 * @name tryDecode
 * @param {String} str
 * @param {Function} d
 * @summary Try decoding a string using a decoding function.
 * @private
 */

const tryDecode = (str, d) => {
  try {
    return d(str);
  } catch (e) {
    return str;
  }
};
/*
 * @function
 * @name parse
 * @param {String} str
 * @param {Object} [options]
 * @return {Object}
 * @summary
 * Parse a cookie header.
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 * @private
 */


const parse = (str, options) => {
  if (typeof str !== 'string') {
    throw new Meteor.Error(404, 'argument str must be a string');
  }

  const obj = {};
  const opt = options || {};
  let val;
  let key;
  let eqIndx;
  str.split(pairSplitRegExp).forEach(pair => {
    eqIndx = pair.indexOf('=');

    if (eqIndx < 0) {
      return;
    }

    key = pair.substr(0, eqIndx).trim();
    key = tryDecode(unescape(key), opt.decode || decode);
    val = pair.substr(++eqIndx, pair.length).trim();

    if (val[0] === '"') {
      val = val.slice(1, -1);
    }

    if (void 0 === obj[key]) {
      obj[key] = tryDecode(val, opt.decode || decode);
    }
  });
  return obj;
};
/*
 * @function
 * @name antiCircular
 * @param data {Object} - Circular or any other object which needs to be non-circular
 */


const antiCircular = _obj => {
  const object = helpers.clone(_obj);
  const cache = new Map();
  return JSON.stringify(object, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.get(value)) {
        return void 0;
      }

      cache.set(value, true);
    }

    return value;
  });
};
/*
 * @function
 * @name serialize
 * @param {String} name
 * @param {String} val
 * @param {Object} [options]
 * @return { cookieString: String, sanitizedValue: Mixed }
 * @summary
 * Serialize data into a cookie header.
 * Serialize the a name value pair into a cookie string suitable for
 * http headers. An optional options object specified cookie parameters.
 * serialize('foo', 'bar', { httpOnly: true }) => "foo=bar; httpOnly"
 * @private
 */


const serialize = (key, val, opt = {}) => {
  let name;

  if (!fieldContentRegExp.test(key)) {
    name = escape(key);
  } else {
    name = key;
  }

  let sanitizedValue = val;
  let value = val;

  if (!helpers.isUndefined(value)) {
    if (helpers.isObject(value) || helpers.isArray(value)) {
      const stringified = antiCircular(value);
      value = encode(`JSON.parse(${stringified})`);
      sanitizedValue = JSON.parse(stringified);
    } else {
      value = encode(value);

      if (value && !fieldContentRegExp.test(value)) {
        value = escape(value);
      }
    }
  } else {
    value = '';
  }

  const pairs = [`${name}=${value}`];

  if (helpers.isNumber(opt.maxAge)) {
    pairs.push(`Max-Age=${opt.maxAge}`);
  }

  if (opt.domain && typeof opt.domain === 'string') {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new Meteor.Error(404, 'option domain is invalid');
    }

    pairs.push(`Domain=${opt.domain}`);
  }

  if (opt.path && typeof opt.path === 'string') {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new Meteor.Error(404, 'option path is invalid');
    }

    pairs.push(`Path=${opt.path}`);
  } else {
    pairs.push('Path=/');
  }

  opt.expires = opt.expires || opt.expire || false;

  if (opt.expires === Infinity) {
    pairs.push('Expires=Fri, 31 Dec 9999 23:59:59 GMT');
  } else if (opt.expires instanceof Date) {
    pairs.push(`Expires=${opt.expires.toUTCString()}`);
  } else if (opt.expires === 0) {
    pairs.push('Expires=0');
  } else if (helpers.isNumber(opt.expires)) {
    pairs.push(`Expires=${new Date(opt.expires).toUTCString()}`);
  }

  if (opt.httpOnly) {
    pairs.push('HttpOnly');
  }

  if (opt.secure) {
    pairs.push('Secure');
  }

  if (opt.firstPartyOnly) {
    pairs.push('First-Party-Only');
  }

  if (opt.sameSite) {
    pairs.push('SameSite');
  }

  return {
    cookieString: pairs.join('; '),
    sanitizedValue
  };
};

const isStringifiedRegEx = /JSON\.parse\((.*)\)/;
const isTypedRegEx = /false|true|null|undefined/;

const deserialize = string => {
  if (typeof string !== 'string') {
    return string;
  }

  if (isStringifiedRegEx.test(string)) {
    let obj = string.match(isStringifiedRegEx)[1];

    if (obj) {
      try {
        return JSON.parse(decode(obj));
      } catch (e) {
        console.error('[ostrio:cookies] [.get()] [deserialize()] Exception:', e, string, obj);
        return string;
      }
    }

    return string;
  } else if (isTypedRegEx.test(string)) {
    return JSON.parse(string);
  }

  return string;
};
/*
 * @locus Anywhere
 * @class __cookies
 * @param _cookies {Object|String} - Current cookies as String or Object
 * @param TTL {Number} - Default cookies expiration time (max-age) in milliseconds, by default - session (false)
 * @param runOnServer {Boolean} - Expose Cookies class to Server
 * @param response {http.ServerResponse|Object} - This object is created internally by a HTTP server
 * @summary Internal Class
 */


class __cookies {
  constructor(_cookies, TTL, runOnServer, response) {
    this.TTL = TTL;
    this.response = response;
    this.runOnServer = runOnServer;

    if (helpers.isObject(_cookies)) {
      this.cookies = _cookies;
    } else {
      this.cookies = parse(_cookies);
    }
  }
  /*
   * @locus Anywhere
   * @memberOf __cookies
   * @name get
   * @param {String} key  - The name of the cookie to read
   * @param {String} _tmp - Unparsed string instead of user's cookies
   * @summary Read a cookie. If the cookie doesn't exist a null value will be returned.
   * @returns {String|void}
   */


  get(key, _tmp) {
    const cookieString = _tmp ? parse(_tmp) : this.cookies;

    if (!key || !cookieString) {
      return void 0;
    }

    if (cookieString.hasOwnProperty(key)) {
      return deserialize(cookieString[key]);
    }

    return void 0;
  }
  /*
   * @locus Anywhere
   * @memberOf __cookies
   * @name set
   * @param {String}  key   - The name of the cookie to create/overwrite
   * @param {String}  value - The value of the cookie
   * @param {Object}  opts  - [Optional] Cookie options (see readme docs)
   * @summary Create/overwrite a cookie.
   * @returns {Boolean}
   */


  set(key, value, opts = {}) {
    if (key && !helpers.isUndefined(value)) {
      if (helpers.isNumber(this.TTL) && opts.expires === undefined) {
        opts.expires = new Date(+new Date() + this.TTL);
      }

      const {
        cookieString,
        sanitizedValue
      } = serialize(key, value, opts);
      this.cookies[key] = sanitizedValue;

      if (Meteor.isClient) {
        document.cookie = cookieString;
      } else {
        this.response.setHeader('Set-Cookie', cookieString);
      }

      return true;
    }

    return false;
  }
  /*
   * @locus Anywhere
   * @memberOf __cookies
   * @name remove
   * @param {String} key    - The name of the cookie to create/overwrite
   * @param {String} path   - [Optional] The path from where the cookie will be
   * readable. E.g., "/", "/mydir"; if not specified, defaults to the current
   * path of the current document location (string or null). The path must be
   * absolute (see RFC 2965). For more information on how to use relative paths
   * in this argument, see: https://developer.mozilla.org/en-US/docs/Web/API/document.cookie#Using_relative_URLs_in_the_path_parameter
   * @param {String} domain - [Optional] The domain from where the cookie will
   * be readable. E.g., "example.com", ".example.com" (includes all subdomains)
   * or "subdomain.example.com"; if not specified, defaults to the host portion
   * of the current document location (string or null).
   * @summary Remove a cookie(s).
   * @returns {Boolean}
   */


  remove(key, path = '/', domain = '') {
    if (key && this.cookies.hasOwnProperty(key)) {
      const {
        cookieString
      } = serialize(key, '', {
        domain,
        path,
        expires: new Date(0)
      });
      delete this.cookies[key];

      if (Meteor.isClient) {
        document.cookie = cookieString;
      } else {
        this.response.setHeader('Set-Cookie', cookieString);
      }

      return true;
    } else if (!key && this.keys().length > 0 && this.keys()[0] !== '') {
      const keys = Object.keys(this.cookies);

      for (let i = 0; i < keys.length; i++) {
        this.remove(keys[i]);
      }

      return true;
    }

    return false;
  }
  /*
   * @locus Anywhere
   * @memberOf __cookies
   * @name has
   * @param {String} key  - The name of the cookie to create/overwrite
   * @param {String} _tmp - Unparsed string instead of user's cookies
   * @summary Check whether a cookie exists in the current position.
   * @returns {Boolean}
   */


  has(key, _tmp) {
    const cookieString = _tmp ? parse(_tmp) : this.cookies;

    if (!key || !cookieString) {
      return false;
    }

    return cookieString.hasOwnProperty(key);
  }
  /*
   * @locus Anywhere
   * @memberOf __cookies
   * @name keys
   * @summary Returns an array of all readable cookies from this location.
   * @returns {[String]}
   */


  keys() {
    if (this.cookies) {
      return Object.keys(this.cookies);
    }

    return [];
  }
  /*
   * @locus Client
   * @memberOf __cookies
   * @name send
   * @param cb {Function} - Callback
   * @summary Send all cookies over XHR to server.
   * @returns {void}
   */


  send(cb = NoOp) {
    if (Meteor.isServer) {
      cb(new Meteor.Error(400, 'Can\'t run `.send()` on server, it\'s Client only method!'));
    }

    if (this.runOnServer) {
      HTTP.get(`${window.__meteor_runtime_config__.ROOT_URL_PATH_PREFIX || window.__meteor_runtime_config__.meteorEnv.ROOT_URL_PATH_PREFIX || ''}/___cookie___/set`, {
        beforeSend(xhr) {
          xhr.withCredentials = true;
          return true;
        }

      }, cb);
    } else {
      cb(new Meteor.Error(400, 'Can\'t send cookies on server when `runOnServer` is false.'));
    }

    return void 0;
  }

}
/*
 * @function
 * @locus Server
 * @summary Middleware handler
 * @private
 */


const __middlewareHandler = (req, res, self) => {
  let _cookies = {};

  if (self.runOnServer) {
    if (req.headers && req.headers.cookie) {
      _cookies = parse(req.headers.cookie);
    }

    return new __cookies(_cookies, self.TTL, self.runOnServer, res);
  }

  throw new Meteor.Error(400, 'Can\'t use middleware when `runOnServer` is false.');
};
/*
 * @locus Anywhere
 * @class Cookies
 * @param opts {Object}
 * @param opts.TTL {Number} - Default cookies expiration time (max-age) in milliseconds, by default - session (false)
 * @param opts.auto {Boolean} - [Server] Auto-bind in middleware as `req.Cookies`, by default `true`
 * @param opts.handler {Function} - [Server] Middleware handler
 * @param opts.runOnServer {Boolean} - Expose Cookies class to Server
 * @summary Main Cookie class
 */


class Cookies extends __cookies {
  constructor(opts = {}) {
    opts.TTL = helpers.isNumber(opts.TTL) ? opts.TTL : false;
    opts.runOnServer = opts.runOnServer !== false ? true : false;

    if (Meteor.isClient) {
      super(document.cookie, opts.TTL, opts.runOnServer);
    } else {
      super({}, opts.TTL, opts.runOnServer);
      opts.auto = opts.auto !== false ? true : false;
      this.handler = helpers.isFunction(opts.handler) ? opts.handler : false;
      this.onCookies = helpers.isFunction(opts.onCookies) ? opts.onCookies : false;
      this.runOnServer = opts.runOnServer;

      if (this.runOnServer) {
        if (!Cookies.isLoadedOnServer) {
          if (opts.auto) {
            WebApp.connectHandlers.use((req, res, next) => {
              if (urlRE.test(req._parsedUrl.path)) {
                if (req.headers && req.headers.cookie) {
                  const cookiesObject = parse(req.headers.cookie);
                  const cookiesKeys = Object.keys(cookiesObject);
                  const cookiesArray = [];

                  if (originRE.test(req.headers.origin)) {
                    res.setHeader('Access-Control-Allow-Credentials', 'true');
                    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
                  }

                  for (let i = 0; i < cookiesKeys.length; i++) {
                    const {
                      cookieString
                    } = serialize(cookiesKeys[i], cookiesObject[cookiesKeys[i]]);

                    if (!cookiesArray.includes(cookieString)) {
                      cookiesArray.push(cookieString);
                    }
                  }

                  res.setHeader('Set-Cookie', cookiesArray);
                }

                helpers.isFunction(this.onCookies) && this.onCookies(__middlewareHandler(req, res, this));
                res.writeHead(200);
                res.end('');
              } else {
                req.Cookies = __middlewareHandler(req, res, this);
                helpers.isFunction(this.handler) && this.handler(req.Cookies);
                next();
              }
            });
          }

          Cookies.isLoadedOnServer = true;
        }
      }
    }
  }
  /*
   * @locus Server
   * @memberOf Cookies
   * @name middleware
   * @summary Get Cookies instance into callback
   * @returns {void}
   */


  middleware() {
    if (!Meteor.isServer) {
      throw new Meteor.Error(500, '[ostrio:cookies] Can\'t use `.middleware()` on Client, it\'s Server only!');
    }

    return (req, res, next) => {
      helpers.isFunction(this.handler) && this.handler(__middlewareHandler(req, res, this));
      next();
    };
  }

}

if (Meteor.isServer) {
  Cookies.isLoadedOnServer = false;
}
/* Export the Cookies class */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/ostrio:cookies/cookies.js");

/* Exports */
Package._define("ostrio:cookies", exports);

})();

//# sourceURL=meteor://💻app/packages/ostrio_cookies.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb3N0cmlvOmNvb2tpZXMvY29va2llcy5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnQiLCJDb29raWVzIiwiTWV0ZW9yIiwibGluayIsInYiLCJIVFRQIiwiV2ViQXBwIiwiaXNTZXJ2ZXIiLCJyZXF1aXJlIiwiTm9PcCIsInVybFJFIiwicm9vdFVybFJFIiwicHJvY2VzcyIsImVudiIsIlJPT1RfVVJMIiwid2luZG93IiwiX19tZXRlb3JfcnVudGltZV9jb25maWdfXyIsIm1ldGVvckVudiIsIm1vYmlsZVJvb3RVcmxSRSIsIk1PQklMRV9ST09UX1VSTCIsIm9yaWdpblJFIiwiUmVnRXhwIiwiaGVscGVycyIsImlzVW5kZWZpbmVkIiwib2JqIiwiaXNBcnJheSIsIkFycmF5IiwiY2xvbmUiLCJpc09iamVjdCIsInNsaWNlIiwiT2JqZWN0IiwiYXNzaWduIiwiX2hlbHBlcnMiLCJpIiwibGVuZ3RoIiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJjYWxsIiwiZGVjb2RlIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwiZW5jb2RlIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwicGFpclNwbGl0UmVnRXhwIiwiZmllbGRDb250ZW50UmVnRXhwIiwidHJ5RGVjb2RlIiwic3RyIiwiZCIsImUiLCJwYXJzZSIsIm9wdGlvbnMiLCJFcnJvciIsIm9wdCIsInZhbCIsImtleSIsImVxSW5keCIsInNwbGl0IiwiZm9yRWFjaCIsInBhaXIiLCJpbmRleE9mIiwic3Vic3RyIiwidHJpbSIsInVuZXNjYXBlIiwiYW50aUNpcmN1bGFyIiwiX29iaiIsIm9iamVjdCIsImNhY2hlIiwiTWFwIiwiSlNPTiIsInN0cmluZ2lmeSIsInZhbHVlIiwiZ2V0Iiwic2V0Iiwic2VyaWFsaXplIiwibmFtZSIsInRlc3QiLCJlc2NhcGUiLCJzYW5pdGl6ZWRWYWx1ZSIsInN0cmluZ2lmaWVkIiwicGFpcnMiLCJpc051bWJlciIsIm1heEFnZSIsInB1c2giLCJkb21haW4iLCJwYXRoIiwiZXhwaXJlcyIsImV4cGlyZSIsIkluZmluaXR5IiwiRGF0ZSIsInRvVVRDU3RyaW5nIiwiaHR0cE9ubHkiLCJzZWN1cmUiLCJmaXJzdFBhcnR5T25seSIsInNhbWVTaXRlIiwiY29va2llU3RyaW5nIiwiam9pbiIsImlzU3RyaW5naWZpZWRSZWdFeCIsImlzVHlwZWRSZWdFeCIsImRlc2VyaWFsaXplIiwic3RyaW5nIiwibWF0Y2giLCJjb25zb2xlIiwiZXJyb3IiLCJfX2Nvb2tpZXMiLCJjb25zdHJ1Y3RvciIsIl9jb29raWVzIiwiVFRMIiwicnVuT25TZXJ2ZXIiLCJyZXNwb25zZSIsImNvb2tpZXMiLCJfdG1wIiwiaGFzT3duUHJvcGVydHkiLCJvcHRzIiwidW5kZWZpbmVkIiwiaXNDbGllbnQiLCJkb2N1bWVudCIsImNvb2tpZSIsInNldEhlYWRlciIsInJlbW92ZSIsImtleXMiLCJoYXMiLCJzZW5kIiwiY2IiLCJST09UX1VSTF9QQVRIX1BSRUZJWCIsImJlZm9yZVNlbmQiLCJ4aHIiLCJ3aXRoQ3JlZGVudGlhbHMiLCJfX21pZGRsZXdhcmVIYW5kbGVyIiwicmVxIiwicmVzIiwic2VsZiIsImhlYWRlcnMiLCJhdXRvIiwiaGFuZGxlciIsImlzRnVuY3Rpb24iLCJvbkNvb2tpZXMiLCJpc0xvYWRlZE9uU2VydmVyIiwiY29ubmVjdEhhbmRsZXJzIiwidXNlIiwibmV4dCIsIl9wYXJzZWRVcmwiLCJjb29raWVzT2JqZWN0IiwiY29va2llc0tleXMiLCJjb29raWVzQXJyYXkiLCJvcmlnaW4iLCJpbmNsdWRlcyIsIndyaXRlSGVhZCIsImVuZCIsIm1pZGRsZXdhcmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQUEsTUFBTSxDQUFDQyxNQUFQLENBQWM7QUFBQ0MsU0FBTyxFQUFDLE1BQUlBO0FBQWIsQ0FBZDtBQUFxQyxJQUFJQyxNQUFKO0FBQVdILE1BQU0sQ0FBQ0ksSUFBUCxDQUFZLGVBQVosRUFBNEI7QUFBQ0QsUUFBTSxDQUFD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QUFPQVksWUFBVSxHQUFHO0FBQ1gsUUFBSSxDQUFDakosTUFBTSxDQUFDSyxRQUFaLEVBQXNCO0FBQ3BCLFlBQU0sSUFBSUwsTUFBTSxDQUFDZ0QsS0FBWCxDQUFpQixHQUFqQixFQUFzQiwyRUFBdEIsQ0FBTjtBQUNEOztBQUVELFdBQU8sQ0FBQzZFLEdBQUQsRUFBTUMsR0FBTixFQUFXVSxJQUFYLEtBQW9CO0FBQ3pCcEgsYUFBTyxDQUFDK0csVUFBUixDQUFtQixLQUFLRCxPQUF4QixLQUFvQyxLQUFLQSxPQUFMLENBQWFOLG1CQUFtQixDQUFDQyxHQUFELEVBQU1DLEdBQU4sRUFBVyxJQUFYLENBQWhDLENBQXBDO0FBQ0FVLFVBQUk7QUFDTCxLQUhEO0FBSUQ7O0FBeEU2Qjs7QUEyRWhDLElBQUl4SSxNQUFNLENBQUNLLFFBQVgsRUFBcUI7QUFDbkJOLFNBQU8sQ0FBQ3NJLGdCQUFSLEdBQTJCLEtBQTNCO0FBQ0Q7QUFFRCw4QiIsImZpbGUiOiIvcGFja2FnZXMvb3N0cmlvX2Nvb2tpZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcblxubGV0IEhUVFA7XG5sZXQgV2ViQXBwO1xuXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gIFdlYkFwcCA9IHJlcXVpcmUoJ21ldGVvci93ZWJhcHAnKS5XZWJBcHA7XG59IGVsc2Uge1xuICBIVFRQID0gcmVxdWlyZSgnbWV0ZW9yL2h0dHAnKS5IVFRQO1xufVxuXG5jb25zdCBOb09wICA9ICgpID0+IHt9O1xuY29uc3QgdXJsUkUgPSAvXFwvX19fY29va2llX19fXFwvc2V0LztcbmNvbnN0IHJvb3RVcmxSRSA9IE1ldGVvci5pc1NlcnZlciA/IHByb2Nlc3MuZW52LlJPT1RfVVJMIDogKHdpbmRvdy5fX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLlJPT1RfVVJMIHx8IHdpbmRvdy5fX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLm1ldGVvckVudi5ST09UX1VSTCB8fCBmYWxzZSk7XG5jb25zdCBtb2JpbGVSb290VXJsUkUgPSBNZXRlb3IuaXNTZXJ2ZXIgPyBwcm9jZXNzLmVudi5NT0JJTEVfUk9PVF9VUkwgOiAod2luZG93Ll9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18uTU9CSUxFX1JPT1RfVVJMIHx8IHdpbmRvdy5fX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLm1ldGVvckVudi5NT0JJTEVfUk9PVF9VUkwgfHwgZmFsc2UpO1xuY29uc3Qgb3JpZ2luUkUgPSBuZXcgUmVnRXhwKGBeaHR0cHM/OlxcL1xcLyhsb2NhbGhvc3Q6MTJcXFxcZFxcXFxkXFxcXGQke3Jvb3RVcmxSRSA/ICgnfCcgKyByb290VXJsUkUpIDogJyd9JHttb2JpbGVSb290VXJsUkUgPyAoJ3wnICsgbW9iaWxlUm9vdFVybFJFKSA6ICcnfSkkYCk7XG5cbmNvbnN0IGhlbHBlcnMgPSB7XG4gIGlzVW5kZWZpbmVkKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHZvaWQgMDtcbiAgfSxcbiAgaXNBcnJheShvYmopIHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheShvYmopO1xuICB9LFxuICBjbG9uZShvYmopIHtcbiAgICBpZiAoIXRoaXMuaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgICByZXR1cm4gdGhpcy5pc0FycmF5KG9iaikgPyBvYmouc2xpY2UoKSA6IE9iamVjdC5hc3NpZ24oe30sIG9iaik7XG4gIH1cbn07XG5jb25zdCBfaGVscGVycyA9IFsnTnVtYmVyJywgJ09iamVjdCcsICdGdW5jdGlvbiddO1xuZm9yIChsZXQgaSA9IDA7IGkgPCBfaGVscGVycy5sZW5ndGg7IGkrKykge1xuICBoZWxwZXJzWydpcycgKyBfaGVscGVyc1tpXV0gPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCAnICsgX2hlbHBlcnNbaV0gKyAnXSc7XG4gIH07XG59XG5cbi8qXG4gKiBAdXJsIGh0dHBzOi8vZ2l0aHViLmNvbS9qc2h0dHAvY29va2llL2Jsb2IvbWFzdGVyL2luZGV4LmpzXG4gKiBAbmFtZSBjb29raWVcbiAqIEBhdXRob3IganNodHRwXG4gKiBAbGljZW5zZVxuICogKFRoZSBNSVQgTGljZW5zZSlcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTItMjAxNCBSb21hbiBTaHR5bG1hbiA8c2h0eWxtYW5AZ21haWwuY29tPlxuICogQ29weXJpZ2h0IChjKSAyMDE1IERvdWdsYXMgQ2hyaXN0b3BoZXIgV2lsc29uIDxkb3VnQHNvbWV0aGluZ2RvdWcuY29tPlxuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZ1xuICogYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4gKiAnU29mdHdhcmUnKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4gKiB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4gKiBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG9cbiAqIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0b1xuICogdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG4gKiBpbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgJ0FTIElTJywgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbiAqIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuICogTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULlxuICogSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTllcbiAqIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsXG4gKiBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRVxuICogU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4gKi9cbmNvbnN0IGRlY29kZSA9IGRlY29kZVVSSUNvbXBvbmVudDtcbmNvbnN0IGVuY29kZSA9IGVuY29kZVVSSUNvbXBvbmVudDtcbmNvbnN0IHBhaXJTcGxpdFJlZ0V4cCA9IC87ICovO1xuXG4vKlxuICogUmVnRXhwIHRvIG1hdGNoIGZpZWxkLWNvbnRlbnQgaW4gUkZDIDcyMzAgc2VjIDMuMlxuICpcbiAqIGZpZWxkLWNvbnRlbnQgPSBmaWVsZC12Y2hhciBbIDEqKCBTUCAvIEhUQUIgKSBmaWVsZC12Y2hhciBdXG4gKiBmaWVsZC12Y2hhciAgID0gVkNIQVIgLyBvYnMtdGV4dFxuICogb2JzLXRleHQgICAgICA9ICV4ODAtRkZcbiAqL1xuY29uc3QgZmllbGRDb250ZW50UmVnRXhwID0gL15bXFx1MDAwOVxcdTAwMjAtXFx1MDA3ZVxcdTAwODAtXFx1MDBmZl0rJC87XG5cbi8qXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIHRyeURlY29kZVxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtGdW5jdGlvbn0gZFxuICogQHN1bW1hcnkgVHJ5IGRlY29kaW5nIGEgc3RyaW5nIHVzaW5nIGEgZGVjb2RpbmcgZnVuY3Rpb24uXG4gKiBAcHJpdmF0ZVxuICovXG5jb25zdCB0cnlEZWNvZGUgPSAoc3RyLCBkKSA9PiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGQoc3RyKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn07XG5cbi8qXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIHBhcnNlXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAc3VtbWFyeVxuICogUGFyc2UgYSBjb29raWUgaGVhZGVyLlxuICogUGFyc2UgdGhlIGdpdmVuIGNvb2tpZSBoZWFkZXIgc3RyaW5nIGludG8gYW4gb2JqZWN0XG4gKiBUaGUgb2JqZWN0IGhhcyB0aGUgdmFyaW91cyBjb29raWVzIGFzIGtleXMobmFtZXMpID0+IHZhbHVlc1xuICogQHByaXZhdGVcbiAqL1xuY29uc3QgcGFyc2UgPSAoc3RyLCBvcHRpb25zKSA9PiB7XG4gIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDA0LCAnYXJndW1lbnQgc3RyIG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgfVxuICBjb25zdCBvYmogPSB7fTtcbiAgY29uc3Qgb3B0ID0gb3B0aW9ucyB8fCB7fTtcbiAgbGV0IHZhbDtcbiAgbGV0IGtleTtcbiAgbGV0IGVxSW5keDtcblxuICBzdHIuc3BsaXQocGFpclNwbGl0UmVnRXhwKS5mb3JFYWNoKChwYWlyKSA9PiB7XG4gICAgZXFJbmR4ID0gcGFpci5pbmRleE9mKCc9Jyk7XG4gICAgaWYgKGVxSW5keCA8IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAga2V5ID0gcGFpci5zdWJzdHIoMCwgZXFJbmR4KS50cmltKCk7XG4gICAga2V5ID0gdHJ5RGVjb2RlKHVuZXNjYXBlKGtleSksIChvcHQuZGVjb2RlIHx8IGRlY29kZSkpO1xuICAgIHZhbCA9IHBhaXIuc3Vic3RyKCsrZXFJbmR4LCBwYWlyLmxlbmd0aCkudHJpbSgpO1xuICAgIGlmICh2YWxbMF0gPT09ICdcIicpIHtcbiAgICAgIHZhbCA9IHZhbC5zbGljZSgxLCAtMSk7XG4gICAgfVxuICAgIGlmICh2b2lkIDAgPT09IG9ialtrZXldKSB7XG4gICAgICBvYmpba2V5XSA9IHRyeURlY29kZSh2YWwsIChvcHQuZGVjb2RlIHx8IGRlY29kZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvYmo7XG59O1xuXG4vKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBhbnRpQ2lyY3VsYXJcbiAqIEBwYXJhbSBkYXRhIHtPYmplY3R9IC0gQ2lyY3VsYXIgb3IgYW55IG90aGVyIG9iamVjdCB3aGljaCBuZWVkcyB0byBiZSBub24tY2lyY3VsYXJcbiAqL1xuY29uc3QgYW50aUNpcmN1bGFyID0gKF9vYmopID0+IHtcbiAgY29uc3Qgb2JqZWN0ID0gaGVscGVycy5jbG9uZShfb2JqKTtcbiAgY29uc3QgY2FjaGUgID0gbmV3IE1hcCgpO1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkob2JqZWN0LCAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICBpZiAoY2FjaGUuZ2V0KHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfVxuICAgICAgY2FjaGUuc2V0KHZhbHVlLCB0cnVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9KTtcbn07XG5cbi8qXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIHNlcmlhbGl6ZVxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAqIEByZXR1cm4geyBjb29raWVTdHJpbmc6IFN0cmluZywgc2FuaXRpemVkVmFsdWU6IE1peGVkIH1cbiAqIEBzdW1tYXJ5XG4gKiBTZXJpYWxpemUgZGF0YSBpbnRvIGEgY29va2llIGhlYWRlci5cbiAqIFNlcmlhbGl6ZSB0aGUgYSBuYW1lIHZhbHVlIHBhaXIgaW50byBhIGNvb2tpZSBzdHJpbmcgc3VpdGFibGUgZm9yXG4gKiBodHRwIGhlYWRlcnMuIEFuIG9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHNwZWNpZmllZCBjb29raWUgcGFyYW1ldGVycy5cbiAqIHNlcmlhbGl6ZSgnZm9vJywgJ2JhcicsIHsgaHR0cE9ubHk6IHRydWUgfSkgPT4gXCJmb289YmFyOyBodHRwT25seVwiXG4gKiBAcHJpdmF0ZVxuICovXG5jb25zdCBzZXJpYWxpemUgPSAoa2V5LCB2YWwsIG9wdCA9IHt9KSA9PiB7XG4gIGxldCBuYW1lO1xuXG4gIGlmICghZmllbGRDb250ZW50UmVnRXhwLnRlc3Qoa2V5KSkge1xuICAgIG5hbWUgPSBlc2NhcGUoa2V5KTtcbiAgfSBlbHNlIHtcbiAgICBuYW1lID0ga2V5O1xuICB9XG5cbiAgbGV0IHNhbml0aXplZFZhbHVlID0gdmFsO1xuICBsZXQgdmFsdWUgPSB2YWw7XG4gIGlmICghaGVscGVycy5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICBpZiAoaGVscGVycy5pc09iamVjdCh2YWx1ZSkgfHwgaGVscGVycy5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgY29uc3Qgc3RyaW5naWZpZWQgPSBhbnRpQ2lyY3VsYXIodmFsdWUpO1xuICAgICAgdmFsdWUgPSBlbmNvZGUoYEpTT04ucGFyc2UoJHtzdHJpbmdpZmllZH0pYCk7XG4gICAgICBzYW5pdGl6ZWRWYWx1ZSA9IEpTT04ucGFyc2Uoc3RyaW5naWZpZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSA9IGVuY29kZSh2YWx1ZSk7XG4gICAgICBpZiAodmFsdWUgJiYgIWZpZWxkQ29udGVudFJlZ0V4cC50ZXN0KHZhbHVlKSkge1xuICAgICAgICB2YWx1ZSA9IGVzY2FwZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhbHVlID0gJyc7XG4gIH1cblxuICBjb25zdCBwYWlycyA9IFtgJHtuYW1lfT0ke3ZhbHVlfWBdO1xuXG4gIGlmIChoZWxwZXJzLmlzTnVtYmVyKG9wdC5tYXhBZ2UpKSB7XG4gICAgcGFpcnMucHVzaChgTWF4LUFnZT0ke29wdC5tYXhBZ2V9YCk7XG4gIH1cblxuICBpZiAob3B0LmRvbWFpbiAmJiB0eXBlb2Ygb3B0LmRvbWFpbiA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAoIWZpZWxkQ29udGVudFJlZ0V4cC50ZXN0KG9wdC5kb21haW4pKSB7XG4gICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDQwNCwgJ29wdGlvbiBkb21haW4gaXMgaW52YWxpZCcpO1xuICAgIH1cbiAgICBwYWlycy5wdXNoKGBEb21haW49JHtvcHQuZG9tYWlufWApO1xuICB9XG5cbiAgaWYgKG9wdC5wYXRoICYmIHR5cGVvZiBvcHQucGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAoIWZpZWxkQ29udGVudFJlZ0V4cC50ZXN0KG9wdC5wYXRoKSkge1xuICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDQsICdvcHRpb24gcGF0aCBpcyBpbnZhbGlkJyk7XG4gICAgfVxuICAgIHBhaXJzLnB1c2goYFBhdGg9JHtvcHQucGF0aH1gKTtcbiAgfSBlbHNlIHtcbiAgICBwYWlycy5wdXNoKCdQYXRoPS8nKTtcbiAgfVxuXG4gIG9wdC5leHBpcmVzID0gb3B0LmV4cGlyZXMgfHwgb3B0LmV4cGlyZSB8fCBmYWxzZTtcbiAgaWYgKG9wdC5leHBpcmVzID09PSBJbmZpbml0eSkge1xuICAgIHBhaXJzLnB1c2goJ0V4cGlyZXM9RnJpLCAzMSBEZWMgOTk5OSAyMzo1OTo1OSBHTVQnKTtcbiAgfSBlbHNlIGlmIChvcHQuZXhwaXJlcyBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICBwYWlycy5wdXNoKGBFeHBpcmVzPSR7b3B0LmV4cGlyZXMudG9VVENTdHJpbmcoKX1gKTtcbiAgfSBlbHNlIGlmIChvcHQuZXhwaXJlcyA9PT0gMCkge1xuICAgIHBhaXJzLnB1c2goJ0V4cGlyZXM9MCcpO1xuICB9IGVsc2UgaWYgKGhlbHBlcnMuaXNOdW1iZXIob3B0LmV4cGlyZXMpKSB7XG4gICAgcGFpcnMucHVzaChgRXhwaXJlcz0keyhuZXcgRGF0ZShvcHQuZXhwaXJlcykpLnRvVVRDU3RyaW5nKCl9YCk7XG4gIH1cblxuICBpZiAob3B0Lmh0dHBPbmx5KSB7XG4gICAgcGFpcnMucHVzaCgnSHR0cE9ubHknKTtcbiAgfVxuXG4gIGlmIChvcHQuc2VjdXJlKSB7XG4gICAgcGFpcnMucHVzaCgnU2VjdXJlJyk7XG4gIH1cblxuICBpZiAob3B0LmZpcnN0UGFydHlPbmx5KSB7XG4gICAgcGFpcnMucHVzaCgnRmlyc3QtUGFydHktT25seScpO1xuICB9XG5cbiAgaWYgKG9wdC5zYW1lU2l0ZSkge1xuICAgIHBhaXJzLnB1c2goJ1NhbWVTaXRlJyk7XG4gIH1cblxuICByZXR1cm4geyBjb29raWVTdHJpbmc6IHBhaXJzLmpvaW4oJzsgJyksIHNhbml0aXplZFZhbHVlIH07XG59O1xuXG5jb25zdCBpc1N0cmluZ2lmaWVkUmVnRXggPSAvSlNPTlxcLnBhcnNlXFwoKC4qKVxcKS87XG5jb25zdCBpc1R5cGVkUmVnRXggPSAvZmFsc2V8dHJ1ZXxudWxsfHVuZGVmaW5lZC87XG5jb25zdCBkZXNlcmlhbGl6ZSA9IChzdHJpbmcpID0+IHtcbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHN0cmluZztcbiAgfVxuXG4gIGlmIChpc1N0cmluZ2lmaWVkUmVnRXgudGVzdChzdHJpbmcpKSB7XG4gICAgbGV0IG9iaiA9IHN0cmluZy5tYXRjaChpc1N0cmluZ2lmaWVkUmVnRXgpWzFdO1xuICAgIGlmIChvYmopIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRlY29kZShvYmopKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW29zdHJpbzpjb29raWVzXSBbLmdldCgpXSBbZGVzZXJpYWxpemUoKV0gRXhjZXB0aW9uOicsIGUsIHN0cmluZywgb2JqKTtcbiAgICAgICAgcmV0dXJuIHN0cmluZztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN0cmluZztcbiAgfSBlbHNlIGlmIChpc1R5cGVkUmVnRXgudGVzdChzdHJpbmcpKSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2Uoc3RyaW5nKTtcbiAgfVxuICByZXR1cm4gc3RyaW5nO1xufTtcblxuLypcbiAqIEBsb2N1cyBBbnl3aGVyZVxuICogQGNsYXNzIF9fY29va2llc1xuICogQHBhcmFtIF9jb29raWVzIHtPYmplY3R8U3RyaW5nfSAtIEN1cnJlbnQgY29va2llcyBhcyBTdHJpbmcgb3IgT2JqZWN0XG4gKiBAcGFyYW0gVFRMIHtOdW1iZXJ9IC0gRGVmYXVsdCBjb29raWVzIGV4cGlyYXRpb24gdGltZSAobWF4LWFnZSkgaW4gbWlsbGlzZWNvbmRzLCBieSBkZWZhdWx0IC0gc2Vzc2lvbiAoZmFsc2UpXG4gKiBAcGFyYW0gcnVuT25TZXJ2ZXIge0Jvb2xlYW59IC0gRXhwb3NlIENvb2tpZXMgY2xhc3MgdG8gU2VydmVyXG4gKiBAcGFyYW0gcmVzcG9uc2Uge2h0dHAuU2VydmVyUmVzcG9uc2V8T2JqZWN0fSAtIFRoaXMgb2JqZWN0IGlzIGNyZWF0ZWQgaW50ZXJuYWxseSBieSBhIEhUVFAgc2VydmVyXG4gKiBAc3VtbWFyeSBJbnRlcm5hbCBDbGFzc1xuICovXG5jbGFzcyBfX2Nvb2tpZXMge1xuICBjb25zdHJ1Y3RvcihfY29va2llcywgVFRMLCBydW5PblNlcnZlciwgcmVzcG9uc2UpIHtcbiAgICB0aGlzLlRUTCAgICAgICAgID0gVFRMO1xuICAgIHRoaXMucmVzcG9uc2UgICAgPSByZXNwb25zZTtcbiAgICB0aGlzLnJ1bk9uU2VydmVyID0gcnVuT25TZXJ2ZXI7XG5cbiAgICBpZiAoaGVscGVycy5pc09iamVjdChfY29va2llcykpIHtcbiAgICAgIHRoaXMuY29va2llcyA9IF9jb29raWVzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNvb2tpZXMgPSBwYXJzZShfY29va2llcyk7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBfX2Nvb2tpZXNcbiAgICogQG5hbWUgZ2V0XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXkgIC0gVGhlIG5hbWUgb2YgdGhlIGNvb2tpZSB0byByZWFkXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBfdG1wIC0gVW5wYXJzZWQgc3RyaW5nIGluc3RlYWQgb2YgdXNlcidzIGNvb2tpZXNcbiAgICogQHN1bW1hcnkgUmVhZCBhIGNvb2tpZS4gSWYgdGhlIGNvb2tpZSBkb2Vzbid0IGV4aXN0IGEgbnVsbCB2YWx1ZSB3aWxsIGJlIHJldHVybmVkLlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfHZvaWR9XG4gICAqL1xuICBnZXQoa2V5LCBfdG1wKSB7XG4gICAgY29uc3QgY29va2llU3RyaW5nID0gX3RtcCA/IHBhcnNlKF90bXApIDogdGhpcy5jb29raWVzO1xuICAgIGlmICgha2V5IHx8ICFjb29raWVTdHJpbmcpIHtcbiAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgfVxuXG4gICAgaWYgKGNvb2tpZVN0cmluZy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICByZXR1cm4gZGVzZXJpYWxpemUoY29va2llU3RyaW5nW2tleV0pO1xuICAgIH1cblxuICAgIHJldHVybiB2b2lkIDA7XG4gIH1cblxuICAvKlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1lbWJlck9mIF9fY29va2llc1xuICAgKiBAbmFtZSBzZXRcbiAgICogQHBhcmFtIHtTdHJpbmd9ICBrZXkgICAtIFRoZSBuYW1lIG9mIHRoZSBjb29raWUgdG8gY3JlYXRlL292ZXJ3cml0ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gIHZhbHVlIC0gVGhlIHZhbHVlIG9mIHRoZSBjb29raWVcbiAgICogQHBhcmFtIHtPYmplY3R9ICBvcHRzICAtIFtPcHRpb25hbF0gQ29va2llIG9wdGlvbnMgKHNlZSByZWFkbWUgZG9jcylcbiAgICogQHN1bW1hcnkgQ3JlYXRlL292ZXJ3cml0ZSBhIGNvb2tpZS5cbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqL1xuICBzZXQoa2V5LCB2YWx1ZSwgb3B0cyA9IHt9KSB7XG4gICAgaWYgKGtleSAmJiAhaGVscGVycy5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgIGlmIChoZWxwZXJzLmlzTnVtYmVyKHRoaXMuVFRMKSAmJiBvcHRzLmV4cGlyZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBvcHRzLmV4cGlyZXMgPSBuZXcgRGF0ZSgrbmV3IERhdGUoKSArIHRoaXMuVFRMKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHsgY29va2llU3RyaW5nLCBzYW5pdGl6ZWRWYWx1ZSB9ID0gc2VyaWFsaXplKGtleSwgdmFsdWUsIG9wdHMpO1xuICAgICAgdGhpcy5jb29raWVzW2tleV0gPSBzYW5pdGl6ZWRWYWx1ZTtcbiAgICAgIGlmIChNZXRlb3IuaXNDbGllbnQpIHtcbiAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llU3RyaW5nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZXNwb25zZS5zZXRIZWFkZXIoJ1NldC1Db29raWUnLCBjb29raWVTdHJpbmcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWVtYmVyT2YgX19jb29raWVzXG4gICAqIEBuYW1lIHJlbW92ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5ICAgIC0gVGhlIG5hbWUgb2YgdGhlIGNvb2tpZSB0byBjcmVhdGUvb3ZlcndyaXRlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoICAgLSBbT3B0aW9uYWxdIFRoZSBwYXRoIGZyb20gd2hlcmUgdGhlIGNvb2tpZSB3aWxsIGJlXG4gICAqIHJlYWRhYmxlLiBFLmcuLCBcIi9cIiwgXCIvbXlkaXJcIjsgaWYgbm90IHNwZWNpZmllZCwgZGVmYXVsdHMgdG8gdGhlIGN1cnJlbnRcbiAgICogcGF0aCBvZiB0aGUgY3VycmVudCBkb2N1bWVudCBsb2NhdGlvbiAoc3RyaW5nIG9yIG51bGwpLiBUaGUgcGF0aCBtdXN0IGJlXG4gICAqIGFic29sdXRlIChzZWUgUkZDIDI5NjUpLiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBob3cgdG8gdXNlIHJlbGF0aXZlIHBhdGhzXG4gICAqIGluIHRoaXMgYXJndW1lbnQsIHNlZTogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL2RvY3VtZW50LmNvb2tpZSNVc2luZ19yZWxhdGl2ZV9VUkxzX2luX3RoZV9wYXRoX3BhcmFtZXRlclxuICAgKiBAcGFyYW0ge1N0cmluZ30gZG9tYWluIC0gW09wdGlvbmFsXSBUaGUgZG9tYWluIGZyb20gd2hlcmUgdGhlIGNvb2tpZSB3aWxsXG4gICAqIGJlIHJlYWRhYmxlLiBFLmcuLCBcImV4YW1wbGUuY29tXCIsIFwiLmV4YW1wbGUuY29tXCIgKGluY2x1ZGVzIGFsbCBzdWJkb21haW5zKVxuICAgKiBvciBcInN1YmRvbWFpbi5leGFtcGxlLmNvbVwiOyBpZiBub3Qgc3BlY2lmaWVkLCBkZWZhdWx0cyB0byB0aGUgaG9zdCBwb3J0aW9uXG4gICAqIG9mIHRoZSBjdXJyZW50IGRvY3VtZW50IGxvY2F0aW9uIChzdHJpbmcgb3IgbnVsbCkuXG4gICAqIEBzdW1tYXJ5IFJlbW92ZSBhIGNvb2tpZShzKS5cbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqL1xuICByZW1vdmUoa2V5LCBwYXRoID0gJy8nLCBkb21haW4gPSAnJykge1xuICAgIGlmIChrZXkgJiYgdGhpcy5jb29raWVzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIGNvbnN0IHsgY29va2llU3RyaW5nIH0gPSBzZXJpYWxpemUoa2V5LCAnJywge1xuICAgICAgICBkb21haW4sXG4gICAgICAgIHBhdGgsXG4gICAgICAgIGV4cGlyZXM6IG5ldyBEYXRlKDApXG4gICAgICB9KTtcblxuICAgICAgZGVsZXRlIHRoaXMuY29va2llc1trZXldO1xuICAgICAgaWYgKE1ldGVvci5pc0NsaWVudCkge1xuICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWVTdHJpbmc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlc3BvbnNlLnNldEhlYWRlcignU2V0LUNvb2tpZScsIGNvb2tpZVN0cmluZyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKCFrZXkgJiYgdGhpcy5rZXlzKCkubGVuZ3RoID4gMCAmJiB0aGlzLmtleXMoKVswXSAhPT0gJycpIHtcbiAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmNvb2tpZXMpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlKGtleXNbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWVtYmVyT2YgX19jb29raWVzXG4gICAqIEBuYW1lIGhhc1xuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5ICAtIFRoZSBuYW1lIG9mIHRoZSBjb29raWUgdG8gY3JlYXRlL292ZXJ3cml0ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gX3RtcCAtIFVucGFyc2VkIHN0cmluZyBpbnN0ZWFkIG9mIHVzZXIncyBjb29raWVzXG4gICAqIEBzdW1tYXJ5IENoZWNrIHdoZXRoZXIgYSBjb29raWUgZXhpc3RzIGluIHRoZSBjdXJyZW50IHBvc2l0aW9uLlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICovXG4gIGhhcyhrZXksIF90bXApIHtcbiAgICBjb25zdCBjb29raWVTdHJpbmcgPSBfdG1wID8gcGFyc2UoX3RtcCkgOiB0aGlzLmNvb2tpZXM7XG4gICAgaWYgKCFrZXkgfHwgIWNvb2tpZVN0cmluZykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiBjb29raWVTdHJpbmcuaGFzT3duUHJvcGVydHkoa2V5KTtcbiAgfVxuXG4gIC8qXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWVtYmVyT2YgX19jb29raWVzXG4gICAqIEBuYW1lIGtleXNcbiAgICogQHN1bW1hcnkgUmV0dXJucyBhbiBhcnJheSBvZiBhbGwgcmVhZGFibGUgY29va2llcyBmcm9tIHRoaXMgbG9jYXRpb24uXG4gICAqIEByZXR1cm5zIHtbU3RyaW5nXX1cbiAgICovXG4gIGtleXMoKSB7XG4gICAgaWYgKHRoaXMuY29va2llcykge1xuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuY29va2llcyk7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIC8qXG4gICAqIEBsb2N1cyBDbGllbnRcbiAgICogQG1lbWJlck9mIF9fY29va2llc1xuICAgKiBAbmFtZSBzZW5kXG4gICAqIEBwYXJhbSBjYiB7RnVuY3Rpb259IC0gQ2FsbGJhY2tcbiAgICogQHN1bW1hcnkgU2VuZCBhbGwgY29va2llcyBvdmVyIFhIUiB0byBzZXJ2ZXIuXG4gICAqIEByZXR1cm5zIHt2b2lkfVxuICAgKi9cbiAgc2VuZChjYiA9IE5vT3ApIHtcbiAgICBpZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gICAgICBjYihuZXcgTWV0ZW9yLkVycm9yKDQwMCwgJ0NhblxcJ3QgcnVuIGAuc2VuZCgpYCBvbiBzZXJ2ZXIsIGl0XFwncyBDbGllbnQgb25seSBtZXRob2QhJykpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnJ1bk9uU2VydmVyKSB7XG4gICAgICBIVFRQLmdldChgJHt3aW5kb3cuX19tZXRlb3JfcnVudGltZV9jb25maWdfXy5ST09UX1VSTF9QQVRIX1BSRUZJWCB8fCB3aW5kb3cuX19tZXRlb3JfcnVudGltZV9jb25maWdfXy5tZXRlb3JFbnYuUk9PVF9VUkxfUEFUSF9QUkVGSVggfHwgJyd9L19fX2Nvb2tpZV9fXy9zZXRgLCB7XG4gICAgICAgIGJlZm9yZVNlbmQoeGhyKSB7XG4gICAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0sIGNiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2IobmV3IE1ldGVvci5FcnJvcig0MDAsICdDYW5cXCd0IHNlbmQgY29va2llcyBvbiBzZXJ2ZXIgd2hlbiBgcnVuT25TZXJ2ZXJgIGlzIGZhbHNlLicpKTtcbiAgICB9XG4gICAgcmV0dXJuIHZvaWQgMDtcbiAgfVxufVxuXG4vKlxuICogQGZ1bmN0aW9uXG4gKiBAbG9jdXMgU2VydmVyXG4gKiBAc3VtbWFyeSBNaWRkbGV3YXJlIGhhbmRsZXJcbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IF9fbWlkZGxld2FyZUhhbmRsZXIgPSAocmVxLCByZXMsIHNlbGYpID0+IHtcbiAgbGV0IF9jb29raWVzID0ge307XG4gIGlmIChzZWxmLnJ1bk9uU2VydmVyKSB7XG4gICAgaWYgKHJlcS5oZWFkZXJzICYmIHJlcS5oZWFkZXJzLmNvb2tpZSkge1xuICAgICAgX2Nvb2tpZXMgPSBwYXJzZShyZXEuaGVhZGVycy5jb29raWUpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IF9fY29va2llcyhfY29va2llcywgc2VsZi5UVEwsIHNlbGYucnVuT25TZXJ2ZXIsIHJlcyk7XG4gIH1cblxuICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDQwMCwgJ0NhblxcJ3QgdXNlIG1pZGRsZXdhcmUgd2hlbiBgcnVuT25TZXJ2ZXJgIGlzIGZhbHNlLicpO1xufTtcblxuLypcbiAqIEBsb2N1cyBBbnl3aGVyZVxuICogQGNsYXNzIENvb2tpZXNcbiAqIEBwYXJhbSBvcHRzIHtPYmplY3R9XG4gKiBAcGFyYW0gb3B0cy5UVEwge051bWJlcn0gLSBEZWZhdWx0IGNvb2tpZXMgZXhwaXJhdGlvbiB0aW1lIChtYXgtYWdlKSBpbiBtaWxsaXNlY29uZHMsIGJ5IGRlZmF1bHQgLSBzZXNzaW9uIChmYWxzZSlcbiAqIEBwYXJhbSBvcHRzLmF1dG8ge0Jvb2xlYW59IC0gW1NlcnZlcl0gQXV0by1iaW5kIGluIG1pZGRsZXdhcmUgYXMgYHJlcS5Db29raWVzYCwgYnkgZGVmYXVsdCBgdHJ1ZWBcbiAqIEBwYXJhbSBvcHRzLmhhbmRsZXIge0Z1bmN0aW9ufSAtIFtTZXJ2ZXJdIE1pZGRsZXdhcmUgaGFuZGxlclxuICogQHBhcmFtIG9wdHMucnVuT25TZXJ2ZXIge0Jvb2xlYW59IC0gRXhwb3NlIENvb2tpZXMgY2xhc3MgdG8gU2VydmVyXG4gKiBAc3VtbWFyeSBNYWluIENvb2tpZSBjbGFzc1xuICovXG5jbGFzcyBDb29raWVzIGV4dGVuZHMgX19jb29raWVzIHtcbiAgY29uc3RydWN0b3Iob3B0cyA9IHt9KSB7XG4gICAgb3B0cy5UVEwgPSBoZWxwZXJzLmlzTnVtYmVyKG9wdHMuVFRMKSA/IG9wdHMuVFRMIDogZmFsc2U7XG4gICAgb3B0cy5ydW5PblNlcnZlciA9IChvcHRzLnJ1bk9uU2VydmVyICE9PSBmYWxzZSkgPyB0cnVlIDogZmFsc2U7XG5cbiAgICBpZiAoTWV0ZW9yLmlzQ2xpZW50KSB7XG4gICAgICBzdXBlcihkb2N1bWVudC5jb29raWUsIG9wdHMuVFRMLCBvcHRzLnJ1bk9uU2VydmVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3VwZXIoe30sIG9wdHMuVFRMLCBvcHRzLnJ1bk9uU2VydmVyKTtcbiAgICAgIG9wdHMuYXV0byAgICAgICAgPSBvcHRzLmF1dG8gIT09IGZhbHNlID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgdGhpcy5oYW5kbGVyICAgICA9IGhlbHBlcnMuaXNGdW5jdGlvbihvcHRzLmhhbmRsZXIpID8gb3B0cy5oYW5kbGVyIDogZmFsc2U7XG4gICAgICB0aGlzLm9uQ29va2llcyAgID0gaGVscGVycy5pc0Z1bmN0aW9uKG9wdHMub25Db29raWVzKSA/IG9wdHMub25Db29raWVzIDogZmFsc2U7XG4gICAgICB0aGlzLnJ1bk9uU2VydmVyID0gb3B0cy5ydW5PblNlcnZlcjtcblxuICAgICAgaWYgKHRoaXMucnVuT25TZXJ2ZXIpIHtcbiAgICAgICAgaWYgKCFDb29raWVzLmlzTG9hZGVkT25TZXJ2ZXIpIHtcbiAgICAgICAgICBpZiAob3B0cy5hdXRvKSB7XG4gICAgICAgICAgICBXZWJBcHAuY29ubmVjdEhhbmRsZXJzLnVzZSgocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgICAgICAgaWYgKHVybFJFLnRlc3QocmVxLl9wYXJzZWRVcmwucGF0aCkpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVxLmhlYWRlcnMgJiYgcmVxLmhlYWRlcnMuY29va2llKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBjb29raWVzT2JqZWN0ID0gcGFyc2UocmVxLmhlYWRlcnMuY29va2llKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGNvb2tpZXNLZXlzICAgPSBPYmplY3Qua2V5cyhjb29raWVzT2JqZWN0KTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGNvb2tpZXNBcnJheSAgPSBbXTtcblxuICAgICAgICAgICAgICAgICAgaWYgKG9yaWdpblJFLnRlc3QocmVxLmhlYWRlcnMub3JpZ2luKSkge1xuICAgICAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscycsICd0cnVlJyk7XG4gICAgICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsIHJlcS5oZWFkZXJzLm9yaWdpbik7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29va2llc0tleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeyBjb29raWVTdHJpbmcgfSA9IHNlcmlhbGl6ZShjb29raWVzS2V5c1tpXSwgY29va2llc09iamVjdFtjb29raWVzS2V5c1tpXV0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvb2tpZXNBcnJheS5pbmNsdWRlcyhjb29raWVTdHJpbmcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY29va2llc0FycmF5LnB1c2goY29va2llU3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdTZXQtQ29va2llJywgY29va2llc0FycmF5KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBoZWxwZXJzLmlzRnVuY3Rpb24odGhpcy5vbkNvb2tpZXMpICYmIHRoaXMub25Db29raWVzKF9fbWlkZGxld2FyZUhhbmRsZXIocmVxLCByZXMsIHRoaXMpKTtcblxuICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoMjAwKTtcbiAgICAgICAgICAgICAgICByZXMuZW5kKCcnKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXEuQ29va2llcyA9IF9fbWlkZGxld2FyZUhhbmRsZXIocmVxLCByZXMsIHRoaXMpO1xuICAgICAgICAgICAgICAgIGhlbHBlcnMuaXNGdW5jdGlvbih0aGlzLmhhbmRsZXIpICYmIHRoaXMuaGFuZGxlcihyZXEuQ29va2llcyk7XG4gICAgICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgQ29va2llcy5pc0xvYWRlZE9uU2VydmVyID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qXG4gICAqIEBsb2N1cyBTZXJ2ZXJcbiAgICogQG1lbWJlck9mIENvb2tpZXNcbiAgICogQG5hbWUgbWlkZGxld2FyZVxuICAgKiBAc3VtbWFyeSBHZXQgQ29va2llcyBpbnN0YW5jZSBpbnRvIGNhbGxiYWNrXG4gICAqIEByZXR1cm5zIHt2b2lkfVxuICAgKi9cbiAgbWlkZGxld2FyZSgpIHtcbiAgICBpZiAoIU1ldGVvci5pc1NlcnZlcikge1xuICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig1MDAsICdbb3N0cmlvOmNvb2tpZXNdIENhblxcJ3QgdXNlIGAubWlkZGxld2FyZSgpYCBvbiBDbGllbnQsIGl0XFwncyBTZXJ2ZXIgb25seSEnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICBoZWxwZXJzLmlzRnVuY3Rpb24odGhpcy5oYW5kbGVyKSAmJiB0aGlzLmhhbmRsZXIoX19taWRkbGV3YXJlSGFuZGxlcihyZXEsIHJlcywgdGhpcykpO1xuICAgICAgbmV4dCgpO1xuICAgIH07XG4gIH1cbn1cblxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICBDb29raWVzLmlzTG9hZGVkT25TZXJ2ZXIgPSBmYWxzZTtcbn1cblxuLyogRXhwb3J0IHRoZSBDb29raWVzIGNsYXNzICovXG5leHBvcnQgeyBDb29raWVzIH07XG4iXX0=
