(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var check = Package.check.check;
var Match = Package.check.Match;
var ECMAScript = Package.ecmascript.ECMAScript;
var CollectionHooks = Package['matb33:collection-hooks'].CollectionHooks;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var _ = Package.underscore._;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var extension, options, path;

var require = meteorInstall({"node_modules":{"meteor":{"jalik:ufs":{"ufs.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/jalik_ufs/ufs.js                                                                                     //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
const module1 = module;
module1.export({
  UploadFS: () => UploadFS
});

let _;

module1.link("meteor/underscore", {
  _(v) {
    _ = v;
  }

}, 0);
let Meteor;
module1.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let Mongo;
module1.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 2);
let MIME;
module1.link("./ufs-mime", {
  MIME(v) {
    MIME = v;
  }

}, 3);
let Random;
module1.link("meteor/random", {
  Random(v) {
    Random = v;
  }

}, 4);
let Tokens;
module1.link("./ufs-tokens", {
  Tokens(v) {
    Tokens = v;
  }

}, 5);
let Config;
module1.link("./ufs-config", {
  Config(v) {
    Config = v;
  }

}, 6);
let Filter;
module1.link("./ufs-filter", {
  Filter(v) {
    Filter = v;
  }

}, 7);
let Store;
module1.link("./ufs-store", {
  Store(v) {
    Store = v;
  }

}, 8);
let StorePermissions;
module1.link("./ufs-store-permissions", {
  StorePermissions(v) {
    StorePermissions = v;
  }

}, 9);
let Uploader;
module1.link("./ufs-uploader", {
  Uploader(v) {
    Uploader = v;
  }

}, 10);
let stores = {};
const UploadFS = {
  /**
   * Contains all stores
   */
  store: {},

  /**
   * Collection of tokens
   */
  tokens: Tokens,

  /**
   * Adds the "etag" attribute to files
   * @param where
   */
  addETagAttributeToFiles(where) {
    _.each(this.getStores(), store => {
      const files = store.getCollection(); // By default update only files with no path set

      files.find(where || {
        etag: null
      }, {
        fields: {
          _id: 1
        }
      }).forEach(file => {
        files.direct.update(file._id, {
          $set: {
            etag: this.generateEtag()
          }
        });
      });
    });
  },

  /**
   * Adds the MIME type for an extension
   * @param extension
   * @param mime
   */
  addMimeType(extension, mime) {
    MIME[extension.toLowerCase()] = mime;
  },

  /**
   * Adds the "path" attribute to files
   * @param where
   */
  addPathAttributeToFiles(where) {
    _.each(this.getStores(), store => {
      const files = store.getCollection(); // By default update only files with no path set

      files.find(where || {
        path: null
      }, {
        fields: {
          _id: 1
        }
      }).forEach(file => {
        files.direct.update(file._id, {
          $set: {
            path: store.getFileRelativeURL(file._id)
          }
        });
      });
    });
  },

  /**
   * Registers the store
   * @param store
   */
  addStore(store) {
    if (!(store instanceof Store)) {
      throw new TypeError(`ufs: store is not an instance of UploadFS.Store.`);
    }

    stores[store.getName()] = store;
  },

  /**
   * Generates a unique ETag
   * @return {string}
   */
  generateEtag() {
    return Random.id();
  },

  /**
   * Returns the MIME type of the extension
   * @param extension
   * @returns {*}
   */
  getMimeType(extension) {
    extension = extension.toLowerCase();
    return MIME[extension];
  },

  /**
   * Returns all MIME types
   */
  getMimeTypes() {
    return MIME;
  },

  /**
   * Returns the store by its name
   * @param name
   * @return {UploadFS.Store}
   */
  getStore(name) {
    return stores[name];
  },

  /**
   * Returns all stores
   * @return {object}
   */
  getStores() {
    return stores;
  },

  /**
   * Returns the temporary file path
   * @param fileId
   * @return {string}
   */
  getTempFilePath(fileId) {
    return `${this.config.tmpDir}/${fileId}`;
  },

  /**
   * Imports a file from a URL
   * @param url
   * @param file
   * @param store
   * @param callback
   */
  importFromURL(url, file, store, callback) {
    if (typeof store === 'string') {
      Meteor.call('ufsImportURL', url, file, store, callback);
    } else if (typeof store === 'object') {
      store.importFromURL(url, file, callback);
    }
  },

  /**
   * Returns file and data as ArrayBuffer for each files in the event
   * @deprecated
   * @param event
   * @param callback
   */
  readAsArrayBuffer(event, callback) {
    console.error('UploadFS.readAsArrayBuffer is deprecated, see https://github.com/jalik/jalik-ufs#uploading-from-a-file');
  },

  /**
   * Opens a dialog to select a single file
   * @param callback
   */
  selectFile(callback) {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = false;

    input.onchange = ev => {
      let files = ev.target.files;
      callback.call(UploadFS, files[0]);
    }; // Fix for iOS/Safari


    const div = document.createElement('div');
    div.className = 'ufs-file-selector';
    div.style = 'display:none; height:0; width:0; overflow: hidden;';
    div.appendChild(input);
    document.body.appendChild(div); // Trigger file selection

    input.click();
  },

  /**
   * Opens a dialog to select multiple files
   * @param callback
   */
  selectFiles(callback) {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;

    input.onchange = ev => {
      const files = ev.target.files;

      for (let i = 0; i < files.length; i += 1) {
        callback.call(UploadFS, files[i]);
      }
    }; // Fix for iOS/Safari


    const div = document.createElement('div');
    div.className = 'ufs-file-selector';
    div.style = 'display:none; height:0; width:0; overflow: hidden;';
    div.appendChild(input);
    document.body.appendChild(div); // Trigger file selection

    input.click();
  }

};

if (Meteor.isClient) {
  require('./ufs-template-helpers');
}

if (Meteor.isServer) {
  require('./ufs-methods');

  require('./ufs-server');
}
/**
 * UploadFS Configuration
 * @type {Config}
 */


UploadFS.config = new Config(); // Add classes to global namespace

UploadFS.Config = Config;
UploadFS.Filter = Filter;
UploadFS.Store = Store;
UploadFS.StorePermissions = StorePermissions;
UploadFS.Uploader = Uploader;

if (Meteor.isServer) {
  // Expose the module globally
  if (typeof global !== 'undefined') {
    global['UploadFS'] = UploadFS;
  }
} else if (Meteor.isClient) {
  // Expose the module globally
  if (typeof window !== 'undefined') {
    window.UploadFS = UploadFS;
  }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-config.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/jalik_ufs/ufs-config.js                                                                              //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
module.export({
  Config: () => Config
});

let _;

module.link("meteor/underscore", {
  _(v) {
    _ = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let StorePermissions;
module.link("./ufs-store-permissions", {
  StorePermissions(v) {
    StorePermissions = v;
  }

}, 2);

class Config {
  constructor(options) {
    // Default options
    options = _.extend({
      defaultStorePermissions: null,
      https: false,
      simulateReadDelay: 0,
      simulateUploadSpeed: 0,
      simulateWriteDelay: 0,
      storesPath: 'ufs',
      tmpDir: '/tmp/ufs',
      tmpDirPermissions: '0700'
    }, options); // Check options

    if (options.defaultStorePermissions && !(options.defaultStorePermissions instanceof StorePermissions)) {
      throw new TypeError('Config: defaultStorePermissions is not an instance of StorePermissions');
    }

    if (typeof options.https !== 'boolean') {
      throw new TypeError('Config: https is not a function');
    }

    if (typeof options.simulateReadDelay !== 'number') {
      throw new TypeError('Config: simulateReadDelay is not a number');
    }

    if (typeof options.simulateUploadSpeed !== 'number') {
      throw new TypeError('Config: simulateUploadSpeed is not a number');
    }

    if (typeof options.simulateWriteDelay !== 'number') {
      throw new TypeError('Config: simulateWriteDelay is not a number');
    }

    if (typeof options.storesPath !== 'string') {
      throw new TypeError('Config: storesPath is not a string');
    }

    if (typeof options.tmpDir !== 'string') {
      throw new TypeError('Config: tmpDir is not a string');
    }

    if (typeof options.tmpDirPermissions !== 'string') {
      throw new TypeError('Config: tmpDirPermissions is not a string');
    }
    /**
     * Default store permissions
     * @type {UploadFS.StorePermissions}
     */


    this.defaultStorePermissions = options.defaultStorePermissions;
    /**
     * Use or not secured protocol in URLS
     * @type {boolean}
     */

    this.https = options.https;
    /**
     * The simulation read delay
     * @type {Number}
     */

    this.simulateReadDelay = parseInt(options.simulateReadDelay);
    /**
     * The simulation upload speed
     * @type {Number}
     */

    this.simulateUploadSpeed = parseInt(options.simulateUploadSpeed);
    /**
     * The simulation write delay
     * @type {Number}
     */

    this.simulateWriteDelay = parseInt(options.simulateWriteDelay);
    /**
     * The URL root path of stores
     * @type {string}
     */

    this.storesPath = options.storesPath;
    /**
     * The temporary directory of uploading files
     * @type {string}
     */

    this.tmpDir = options.tmpDir;
    /**
     * The permissions of the temporary directory
     * @type {string}
     */

    this.tmpDirPermissions = options.tmpDirPermissions;
  }

}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-filter.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/jalik_ufs/ufs-filter.js                                                                              //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
module.export({
  Filter: () => Filter
});

let _;

module.link("meteor/underscore", {
  _(v) {
    _ = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);

class Filter {
  constructor(options) {
    const self = this; // Default options

    options = _.extend({
      contentTypes: null,
      extensions: null,
      minSize: 1,
      maxSize: 0,
      onCheck: this.onCheck
    }, options); // Check options

    if (options.contentTypes && !(options.contentTypes instanceof Array)) {
      throw new TypeError("Filter: contentTypes is not an Array");
    }

    if (options.extensions && !(options.extensions instanceof Array)) {
      throw new TypeError("Filter: extensions is not an Array");
    }

    if (typeof options.minSize !== "number") {
      throw new TypeError("Filter: minSize is not a number");
    }

    if (typeof options.maxSize !== "number") {
      throw new TypeError("Filter: maxSize is not a number");
    }

    if (options.onCheck && typeof options.onCheck !== "function") {
      throw new TypeError("Filter: onCheck is not a function");
    } // Public attributes


    self.options = options;

    _.each(['onCheck'], method => {
      if (typeof options[method] === 'function') {
        self[method] = options[method];
      }
    });
  }
  /**
   * Checks the file
   * @param file
   */


  check(file) {
    if (typeof file !== "object" || !file) {
      throw new Meteor.Error('invalid-file', "File is not valid");
    } // Check size


    if (file.size <= 0 || file.size < this.getMinSize()) {
      throw new Meteor.Error('file-too-small', `File size is too small (min = ${this.getMinSize()})`);
    }

    if (this.getMaxSize() > 0 && file.size > this.getMaxSize()) {
      throw new Meteor.Error('file-too-large', `File size is too large (max = ${this.getMaxSize()})`);
    } // Check extension


    if (this.getExtensions() && !_.contains(this.getExtensions(), file.extension)) {
      throw new Meteor.Error('invalid-file-extension', `File extension "${file.extension}" is not accepted`);
    } // Check content type


    if (this.getContentTypes() && !this.isContentTypeInList(file.type, this.getContentTypes())) {
      throw new Meteor.Error('invalid-file-type', `File type "${file.type}" is not accepted`);
    } // Apply custom check


    if (typeof this.onCheck === 'function' && !this.onCheck(file)) {
      throw new Meteor.Error('invalid-file', "File does not match filter");
    }
  }
  /**
   * Returns the allowed content types
   * @return {Array}
   */


  getContentTypes() {
    return this.options.contentTypes;
  }
  /**
   * Returns the allowed extensions
   * @return {Array}
   */


  getExtensions() {
    return this.options.extensions;
  }
  /**
   * Returns the maximum file size
   * @return {Number}
   */


  getMaxSize() {
    return this.options.maxSize;
  }
  /**
   * Returns the minimum file size
   * @return {Number}
   */


  getMinSize() {
    return this.options.minSize;
  }
  /**
   * Checks if content type is in the given list
   * @param type
   * @param list
   * @return {boolean}
   */


  isContentTypeInList(type, list) {
    if (typeof type === 'string' && list instanceof Array) {
      if (_.contains(list, type)) {
        return true;
      } else {
        let wildCardGlob = '/*';

        let wildcards = _.filter(list, item => {
          return item.indexOf(wildCardGlob) > 0;
        });

        if (_.contains(wildcards, type.replace(/(\/.*)$/, wildCardGlob))) {
          return true;
        }
      }
    }

    return false;
  }
  /**
   * Checks if the file matches filter
   * @param file
   * @return {boolean}
   */


  isValid(file) {
    let result = true;

    try {
      this.check(file);
    } catch (err) {
      result = false;
    }

    return result;
  }
  /**
   * Executes custom checks
   * @param file
   * @return {boolean}
   */


  onCheck(file) {
    return true;
  }

}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-methods.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/jalik_ufs/ufs-methods.js                                                                             //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
let _;

module.link("meteor/underscore", {
  _(v) {
    _ = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 2);
let UploadFS;
module.link("./ufs", {
  UploadFS(v) {
    UploadFS = v;
  }

}, 3);
let Filter;
module.link("./ufs-filter", {
  Filter(v) {
    Filter = v;
  }

}, 4);
let Tokens;
module.link("./ufs-tokens", {
  Tokens(v) {
    Tokens = v;
  }

}, 5);

const fs = Npm.require('fs');

const http = Npm.require('http');

const https = Npm.require('https');

const Future = Npm.require('fibers/future');

if (Meteor.isServer) {
  Meteor.methods({
    /**
     * Completes the file transfer
     * @param fileId
     * @param storeName
     * @param token
     */
    ufsComplete(fileId, storeName, token) {
      check(fileId, String);
      check(storeName, String);
      check(token, String); // Get store

      let store = UploadFS.getStore(storeName);

      if (!store) {
        throw new Meteor.Error('invalid-store', "Store not found");
      } // Check token


      if (!store.checkToken(token, fileId)) {
        throw new Meteor.Error('invalid-token', "Token is not valid");
      }

      let fut = new Future();
      let tmpFile = UploadFS.getTempFilePath(fileId);

      const removeTempFile = function () {
        fs.unlink(tmpFile, function (err) {
          err && console.error(`ufs: cannot delete temp file "${tmpFile}" (${err.message})`);
        });
      };

      try {
        // todo check if temp file exists
        // Get file
        let file = store.getCollection().findOne({
          _id: fileId
        }); // Validate file before moving to the store

        store.validate(file); // Get the temp file

        let rs = fs.createReadStream(tmpFile, {
          flags: 'r',
          encoding: null,
          autoClose: true
        }); // Clean upload if error occurs

        rs.on('error', Meteor.bindEnvironment(function (err) {
          console.error(err);
          store.getCollection().remove({
            _id: fileId
          });
          fut.throw(err);
        })); // Save file in the store

        store.write(rs, fileId, Meteor.bindEnvironment(function (err, file) {
          removeTempFile();

          if (err) {
            fut.throw(err);
          } else {
            // File has been fully uploaded
            // so we don't need to keep the token anymore.
            // Also this ensure that the file cannot be modified with extra chunks later.
            Tokens.remove({
              fileId: fileId
            });
            fut.return(file);
          }
        }));
      } catch (err) {
        // If write failed, remove the file
        store.getCollection().remove({
          _id: fileId
        }); // removeTempFile(); // todo remove temp file on error or try again ?

        fut.throw(err);
      }

      return fut.wait();
    },

    /**
     * Creates the file and returns the file upload token
     * @param file
     * @return {{fileId: string, token: *, url: *}}
     */
    ufsCreate(file) {
      check(file, Object);

      if (typeof file.name !== 'string' || !file.name.length) {
        throw new Meteor.Error('invalid-file-name', "file name is not valid");
      }

      if (typeof file.store !== 'string' || !file.store.length) {
        throw new Meteor.Error('invalid-store', "store is not valid");
      } // Get store


      let store = UploadFS.getStore(file.store);

      if (!store) {
        throw new Meteor.Error('invalid-store', "Store not found");
      } // Set default info


      file.complete = false;
      file.uploading = false;
      file.extension = file.name && file.name.substr((~-file.name.lastIndexOf('.') >>> 0) + 2).toLowerCase(); // Assign file MIME type based on the extension

      if (file.extension && !file.type) {
        file.type = UploadFS.getMimeType(file.extension) || 'application/octet-stream';
      }

      file.progress = 0;
      file.size = parseInt(file.size) || 0;
      file.userId = file.userId || this.userId; // Check if the file matches store filter

      let filter = store.getFilter();

      if (filter instanceof Filter) {
        filter.check(file);
      } // Create the file


      let fileId = store.create(file);
      let token = store.createToken(fileId);
      let uploadUrl = store.getURL(`${fileId}?token=${token}`);
      return {
        fileId: fileId,
        token: token,
        url: uploadUrl
      };
    },

    /**
     * Deletes a file
     * @param fileId
     * @param storeName
     * @param token
     * @returns {*}
     */
    ufsDelete(fileId, storeName, token) {
      check(fileId, String);
      check(storeName, String);
      check(token, String); // Check store

      let store = UploadFS.getStore(storeName);

      if (!store) {
        throw new Meteor.Error('invalid-store', "Store not found");
      } // Ignore files that does not exist


      if (store.getCollection().find({
        _id: fileId
      }).count() === 0) {
        return 1;
      } // Check token


      if (!store.checkToken(token, fileId)) {
        throw new Meteor.Error('invalid-token', "Token is not valid");
      }

      return store.getCollection().remove({
        _id: fileId
      });
    },

    /**
     * Imports a file from the URL
     * @param url
     * @param file
     * @param storeName
     * @return {*}
     */
    ufsImportURL(url, file, storeName) {
      check(url, String);
      check(file, Object);
      check(storeName, String); // Check URL

      if (typeof url !== 'string' || url.length <= 0) {
        throw new Meteor.Error('invalid-url', "The url is not valid");
      } // Check file


      if (typeof file !== 'object' || file === null) {
        throw new Meteor.Error('invalid-file', "The file is not valid");
      } // Check store


      const store = UploadFS.getStore(storeName);

      if (!store) {
        throw new Meteor.Error('invalid-store', 'The store does not exist');
      } // Extract file info


      if (!file.name) {
        file.name = url.replace(/\?.*$/, '').split('/').pop();
      }

      if (file.name && !file.extension) {
        file.extension = file.name && file.name.substr((~-file.name.lastIndexOf('.') >>> 0) + 2).toLowerCase();
      }

      if (file.extension && !file.type) {
        // Assign file MIME type based on the extension
        file.type = UploadFS.getMimeType(file.extension) || 'application/octet-stream';
      } // Check if file is valid


      if (store.getFilter() instanceof Filter) {
        store.getFilter().check(file);
      }

      if (file.originalUrl) {
        console.warn(`ufs: The "originalUrl" attribute is automatically set when importing a file from a URL`);
      } // Add original URL


      file.originalUrl = url; // Create the file

      file.complete = false;
      file.uploading = true;
      file.progress = 0;
      file._id = store.create(file);
      let fut = new Future();
      let proto; // Detect protocol to use

      if (/http:\/\//i.test(url)) {
        proto = http;
      } else if (/https:\/\//i.test(url)) {
        proto = https;
      }

      this.unblock(); // Download file

      proto.get(url, Meteor.bindEnvironment(function (res) {
        // Save the file in the store
        store.write(res, file._id, function (err, file) {
          if (err) {
            fut.throw(err);
          } else {
            fut.return(file);
          }
        });
      })).on('error', function (err) {
        fut.throw(err);
      });
      return fut.wait();
    },

    /**
     * Marks the file uploading as stopped
     * @param fileId
     * @param storeName
     * @param token
     * @returns {*}
     */
    ufsStop(fileId, storeName, token) {
      check(fileId, String);
      check(storeName, String);
      check(token, String); // Check store

      const store = UploadFS.getStore(storeName);

      if (!store) {
        throw new Meteor.Error('invalid-store', "Store not found");
      } // Check file


      const file = store.getCollection().find({
        _id: fileId
      }, {
        fields: {
          userId: 1
        }
      });

      if (!file) {
        throw new Meteor.Error('invalid-file', "File not found");
      } // Check token


      if (!store.checkToken(token, fileId)) {
        throw new Meteor.Error('invalid-token', "Token is not valid");
      }

      return store.getCollection().update({
        _id: fileId
      }, {
        $set: {
          uploading: false
        }
      });
    }

  });
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-mime.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/jalik_ufs/ufs-mime.js                                                                                //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
module.export({
  MIME: () => MIME
});
const MIME = {
  // application
  '7z': 'application/x-7z-compressed',
  'arc': 'application/octet-stream',
  'ai': 'application/postscript',
  'bin': 'application/octet-stream',
  'bz': 'application/x-bzip',
  'bz2': 'application/x-bzip2',
  'eps': 'application/postscript',
  'exe': 'application/octet-stream',
  'gz': 'application/x-gzip',
  'gzip': 'application/x-gzip',
  'js': 'application/javascript',
  'json': 'application/json',
  'ogx': 'application/ogg',
  'pdf': 'application/pdf',
  'ps': 'application/postscript',
  'psd': 'application/octet-stream',
  'rar': 'application/x-rar-compressed',
  'rev': 'application/x-rar-compressed',
  'swf': 'application/x-shockwave-flash',
  'tar': 'application/x-tar',
  'xhtml': 'application/xhtml+xml',
  'xml': 'application/xml',
  'zip': 'application/zip',
  // audio
  'aif': 'audio/aiff',
  'aifc': 'audio/aiff',
  'aiff': 'audio/aiff',
  'au': 'audio/basic',
  'flac': 'audio/flac',
  'midi': 'audio/midi',
  'mp2': 'audio/mpeg',
  'mp3': 'audio/mpeg',
  'mpa': 'audio/mpeg',
  'oga': 'audio/ogg',
  'ogg': 'audio/ogg',
  'opus': 'audio/ogg',
  'ra': 'audio/vnd.rn-realaudio',
  'spx': 'audio/ogg',
  'wav': 'audio/x-wav',
  'weba': 'audio/webm',
  'wma': 'audio/x-ms-wma',
  // image
  'avs': 'image/avs-video',
  'bmp': 'image/x-windows-bmp',
  'gif': 'image/gif',
  'ico': 'image/vnd.microsoft.icon',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpg',
  'mjpg': 'image/x-motion-jpeg',
  'pic': 'image/pic',
  'png': 'image/png',
  'svg': 'image/svg+xml',
  'tif': 'image/tiff',
  'tiff': 'image/tiff',
  // text
  'css': 'text/css',
  'csv': 'text/csv',
  'html': 'text/html',
  'txt': 'text/plain',
  // video
  'avi': 'video/avi',
  'dv': 'video/x-dv',
  'flv': 'video/x-flv',
  'mov': 'video/quicktime',
  'mp4': 'video/mp4',
  'mpeg': 'video/mpeg',
  'mpg': 'video/mpg',
  'ogv': 'video/ogg',
  'vdo': 'video/vdo',
  'webm': 'video/webm',
  'wmv': 'video/x-ms-wmv',
  // specific to vendors
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'odb': 'application/vnd.oasis.opendocument.database',
  'odc': 'application/vnd.oasis.opendocument.chart',
  'odf': 'application/vnd.oasis.opendocument.formula',
  'odg': 'application/vnd.oasis.opendocument.graphics',
  'odi': 'application/vnd.oasis.opendocument.image',
  'odm': 'application/vnd.oasis.opendocument.text-master',
  'odp': 'application/vnd.oasis.opendocument.presentation',
  'ods': 'application/vnd.oasis.opendocument.spreadsheet',
  'odt': 'application/vnd.oasis.opendocument.text',
  'otg': 'application/vnd.oasis.opendocument.graphics-template',
  'otp': 'application/vnd.oasis.opendocument.presentation-template',
  'ots': 'application/vnd.oasis.opendocument.spreadsheet-template',
  'ott': 'application/vnd.oasis.opendocument.text-template',
  'ppt': 'application/vnd.ms-powerpoint',
  'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'xls': 'application/vnd.ms-excel',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-server.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/jalik_ufs/ufs-server.js                                                                              //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
let _;

module.link("meteor/underscore", {
  _(v) {
    _ = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let WebApp;
module.link("meteor/webapp", {
  WebApp(v) {
    WebApp = v;
  }

}, 2);
let UploadFS;
module.link("./ufs", {
  UploadFS(v) {
    UploadFS = v;
  }

}, 3);

if (Meteor.isServer) {
  const domain = Npm.require('domain');

  const fs = Npm.require('fs');

  const http = Npm.require('http');

  const https = Npm.require('https');

  const mkdirp = Npm.require('mkdirp');

  const stream = Npm.require('stream');

  const URL = Npm.require('url');

  const zlib = Npm.require('zlib');

  Meteor.startup(() => {
    let path = UploadFS.config.tmpDir;
    let mode = UploadFS.config.tmpDirPermissions;
    fs.stat(path, err => {
      if (err) {
        // Create the temp directory
        mkdirp(path, {
          mode: mode
        }, err => {
          if (err) {
            console.error(`ufs: cannot create temp directory at "${path}" (${err.message})`);
          } else {
            console.log(`ufs: temp directory created at "${path}"`);
          }
        });
      } else {
        // Set directory permissions
        fs.chmod(path, mode, err => {
          err && console.error(`ufs: cannot set temp directory permissions ${mode} (${err.message})`);
        });
      }
    });
  }); // Create domain to handle errors
  // and possibly avoid server crashes.

  let d = domain.create();
  d.on('error', err => {
    console.error('ufs: ' + err.message);
  }); // Listen HTTP requests to serve files

  WebApp.connectHandlers.use((req, res, next) => {
    // Quick check to see if request should be catch
    if (req.url.indexOf(UploadFS.config.storesPath) === -1) {
      next();
      return;
    } // Remove store path


    let parsedUrl = URL.parse(req.url);
    let path = parsedUrl.pathname.substr(UploadFS.config.storesPath.length + 1);

    let allowCORS = () => {
      // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
      res.setHeader("Access-Control-Allow-Methods", "POST");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    };

    if (req.method === "OPTIONS") {
      let regExp = new RegExp('^\/([^\/\?]+)\/([^\/\?]+)$');
      let match = regExp.exec(path); // Request is not valid

      if (match === null) {
        res.writeHead(400);
        res.end();
        return;
      } // Get store


      let store = UploadFS.getStore(match[1]);

      if (!store) {
        res.writeHead(404);
        res.end();
        return;
      } // If a store is found, go ahead and allow the origin


      allowCORS();
      next();
    } else if (req.method === 'POST') {
      // Get store
      let regExp = new RegExp('^\/([^\/\?]+)\/([^\/\?]+)$');
      let match = regExp.exec(path); // Request is not valid

      if (match === null) {
        res.writeHead(400);
        res.end();
        return;
      } // Get store


      let store = UploadFS.getStore(match[1]);

      if (!store) {
        res.writeHead(404);
        res.end();
        return;
      } // If a store is found, go ahead and allow the origin


      allowCORS(); // Get file

      let fileId = match[2];

      if (store.getCollection().find({
        _id: fileId
      }).count() === 0) {
        res.writeHead(404);
        res.end();
        return;
      } // Check upload token


      if (!store.checkToken(req.query.token, fileId)) {
        res.writeHead(403);
        res.end();
        return;
      }

      let tmpFile = UploadFS.getTempFilePath(fileId);
      let ws = fs.createWriteStream(tmpFile, {
        flags: 'a'
      });
      let fields = {
        uploading: true
      };
      let progress = parseFloat(req.query.progress);

      if (!isNaN(progress) && progress > 0) {
        fields.progress = Math.min(progress, 1);
      }

      req.on('data', chunk => {
        ws.write(chunk);
      });
      req.on('error', err => {
        res.writeHead(500);
        res.end();
      });
      req.on('end', Meteor.bindEnvironment(() => {
        // Update completed state without triggering hooks
        store.getCollection().direct.update({
          _id: fileId
        }, {
          $set: fields
        });
        ws.end();
      }));
      ws.on('error', err => {
        console.error(`ufs: cannot write chunk of file "${fileId}" (${err.message})`);
        fs.unlink(tmpFile, err => {
          err && console.error(`ufs: cannot delete temp file "${tmpFile}" (${err.message})`);
        });
        res.writeHead(500);
        res.end();
      });
      ws.on('finish', () => {
        res.writeHead(204, {
          "Content-Type": 'text/plain'
        });
        res.end();
      });
    } else if (req.method === 'GET') {
      // Get store, file Id and file name
      let regExp = new RegExp('^\/([^\/\?]+)\/([^\/\?]+)(?:\/([^\/\?]+))?$');
      let match = regExp.exec(path); // Avoid 504 Gateway timeout error
      // if file is not handled by UploadFS.

      if (match === null) {
        next();
        return;
      } // Get store


      const storeName = match[1];
      const store = UploadFS.getStore(storeName);

      if (!store) {
        res.writeHead(404);
        res.end();
        return;
      }

      if (store.onRead !== null && store.onRead !== undefined && typeof store.onRead !== 'function') {
        console.error(`ufs: Store.onRead is not a function in store "${storeName}"`);
        res.writeHead(500);
        res.end();
        return;
      } // Remove file extension from file Id


      let index = match[2].indexOf('.');
      let fileId = index !== -1 ? match[2].substr(0, index) : match[2]; // Get file from database

      const file = store.getCollection().findOne({
        _id: fileId
      });

      if (!file) {
        res.writeHead(404);
        res.end();
        return;
      } // Simulate read speed


      if (UploadFS.config.simulateReadDelay) {
        Meteor._sleepForMs(UploadFS.config.simulateReadDelay);
      }

      d.run(() => {
        // Check if the file can be accessed
        if (store.onRead.call(store, fileId, file, req, res) !== false) {
          let options = {};
          let status = 200; // Prepare response headers

          let headers = {
            'Content-Type': file.type,
            'Content-Length': file.size
          }; // Add ETag header

          if (typeof file.etag === 'string') {
            headers['ETag'] = file.etag;
          } // Add Last-Modified header


          if (file.modifiedAt instanceof Date) {
            headers['Last-Modified'] = file.modifiedAt.toUTCString();
          } else if (file.uploadedAt instanceof Date) {
            headers['Last-Modified'] = file.uploadedAt.toUTCString();
          } // Parse request headers


          if (typeof req.headers === 'object') {
            // Compare ETag
            if (req.headers['if-none-match']) {
              if (file.etag === req.headers['if-none-match']) {
                res.writeHead(304); // Not Modified

                res.end();
                return;
              }
            } // Compare file modification date


            if (req.headers['if-modified-since']) {
              const modifiedSince = new Date(req.headers['if-modified-since']);

              if (file.modifiedAt instanceof Date && file.modifiedAt > modifiedSince || file.uploadedAt instanceof Date && file.uploadedAt > modifiedSince) {
                res.writeHead(304); // Not Modified

                res.end();
                return;
              }
            } // Support range request


            if (typeof req.headers.range === 'string') {
              const range = req.headers.range; // Range is not valid

              if (!range) {
                res.writeHead(416);
                res.end();
                return;
              }

              const total = file.size;
              const unit = range.substr(0, range.indexOf("="));

              if (unit !== "bytes") {
                res.writeHead(416);
                res.end();
                return;
              }

              const ranges = range.substr(unit.length).replace(/[^0-9\-,]/, '').split(',');

              if (ranges.length > 1) {//todo: support multipart ranges: https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests
              } else {
                const r = ranges[0].split("-");
                const start = parseInt(r[0], 10);
                const end = r[1] ? parseInt(r[1], 10) : total - 1; // Range is not valid

                if (start < 0 || end >= total || start > end) {
                  res.writeHead(416);
                  res.end();
                  return;
                } // Update headers


                headers['Content-Range'] = `bytes ${start}-${end}/${total}`;
                headers['Content-Length'] = end - start + 1;
                options.start = start;
                options.end = end;
              }

              status = 206; // partial content
            }
          } else {
            headers['Accept-Ranges'] = "bytes";
          } // Open the file stream


          const rs = store.getReadStream(fileId, file, options);
          const ws = new stream.PassThrough();
          rs.on('error', Meteor.bindEnvironment(err => {
            store.onReadError.call(store, err, fileId, file);
            res.end();
          }));
          ws.on('error', Meteor.bindEnvironment(err => {
            store.onReadError.call(store, err, fileId, file);
            res.end();
          }));
          ws.on('close', () => {
            // Close output stream at the end
            ws.emit('end');
          }); // Transform stream

          store.transformRead(rs, ws, fileId, file, req, headers); // Parse request headers

          if (typeof req.headers === 'object') {
            // Compress data using if needed (ignore audio/video as they are already compressed)
            if (typeof req.headers['accept-encoding'] === 'string' && !/^(audio|video)/.test(file.type)) {
              let accept = req.headers['accept-encoding']; // Compress with gzip

              if (accept.match(/\bgzip\b/)) {
                headers['Content-Encoding'] = 'gzip';
                delete headers['Content-Length'];
                res.writeHead(status, headers);
                ws.pipe(zlib.createGzip()).pipe(res);
                return;
              } // Compress with deflate
              else if (accept.match(/\bdeflate\b/)) {
                  headers['Content-Encoding'] = 'deflate';
                  delete headers['Content-Length'];
                  res.writeHead(status, headers);
                  ws.pipe(zlib.createDeflate()).pipe(res);
                  return;
                }
            }
          } // Send raw data


          if (!headers['Content-Encoding']) {
            res.writeHead(status, headers);
            ws.pipe(res);
          }
        } else {
          res.end();
        }
      });
    } else {
      next();
    }
  });
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-store-permissions.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/jalik_ufs/ufs-store-permissions.js                                                                   //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
module.export({
  StorePermissions: () => StorePermissions
});

let _;

module.link("meteor/underscore", {
  _(v) {
    _ = v;
  }

}, 0);

class StorePermissions {
  constructor(options) {
    // Default options
    options = _.extend({
      insert: null,
      remove: null,
      update: null
    }, options); // Check options

    if (options.insert && typeof options.insert !== 'function') {
      throw new TypeError("StorePermissions: insert is not a function");
    }

    if (options.remove && typeof options.remove !== 'function') {
      throw new TypeError("StorePermissions: remove is not a function");
    }

    if (options.update && typeof options.update !== 'function') {
      throw new TypeError("StorePermissions: update is not a function");
    } // Public attributes


    this.actions = {
      insert: options.insert,
      remove: options.remove,
      update: options.update
    };
  }
  /**
   * Checks the permission for the action
   * @param action
   * @param userId
   * @param file
   * @param fields
   * @param modifiers
   * @return {*}
   */


  check(action, userId, file, fields, modifiers) {
    if (typeof this.actions[action] === 'function') {
      return this.actions[action](userId, file, fields, modifiers);
    }

    return true; // by default allow all
  }
  /**
   * Checks the insert permission
   * @param userId
   * @param file
   * @returns {*}
   */


  checkInsert(userId, file) {
    return this.check('insert', userId, file);
  }
  /**
   * Checks the remove permission
   * @param userId
   * @param file
   * @returns {*}
   */


  checkRemove(userId, file) {
    return this.check('remove', userId, file);
  }
  /**
   * Checks the update permission
   * @param userId
   * @param file
   * @param fields
   * @param modifiers
   * @returns {*}
   */


  checkUpdate(userId, file, fields, modifiers) {
    return this.check('update', userId, file, fields, modifiers);
  }

}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-store.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/jalik_ufs/ufs-store.js                                                                               //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
module.export({
  Store: () => Store
});

let _;

module.link("meteor/underscore", {
  _(v) {
    _ = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 2);
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 3);
let UploadFS;
module.link("./ufs", {
  UploadFS(v) {
    UploadFS = v;
  }

}, 4);
let Filter;
module.link("./ufs-filter", {
  Filter(v) {
    Filter = v;
  }

}, 5);
let StorePermissions;
module.link("./ufs-store-permissions", {
  StorePermissions(v) {
    StorePermissions = v;
  }

}, 6);
let Tokens;
module.link("./ufs-tokens", {
  Tokens(v) {
    Tokens = v;
  }

}, 7);

class Store {
  constructor(options) {
    let self = this; // Default options

    options = _.extend({
      collection: null,
      filter: null,
      name: null,
      onCopyError: this.onCopyError,
      onFinishUpload: this.onFinishUpload,
      onRead: this.onRead,
      onReadError: this.onReadError,
      onValidate: this.onValidate,
      onWriteError: this.onWriteError,
      permissions: null,
      transformRead: null,
      transformWrite: null
    }, options); // Check options

    if (!(options.collection instanceof Mongo.Collection)) {
      throw new TypeError('Store: collection is not a Mongo.Collection');
    }

    if (options.filter && !(options.filter instanceof Filter)) {
      throw new TypeError('Store: filter is not a UploadFS.Filter');
    }

    if (typeof options.name !== 'string') {
      throw new TypeError('Store: name is not a string');
    }

    if (UploadFS.getStore(options.name)) {
      throw new TypeError('Store: name already exists');
    }

    if (options.onCopyError && typeof options.onCopyError !== 'function') {
      throw new TypeError('Store: onCopyError is not a function');
    }

    if (options.onFinishUpload && typeof options.onFinishUpload !== 'function') {
      throw new TypeError('Store: onFinishUpload is not a function');
    }

    if (options.onRead && typeof options.onRead !== 'function') {
      throw new TypeError('Store: onRead is not a function');
    }

    if (options.onReadError && typeof options.onReadError !== 'function') {
      throw new TypeError('Store: onReadError is not a function');
    }

    if (options.onWriteError && typeof options.onWriteError !== 'function') {
      throw new TypeError('Store: onWriteError is not a function');
    }

    if (options.permissions && !(options.permissions instanceof StorePermissions)) {
      throw new TypeError('Store: permissions is not a UploadFS.StorePermissions');
    }

    if (options.transformRead && typeof options.transformRead !== 'function') {
      throw new TypeError('Store: transformRead is not a function');
    }

    if (options.transformWrite && typeof options.transformWrite !== 'function') {
      throw new TypeError('Store: transformWrite is not a function');
    }

    if (options.onValidate && typeof options.onValidate !== 'function') {
      throw new TypeError('Store: onValidate is not a function');
    } // Public attributes


    self.options = options;
    self.permissions = options.permissions;

    _.each(['onCopyError', 'onFinishUpload', 'onRead', 'onReadError', 'onWriteError', 'onValidate'], method => {
      if (typeof options[method] === 'function') {
        self[method] = options[method];
      }
    }); // Add the store to the list


    UploadFS.addStore(self); // Set default permissions

    if (!(self.permissions instanceof StorePermissions)) {
      // Uses custom default permissions or UFS default permissions
      if (UploadFS.config.defaultStorePermissions instanceof StorePermissions) {
        self.permissions = UploadFS.config.defaultStorePermissions;
      } else {
        self.permissions = new StorePermissions();
        console.warn(`ufs: permissions are not defined for store "${options.name}"`);
      }
    }

    if (Meteor.isServer) {
      /**
       * Checks token validity
       * @param token
       * @param fileId
       * @returns {boolean}
       */
      self.checkToken = function (token, fileId) {
        check(token, String);
        check(fileId, String);
        return Tokens.find({
          value: token,
          fileId: fileId
        }).count() === 1;
      };
      /**
       * Copies the file to a store
       * @param fileId
       * @param store
       * @param callback
       */


      self.copy = function (fileId, store, callback) {
        check(fileId, String);

        if (!(store instanceof Store)) {
          throw new TypeError('store is not an instance of UploadFS.Store');
        } // Get original file


        let file = self.getCollection().findOne({
          _id: fileId
        });

        if (!file) {
          throw new Meteor.Error('file-not-found', 'File not found');
        } // Silently ignore the file if it does not match filter


        const filter = store.getFilter();

        if (filter instanceof Filter && !filter.isValid(file)) {
          return;
        } // Prepare copy


        let copy = _.omit(file, '_id', 'url');

        copy.originalStore = self.getName();
        copy.originalId = fileId; // Create the copy

        let copyId = store.create(copy); // Get original stream

        let rs = self.getReadStream(fileId, file); // Catch errors to avoid app crashing

        rs.on('error', Meteor.bindEnvironment(function (err) {
          callback.call(self, err, null);
        })); // Copy file data

        store.write(rs, copyId, Meteor.bindEnvironment(function (err) {
          if (err) {
            self.getCollection().remove({
              _id: copyId
            });
            self.onCopyError.call(self, err, fileId, file);
          }

          if (typeof callback === 'function') {
            callback.call(self, err, copyId, copy, store);
          }
        }));
      };
      /**
       * Creates the file in the collection
       * @param file
       * @param callback
       * @return {string}
       */


      self.create = function (file, callback) {
        check(file, Object);
        file.store = self.options.name; // assign store to file

        return self.getCollection().insert(file, callback);
      };
      /**
       * Creates a token for the file (only needed for client side upload)
       * @param fileId
       * @returns {*}
       */


      self.createToken = function (fileId) {
        let token = self.generateToken(); // Check if token exists

        if (Tokens.find({
          fileId: fileId
        }).count()) {
          Tokens.update({
            fileId: fileId
          }, {
            $set: {
              createdAt: new Date(),
              value: token
            }
          });
        } else {
          Tokens.insert({
            createdAt: new Date(),
            fileId: fileId,
            value: token
          });
        }

        return token;
      };
      /**
       * Writes the file to the store
       * @param rs
       * @param fileId
       * @param callback
       */


      self.write = function (rs, fileId, callback) {
        let file = self.getCollection().findOne({
          _id: fileId
        });
        let ws = self.getWriteStream(fileId, file);
        let errorHandler = Meteor.bindEnvironment(function (err) {
          self.getCollection().remove({
            _id: fileId
          });
          self.onWriteError.call(self, err, fileId, file);
          callback.call(self, err);
        });
        ws.on('error', errorHandler);
        ws.on('finish', Meteor.bindEnvironment(function () {
          let size = 0;
          let readStream = self.getReadStream(fileId, file);
          readStream.on('error', Meteor.bindEnvironment(function (error) {
            callback.call(self, error, null);
          }));
          readStream.on('data', Meteor.bindEnvironment(function (data) {
            size += data.length;
          }));
          readStream.on('end', Meteor.bindEnvironment(function () {
            // Set file attribute
            file.complete = true;
            file.etag = UploadFS.generateEtag();
            file.path = self.getFileRelativeURL(fileId);
            file.progress = 1;
            file.size = size;
            file.token = self.generateToken();
            file.uploading = false;
            file.uploadedAt = new Date();
            file.url = self.getFileURL(fileId); // Execute callback

            if (typeof self.onFinishUpload === 'function') {
              self.onFinishUpload.call(self, file);
            } // Sets the file URL when file transfer is complete,
            // this way, the image will loads entirely.


            self.getCollection().direct.update({
              _id: fileId
            }, {
              $set: {
                complete: file.complete,
                etag: file.etag,
                path: file.path,
                progress: file.progress,
                size: file.size,
                token: file.token,
                uploading: file.uploading,
                uploadedAt: file.uploadedAt,
                url: file.url
              }
            }); // Return file info

            callback.call(self, null, file); // Simulate write speed

            if (UploadFS.config.simulateWriteDelay) {
              Meteor._sleepForMs(UploadFS.config.simulateWriteDelay);
            } // Copy file to other stores


            if (self.options.copyTo instanceof Array) {
              for (let i = 0; i < self.options.copyTo.length; i += 1) {
                let store = self.options.copyTo[i];

                if (!store.getFilter() || store.getFilter().isValid(file)) {
                  self.copy(fileId, store);
                }
              }
            }
          }));
        })); // Execute transformation

        self.transformWrite(rs, ws, fileId, file);
      };
    }

    if (Meteor.isServer) {
      const fs = Npm.require('fs');

      const collection = self.getCollection(); // Code executed after removing file

      collection.after.remove(function (userId, file) {
        // Remove associated tokens
        Tokens.remove({
          fileId: file._id
        });

        if (self.options.copyTo instanceof Array) {
          for (let i = 0; i < self.options.copyTo.length; i += 1) {
            // Remove copies in stores
            self.options.copyTo[i].getCollection().remove({
              originalId: file._id
            });
          }
        }
      }); // Code executed before inserting file

      collection.before.insert(function (userId, file) {
        if (!self.permissions.checkInsert(userId, file)) {
          throw new Meteor.Error('forbidden', "Forbidden");
        }
      }); // Code executed before updating file

      collection.before.update(function (userId, file, fields, modifiers) {
        if (!self.permissions.checkUpdate(userId, file, fields, modifiers)) {
          throw new Meteor.Error('forbidden', "Forbidden");
        }
      }); // Code executed before removing file

      collection.before.remove(function (userId, file) {
        if (!self.permissions.checkRemove(userId, file)) {
          throw new Meteor.Error('forbidden', "Forbidden");
        } // Delete the physical file in the store


        self.delete(file._id);
        let tmpFile = UploadFS.getTempFilePath(file._id); // Delete the temp file

        fs.stat(tmpFile, function (err) {
          !err && fs.unlink(tmpFile, function (err) {
            err && console.error(`ufs: cannot delete temp file at ${tmpFile} (${err.message})`);
          });
        });
      });
    }
  }
  /**
   * Deletes a file async
   * @param fileId
   * @param callback
   */


  delete(fileId, callback) {
    throw new Error('delete is not implemented');
  }
  /**
   * Generates a random token
   * @param pattern
   * @return {string}
   */


  generateToken(pattern) {
    return (pattern || 'xyxyxyxyxy').replace(/[xy]/g, c => {
      let r = Math.random() * 16 | 0,
          v = c === 'x' ? r : r & 0x3 | 0x8;
      let s = v.toString(16);
      return Math.round(Math.random()) ? s.toUpperCase() : s;
    });
  }
  /**
   * Returns the collection
   * @return {Mongo.Collection}
   */


  getCollection() {
    return this.options.collection;
  }
  /**
   * Returns the file URL
   * @param fileId
   * @return {string|null}
   */


  getFileRelativeURL(fileId) {
    let file = this.getCollection().findOne(fileId, {
      fields: {
        name: 1
      }
    });
    return file ? this.getRelativeURL(`${fileId}/${file.name}`) : null;
  }
  /**
   * Returns the file URL
   * @param fileId
   * @return {string|null}
   */


  getFileURL(fileId) {
    let file = this.getCollection().findOne(fileId, {
      fields: {
        name: 1
      }
    });
    return file ? this.getURL(`${fileId}/${file.name}`) : null;
  }
  /**
   * Returns the file filter
   * @return {UploadFS.Filter}
   */


  getFilter() {
    return this.options.filter;
  }
  /**
   * Returns the store name
   * @return {string}
   */


  getName() {
    return this.options.name;
  }
  /**
   * Returns the file read stream
   * @param fileId
   * @param file
   */


  getReadStream(fileId, file) {
    throw new Error('Store.getReadStream is not implemented');
  }
  /**
   * Returns the store relative URL
   * @param path
   * @return {string}
   */


  getRelativeURL(path) {
    const rootUrl = Meteor.absoluteUrl().replace(/\/+$/, '');
    const rootPath = rootUrl.replace(/^[a-z]+:\/\/[^/]+\/*/gi, '');
    const storeName = this.getName();
    path = String(path).replace(/\/$/, '').trim();
    return encodeURI(`${rootPath}/${UploadFS.config.storesPath}/${storeName}/${path}`);
  }
  /**
   * Returns the store absolute URL
   * @param path
   * @return {string}
   */


  getURL(path) {
    const rootUrl = Meteor.absoluteUrl({
      secure: UploadFS.config.https
    }).replace(/\/+$/, '');
    const storeName = this.getName();
    path = String(path).replace(/\/$/, '').trim();
    return encodeURI(`${rootUrl}/${UploadFS.config.storesPath}/${storeName}/${path}`);
  }
  /**
   * Returns the file write stream
   * @param fileId
   * @param file
   */


  getWriteStream(fileId, file) {
    throw new Error('getWriteStream is not implemented');
  }
  /**
   * Completes the file upload
   * @param url
   * @param file
   * @param callback
   */


  importFromURL(url, file, callback) {
    Meteor.call('ufsImportURL', url, file, this.getName(), callback);
  }
  /**
   * Called when a copy error happened
   * @param err
   * @param fileId
   * @param file
   */


  onCopyError(err, fileId, file) {
    console.error(`ufs: cannot copy file "${fileId}" (${err.message})`, err);
  }
  /**
   * Called when a file has been uploaded
   * @param file
   */


  onFinishUpload(file) {}
  /**
   * Called when a file is read from the store
   * @param fileId
   * @param file
   * @param request
   * @param response
   * @return boolean
   */


  onRead(fileId, file, request, response) {
    return true;
  }
  /**
   * Called when a read error happened
   * @param err
   * @param fileId
   * @param file
   * @return boolean
   */


  onReadError(err, fileId, file) {
    console.error(`ufs: cannot read file "${fileId}" (${err.message})`, err);
  }
  /**
   * Called when file is being validated
   * @param file
   */


  onValidate(file) {}
  /**
   * Called when a write error happened
   * @param err
   * @param fileId
   * @param file
   * @return boolean
   */


  onWriteError(err, fileId, file) {
    console.error(`ufs: cannot write file "${fileId}" (${err.message})`, err);
  }
  /**
   * Sets the store permissions
   * @param permissions
   */


  setPermissions(permissions) {
    if (!(permissions instanceof StorePermissions)) {
      throw new TypeError("Permissions is not an instance of UploadFS.StorePermissions");
    }

    this.permissions = permissions;
  }
  /**
   * Transforms the file on reading
   * @param readStream
   * @param writeStream
   * @param fileId
   * @param file
   * @param request
   * @param headers
   */


  transformRead(readStream, writeStream, fileId, file, request, headers) {
    if (typeof this.options.transformRead === 'function') {
      this.options.transformRead.call(this, readStream, writeStream, fileId, file, request, headers);
    } else {
      readStream.pipe(writeStream);
    }
  }
  /**
   * Transforms the file on writing
   * @param readStream
   * @param writeStream
   * @param fileId
   * @param file
   */


  transformWrite(readStream, writeStream, fileId, file) {
    if (typeof this.options.transformWrite === 'function') {
      this.options.transformWrite.call(this, readStream, writeStream, fileId, file);
    } else {
      readStream.pipe(writeStream);
    }
  }
  /**
   * Validates the file
   * @param file
   */


  validate(file) {
    if (typeof this.onValidate === 'function') {
      this.onValidate(file);
    }
  }

}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-template-helpers.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/jalik_ufs/ufs-template-helpers.js                                                                    //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
let Template;
module.link("meteor/templating", {
  Template(v) {
    Template = v;
  }

}, 0);

let isMIME = function (type, mime) {
  return typeof type === 'string' && typeof mime === 'string' && mime.indexOf(type + '/') === 0;
};

Template.registerHelper('isApplication', function (type) {
  return isMIME('application', this.type || type);
});
Template.registerHelper('isAudio', function (type) {
  return isMIME('audio', this.type || type);
});
Template.registerHelper('isImage', function (type) {
  return isMIME('image', this.type || type);
});
Template.registerHelper('isText', function (type) {
  return isMIME('text', this.type || type);
});
Template.registerHelper('isVideo', function (type) {
  return isMIME('video', this.type || type);
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-tokens.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/jalik_ufs/ufs-tokens.js                                                                              //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
module.export({
  Tokens: () => Tokens
});
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 0);
const Tokens = new Mongo.Collection('ufsTokens');
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ufs-uploader.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/jalik_ufs/ufs-uploader.js                                                                            //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
module.export({
  Uploader: () => Uploader
});

let _;

module.link("meteor/underscore", {
  _(v) {
    _ = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let Store;
module.link("./ufs-store", {
  Store(v) {
    Store = v;
  }

}, 2);

class Uploader {
  constructor(options) {
    let self = this; // Set default options

    options = _.extend({
      adaptive: true,
      capacity: 0.9,
      chunkSize: 16 * 1024,
      data: null,
      file: null,
      maxChunkSize: 4 * 1024 * 1000,
      maxTries: 5,
      onAbort: this.onAbort,
      onComplete: this.onComplete,
      onCreate: this.onCreate,
      onError: this.onError,
      onProgress: this.onProgress,
      onStart: this.onStart,
      onStop: this.onStop,
      retryDelay: 2000,
      store: null,
      transferDelay: 100
    }, options); // Check options

    if (typeof options.adaptive !== 'boolean') {
      throw new TypeError('adaptive is not a number');
    }

    if (typeof options.capacity !== 'number') {
      throw new TypeError('capacity is not a number');
    }

    if (options.capacity <= 0 || options.capacity > 1) {
      throw new RangeError('capacity must be a float between 0.1 and 1.0');
    }

    if (typeof options.chunkSize !== 'number') {
      throw new TypeError('chunkSize is not a number');
    }

    if (!(options.data instanceof Blob) && !(options.data instanceof File)) {
      throw new TypeError('data is not an Blob or File');
    }

    if (options.file === null || typeof options.file !== 'object') {
      throw new TypeError('file is not an object');
    }

    if (typeof options.maxChunkSize !== 'number') {
      throw new TypeError('maxChunkSize is not a number');
    }

    if (typeof options.maxTries !== 'number') {
      throw new TypeError('maxTries is not a number');
    }

    if (typeof options.retryDelay !== 'number') {
      throw new TypeError('retryDelay is not a number');
    }

    if (typeof options.transferDelay !== 'number') {
      throw new TypeError('transferDelay is not a number');
    }

    if (typeof options.onAbort !== 'function') {
      throw new TypeError('onAbort is not a function');
    }

    if (typeof options.onComplete !== 'function') {
      throw new TypeError('onComplete is not a function');
    }

    if (typeof options.onCreate !== 'function') {
      throw new TypeError('onCreate is not a function');
    }

    if (typeof options.onError !== 'function') {
      throw new TypeError('onError is not a function');
    }

    if (typeof options.onProgress !== 'function') {
      throw new TypeError('onProgress is not a function');
    }

    if (typeof options.onStart !== 'function') {
      throw new TypeError('onStart is not a function');
    }

    if (typeof options.onStop !== 'function') {
      throw new TypeError('onStop is not a function');
    }

    if (typeof options.store !== 'string' && !(options.store instanceof Store)) {
      throw new TypeError('store must be the name of the store or an instance of UploadFS.Store');
    } // Public attributes


    self.adaptive = options.adaptive;
    self.capacity = parseFloat(options.capacity);
    self.chunkSize = parseInt(options.chunkSize);
    self.maxChunkSize = parseInt(options.maxChunkSize);
    self.maxTries = parseInt(options.maxTries);
    self.retryDelay = parseInt(options.retryDelay);
    self.transferDelay = parseInt(options.transferDelay);
    self.onAbort = options.onAbort;
    self.onComplete = options.onComplete;
    self.onCreate = options.onCreate;
    self.onError = options.onError;
    self.onProgress = options.onProgress;
    self.onStart = options.onStart;
    self.onStop = options.onStop; // Private attributes

    let store = options.store;
    let data = options.data;
    let capacityMargin = 0.1;
    let file = options.file;
    let fileId = null;
    let offset = 0;
    let loaded = 0;
    let total = data.size;
    let tries = 0;
    let postUrl = null;
    let token = null;
    let complete = false;
    let uploading = false;
    let timeA = null;
    let timeB = null;
    let elapsedTime = 0;
    let startTime = 0; // Keep only the name of the store

    if (store instanceof Store) {
      store = store.getName();
    } // Assign file to store


    file.store = store;

    function finish() {
      // Finish the upload by telling the store the upload is complete
      Meteor.call('ufsComplete', fileId, store, token, function (err, uploadedFile) {
        if (err) {
          self.onError(err, file);
          self.abort();
        } else if (uploadedFile) {
          uploading = false;
          complete = true;
          file = uploadedFile;
          self.onComplete(uploadedFile);
        }
      });
    }
    /**
     * Aborts the current transfer
     */


    self.abort = function () {
      // Remove the file from database
      Meteor.call('ufsDelete', fileId, store, token, function (err, result) {
        if (err) {
          self.onError(err, file);
        }
      }); // Reset uploader status

      uploading = false;
      fileId = null;
      offset = 0;
      tries = 0;
      loaded = 0;
      complete = false;
      startTime = null;
      self.onAbort(file);
    };
    /**
     * Returns the average speed in bytes per second
     * @returns {number}
     */


    self.getAverageSpeed = function () {
      let seconds = self.getElapsedTime() / 1000;
      return self.getLoaded() / seconds;
    };
    /**
     * Returns the elapsed time in milliseconds
     * @returns {number}
     */


    self.getElapsedTime = function () {
      if (startTime && self.isUploading()) {
        return elapsedTime + (Date.now() - startTime);
      }

      return elapsedTime;
    };
    /**
     * Returns the file
     * @return {object}
     */


    self.getFile = function () {
      return file;
    };
    /**
     * Returns the loaded bytes
     * @return {number}
     */


    self.getLoaded = function () {
      return loaded;
    };
    /**
     * Returns current progress
     * @return {number}
     */


    self.getProgress = function () {
      return Math.min(loaded / total * 100 / 100, 1.0);
    };
    /**
     * Returns the remaining time in milliseconds
     * @returns {number}
     */


    self.getRemainingTime = function () {
      let averageSpeed = self.getAverageSpeed();
      let remainingBytes = total - self.getLoaded();
      return averageSpeed && remainingBytes ? Math.max(remainingBytes / averageSpeed, 0) : 0;
    };
    /**
     * Returns the upload speed in bytes per second
     * @returns {number}
     */


    self.getSpeed = function () {
      if (timeA && timeB && self.isUploading()) {
        let seconds = (timeB - timeA) / 1000;
        return self.chunkSize / seconds;
      }

      return 0;
    };
    /**
     * Returns the total bytes
     * @return {number}
     */


    self.getTotal = function () {
      return total;
    };
    /**
     * Checks if the transfer is complete
     * @return {boolean}
     */


    self.isComplete = function () {
      return complete;
    };
    /**
     * Checks if the transfer is active
     * @return {boolean}
     */


    self.isUploading = function () {
      return uploading;
    };
    /**
     * Reads a portion of file
     * @param start
     * @param length
     * @param callback
     * @returns {Blob}
     */


    self.readChunk = function (start, length, callback) {
      if (typeof callback != 'function') {
        throw new Error('readChunk is missing callback');
      }

      try {
        let end; // Calculate the chunk size

        if (length && start + length > total) {
          end = total;
        } else {
          end = start + length;
        } // Get chunk


        let chunk = data.slice(start, end); // Pass chunk to callback

        callback.call(self, null, chunk);
      } catch (err) {
        console.error('read error', err); // Retry to read chunk

        Meteor.setTimeout(function () {
          if (tries < self.maxTries) {
            tries += 1;
            self.readChunk(start, length, callback);
          }
        }, self.retryDelay);
      }
    };
    /**
     * Sends a file chunk to the store
     */


    self.sendChunk = function () {
      if (!complete && startTime !== null) {
        if (offset < total) {
          let chunkSize = self.chunkSize; // Use adaptive length

          if (self.adaptive && timeA && timeB && timeB > timeA) {
            let duration = (timeB - timeA) / 1000;
            let max = self.capacity * (1 + capacityMargin);
            let min = self.capacity * (1 - capacityMargin);

            if (duration >= max) {
              chunkSize = Math.abs(Math.round(chunkSize * (max - duration)));
            } else if (duration < min) {
              chunkSize = Math.round(chunkSize * (min / duration));
            } // Limit to max chunk size


            if (self.maxChunkSize > 0 && chunkSize > self.maxChunkSize) {
              chunkSize = self.maxChunkSize;
            }
          } // Limit to max chunk size


          if (self.maxChunkSize > 0 && chunkSize > self.maxChunkSize) {
            chunkSize = self.maxChunkSize;
          } // Reduce chunk size to fit total


          if (offset + chunkSize > total) {
            chunkSize = total - offset;
          } // Prepare the chunk


          self.readChunk(offset, chunkSize, function (err, chunk) {
            if (err) {
              self.onError(err, file);
              return;
            }

            let xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function () {
              if (xhr.readyState === 4) {
                if (_.contains([200, 201, 202, 204], xhr.status)) {
                  timeB = Date.now();
                  offset += chunkSize;
                  loaded += chunkSize; // Send next chunk

                  self.onProgress(file, self.getProgress()); // Finish upload

                  if (loaded >= total) {
                    elapsedTime = Date.now() - startTime;
                    finish();
                  } else {
                    Meteor.setTimeout(self.sendChunk, self.transferDelay);
                  }
                } else if (!_.contains([402, 403, 404, 500], xhr.status)) {
                  // Retry until max tries is reach
                  // But don't retry if these errors occur
                  if (tries <= self.maxTries) {
                    tries += 1; // Wait before retrying

                    Meteor.setTimeout(self.sendChunk, self.retryDelay);
                  } else {
                    self.abort();
                  }
                } else {
                  self.abort();
                }
              }
            }; // Calculate upload progress


            let progress = (offset + chunkSize) / total; // let formData = new FormData();
            // formData.append('progress', progress);
            // formData.append('chunk', chunk);

            let url = `${postUrl}&progress=${progress}`;
            timeA = Date.now();
            timeB = null;
            uploading = true; // Send chunk to the store

            xhr.open('POST', url, true);
            xhr.send(chunk);
          });
        }
      }
    };
    /**
     * Starts or resumes the transfer
     */


    self.start = function () {
      if (!fileId) {
        // Create the file document and get the token
        // that allows the user to send chunks to the store.
        Meteor.call('ufsCreate', _.extend({}, file), function (err, result) {
          if (err) {
            self.onError(err, file);
          } else if (result) {
            token = result.token;
            postUrl = result.url;
            fileId = result.fileId;
            file._id = result.fileId;
            self.onCreate(file);
            tries = 0;
            startTime = Date.now();
            self.onStart(file);
            self.sendChunk();
          }
        });
      } else if (!uploading && !complete) {
        // Resume uploading
        tries = 0;
        startTime = Date.now();
        self.onStart(file);
        self.sendChunk();
      }
    };
    /**
     * Stops the transfer
     */


    self.stop = function () {
      if (uploading) {
        // Update elapsed time
        elapsedTime = Date.now() - startTime;
        startTime = null;
        uploading = false;
        self.onStop(file);
        Meteor.call('ufsStop', fileId, store, token, function (err, result) {
          if (err) {
            self.onError(err, file);
          }
        });
      }
    };
  }
  /**
   * Called when the file upload is aborted
   * @param file
   */


  onAbort(file) {}
  /**
   * Called when the file upload is complete
   * @param file
   */


  onComplete(file) {}
  /**
   * Called when the file is created in the collection
   * @param file
   */


  onCreate(file) {}
  /**
   * Called when an error occurs during file upload
   * @param err
   * @param file
   */


  onError(err, file) {
    console.error(`ufs: ${err.message}`);
  }
  /**
   * Called when a file chunk has been sent
   * @param file
   * @param progress is a float from 0.0 to 1.0
   */


  onProgress(file, progress) {}
  /**
   * Called when the file upload starts
   * @param file
   */


  onStart(file) {}
  /**
   * Called when the file upload stops
   * @param file
   */


  onStop(file) {}

}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/jalik:ufs/ufs.js");

/* Exports */
Package._define("jalik:ufs", exports);

})();

//# sourceURL=meteor://💻app/packages/jalik_ufs.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvamFsaWs6dWZzL3Vmcy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvamFsaWs6dWZzL3Vmcy1jb25maWcuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2phbGlrOnVmcy91ZnMtZmlsdGVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9qYWxpazp1ZnMvdWZzLW1ldGhvZHMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2phbGlrOnVmcy91ZnMtbWltZS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvamFsaWs6dWZzL3Vmcy1zZXJ2ZXIuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2phbGlrOnVmcy91ZnMtc3RvcmUtcGVybWlzc2lvbnMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2phbGlrOnVmcy91ZnMtc3RvcmUuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2phbGlrOnVmcy91ZnMtdGVtcGxhdGUtaGVscGVycy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvamFsaWs6dWZzL3Vmcy10b2tlbnMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2phbGlrOnVmcy91ZnMtdXBsb2FkZXIuanMiXSwibmFtZXMiOlsibW9kdWxlMSIsIm1vZHVsZSIsImV4cG9ydCIsIlVwbG9hZEZTIiwiXyIsImxpbmsiLCJ2IiwiTWV0ZW9yIiwiTW9uZ28iLCJNSU1FIiwiUmFuZG9tIiwiVG9rZW5zIiwiQ29uZmlnIiwiRmlsdGVyIiwiU3RvcmUiLCJTdG9yZVBlcm1pc3Npb25zIiwiVXBsb2FkZXIiLCJzdG9yZXMiLCJzdG9yZSIsInRva2VucyIsImFkZEVUYWdBdHRyaWJ1dGVUb0ZpbGVzIiwid2hlcmUiLCJlYWNoIiwiZ2V0U3RvcmVzIiwiZmlsZXMiLCJnZXRDb2xsZWN0aW9uIiwiZmluZCIsImV0YWciLCJmaWVsZHMiLCJfaWQiLCJmb3JFYWNoIiwiZmlsZSIsImRpcmVjdCIsInVwZGF0ZSIsIiRzZXQiLCJnZW5lcmF0ZUV0YWciLCJhZGRNaW1lVHlwZSIsImV4dGVuc2lvbiIsIm1pbWUiLCJ0b0xvd2VyQ2FzZSIsImFkZFBhdGhBdHRyaWJ1dGVUb0ZpbGVzIiwicGF0aCIsImdldEZpbGVSZWxhdGl2ZVVSTCIsImFkZFN0b3JlIiwiVHlwZUVycm9yIiwiZ2V0TmFtZSIsImlkIiwiZ2V0TWltZVR5cGUiLCJnZXRNaW1lVHlwZXMiLCJnZXRTdG9yZSIsIm5hbWUiLCJnZXRUZW1wRmlsZVBhdGgiLCJmaWxlSWQiLCJjb25maWciLCJ0bXBEaXIiLCJpbXBvcnRGcm9tVVJMIiwidXJsIiwiY2FsbGJhY2siLCJjYWxsIiwicmVhZEFzQXJyYXlCdWZmZXIiLCJldmVudCIsImNvbnNvbGUiLCJlcnJvciIsInNlbGVjdEZpbGUiLCJpbnB1dCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInR5cGUiLCJtdWx0aXBsZSIsIm9uY2hhbmdlIiwiZXYiLCJ0YXJnZXQiLCJkaXYiLCJjbGFzc05hbWUiLCJzdHlsZSIsImFwcGVuZENoaWxkIiwiYm9keSIsImNsaWNrIiwic2VsZWN0RmlsZXMiLCJpIiwibGVuZ3RoIiwiaXNDbGllbnQiLCJyZXF1aXJlIiwiaXNTZXJ2ZXIiLCJnbG9iYWwiLCJ3aW5kb3ciLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJleHRlbmQiLCJkZWZhdWx0U3RvcmVQZXJtaXNzaW9ucyIsImh0dHBzIiwic2ltdWxhdGVSZWFkRGVsYXkiLCJzaW11bGF0ZVVwbG9hZFNwZWVkIiwic2ltdWxhdGVXcml0ZURlbGF5Iiwic3RvcmVzUGF0aCIsInRtcERpclBlcm1pc3Npb25zIiwicGFyc2VJbnQiLCJzZWxmIiwiY29udGVudFR5cGVzIiwiZXh0ZW5zaW9ucyIsIm1pblNpemUiLCJtYXhTaXplIiwib25DaGVjayIsIkFycmF5IiwibWV0aG9kIiwiY2hlY2siLCJFcnJvciIsInNpemUiLCJnZXRNaW5TaXplIiwiZ2V0TWF4U2l6ZSIsImdldEV4dGVuc2lvbnMiLCJjb250YWlucyIsImdldENvbnRlbnRUeXBlcyIsImlzQ29udGVudFR5cGVJbkxpc3QiLCJsaXN0Iiwid2lsZENhcmRHbG9iIiwid2lsZGNhcmRzIiwiZmlsdGVyIiwiaXRlbSIsImluZGV4T2YiLCJyZXBsYWNlIiwiaXNWYWxpZCIsInJlc3VsdCIsImVyciIsImZzIiwiTnBtIiwiaHR0cCIsIkZ1dHVyZSIsIm1ldGhvZHMiLCJ1ZnNDb21wbGV0ZSIsInN0b3JlTmFtZSIsInRva2VuIiwiU3RyaW5nIiwiY2hlY2tUb2tlbiIsImZ1dCIsInRtcEZpbGUiLCJyZW1vdmVUZW1wRmlsZSIsInVubGluayIsIm1lc3NhZ2UiLCJmaW5kT25lIiwidmFsaWRhdGUiLCJycyIsImNyZWF0ZVJlYWRTdHJlYW0iLCJmbGFncyIsImVuY29kaW5nIiwiYXV0b0Nsb3NlIiwib24iLCJiaW5kRW52aXJvbm1lbnQiLCJyZW1vdmUiLCJ0aHJvdyIsIndyaXRlIiwicmV0dXJuIiwid2FpdCIsInVmc0NyZWF0ZSIsIk9iamVjdCIsImNvbXBsZXRlIiwidXBsb2FkaW5nIiwic3Vic3RyIiwibGFzdEluZGV4T2YiLCJwcm9ncmVzcyIsInVzZXJJZCIsImdldEZpbHRlciIsImNyZWF0ZSIsImNyZWF0ZVRva2VuIiwidXBsb2FkVXJsIiwiZ2V0VVJMIiwidWZzRGVsZXRlIiwiY291bnQiLCJ1ZnNJbXBvcnRVUkwiLCJzcGxpdCIsInBvcCIsIm9yaWdpbmFsVXJsIiwid2FybiIsInByb3RvIiwidGVzdCIsInVuYmxvY2siLCJnZXQiLCJyZXMiLCJ1ZnNTdG9wIiwiV2ViQXBwIiwiZG9tYWluIiwibWtkaXJwIiwic3RyZWFtIiwiVVJMIiwiemxpYiIsInN0YXJ0dXAiLCJtb2RlIiwic3RhdCIsImxvZyIsImNobW9kIiwiZCIsImNvbm5lY3RIYW5kbGVycyIsInVzZSIsInJlcSIsIm5leHQiLCJwYXJzZWRVcmwiLCJwYXJzZSIsInBhdGhuYW1lIiwiYWxsb3dDT1JTIiwic2V0SGVhZGVyIiwicmVnRXhwIiwiUmVnRXhwIiwibWF0Y2giLCJleGVjIiwid3JpdGVIZWFkIiwiZW5kIiwicXVlcnkiLCJ3cyIsImNyZWF0ZVdyaXRlU3RyZWFtIiwicGFyc2VGbG9hdCIsImlzTmFOIiwiTWF0aCIsIm1pbiIsImNodW5rIiwib25SZWFkIiwidW5kZWZpbmVkIiwiaW5kZXgiLCJfc2xlZXBGb3JNcyIsInJ1biIsInN0YXR1cyIsImhlYWRlcnMiLCJtb2RpZmllZEF0IiwiRGF0ZSIsInRvVVRDU3RyaW5nIiwidXBsb2FkZWRBdCIsIm1vZGlmaWVkU2luY2UiLCJyYW5nZSIsInRvdGFsIiwidW5pdCIsInJhbmdlcyIsInIiLCJzdGFydCIsImdldFJlYWRTdHJlYW0iLCJQYXNzVGhyb3VnaCIsIm9uUmVhZEVycm9yIiwiZW1pdCIsInRyYW5zZm9ybVJlYWQiLCJhY2NlcHQiLCJwaXBlIiwiY3JlYXRlR3ppcCIsImNyZWF0ZURlZmxhdGUiLCJpbnNlcnQiLCJhY3Rpb25zIiwiYWN0aW9uIiwibW9kaWZpZXJzIiwiY2hlY2tJbnNlcnQiLCJjaGVja1JlbW92ZSIsImNoZWNrVXBkYXRlIiwiY29sbGVjdGlvbiIsIm9uQ29weUVycm9yIiwib25GaW5pc2hVcGxvYWQiLCJvblZhbGlkYXRlIiwib25Xcml0ZUVycm9yIiwicGVybWlzc2lvbnMiLCJ0cmFuc2Zvcm1Xcml0ZSIsIkNvbGxlY3Rpb24iLCJ2YWx1ZSIsImNvcHkiLCJvbWl0Iiwib3JpZ2luYWxTdG9yZSIsIm9yaWdpbmFsSWQiLCJjb3B5SWQiLCJnZW5lcmF0ZVRva2VuIiwiY3JlYXRlZEF0IiwiZ2V0V3JpdGVTdHJlYW0iLCJlcnJvckhhbmRsZXIiLCJyZWFkU3RyZWFtIiwiZGF0YSIsImdldEZpbGVVUkwiLCJjb3B5VG8iLCJhZnRlciIsImJlZm9yZSIsImRlbGV0ZSIsInBhdHRlcm4iLCJjIiwicmFuZG9tIiwicyIsInRvU3RyaW5nIiwicm91bmQiLCJ0b1VwcGVyQ2FzZSIsImdldFJlbGF0aXZlVVJMIiwicm9vdFVybCIsImFic29sdXRlVXJsIiwicm9vdFBhdGgiLCJ0cmltIiwiZW5jb2RlVVJJIiwic2VjdXJlIiwicmVxdWVzdCIsInJlc3BvbnNlIiwic2V0UGVybWlzc2lvbnMiLCJ3cml0ZVN0cmVhbSIsIlRlbXBsYXRlIiwiaXNNSU1FIiwicmVnaXN0ZXJIZWxwZXIiLCJhZGFwdGl2ZSIsImNhcGFjaXR5IiwiY2h1bmtTaXplIiwibWF4Q2h1bmtTaXplIiwibWF4VHJpZXMiLCJvbkFib3J0Iiwib25Db21wbGV0ZSIsIm9uQ3JlYXRlIiwib25FcnJvciIsIm9uUHJvZ3Jlc3MiLCJvblN0YXJ0Iiwib25TdG9wIiwicmV0cnlEZWxheSIsInRyYW5zZmVyRGVsYXkiLCJSYW5nZUVycm9yIiwiQmxvYiIsIkZpbGUiLCJjYXBhY2l0eU1hcmdpbiIsIm9mZnNldCIsImxvYWRlZCIsInRyaWVzIiwicG9zdFVybCIsInRpbWVBIiwidGltZUIiLCJlbGFwc2VkVGltZSIsInN0YXJ0VGltZSIsImZpbmlzaCIsInVwbG9hZGVkRmlsZSIsImFib3J0IiwiZ2V0QXZlcmFnZVNwZWVkIiwic2Vjb25kcyIsImdldEVsYXBzZWRUaW1lIiwiZ2V0TG9hZGVkIiwiaXNVcGxvYWRpbmciLCJub3ciLCJnZXRGaWxlIiwiZ2V0UHJvZ3Jlc3MiLCJnZXRSZW1haW5pbmdUaW1lIiwiYXZlcmFnZVNwZWVkIiwicmVtYWluaW5nQnl0ZXMiLCJtYXgiLCJnZXRTcGVlZCIsImdldFRvdGFsIiwiaXNDb21wbGV0ZSIsInJlYWRDaHVuayIsInNsaWNlIiwic2V0VGltZW91dCIsInNlbmRDaHVuayIsImR1cmF0aW9uIiwiYWJzIiwieGhyIiwiWE1MSHR0cFJlcXVlc3QiLCJvbnJlYWR5c3RhdGVjaGFuZ2UiLCJyZWFkeVN0YXRlIiwib3BlbiIsInNlbmQiLCJzdG9wIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsTUFBTUEsT0FBTyxHQUFDQyxNQUFkO0FBQXFCRCxPQUFPLENBQUNFLE1BQVIsQ0FBZTtBQUFDQyxVQUFRLEVBQUMsTUFBSUE7QUFB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KlxyXG4gKiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDE3IEthcmwgU1RFSU5cclxuICpcclxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuICpcclxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXHJcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXHJcbiAqIFNPRlRXQVJFLlxyXG4gKlxyXG4gKi9cclxuaW1wb3J0IHtffSBmcm9tIFwibWV0ZW9yL3VuZGVyc2NvcmVcIjtcclxuaW1wb3J0IHtNZXRlb3J9IGZyb20gXCJtZXRlb3IvbWV0ZW9yXCI7XHJcbmltcG9ydCB7TW9uZ299IGZyb20gXCJtZXRlb3IvbW9uZ29cIjtcclxuaW1wb3J0IHtNSU1FfSBmcm9tIFwiLi91ZnMtbWltZVwiO1xyXG5pbXBvcnQge1JhbmRvbX0gZnJvbSBcIm1ldGVvci9yYW5kb21cIjtcclxuaW1wb3J0IHtUb2tlbnN9IGZyb20gXCIuL3Vmcy10b2tlbnNcIjtcclxuaW1wb3J0IHtDb25maWd9IGZyb20gXCIuL3Vmcy1jb25maWdcIjtcclxuaW1wb3J0IHtGaWx0ZXJ9IGZyb20gXCIuL3Vmcy1maWx0ZXJcIjtcclxuaW1wb3J0IHtTdG9yZX0gZnJvbSBcIi4vdWZzLXN0b3JlXCI7XHJcbmltcG9ydCB7U3RvcmVQZXJtaXNzaW9uc30gZnJvbSBcIi4vdWZzLXN0b3JlLXBlcm1pc3Npb25zXCI7XHJcbmltcG9ydCB7VXBsb2FkZXJ9IGZyb20gXCIuL3Vmcy11cGxvYWRlclwiO1xyXG5cclxuXHJcbmxldCBzdG9yZXMgPSB7fTtcclxuXHJcbmV4cG9ydCBjb25zdCBVcGxvYWRGUyA9IHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnRhaW5zIGFsbCBzdG9yZXNcclxuICAgICAqL1xyXG4gICAgc3RvcmU6IHt9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29sbGVjdGlvbiBvZiB0b2tlbnNcclxuICAgICAqL1xyXG4gICAgdG9rZW5zOiBUb2tlbnMsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIHRoZSBcImV0YWdcIiBhdHRyaWJ1dGUgdG8gZmlsZXNcclxuICAgICAqIEBwYXJhbSB3aGVyZVxyXG4gICAgICovXHJcbiAgICBhZGRFVGFnQXR0cmlidXRlVG9GaWxlcyh3aGVyZSkge1xyXG4gICAgICAgIF8uZWFjaCh0aGlzLmdldFN0b3JlcygpLCAoc3RvcmUpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgZmlsZXMgPSBzdG9yZS5nZXRDb2xsZWN0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBCeSBkZWZhdWx0IHVwZGF0ZSBvbmx5IGZpbGVzIHdpdGggbm8gcGF0aCBzZXRcclxuICAgICAgICAgICAgZmlsZXMuZmluZCh3aGVyZSB8fCB7ZXRhZzogbnVsbH0sIHtmaWVsZHM6IHtfaWQ6IDF9fSkuZm9yRWFjaCgoZmlsZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZmlsZXMuZGlyZWN0LnVwZGF0ZShmaWxlLl9pZCwgeyRzZXQ6IHtldGFnOiB0aGlzLmdlbmVyYXRlRXRhZygpfX0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIHRoZSBNSU1FIHR5cGUgZm9yIGFuIGV4dGVuc2lvblxyXG4gICAgICogQHBhcmFtIGV4dGVuc2lvblxyXG4gICAgICogQHBhcmFtIG1pbWVcclxuICAgICAqL1xyXG4gICAgYWRkTWltZVR5cGUoZXh0ZW5zaW9uLCBtaW1lKSB7XHJcbiAgICAgICAgTUlNRVtleHRlbnNpb24udG9Mb3dlckNhc2UoKV0gPSBtaW1lO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgdGhlIFwicGF0aFwiIGF0dHJpYnV0ZSB0byBmaWxlc1xyXG4gICAgICogQHBhcmFtIHdoZXJlXHJcbiAgICAgKi9cclxuICAgIGFkZFBhdGhBdHRyaWJ1dGVUb0ZpbGVzKHdoZXJlKSB7XHJcbiAgICAgICAgXy5lYWNoKHRoaXMuZ2V0U3RvcmVzKCksIChzdG9yZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBmaWxlcyA9IHN0b3JlLmdldENvbGxlY3Rpb24oKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEJ5IGRlZmF1bHQgdXBkYXRlIG9ubHkgZmlsZXMgd2l0aCBubyBwYXRoIHNldFxyXG4gICAgICAgICAgICBmaWxlcy5maW5kKHdoZXJlIHx8IHtwYXRoOiBudWxsfSwge2ZpZWxkczoge19pZDogMX19KS5mb3JFYWNoKChmaWxlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBmaWxlcy5kaXJlY3QudXBkYXRlKGZpbGUuX2lkLCB7JHNldDoge3BhdGg6IHN0b3JlLmdldEZpbGVSZWxhdGl2ZVVSTChmaWxlLl9pZCl9fSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlZ2lzdGVycyB0aGUgc3RvcmVcclxuICAgICAqIEBwYXJhbSBzdG9yZVxyXG4gICAgICovXHJcbiAgICBhZGRTdG9yZShzdG9yZSkge1xyXG4gICAgICAgIGlmICghKHN0b3JlIGluc3RhbmNlb2YgU3RvcmUpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYHVmczogc3RvcmUgaXMgbm90IGFuIGluc3RhbmNlIG9mIFVwbG9hZEZTLlN0b3JlLmApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzdG9yZXNbc3RvcmUuZ2V0TmFtZSgpXSA9IHN0b3JlO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEdlbmVyYXRlcyBhIHVuaXF1ZSBFVGFnXHJcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIGdlbmVyYXRlRXRhZygpIHtcclxuICAgICAgICByZXR1cm4gUmFuZG9tLmlkKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgTUlNRSB0eXBlIG9mIHRoZSBleHRlbnNpb25cclxuICAgICAqIEBwYXJhbSBleHRlbnNpb25cclxuICAgICAqIEByZXR1cm5zIHsqfVxyXG4gICAgICovXHJcbiAgICBnZXRNaW1lVHlwZShleHRlbnNpb24pIHtcclxuICAgICAgICBleHRlbnNpb24gPSBleHRlbnNpb24udG9Mb3dlckNhc2UoKTtcclxuICAgICAgICByZXR1cm4gTUlNRVtleHRlbnNpb25dO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYWxsIE1JTUUgdHlwZXNcclxuICAgICAqL1xyXG4gICAgZ2V0TWltZVR5cGVzKCkge1xyXG4gICAgICAgIHJldHVybiBNSU1FO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHN0b3JlIGJ5IGl0cyBuYW1lXHJcbiAgICAgKiBAcGFyYW0gbmFtZVxyXG4gICAgICogQHJldHVybiB7VXBsb2FkRlMuU3RvcmV9XHJcbiAgICAgKi9cclxuICAgIGdldFN0b3JlKG5hbWUpIHtcclxuICAgICAgICByZXR1cm4gc3RvcmVzW25hbWVdO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYWxsIHN0b3Jlc1xyXG4gICAgICogQHJldHVybiB7b2JqZWN0fVxyXG4gICAgICovXHJcbiAgICBnZXRTdG9yZXMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHN0b3JlcztcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB0ZW1wb3JhcnkgZmlsZSBwYXRoXHJcbiAgICAgKiBAcGFyYW0gZmlsZUlkXHJcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIGdldFRlbXBGaWxlUGF0aChmaWxlSWQpIHtcclxuICAgICAgICByZXR1cm4gYCR7dGhpcy5jb25maWcudG1wRGlyfS8ke2ZpbGVJZH1gO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEltcG9ydHMgYSBmaWxlIGZyb20gYSBVUkxcclxuICAgICAqIEBwYXJhbSB1cmxcclxuICAgICAqIEBwYXJhbSBmaWxlXHJcbiAgICAgKiBAcGFyYW0gc3RvcmVcclxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xyXG4gICAgICovXHJcbiAgICBpbXBvcnRGcm9tVVJMKHVybCwgZmlsZSwgc3RvcmUsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBzdG9yZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgTWV0ZW9yLmNhbGwoJ3Vmc0ltcG9ydFVSTCcsIHVybCwgZmlsZSwgc3RvcmUsIGNhbGxiYWNrKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHN0b3JlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICBzdG9yZS5pbXBvcnRGcm9tVVJMKHVybCwgZmlsZSwgY2FsbGJhY2spO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGZpbGUgYW5kIGRhdGEgYXMgQXJyYXlCdWZmZXIgZm9yIGVhY2ggZmlsZXMgaW4gdGhlIGV2ZW50XHJcbiAgICAgKiBAZGVwcmVjYXRlZFxyXG4gICAgICogQHBhcmFtIGV2ZW50XHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcclxuICAgICAqL1xyXG4gICAgcmVhZEFzQXJyYXlCdWZmZXIgKGV2ZW50LCBjYWxsYmFjaykge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1VwbG9hZEZTLnJlYWRBc0FycmF5QnVmZmVyIGlzIGRlcHJlY2F0ZWQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vamFsaWsvamFsaWstdWZzI3VwbG9hZGluZy1mcm9tLWEtZmlsZScpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIE9wZW5zIGEgZGlhbG9nIHRvIHNlbGVjdCBhIHNpbmdsZSBmaWxlXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcclxuICAgICAqL1xyXG4gICAgc2VsZWN0RmlsZShjYWxsYmFjaykge1xyXG4gICAgICAgIGNvbnN0IGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICBpbnB1dC50eXBlID0gJ2ZpbGUnO1xyXG4gICAgICAgIGlucHV0Lm11bHRpcGxlID0gZmFsc2U7XHJcbiAgICAgICAgaW5wdXQub25jaGFuZ2UgPSAoZXYpID0+IHtcclxuICAgICAgICAgICAgbGV0IGZpbGVzID0gZXYudGFyZ2V0LmZpbGVzO1xyXG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsKFVwbG9hZEZTLCBmaWxlc1swXSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvLyBGaXggZm9yIGlPUy9TYWZhcmlcclxuICAgICAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBkaXYuY2xhc3NOYW1lID0gJ3Vmcy1maWxlLXNlbGVjdG9yJztcclxuICAgICAgICBkaXYuc3R5bGUgPSAnZGlzcGxheTpub25lOyBoZWlnaHQ6MDsgd2lkdGg6MDsgb3ZlcmZsb3c6IGhpZGRlbjsnO1xyXG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChpbnB1dCk7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpO1xyXG4gICAgICAgIC8vIFRyaWdnZXIgZmlsZSBzZWxlY3Rpb25cclxuICAgICAgICBpbnB1dC5jbGljaygpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIE9wZW5zIGEgZGlhbG9nIHRvIHNlbGVjdCBtdWx0aXBsZSBmaWxlc1xyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrXHJcbiAgICAgKi9cclxuICAgIHNlbGVjdEZpbGVzKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgICAgIGlucHV0LnR5cGUgPSAnZmlsZSc7XHJcbiAgICAgICAgaW5wdXQubXVsdGlwbGUgPSB0cnVlO1xyXG4gICAgICAgIGlucHV0Lm9uY2hhbmdlID0gKGV2KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpbGVzID0gZXYudGFyZ2V0LmZpbGVzO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaWxlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbChVcGxvYWRGUywgZmlsZXNbaV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvLyBGaXggZm9yIGlPUy9TYWZhcmlcclxuICAgICAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBkaXYuY2xhc3NOYW1lID0gJ3Vmcy1maWxlLXNlbGVjdG9yJztcclxuICAgICAgICBkaXYuc3R5bGUgPSAnZGlzcGxheTpub25lOyBoZWlnaHQ6MDsgd2lkdGg6MDsgb3ZlcmZsb3c6IGhpZGRlbjsnO1xyXG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChpbnB1dCk7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpO1xyXG4gICAgICAgIC8vIFRyaWdnZXIgZmlsZSBzZWxlY3Rpb25cclxuICAgICAgICBpbnB1dC5jbGljaygpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuXHJcbmlmIChNZXRlb3IuaXNDbGllbnQpIHtcclxuICAgIHJlcXVpcmUoJy4vdWZzLXRlbXBsYXRlLWhlbHBlcnMnKTtcclxufVxyXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XHJcbiAgICByZXF1aXJlKCcuL3Vmcy1tZXRob2RzJyk7XHJcbiAgICByZXF1aXJlKCcuL3Vmcy1zZXJ2ZXInKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFVwbG9hZEZTIENvbmZpZ3VyYXRpb25cclxuICogQHR5cGUge0NvbmZpZ31cclxuICovXHJcblVwbG9hZEZTLmNvbmZpZyA9IG5ldyBDb25maWcoKTtcclxuXHJcbi8vIEFkZCBjbGFzc2VzIHRvIGdsb2JhbCBuYW1lc3BhY2VcclxuVXBsb2FkRlMuQ29uZmlnID0gQ29uZmlnO1xyXG5VcGxvYWRGUy5GaWx0ZXIgPSBGaWx0ZXI7XHJcblVwbG9hZEZTLlN0b3JlID0gU3RvcmU7XHJcblVwbG9hZEZTLlN0b3JlUGVybWlzc2lvbnMgPSBTdG9yZVBlcm1pc3Npb25zO1xyXG5VcGxvYWRGUy5VcGxvYWRlciA9IFVwbG9hZGVyO1xyXG5cclxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xyXG4gICAgLy8gRXhwb3NlIHRoZSBtb2R1bGUgZ2xvYmFsbHlcclxuICAgIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIGdsb2JhbFsnVXBsb2FkRlMnXSA9IFVwbG9hZEZTO1xyXG4gICAgfVxyXG59XHJcbmVsc2UgaWYgKE1ldGVvci5pc0NsaWVudCkge1xyXG4gICAgLy8gRXhwb3NlIHRoZSBtb2R1bGUgZ2xvYmFsbHlcclxuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHdpbmRvdy5VcGxvYWRGUyA9IFVwbG9hZEZTO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qXHJcbiAqIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgS2FybCBTVEVJTlxyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4gKlxyXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcclxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuICpcclxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcclxuICogU09GVFdBUkUuXHJcbiAqXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtffSBmcm9tICdtZXRlb3IvdW5kZXJzY29yZSc7XHJcbmltcG9ydCB7TWV0ZW9yfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcclxuaW1wb3J0IHtTdG9yZVBlcm1pc3Npb25zfSBmcm9tICcuL3Vmcy1zdG9yZS1wZXJtaXNzaW9ucyc7XHJcblxyXG5cclxuLyoqXHJcbiAqIFVwbG9hZEZTIGNvbmZpZ3VyYXRpb25cclxuICovXHJcbmV4cG9ydCBjbGFzcyBDb25maWcge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgICAgICAvLyBEZWZhdWx0IG9wdGlvbnNcclxuICAgICAgICBvcHRpb25zID0gXy5leHRlbmQoe1xyXG4gICAgICAgICAgICBkZWZhdWx0U3RvcmVQZXJtaXNzaW9uczogbnVsbCxcclxuICAgICAgICAgICAgaHR0cHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBzaW11bGF0ZVJlYWREZWxheTogMCxcclxuICAgICAgICAgICAgc2ltdWxhdGVVcGxvYWRTcGVlZDogMCxcclxuICAgICAgICAgICAgc2ltdWxhdGVXcml0ZURlbGF5OiAwLFxyXG4gICAgICAgICAgICBzdG9yZXNQYXRoOiAndWZzJyxcclxuICAgICAgICAgICAgdG1wRGlyOiAnL3RtcC91ZnMnLFxyXG4gICAgICAgICAgICB0bXBEaXJQZXJtaXNzaW9uczogJzA3MDAnXHJcbiAgICAgICAgfSwgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgIC8vIENoZWNrIG9wdGlvbnNcclxuICAgICAgICBpZiAob3B0aW9ucy5kZWZhdWx0U3RvcmVQZXJtaXNzaW9ucyAmJiAhKG9wdGlvbnMuZGVmYXVsdFN0b3JlUGVybWlzc2lvbnMgaW5zdGFuY2VvZiBTdG9yZVBlcm1pc3Npb25zKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDb25maWc6IGRlZmF1bHRTdG9yZVBlcm1pc3Npb25zIGlzIG5vdCBhbiBpbnN0YW5jZSBvZiBTdG9yZVBlcm1pc3Npb25zJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5odHRwcyAhPT0gJ2Jvb2xlYW4nKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0NvbmZpZzogaHR0cHMgaXMgbm90IGEgZnVuY3Rpb24nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLnNpbXVsYXRlUmVhZERlbGF5ICE9PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDb25maWc6IHNpbXVsYXRlUmVhZERlbGF5IGlzIG5vdCBhIG51bWJlcicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuc2ltdWxhdGVVcGxvYWRTcGVlZCAhPT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ29uZmlnOiBzaW11bGF0ZVVwbG9hZFNwZWVkIGlzIG5vdCBhIG51bWJlcicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuc2ltdWxhdGVXcml0ZURlbGF5ICE9PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDb25maWc6IHNpbXVsYXRlV3JpdGVEZWxheSBpcyBub3QgYSBudW1iZXInKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLnN0b3Jlc1BhdGggIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0NvbmZpZzogc3RvcmVzUGF0aCBpcyBub3QgYSBzdHJpbmcnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLnRtcERpciAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ29uZmlnOiB0bXBEaXIgaXMgbm90IGEgc3RyaW5nJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy50bXBEaXJQZXJtaXNzaW9ucyAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ29uZmlnOiB0bXBEaXJQZXJtaXNzaW9ucyBpcyBub3QgYSBzdHJpbmcnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERlZmF1bHQgc3RvcmUgcGVybWlzc2lvbnNcclxuICAgICAgICAgKiBAdHlwZSB7VXBsb2FkRlMuU3RvcmVQZXJtaXNzaW9uc31cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmRlZmF1bHRTdG9yZVBlcm1pc3Npb25zID0gb3B0aW9ucy5kZWZhdWx0U3RvcmVQZXJtaXNzaW9ucztcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBVc2Ugb3Igbm90IHNlY3VyZWQgcHJvdG9jb2wgaW4gVVJMU1xyXG4gICAgICAgICAqIEB0eXBlIHtib29sZWFufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuaHR0cHMgPSBvcHRpb25zLmh0dHBzO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRoZSBzaW11bGF0aW9uIHJlYWQgZGVsYXlcclxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuc2ltdWxhdGVSZWFkRGVsYXkgPSBwYXJzZUludChvcHRpb25zLnNpbXVsYXRlUmVhZERlbGF5KTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGUgc2ltdWxhdGlvbiB1cGxvYWQgc3BlZWRcclxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuc2ltdWxhdGVVcGxvYWRTcGVlZCA9IHBhcnNlSW50KG9wdGlvbnMuc2ltdWxhdGVVcGxvYWRTcGVlZCk7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhlIHNpbXVsYXRpb24gd3JpdGUgZGVsYXlcclxuICAgICAgICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuc2ltdWxhdGVXcml0ZURlbGF5ID0gcGFyc2VJbnQob3B0aW9ucy5zaW11bGF0ZVdyaXRlRGVsYXkpO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRoZSBVUkwgcm9vdCBwYXRoIG9mIHN0b3Jlc1xyXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5zdG9yZXNQYXRoID0gb3B0aW9ucy5zdG9yZXNQYXRoO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRoZSB0ZW1wb3JhcnkgZGlyZWN0b3J5IG9mIHVwbG9hZGluZyBmaWxlc1xyXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy50bXBEaXIgPSBvcHRpb25zLnRtcERpcjtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGUgcGVybWlzc2lvbnMgb2YgdGhlIHRlbXBvcmFyeSBkaXJlY3RvcnlcclxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMudG1wRGlyUGVybWlzc2lvbnMgPSBvcHRpb25zLnRtcERpclBlcm1pc3Npb25zO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qXHJcbiAqIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgS2FybCBTVEVJTlxyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4gKlxyXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcclxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuICpcclxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcclxuICogU09GVFdBUkUuXHJcbiAqXHJcbiAqL1xyXG5pbXBvcnQge199IGZyb20gXCJtZXRlb3IvdW5kZXJzY29yZVwiO1xyXG5pbXBvcnQge01ldGVvcn0gZnJvbSBcIm1ldGVvci9tZXRlb3JcIjtcclxuXHJcblxyXG4vKipcclxuICogRmlsZSBmaWx0ZXJcclxuICovXHJcbmV4cG9ydCBjbGFzcyBGaWx0ZXIge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgLy8gRGVmYXVsdCBvcHRpb25zXHJcbiAgICAgICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHtcclxuICAgICAgICAgICAgY29udGVudFR5cGVzOiBudWxsLFxyXG4gICAgICAgICAgICBleHRlbnNpb25zOiBudWxsLFxyXG4gICAgICAgICAgICBtaW5TaXplOiAxLFxyXG4gICAgICAgICAgICBtYXhTaXplOiAwLFxyXG4gICAgICAgICAgICBvbkNoZWNrOiB0aGlzLm9uQ2hlY2tcclxuICAgICAgICB9LCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgb3B0aW9uc1xyXG4gICAgICAgIGlmIChvcHRpb25zLmNvbnRlbnRUeXBlcyAmJiAhKG9wdGlvbnMuY29udGVudFR5cGVzIGluc3RhbmNlb2YgQXJyYXkpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJGaWx0ZXI6IGNvbnRlbnRUeXBlcyBpcyBub3QgYW4gQXJyYXlcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvcHRpb25zLmV4dGVuc2lvbnMgJiYgIShvcHRpb25zLmV4dGVuc2lvbnMgaW5zdGFuY2VvZiBBcnJheSkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkZpbHRlcjogZXh0ZW5zaW9ucyBpcyBub3QgYW4gQXJyYXlcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5taW5TaXplICE9PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJGaWx0ZXI6IG1pblNpemUgaXMgbm90IGEgbnVtYmVyXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMubWF4U2l6ZSAhPT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmlsdGVyOiBtYXhTaXplIGlzIG5vdCBhIG51bWJlclwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9wdGlvbnMub25DaGVjayAmJiB0eXBlb2Ygb3B0aW9ucy5vbkNoZWNrICE9PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkZpbHRlcjogb25DaGVjayBpcyBub3QgYSBmdW5jdGlvblwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFB1YmxpYyBhdHRyaWJ1dGVzXHJcbiAgICAgICAgc2VsZi5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICBfLmVhY2goW1xyXG4gICAgICAgICAgICAnb25DaGVjaydcclxuICAgICAgICBdLCAobWV0aG9kKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9uc1ttZXRob2RdID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmW21ldGhvZF0gPSBvcHRpb25zW21ldGhvZF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyB0aGUgZmlsZVxyXG4gICAgICogQHBhcmFtIGZpbGVcclxuICAgICAqL1xyXG4gICAgY2hlY2soZmlsZSkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgZmlsZSAhPT0gXCJvYmplY3RcIiB8fCAhZmlsZSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdpbnZhbGlkLWZpbGUnLCBcIkZpbGUgaXMgbm90IHZhbGlkXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBDaGVjayBzaXplXHJcbiAgICAgICAgaWYgKGZpbGUuc2l6ZSA8PSAwIHx8IGZpbGUuc2l6ZSA8IHRoaXMuZ2V0TWluU2l6ZSgpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ZpbGUtdG9vLXNtYWxsJywgYEZpbGUgc2l6ZSBpcyB0b28gc21hbGwgKG1pbiA9ICR7dGhpcy5nZXRNaW5TaXplKCl9KWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5nZXRNYXhTaXplKCkgPiAwICYmIGZpbGUuc2l6ZSA+IHRoaXMuZ2V0TWF4U2l6ZSgpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ZpbGUtdG9vLWxhcmdlJywgYEZpbGUgc2l6ZSBpcyB0b28gbGFyZ2UgKG1heCA9ICR7dGhpcy5nZXRNYXhTaXplKCl9KWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBDaGVjayBleHRlbnNpb25cclxuICAgICAgICBpZiAodGhpcy5nZXRFeHRlbnNpb25zKCkgJiYgIV8uY29udGFpbnModGhpcy5nZXRFeHRlbnNpb25zKCksIGZpbGUuZXh0ZW5zaW9uKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdpbnZhbGlkLWZpbGUtZXh0ZW5zaW9uJywgYEZpbGUgZXh0ZW5zaW9uIFwiJHtmaWxlLmV4dGVuc2lvbn1cIiBpcyBub3QgYWNjZXB0ZWRgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQ2hlY2sgY29udGVudCB0eXBlXHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0Q29udGVudFR5cGVzKCkgJiYgIXRoaXMuaXNDb250ZW50VHlwZUluTGlzdChmaWxlLnR5cGUsIHRoaXMuZ2V0Q29udGVudFR5cGVzKCkpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ludmFsaWQtZmlsZS10eXBlJywgYEZpbGUgdHlwZSBcIiR7ZmlsZS50eXBlfVwiIGlzIG5vdCBhY2NlcHRlZGApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBBcHBseSBjdXN0b20gY2hlY2tcclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMub25DaGVjayA9PT0gJ2Z1bmN0aW9uJyAmJiAhdGhpcy5vbkNoZWNrKGZpbGUpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ludmFsaWQtZmlsZScsIFwiRmlsZSBkb2VzIG5vdCBtYXRjaCBmaWx0ZXJcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgYWxsb3dlZCBjb250ZW50IHR5cGVzXHJcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cclxuICAgICAqL1xyXG4gICAgZ2V0Q29udGVudFR5cGVzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuY29udGVudFR5cGVzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgYWxsb3dlZCBleHRlbnNpb25zXHJcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cclxuICAgICAqL1xyXG4gICAgZ2V0RXh0ZW5zaW9ucygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmV4dGVuc2lvbnM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBtYXhpbXVtIGZpbGUgc2l6ZVxyXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBnZXRNYXhTaXplKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMubWF4U2l6ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIG1pbmltdW0gZmlsZSBzaXplXHJcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldE1pblNpemUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5taW5TaXplO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIGlmIGNvbnRlbnQgdHlwZSBpcyBpbiB0aGUgZ2l2ZW4gbGlzdFxyXG4gICAgICogQHBhcmFtIHR5cGVcclxuICAgICAqIEBwYXJhbSBsaXN0XHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBpc0NvbnRlbnRUeXBlSW5MaXN0KHR5cGUsIGxpc3QpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnICYmIGxpc3QgaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgICBpZiAoXy5jb250YWlucyhsaXN0LCB0eXBlKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgd2lsZENhcmRHbG9iID0gJy8qJztcclxuICAgICAgICAgICAgICAgIGxldCB3aWxkY2FyZHMgPSBfLmZpbHRlcihsaXN0LCAoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmluZGV4T2Yod2lsZENhcmRHbG9iKSA+IDA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoXy5jb250YWlucyh3aWxkY2FyZHMsIHR5cGUucmVwbGFjZSgvKFxcLy4qKSQvLCB3aWxkQ2FyZEdsb2IpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyBpZiB0aGUgZmlsZSBtYXRjaGVzIGZpbHRlclxyXG4gICAgICogQHBhcmFtIGZpbGVcclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGlzVmFsaWQoZmlsZSkge1xyXG4gICAgICAgIGxldCByZXN1bHQgPSB0cnVlO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2soZmlsZSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRXhlY3V0ZXMgY3VzdG9tIGNoZWNrc1xyXG4gICAgICogQHBhcmFtIGZpbGVcclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIG9uQ2hlY2soZmlsZSkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qXHJcbiAqIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgS2FybCBTVEVJTlxyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4gKlxyXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcclxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuICpcclxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcclxuICogU09GVFdBUkUuXHJcbiAqXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtffSBmcm9tICdtZXRlb3IvdW5kZXJzY29yZSc7XHJcbmltcG9ydCB7Y2hlY2t9IGZyb20gJ21ldGVvci9jaGVjayc7XHJcbmltcG9ydCB7TWV0ZW9yfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcclxuaW1wb3J0IHtVcGxvYWRGU30gZnJvbSAnLi91ZnMnO1xyXG5pbXBvcnQge0ZpbHRlcn0gZnJvbSAnLi91ZnMtZmlsdGVyJztcclxuaW1wb3J0IHtUb2tlbnN9IGZyb20gJy4vdWZzLXRva2Vucyc7XHJcblxyXG5jb25zdCBmcyA9IE5wbS5yZXF1aXJlKCdmcycpO1xyXG5jb25zdCBodHRwID0gTnBtLnJlcXVpcmUoJ2h0dHAnKTtcclxuY29uc3QgaHR0cHMgPSBOcG0ucmVxdWlyZSgnaHR0cHMnKTtcclxuY29uc3QgRnV0dXJlID0gTnBtLnJlcXVpcmUoJ2ZpYmVycy9mdXR1cmUnKTtcclxuXHJcblxyXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XHJcbiAgICBNZXRlb3IubWV0aG9kcyh7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvbXBsZXRlcyB0aGUgZmlsZSB0cmFuc2ZlclxyXG4gICAgICAgICAqIEBwYXJhbSBmaWxlSWRcclxuICAgICAgICAgKiBAcGFyYW0gc3RvcmVOYW1lXHJcbiAgICAgICAgICogQHBhcmFtIHRva2VuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdWZzQ29tcGxldGUoZmlsZUlkLCBzdG9yZU5hbWUsIHRva2VuKSB7XHJcbiAgICAgICAgICAgIGNoZWNrKGZpbGVJZCwgU3RyaW5nKTtcclxuICAgICAgICAgICAgY2hlY2soc3RvcmVOYW1lLCBTdHJpbmcpO1xyXG4gICAgICAgICAgICBjaGVjayh0b2tlbiwgU3RyaW5nKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEdldCBzdG9yZVxyXG4gICAgICAgICAgICBsZXQgc3RvcmUgPSBVcGxvYWRGUy5nZXRTdG9yZShzdG9yZU5hbWUpO1xyXG4gICAgICAgICAgICBpZiAoIXN0b3JlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdpbnZhbGlkLXN0b3JlJywgXCJTdG9yZSBub3QgZm91bmRcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gQ2hlY2sgdG9rZW5cclxuICAgICAgICAgICAgaWYgKCFzdG9yZS5jaGVja1Rva2VuKHRva2VuLCBmaWxlSWQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdpbnZhbGlkLXRva2VuJywgXCJUb2tlbiBpcyBub3QgdmFsaWRcIik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBmdXQgPSBuZXcgRnV0dXJlKCk7XHJcbiAgICAgICAgICAgIGxldCB0bXBGaWxlID0gVXBsb2FkRlMuZ2V0VGVtcEZpbGVQYXRoKGZpbGVJZCk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCByZW1vdmVUZW1wRmlsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGZzLnVubGluayh0bXBGaWxlLCBmdW5jdGlvbiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXJyICYmIGNvbnNvbGUuZXJyb3IoYHVmczogY2Fubm90IGRlbGV0ZSB0ZW1wIGZpbGUgXCIke3RtcEZpbGV9XCIgKCR7ZXJyLm1lc3NhZ2V9KWApO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgLy8gdG9kbyBjaGVjayBpZiB0ZW1wIGZpbGUgZXhpc3RzXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gR2V0IGZpbGVcclxuICAgICAgICAgICAgICAgIGxldCBmaWxlID0gc3RvcmUuZ2V0Q29sbGVjdGlvbigpLmZpbmRPbmUoe19pZDogZmlsZUlkfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVmFsaWRhdGUgZmlsZSBiZWZvcmUgbW92aW5nIHRvIHRoZSBzdG9yZVxyXG4gICAgICAgICAgICAgICAgc3RvcmUudmFsaWRhdGUoZmlsZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gR2V0IHRoZSB0ZW1wIGZpbGVcclxuICAgICAgICAgICAgICAgIGxldCBycyA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0odG1wRmlsZSwge1xyXG4gICAgICAgICAgICAgICAgICAgIGZsYWdzOiAncicsXHJcbiAgICAgICAgICAgICAgICAgICAgZW5jb2Rpbmc6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgYXV0b0Nsb3NlOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDbGVhbiB1cGxvYWQgaWYgZXJyb3Igb2NjdXJzXHJcbiAgICAgICAgICAgICAgICBycy5vbignZXJyb3InLCBNZXRlb3IuYmluZEVudmlyb25tZW50KGZ1bmN0aW9uIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RvcmUuZ2V0Q29sbGVjdGlvbigpLnJlbW92ZSh7X2lkOiBmaWxlSWR9KTtcclxuICAgICAgICAgICAgICAgICAgICBmdXQudGhyb3coZXJyKTtcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTYXZlIGZpbGUgaW4gdGhlIHN0b3JlXHJcbiAgICAgICAgICAgICAgICBzdG9yZS53cml0ZShycywgZmlsZUlkLCBNZXRlb3IuYmluZEVudmlyb25tZW50KGZ1bmN0aW9uIChlcnIsIGZpbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZW1vdmVUZW1wRmlsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1dC50aHJvdyhlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpbGUgaGFzIGJlZW4gZnVsbHkgdXBsb2FkZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc28gd2UgZG9uJ3QgbmVlZCB0byBrZWVwIHRoZSB0b2tlbiBhbnltb3JlLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBbHNvIHRoaXMgZW5zdXJlIHRoYXQgdGhlIGZpbGUgY2Fubm90IGJlIG1vZGlmaWVkIHdpdGggZXh0cmEgY2h1bmtzIGxhdGVyLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBUb2tlbnMucmVtb3ZlKHtmaWxlSWQ6IGZpbGVJZH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmdXQucmV0dXJuKGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB3cml0ZSBmYWlsZWQsIHJlbW92ZSB0aGUgZmlsZVxyXG4gICAgICAgICAgICAgICAgc3RvcmUuZ2V0Q29sbGVjdGlvbigpLnJlbW92ZSh7X2lkOiBmaWxlSWR9KTtcclxuICAgICAgICAgICAgICAgIC8vIHJlbW92ZVRlbXBGaWxlKCk7IC8vIHRvZG8gcmVtb3ZlIHRlbXAgZmlsZSBvbiBlcnJvciBvciB0cnkgYWdhaW4gP1xyXG4gICAgICAgICAgICAgICAgZnV0LnRocm93KGVycik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZ1dC53YWl0KCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ3JlYXRlcyB0aGUgZmlsZSBhbmQgcmV0dXJucyB0aGUgZmlsZSB1cGxvYWQgdG9rZW5cclxuICAgICAgICAgKiBAcGFyYW0gZmlsZVxyXG4gICAgICAgICAqIEByZXR1cm4ge3tmaWxlSWQ6IHN0cmluZywgdG9rZW46ICosIHVybDogKn19XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdWZzQ3JlYXRlKGZpbGUpIHtcclxuICAgICAgICAgICAgY2hlY2soZmlsZSwgT2JqZWN0KTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZmlsZS5uYW1lICE9PSAnc3RyaW5nJyB8fCAhZmlsZS5uYW1lLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignaW52YWxpZC1maWxlLW5hbWUnLCBcImZpbGUgbmFtZSBpcyBub3QgdmFsaWRcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBmaWxlLnN0b3JlICE9PSAnc3RyaW5nJyB8fCAhZmlsZS5zdG9yZS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ludmFsaWQtc3RvcmUnLCBcInN0b3JlIGlzIG5vdCB2YWxpZFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBHZXQgc3RvcmVcclxuICAgICAgICAgICAgbGV0IHN0b3JlID0gVXBsb2FkRlMuZ2V0U3RvcmUoZmlsZS5zdG9yZSk7XHJcbiAgICAgICAgICAgIGlmICghc3RvcmUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ludmFsaWQtc3RvcmUnLCBcIlN0b3JlIG5vdCBmb3VuZFwiKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gU2V0IGRlZmF1bHQgaW5mb1xyXG4gICAgICAgICAgICBmaWxlLmNvbXBsZXRlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGZpbGUudXBsb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGZpbGUuZXh0ZW5zaW9uID0gZmlsZS5uYW1lICYmIGZpbGUubmFtZS5zdWJzdHIoKH4tZmlsZS5uYW1lLmxhc3RJbmRleE9mKCcuJykgPj4+IDApICsgMikudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgLy8gQXNzaWduIGZpbGUgTUlNRSB0eXBlIGJhc2VkIG9uIHRoZSBleHRlbnNpb25cclxuICAgICAgICAgICAgaWYgKGZpbGUuZXh0ZW5zaW9uICYmICFmaWxlLnR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGZpbGUudHlwZSA9IFVwbG9hZEZTLmdldE1pbWVUeXBlKGZpbGUuZXh0ZW5zaW9uKSB8fCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmaWxlLnByb2dyZXNzID0gMDtcclxuICAgICAgICAgICAgZmlsZS5zaXplID0gcGFyc2VJbnQoZmlsZS5zaXplKSB8fCAwO1xyXG4gICAgICAgICAgICBmaWxlLnVzZXJJZCA9IGZpbGUudXNlcklkIHx8IHRoaXMudXNlcklkO1xyXG5cclxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIGZpbGUgbWF0Y2hlcyBzdG9yZSBmaWx0ZXJcclxuICAgICAgICAgICAgbGV0IGZpbHRlciA9IHN0b3JlLmdldEZpbHRlcigpO1xyXG4gICAgICAgICAgICBpZiAoZmlsdGVyIGluc3RhbmNlb2YgRmlsdGVyKSB7XHJcbiAgICAgICAgICAgICAgICBmaWx0ZXIuY2hlY2soZmlsZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgZmlsZVxyXG4gICAgICAgICAgICBsZXQgZmlsZUlkID0gc3RvcmUuY3JlYXRlKGZpbGUpO1xyXG4gICAgICAgICAgICBsZXQgdG9rZW4gPSBzdG9yZS5jcmVhdGVUb2tlbihmaWxlSWQpO1xyXG4gICAgICAgICAgICBsZXQgdXBsb2FkVXJsID0gc3RvcmUuZ2V0VVJMKGAke2ZpbGVJZH0/dG9rZW49JHt0b2tlbn1gKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBmaWxlSWQ6IGZpbGVJZCxcclxuICAgICAgICAgICAgICAgIHRva2VuOiB0b2tlbixcclxuICAgICAgICAgICAgICAgIHVybDogdXBsb2FkVXJsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGVsZXRlcyBhIGZpbGVcclxuICAgICAgICAgKiBAcGFyYW0gZmlsZUlkXHJcbiAgICAgICAgICogQHBhcmFtIHN0b3JlTmFtZVxyXG4gICAgICAgICAqIEBwYXJhbSB0b2tlblxyXG4gICAgICAgICAqIEByZXR1cm5zIHsqfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHVmc0RlbGV0ZShmaWxlSWQsIHN0b3JlTmFtZSwgdG9rZW4pIHtcclxuICAgICAgICAgICAgY2hlY2soZmlsZUlkLCBTdHJpbmcpO1xyXG4gICAgICAgICAgICBjaGVjayhzdG9yZU5hbWUsIFN0cmluZyk7XHJcbiAgICAgICAgICAgIGNoZWNrKHRva2VuLCBTdHJpbmcpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ2hlY2sgc3RvcmVcclxuICAgICAgICAgICAgbGV0IHN0b3JlID0gVXBsb2FkRlMuZ2V0U3RvcmUoc3RvcmVOYW1lKTtcclxuICAgICAgICAgICAgaWYgKCFzdG9yZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignaW52YWxpZC1zdG9yZScsIFwiU3RvcmUgbm90IGZvdW5kXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIElnbm9yZSBmaWxlcyB0aGF0IGRvZXMgbm90IGV4aXN0XHJcbiAgICAgICAgICAgIGlmIChzdG9yZS5nZXRDb2xsZWN0aW9uKCkuZmluZCh7X2lkOiBmaWxlSWR9KS5jb3VudCgpID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBDaGVjayB0b2tlblxyXG4gICAgICAgICAgICBpZiAoIXN0b3JlLmNoZWNrVG9rZW4odG9rZW4sIGZpbGVJZCkpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ludmFsaWQtdG9rZW4nLCBcIlRva2VuIGlzIG5vdCB2YWxpZFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc3RvcmUuZ2V0Q29sbGVjdGlvbigpLnJlbW92ZSh7X2lkOiBmaWxlSWR9KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJbXBvcnRzIGEgZmlsZSBmcm9tIHRoZSBVUkxcclxuICAgICAgICAgKiBAcGFyYW0gdXJsXHJcbiAgICAgICAgICogQHBhcmFtIGZpbGVcclxuICAgICAgICAgKiBAcGFyYW0gc3RvcmVOYW1lXHJcbiAgICAgICAgICogQHJldHVybiB7Kn1cclxuICAgICAgICAgKi9cclxuICAgICAgICB1ZnNJbXBvcnRVUkwodXJsLCBmaWxlLCBzdG9yZU5hbWUpIHtcclxuICAgICAgICAgICAgY2hlY2sodXJsLCBTdHJpbmcpO1xyXG4gICAgICAgICAgICBjaGVjayhmaWxlLCBPYmplY3QpO1xyXG4gICAgICAgICAgICBjaGVjayhzdG9yZU5hbWUsIFN0cmluZyk7XHJcblxyXG4gICAgICAgICAgICAvLyBDaGVjayBVUkxcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnIHx8IHVybC5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignaW52YWxpZC11cmwnLCBcIlRoZSB1cmwgaXMgbm90IHZhbGlkXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIENoZWNrIGZpbGVcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBmaWxlICE9PSAnb2JqZWN0JyB8fCBmaWxlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdpbnZhbGlkLWZpbGUnLCBcIlRoZSBmaWxlIGlzIG5vdCB2YWxpZFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBDaGVjayBzdG9yZVxyXG4gICAgICAgICAgICBjb25zdCBzdG9yZSA9IFVwbG9hZEZTLmdldFN0b3JlKHN0b3JlTmFtZSk7XHJcbiAgICAgICAgICAgIGlmICghc3RvcmUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ludmFsaWQtc3RvcmUnLCAnVGhlIHN0b3JlIGRvZXMgbm90IGV4aXN0Jyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEV4dHJhY3QgZmlsZSBpbmZvXHJcbiAgICAgICAgICAgIGlmICghZmlsZS5uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBmaWxlLm5hbWUgPSB1cmwucmVwbGFjZSgvXFw/LiokLywgJycpLnNwbGl0KCcvJykucG9wKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGZpbGUubmFtZSAmJiAhZmlsZS5leHRlbnNpb24pIHtcclxuICAgICAgICAgICAgICAgIGZpbGUuZXh0ZW5zaW9uID0gZmlsZS5uYW1lICYmIGZpbGUubmFtZS5zdWJzdHIoKH4tZmlsZS5uYW1lLmxhc3RJbmRleE9mKCcuJykgPj4+IDApICsgMikudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZmlsZS5leHRlbnNpb24gJiYgIWZpbGUudHlwZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gQXNzaWduIGZpbGUgTUlNRSB0eXBlIGJhc2VkIG9uIHRoZSBleHRlbnNpb25cclxuICAgICAgICAgICAgICAgIGZpbGUudHlwZSA9IFVwbG9hZEZTLmdldE1pbWVUeXBlKGZpbGUuZXh0ZW5zaW9uKSB8fCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBDaGVjayBpZiBmaWxlIGlzIHZhbGlkXHJcbiAgICAgICAgICAgIGlmIChzdG9yZS5nZXRGaWx0ZXIoKSBpbnN0YW5jZW9mIEZpbHRlcikge1xyXG4gICAgICAgICAgICAgICAgc3RvcmUuZ2V0RmlsdGVyKCkuY2hlY2soZmlsZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChmaWxlLm9yaWdpbmFsVXJsKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYHVmczogVGhlIFwib3JpZ2luYWxVcmxcIiBhdHRyaWJ1dGUgaXMgYXV0b21hdGljYWxseSBzZXQgd2hlbiBpbXBvcnRpbmcgYSBmaWxlIGZyb20gYSBVUkxgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQWRkIG9yaWdpbmFsIFVSTFxyXG4gICAgICAgICAgICBmaWxlLm9yaWdpbmFsVXJsID0gdXJsO1xyXG5cclxuICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBmaWxlXHJcbiAgICAgICAgICAgIGZpbGUuY29tcGxldGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgZmlsZS51cGxvYWRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICBmaWxlLnByb2dyZXNzID0gMDtcclxuICAgICAgICAgICAgZmlsZS5faWQgPSBzdG9yZS5jcmVhdGUoZmlsZSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgZnV0ID0gbmV3IEZ1dHVyZSgpO1xyXG4gICAgICAgICAgICBsZXQgcHJvdG87XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlY3QgcHJvdG9jb2wgdG8gdXNlXHJcbiAgICAgICAgICAgIGlmICgvaHR0cDpcXC9cXC8vaS50ZXN0KHVybCkpIHtcclxuICAgICAgICAgICAgICAgIHByb3RvID0gaHR0cDtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICgvaHR0cHM6XFwvXFwvL2kudGVzdCh1cmwpKSB7XHJcbiAgICAgICAgICAgICAgICBwcm90byA9IGh0dHBzO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnVuYmxvY2soKTtcclxuXHJcbiAgICAgICAgICAgIC8vIERvd25sb2FkIGZpbGVcclxuICAgICAgICAgICAgcHJvdG8uZ2V0KHVybCwgTWV0ZW9yLmJpbmRFbnZpcm9ubWVudChmdW5jdGlvbiAocmVzKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBTYXZlIHRoZSBmaWxlIGluIHRoZSBzdG9yZVxyXG4gICAgICAgICAgICAgICAgc3RvcmUud3JpdGUocmVzLCBmaWxlLl9pZCwgZnVuY3Rpb24gKGVyciwgZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnV0LnRocm93KGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnV0LnJldHVybihmaWxlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSkpLm9uKCdlcnJvcicsIGZ1bmN0aW9uIChlcnIpIHtcclxuICAgICAgICAgICAgICAgIGZ1dC50aHJvdyhlcnIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1dC53YWl0KCk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogTWFya3MgdGhlIGZpbGUgdXBsb2FkaW5nIGFzIHN0b3BwZWRcclxuICAgICAgICAgKiBAcGFyYW0gZmlsZUlkXHJcbiAgICAgICAgICogQHBhcmFtIHN0b3JlTmFtZVxyXG4gICAgICAgICAqIEBwYXJhbSB0b2tlblxyXG4gICAgICAgICAqIEByZXR1cm5zIHsqfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHVmc1N0b3AoZmlsZUlkLCBzdG9yZU5hbWUsIHRva2VuKSB7XHJcbiAgICAgICAgICAgIGNoZWNrKGZpbGVJZCwgU3RyaW5nKTtcclxuICAgICAgICAgICAgY2hlY2soc3RvcmVOYW1lLCBTdHJpbmcpO1xyXG4gICAgICAgICAgICBjaGVjayh0b2tlbiwgU3RyaW5nKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENoZWNrIHN0b3JlXHJcbiAgICAgICAgICAgIGNvbnN0IHN0b3JlID0gVXBsb2FkRlMuZ2V0U3RvcmUoc3RvcmVOYW1lKTtcclxuICAgICAgICAgICAgaWYgKCFzdG9yZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignaW52YWxpZC1zdG9yZScsIFwiU3RvcmUgbm90IGZvdW5kXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIENoZWNrIGZpbGVcclxuICAgICAgICAgICAgY29uc3QgZmlsZSA9IHN0b3JlLmdldENvbGxlY3Rpb24oKS5maW5kKHtfaWQ6IGZpbGVJZH0sIHtmaWVsZHM6IHt1c2VySWQ6IDF9fSk7XHJcbiAgICAgICAgICAgIGlmICghZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignaW52YWxpZC1maWxlJywgXCJGaWxlIG5vdCBmb3VuZFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBDaGVjayB0b2tlblxyXG4gICAgICAgICAgICBpZiAoIXN0b3JlLmNoZWNrVG9rZW4odG9rZW4sIGZpbGVJZCkpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ludmFsaWQtdG9rZW4nLCBcIlRva2VuIGlzIG5vdCB2YWxpZFwiKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0b3JlLmdldENvbGxlY3Rpb24oKS51cGRhdGUoe19pZDogZmlsZUlkfSwge1xyXG4gICAgICAgICAgICAgICAgJHNldDoge3VwbG9hZGluZzogZmFsc2V9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59XHJcbiIsIi8qXHJcbiAqIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgS2FybCBTVEVJTlxyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4gKlxyXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcclxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuICpcclxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcclxuICogU09GVFdBUkUuXHJcbiAqXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIE1JTUUgdHlwZXMgYW5kIGV4dGVuc2lvbnNcclxuICovXHJcbmV4cG9ydCBjb25zdCBNSU1FID0ge1xyXG5cclxuICAgIC8vIGFwcGxpY2F0aW9uXHJcbiAgICAnN3onOiAnYXBwbGljYXRpb24veC03ei1jb21wcmVzc2VkJyxcclxuICAgICdhcmMnOiAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJyxcclxuICAgICdhaSc6ICdhcHBsaWNhdGlvbi9wb3N0c2NyaXB0JyxcclxuICAgICdiaW4nOiAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJyxcclxuICAgICdieic6ICdhcHBsaWNhdGlvbi94LWJ6aXAnLFxyXG4gICAgJ2J6Mic6ICdhcHBsaWNhdGlvbi94LWJ6aXAyJyxcclxuICAgICdlcHMnOiAnYXBwbGljYXRpb24vcG9zdHNjcmlwdCcsXHJcbiAgICAnZXhlJzogJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbScsXHJcbiAgICAnZ3onOiAnYXBwbGljYXRpb24veC1nemlwJyxcclxuICAgICdnemlwJzogJ2FwcGxpY2F0aW9uL3gtZ3ppcCcsXHJcbiAgICAnanMnOiAnYXBwbGljYXRpb24vamF2YXNjcmlwdCcsXHJcbiAgICAnanNvbic6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICdvZ3gnOiAnYXBwbGljYXRpb24vb2dnJyxcclxuICAgICdwZGYnOiAnYXBwbGljYXRpb24vcGRmJyxcclxuICAgICdwcyc6ICdhcHBsaWNhdGlvbi9wb3N0c2NyaXB0JyxcclxuICAgICdwc2QnOiAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJyxcclxuICAgICdyYXInOiAnYXBwbGljYXRpb24veC1yYXItY29tcHJlc3NlZCcsXHJcbiAgICAncmV2JzogJ2FwcGxpY2F0aW9uL3gtcmFyLWNvbXByZXNzZWQnLFxyXG4gICAgJ3N3Zic6ICdhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaCcsXHJcbiAgICAndGFyJzogJ2FwcGxpY2F0aW9uL3gtdGFyJyxcclxuICAgICd4aHRtbCc6ICdhcHBsaWNhdGlvbi94aHRtbCt4bWwnLFxyXG4gICAgJ3htbCc6ICdhcHBsaWNhdGlvbi94bWwnLFxyXG4gICAgJ3ppcCc6ICdhcHBsaWNhdGlvbi96aXAnLFxyXG5cclxuICAgIC8vIGF1ZGlvXHJcbiAgICAnYWlmJzogJ2F1ZGlvL2FpZmYnLFxyXG4gICAgJ2FpZmMnOiAnYXVkaW8vYWlmZicsXHJcbiAgICAnYWlmZic6ICdhdWRpby9haWZmJyxcclxuICAgICdhdSc6ICdhdWRpby9iYXNpYycsXHJcbiAgICAnZmxhYyc6ICdhdWRpby9mbGFjJyxcclxuICAgICdtaWRpJzogJ2F1ZGlvL21pZGknLFxyXG4gICAgJ21wMic6ICdhdWRpby9tcGVnJyxcclxuICAgICdtcDMnOiAnYXVkaW8vbXBlZycsXHJcbiAgICAnbXBhJzogJ2F1ZGlvL21wZWcnLFxyXG4gICAgJ29nYSc6ICdhdWRpby9vZ2cnLFxyXG4gICAgJ29nZyc6ICdhdWRpby9vZ2cnLFxyXG4gICAgJ29wdXMnOiAnYXVkaW8vb2dnJyxcclxuICAgICdyYSc6ICdhdWRpby92bmQucm4tcmVhbGF1ZGlvJyxcclxuICAgICdzcHgnOiAnYXVkaW8vb2dnJyxcclxuICAgICd3YXYnOiAnYXVkaW8veC13YXYnLFxyXG4gICAgJ3dlYmEnOiAnYXVkaW8vd2VibScsXHJcbiAgICAnd21hJzogJ2F1ZGlvL3gtbXMtd21hJyxcclxuXHJcbiAgICAvLyBpbWFnZVxyXG4gICAgJ2F2cyc6ICdpbWFnZS9hdnMtdmlkZW8nLFxyXG4gICAgJ2JtcCc6ICdpbWFnZS94LXdpbmRvd3MtYm1wJyxcclxuICAgICdnaWYnOiAnaW1hZ2UvZ2lmJyxcclxuICAgICdpY28nOiAnaW1hZ2Uvdm5kLm1pY3Jvc29mdC5pY29uJyxcclxuICAgICdqcGVnJzogJ2ltYWdlL2pwZWcnLFxyXG4gICAgJ2pwZyc6ICdpbWFnZS9qcGcnLFxyXG4gICAgJ21qcGcnOiAnaW1hZ2UveC1tb3Rpb24tanBlZycsXHJcbiAgICAncGljJzogJ2ltYWdlL3BpYycsXHJcbiAgICAncG5nJzogJ2ltYWdlL3BuZycsXHJcbiAgICAnc3ZnJzogJ2ltYWdlL3N2Zyt4bWwnLFxyXG4gICAgJ3RpZic6ICdpbWFnZS90aWZmJyxcclxuICAgICd0aWZmJzogJ2ltYWdlL3RpZmYnLFxyXG5cclxuICAgIC8vIHRleHRcclxuICAgICdjc3MnOiAndGV4dC9jc3MnLFxyXG4gICAgJ2Nzdic6ICd0ZXh0L2NzdicsXHJcbiAgICAnaHRtbCc6ICd0ZXh0L2h0bWwnLFxyXG4gICAgJ3R4dCc6ICd0ZXh0L3BsYWluJyxcclxuXHJcbiAgICAvLyB2aWRlb1xyXG4gICAgJ2F2aSc6ICd2aWRlby9hdmknLFxyXG4gICAgJ2R2JzogJ3ZpZGVvL3gtZHYnLFxyXG4gICAgJ2Zsdic6ICd2aWRlby94LWZsdicsXHJcbiAgICAnbW92JzogJ3ZpZGVvL3F1aWNrdGltZScsXHJcbiAgICAnbXA0JzogJ3ZpZGVvL21wNCcsXHJcbiAgICAnbXBlZyc6ICd2aWRlby9tcGVnJyxcclxuICAgICdtcGcnOiAndmlkZW8vbXBnJyxcclxuICAgICdvZ3YnOiAndmlkZW8vb2dnJyxcclxuICAgICd2ZG8nOiAndmlkZW8vdmRvJyxcclxuICAgICd3ZWJtJzogJ3ZpZGVvL3dlYm0nLFxyXG4gICAgJ3dtdic6ICd2aWRlby94LW1zLXdtdicsXHJcblxyXG4gICAgLy8gc3BlY2lmaWMgdG8gdmVuZG9yc1xyXG4gICAgJ2RvYyc6ICdhcHBsaWNhdGlvbi9tc3dvcmQnLFxyXG4gICAgJ2RvY3gnOiAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LndvcmRwcm9jZXNzaW5nbWwuZG9jdW1lbnQnLFxyXG4gICAgJ29kYic6ICdhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmRhdGFiYXNlJyxcclxuICAgICdvZGMnOiAnYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5jaGFydCcsXHJcbiAgICAnb2RmJzogJ2FwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuZm9ybXVsYScsXHJcbiAgICAnb2RnJzogJ2FwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuZ3JhcGhpY3MnLFxyXG4gICAgJ29kaSc6ICdhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmltYWdlJyxcclxuICAgICdvZG0nOiAnYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC50ZXh0LW1hc3RlcicsXHJcbiAgICAnb2RwJzogJ2FwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQucHJlc2VudGF0aW9uJyxcclxuICAgICdvZHMnOiAnYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5zcHJlYWRzaGVldCcsXHJcbiAgICAnb2R0JzogJ2FwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQudGV4dCcsXHJcbiAgICAnb3RnJzogJ2FwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuZ3JhcGhpY3MtdGVtcGxhdGUnLFxyXG4gICAgJ290cCc6ICdhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnByZXNlbnRhdGlvbi10ZW1wbGF0ZScsXHJcbiAgICAnb3RzJzogJ2FwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuc3ByZWFkc2hlZXQtdGVtcGxhdGUnLFxyXG4gICAgJ290dCc6ICdhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnRleHQtdGVtcGxhdGUnLFxyXG4gICAgJ3BwdCc6ICdhcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludCcsXHJcbiAgICAncHB0eCc6ICdhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQucHJlc2VudGF0aW9ubWwucHJlc2VudGF0aW9uJyxcclxuICAgICd4bHMnOiAnYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsJyxcclxuICAgICd4bHN4JzogJ2FwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5zcHJlYWRzaGVldG1sLnNoZWV0J1xyXG59O1xyXG4iLCIvKlxyXG4gKiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDE3IEthcmwgU1RFSU5cclxuICpcclxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuICpcclxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXHJcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXHJcbiAqIFNPRlRXQVJFLlxyXG4gKlxyXG4gKi9cclxuaW1wb3J0IHtffSBmcm9tIFwibWV0ZW9yL3VuZGVyc2NvcmVcIjtcclxuaW1wb3J0IHtNZXRlb3J9IGZyb20gXCJtZXRlb3IvbWV0ZW9yXCI7XHJcbmltcG9ydCB7V2ViQXBwfSBmcm9tIFwibWV0ZW9yL3dlYmFwcFwiO1xyXG5pbXBvcnQge1VwbG9hZEZTfSBmcm9tIFwiLi91ZnNcIjtcclxuXHJcblxyXG5pZiAoTWV0ZW9yLmlzU2VydmVyKSB7XHJcblxyXG4gICAgY29uc3QgZG9tYWluID0gTnBtLnJlcXVpcmUoJ2RvbWFpbicpO1xyXG4gICAgY29uc3QgZnMgPSBOcG0ucmVxdWlyZSgnZnMnKTtcclxuICAgIGNvbnN0IGh0dHAgPSBOcG0ucmVxdWlyZSgnaHR0cCcpO1xyXG4gICAgY29uc3QgaHR0cHMgPSBOcG0ucmVxdWlyZSgnaHR0cHMnKTtcclxuICAgIGNvbnN0IG1rZGlycCA9IE5wbS5yZXF1aXJlKCdta2RpcnAnKTtcclxuICAgIGNvbnN0IHN0cmVhbSA9IE5wbS5yZXF1aXJlKCdzdHJlYW0nKTtcclxuICAgIGNvbnN0IFVSTCA9IE5wbS5yZXF1aXJlKCd1cmwnKTtcclxuICAgIGNvbnN0IHpsaWIgPSBOcG0ucmVxdWlyZSgnemxpYicpO1xyXG5cclxuXHJcbiAgICBNZXRlb3Iuc3RhcnR1cCgoKSA9PiB7XHJcbiAgICAgICAgbGV0IHBhdGggPSBVcGxvYWRGUy5jb25maWcudG1wRGlyO1xyXG4gICAgICAgIGxldCBtb2RlID0gVXBsb2FkRlMuY29uZmlnLnRtcERpclBlcm1pc3Npb25zO1xyXG5cclxuICAgICAgICBmcy5zdGF0KHBhdGgsIChlcnIpID0+IHtcclxuICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSB0ZW1wIGRpcmVjdG9yeVxyXG4gICAgICAgICAgICAgICAgbWtkaXJwKHBhdGgsIHttb2RlOiBtb2RlfSwgKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdWZzOiBjYW5ub3QgY3JlYXRlIHRlbXAgZGlyZWN0b3J5IGF0IFwiJHtwYXRofVwiICgke2Vyci5tZXNzYWdlfSlgKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgdWZzOiB0ZW1wIGRpcmVjdG9yeSBjcmVhdGVkIGF0IFwiJHtwYXRofVwiYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBTZXQgZGlyZWN0b3J5IHBlcm1pc3Npb25zXHJcbiAgICAgICAgICAgICAgICBmcy5jaG1vZChwYXRoLCBtb2RlLCAoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXJyICYmIGNvbnNvbGUuZXJyb3IoYHVmczogY2Fubm90IHNldCB0ZW1wIGRpcmVjdG9yeSBwZXJtaXNzaW9ucyAke21vZGV9ICgke2Vyci5tZXNzYWdlfSlgKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBDcmVhdGUgZG9tYWluIHRvIGhhbmRsZSBlcnJvcnNcclxuICAgIC8vIGFuZCBwb3NzaWJseSBhdm9pZCBzZXJ2ZXIgY3Jhc2hlcy5cclxuICAgIGxldCBkID0gZG9tYWluLmNyZWF0ZSgpO1xyXG5cclxuICAgIGQub24oJ2Vycm9yJywgKGVycikgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ3VmczogJyArIGVyci5tZXNzYWdlKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIExpc3RlbiBIVFRQIHJlcXVlc3RzIHRvIHNlcnZlIGZpbGVzXHJcbiAgICBXZWJBcHAuY29ubmVjdEhhbmRsZXJzLnVzZSgocmVxLCByZXMsIG5leHQpID0+IHtcclxuICAgICAgICAvLyBRdWljayBjaGVjayB0byBzZWUgaWYgcmVxdWVzdCBzaG91bGQgYmUgY2F0Y2hcclxuICAgICAgICBpZiAocmVxLnVybC5pbmRleE9mKFVwbG9hZEZTLmNvbmZpZy5zdG9yZXNQYXRoKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgbmV4dCgpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgc3RvcmUgcGF0aFxyXG4gICAgICAgIGxldCBwYXJzZWRVcmwgPSBVUkwucGFyc2UocmVxLnVybCk7XHJcbiAgICAgICAgbGV0IHBhdGggPSBwYXJzZWRVcmwucGF0aG5hbWUuc3Vic3RyKFVwbG9hZEZTLmNvbmZpZy5zdG9yZXNQYXRoLmxlbmd0aCArIDEpO1xyXG5cclxuICAgICAgICBsZXQgYWxsb3dDT1JTID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAvLyByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCByZXEuaGVhZGVycy5vcmlnaW4pO1xyXG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kc1wiLCBcIlBPU1RcIik7XHJcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xyXG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVyc1wiLCBcIkNvbnRlbnQtVHlwZVwiKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAocmVxLm1ldGhvZCA9PT0gXCJPUFRJT05TXCIpIHtcclxuICAgICAgICAgICAgbGV0IHJlZ0V4cCA9IG5ldyBSZWdFeHAoJ15cXC8oW15cXC9cXD9dKylcXC8oW15cXC9cXD9dKykkJyk7XHJcbiAgICAgICAgICAgIGxldCBtYXRjaCA9IHJlZ0V4cC5leGVjKHBhdGgpO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVxdWVzdCBpcyBub3QgdmFsaWRcclxuICAgICAgICAgICAgaWYgKG1hdGNoID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKDQwMCk7XHJcbiAgICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEdldCBzdG9yZVxyXG4gICAgICAgICAgICBsZXQgc3RvcmUgPSBVcGxvYWRGUy5nZXRTdG9yZShtYXRjaFsxXSk7XHJcbiAgICAgICAgICAgIGlmICghc3RvcmUpIHtcclxuICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNDA0KTtcclxuICAgICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gSWYgYSBzdG9yZSBpcyBmb3VuZCwgZ28gYWhlYWQgYW5kIGFsbG93IHRoZSBvcmlnaW5cclxuICAgICAgICAgICAgYWxsb3dDT1JTKCk7XHJcblxyXG4gICAgICAgICAgICBuZXh0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHJlcS5tZXRob2QgPT09ICdQT1NUJykge1xyXG4gICAgICAgICAgICAvLyBHZXQgc3RvcmVcclxuICAgICAgICAgICAgbGV0IHJlZ0V4cCA9IG5ldyBSZWdFeHAoJ15cXC8oW15cXC9cXD9dKylcXC8oW15cXC9cXD9dKykkJyk7XHJcbiAgICAgICAgICAgIGxldCBtYXRjaCA9IHJlZ0V4cC5leGVjKHBhdGgpO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVxdWVzdCBpcyBub3QgdmFsaWRcclxuICAgICAgICAgICAgaWYgKG1hdGNoID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKDQwMCk7XHJcbiAgICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEdldCBzdG9yZVxyXG4gICAgICAgICAgICBsZXQgc3RvcmUgPSBVcGxvYWRGUy5nZXRTdG9yZShtYXRjaFsxXSk7XHJcbiAgICAgICAgICAgIGlmICghc3RvcmUpIHtcclxuICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNDA0KTtcclxuICAgICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gSWYgYSBzdG9yZSBpcyBmb3VuZCwgZ28gYWhlYWQgYW5kIGFsbG93IHRoZSBvcmlnaW5cclxuICAgICAgICAgICAgYWxsb3dDT1JTKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBHZXQgZmlsZVxyXG4gICAgICAgICAgICBsZXQgZmlsZUlkID0gbWF0Y2hbMl07XHJcbiAgICAgICAgICAgIGlmIChzdG9yZS5nZXRDb2xsZWN0aW9uKCkuZmluZCh7X2lkOiBmaWxlSWR9KS5jb3VudCgpID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKDQwNCk7XHJcbiAgICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIENoZWNrIHVwbG9hZCB0b2tlblxyXG4gICAgICAgICAgICBpZiAoIXN0b3JlLmNoZWNrVG9rZW4ocmVxLnF1ZXJ5LnRva2VuLCBmaWxlSWQpKSB7XHJcbiAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKDQwMyk7XHJcbiAgICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB0bXBGaWxlID0gVXBsb2FkRlMuZ2V0VGVtcEZpbGVQYXRoKGZpbGVJZCk7XHJcbiAgICAgICAgICAgIGxldCB3cyA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKHRtcEZpbGUsIHtmbGFnczogJ2EnfSk7XHJcbiAgICAgICAgICAgIGxldCBmaWVsZHMgPSB7dXBsb2FkaW5nOiB0cnVlfTtcclxuICAgICAgICAgICAgbGV0IHByb2dyZXNzID0gcGFyc2VGbG9hdChyZXEucXVlcnkucHJvZ3Jlc3MpO1xyXG4gICAgICAgICAgICBpZiAoIWlzTmFOKHByb2dyZXNzKSAmJiBwcm9ncmVzcyA+IDApIHtcclxuICAgICAgICAgICAgICAgIGZpZWxkcy5wcm9ncmVzcyA9IE1hdGgubWluKHByb2dyZXNzLCAxKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmVxLm9uKCdkYXRhJywgKGNodW5rKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB3cy53cml0ZShjaHVuayk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXEub24oJ2Vycm9yJywgKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDApO1xyXG4gICAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmVxLm9uKCdlbmQnLCBNZXRlb3IuYmluZEVudmlyb25tZW50KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBjb21wbGV0ZWQgc3RhdGUgd2l0aG91dCB0cmlnZ2VyaW5nIGhvb2tzXHJcbiAgICAgICAgICAgICAgICBzdG9yZS5nZXRDb2xsZWN0aW9uKCkuZGlyZWN0LnVwZGF0ZSh7X2lkOiBmaWxlSWR9LCB7JHNldDogZmllbGRzfSk7XHJcbiAgICAgICAgICAgICAgICB3cy5lbmQoKTtcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICB3cy5vbignZXJyb3InLCAoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGB1ZnM6IGNhbm5vdCB3cml0ZSBjaHVuayBvZiBmaWxlIFwiJHtmaWxlSWR9XCIgKCR7ZXJyLm1lc3NhZ2V9KWApO1xyXG4gICAgICAgICAgICAgICAgZnMudW5saW5rKHRtcEZpbGUsIChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBlcnIgJiYgY29uc29sZS5lcnJvcihgdWZzOiBjYW5ub3QgZGVsZXRlIHRlbXAgZmlsZSBcIiR7dG1wRmlsZX1cIiAoJHtlcnIubWVzc2FnZX0pYCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTtcclxuICAgICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHdzLm9uKCdmaW5pc2gnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKDIwNCwge1wiQ29udGVudC1UeXBlXCI6ICd0ZXh0L3BsYWluJ30pO1xyXG4gICAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAocmVxLm1ldGhvZCA9PT0gJ0dFVCcpIHtcclxuICAgICAgICAgICAgLy8gR2V0IHN0b3JlLCBmaWxlIElkIGFuZCBmaWxlIG5hbWVcclxuICAgICAgICAgICAgbGV0IHJlZ0V4cCA9IG5ldyBSZWdFeHAoJ15cXC8oW15cXC9cXD9dKylcXC8oW15cXC9cXD9dKykoPzpcXC8oW15cXC9cXD9dKykpPyQnKTtcclxuICAgICAgICAgICAgbGV0IG1hdGNoID0gcmVnRXhwLmV4ZWMocGF0aCk7XHJcblxyXG4gICAgICAgICAgICAvLyBBdm9pZCA1MDQgR2F0ZXdheSB0aW1lb3V0IGVycm9yXHJcbiAgICAgICAgICAgIC8vIGlmIGZpbGUgaXMgbm90IGhhbmRsZWQgYnkgVXBsb2FkRlMuXHJcbiAgICAgICAgICAgIGlmIChtYXRjaCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgbmV4dCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBHZXQgc3RvcmVcclxuICAgICAgICAgICAgY29uc3Qgc3RvcmVOYW1lID0gbWF0Y2hbMV07XHJcbiAgICAgICAgICAgIGNvbnN0IHN0b3JlID0gVXBsb2FkRlMuZ2V0U3RvcmUoc3RvcmVOYW1lKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghc3RvcmUpIHtcclxuICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNDA0KTtcclxuICAgICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHN0b3JlLm9uUmVhZCAhPT0gbnVsbCAmJiBzdG9yZS5vblJlYWQgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygc3RvcmUub25SZWFkICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGB1ZnM6IFN0b3JlLm9uUmVhZCBpcyBub3QgYSBmdW5jdGlvbiBpbiBzdG9yZSBcIiR7c3RvcmVOYW1lfVwiYCk7XHJcbiAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKDUwMCk7XHJcbiAgICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSBmaWxlIGV4dGVuc2lvbiBmcm9tIGZpbGUgSWRcclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gbWF0Y2hbMl0uaW5kZXhPZignLicpO1xyXG4gICAgICAgICAgICBsZXQgZmlsZUlkID0gaW5kZXggIT09IC0xID8gbWF0Y2hbMl0uc3Vic3RyKDAsIGluZGV4KSA6IG1hdGNoWzJdO1xyXG5cclxuICAgICAgICAgICAgLy8gR2V0IGZpbGUgZnJvbSBkYXRhYmFzZVxyXG4gICAgICAgICAgICBjb25zdCBmaWxlID0gc3RvcmUuZ2V0Q29sbGVjdGlvbigpLmZpbmRPbmUoe19pZDogZmlsZUlkfSk7XHJcbiAgICAgICAgICAgIGlmICghZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg0MDQpO1xyXG4gICAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBTaW11bGF0ZSByZWFkIHNwZWVkXHJcbiAgICAgICAgICAgIGlmIChVcGxvYWRGUy5jb25maWcuc2ltdWxhdGVSZWFkRGVsYXkpIHtcclxuICAgICAgICAgICAgICAgIE1ldGVvci5fc2xlZXBGb3JNcyhVcGxvYWRGUy5jb25maWcuc2ltdWxhdGVSZWFkRGVsYXkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBkLnJ1bigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgZmlsZSBjYW4gYmUgYWNjZXNzZWRcclxuICAgICAgICAgICAgICAgIGlmIChzdG9yZS5vblJlYWQuY2FsbChzdG9yZSwgZmlsZUlkLCBmaWxlLCByZXEsIHJlcykgIT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG9wdGlvbnMgPSB7fTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc3RhdHVzID0gMjAwO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBQcmVwYXJlIHJlc3BvbnNlIGhlYWRlcnNcclxuICAgICAgICAgICAgICAgICAgICBsZXQgaGVhZGVycyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6IGZpbGUudHlwZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ0NvbnRlbnQtTGVuZ3RoJzogZmlsZS5zaXplXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQWRkIEVUYWcgaGVhZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBmaWxlLmV0YWcgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnNbJ0VUYWcnXSA9IGZpbGUuZXRhZztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEFkZCBMYXN0LU1vZGlmaWVkIGhlYWRlclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWxlLm1vZGlmaWVkQXQgaW5zdGFuY2VvZiBEYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnNbJ0xhc3QtTW9kaWZpZWQnXSA9IGZpbGUubW9kaWZpZWRBdC50b1VUQ1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChmaWxlLnVwbG9hZGVkQXQgaW5zdGFuY2VvZiBEYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnNbJ0xhc3QtTW9kaWZpZWQnXSA9IGZpbGUudXBsb2FkZWRBdC50b1VUQ1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUGFyc2UgcmVxdWVzdCBoZWFkZXJzXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZXEuaGVhZGVycyA9PT0gJ29iamVjdCcpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbXBhcmUgRVRhZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVxLmhlYWRlcnNbJ2lmLW5vbmUtbWF0Y2gnXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGUuZXRhZyA9PT0gcmVxLmhlYWRlcnNbJ2lmLW5vbmUtbWF0Y2gnXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoMzA0KTsgLy8gTm90IE1vZGlmaWVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29tcGFyZSBmaWxlIG1vZGlmaWNhdGlvbiBkYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXEuaGVhZGVyc1snaWYtbW9kaWZpZWQtc2luY2UnXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbW9kaWZpZWRTaW5jZSA9IG5ldyBEYXRlKHJlcS5oZWFkZXJzWydpZi1tb2RpZmllZC1zaW5jZSddKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoKGZpbGUubW9kaWZpZWRBdCBpbnN0YW5jZW9mIERhdGUgJiYgZmlsZS5tb2RpZmllZEF0ID4gbW9kaWZpZWRTaW5jZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCBmaWxlLnVwbG9hZGVkQXQgaW5zdGFuY2VvZiBEYXRlICYmIGZpbGUudXBsb2FkZWRBdCA+IG1vZGlmaWVkU2luY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKDMwNCk7IC8vIE5vdCBNb2RpZmllZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN1cHBvcnQgcmFuZ2UgcmVxdWVzdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlcS5oZWFkZXJzLnJhbmdlID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmFuZ2UgPSByZXEuaGVhZGVycy5yYW5nZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSYW5nZSBpcyBub3QgdmFsaWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmFuZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKDQxNik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0b3RhbCA9IGZpbGUuc2l6ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVuaXQgPSByYW5nZS5zdWJzdHIoMCwgcmFuZ2UuaW5kZXhPZihcIj1cIikpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1bml0ICE9PSBcImJ5dGVzXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKDQxNik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByYW5nZXMgPSByYW5nZS5zdWJzdHIodW5pdC5sZW5ndGgpLnJlcGxhY2UoL1teMC05XFwtLF0vLCAnJykuc3BsaXQoJywnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmFuZ2VzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3RvZG86IHN1cHBvcnQgbXVsdGlwYXJ0IHJhbmdlczogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSFRUUC9SYW5nZV9yZXF1ZXN0c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByID0gcmFuZ2VzWzBdLnNwbGl0KFwiLVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdGFydCA9IHBhcnNlSW50KHJbMF0sIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbmQgPSByWzFdID8gcGFyc2VJbnQoclsxXSwgMTApIDogdG90YWwgLSAxO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSYW5nZSBpcyBub3QgdmFsaWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhcnQgPCAwIHx8IGVuZCA+PSB0b3RhbCB8fCBzdGFydCA+IGVuZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKDQxNik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVXBkYXRlIGhlYWRlcnNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzWydDb250ZW50LVJhbmdlJ10gPSBgYnl0ZXMgJHtzdGFydH0tJHtlbmR9LyR7dG90YWx9YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzWydDb250ZW50LUxlbmd0aCddID0gZW5kIC0gc3RhcnQgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuc3RhcnQgPSBzdGFydDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmVuZCA9IGVuZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1cyA9IDIwNjsgLy8gcGFydGlhbCBjb250ZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzWydBY2NlcHQtUmFuZ2VzJ10gPSBcImJ5dGVzXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBPcGVuIHRoZSBmaWxlIHN0cmVhbVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJzID0gc3RvcmUuZ2V0UmVhZFN0cmVhbShmaWxlSWQsIGZpbGUsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHdzID0gbmV3IHN0cmVhbS5QYXNzVGhyb3VnaCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBycy5vbignZXJyb3InLCBNZXRlb3IuYmluZEVudmlyb25tZW50KChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcmUub25SZWFkRXJyb3IuY2FsbChzdG9yZSwgZXJyLCBmaWxlSWQsIGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHdzLm9uKCdlcnJvcicsIE1ldGVvci5iaW5kRW52aXJvbm1lbnQoKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdG9yZS5vblJlYWRFcnJvci5jYWxsKHN0b3JlLCBlcnIsIGZpbGVJZCwgZmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgd3Mub24oJ2Nsb3NlJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDbG9zZSBvdXRwdXQgc3RyZWFtIGF0IHRoZSBlbmRcclxuICAgICAgICAgICAgICAgICAgICAgICAgd3MuZW1pdCgnZW5kJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRyYW5zZm9ybSBzdHJlYW1cclxuICAgICAgICAgICAgICAgICAgICBzdG9yZS50cmFuc2Zvcm1SZWFkKHJzLCB3cywgZmlsZUlkLCBmaWxlLCByZXEsIGhlYWRlcnMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBQYXJzZSByZXF1ZXN0IGhlYWRlcnNcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlcS5oZWFkZXJzID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDb21wcmVzcyBkYXRhIHVzaW5nIGlmIG5lZWRlZCAoaWdub3JlIGF1ZGlvL3ZpZGVvIGFzIHRoZXkgYXJlIGFscmVhZHkgY29tcHJlc3NlZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZXEuaGVhZGVyc1snYWNjZXB0LWVuY29kaW5nJ10gPT09ICdzdHJpbmcnICYmICEvXihhdWRpb3x2aWRlbykvLnRlc3QoZmlsZS50eXBlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGFjY2VwdCA9IHJlcS5oZWFkZXJzWydhY2NlcHQtZW5jb2RpbmcnXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDb21wcmVzcyB3aXRoIGd6aXBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhY2NlcHQubWF0Y2goL1xcYmd6aXBcXGIvKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnNbJ0NvbnRlbnQtRW5jb2RpbmcnXSA9ICdnemlwJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgaGVhZGVyc1snQ29udGVudC1MZW5ndGgnXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKHN0YXR1cywgaGVhZGVycyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd3MucGlwZSh6bGliLmNyZWF0ZUd6aXAoKSkucGlwZShyZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbXByZXNzIHdpdGggZGVmbGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoYWNjZXB0Lm1hdGNoKC9cXGJkZWZsYXRlXFxiLykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzWydDb250ZW50LUVuY29kaW5nJ10gPSAnZGVmbGF0ZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGhlYWRlcnNbJ0NvbnRlbnQtTGVuZ3RoJ107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZChzdGF0dXMsIGhlYWRlcnMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdzLnBpcGUoemxpYi5jcmVhdGVEZWZsYXRlKCkpLnBpcGUocmVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFNlbmQgcmF3IGRhdGFcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWhlYWRlcnNbJ0NvbnRlbnQtRW5jb2RpbmcnXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKHN0YXR1cywgaGVhZGVycyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdzLnBpcGUocmVzKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG5leHQoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufVxyXG4iLCIvKlxyXG4gKiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDE3IEthcmwgU1RFSU5cclxuICpcclxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuICpcclxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXHJcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXHJcbiAqIFNPRlRXQVJFLlxyXG4gKlxyXG4gKi9cclxuaW1wb3J0IHtffSBmcm9tIFwibWV0ZW9yL3VuZGVyc2NvcmVcIjtcclxuXHJcblxyXG4vKipcclxuICogU3RvcmUgcGVybWlzc2lvbnNcclxuICovXHJcbmV4cG9ydCBjbGFzcyBTdG9yZVBlcm1pc3Npb25zIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XHJcbiAgICAgICAgLy8gRGVmYXVsdCBvcHRpb25zXHJcbiAgICAgICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHtcclxuICAgICAgICAgICAgaW5zZXJ0OiBudWxsLFxyXG4gICAgICAgICAgICByZW1vdmU6IG51bGwsXHJcbiAgICAgICAgICAgIHVwZGF0ZTogbnVsbFxyXG4gICAgICAgIH0sIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICAvLyBDaGVjayBvcHRpb25zXHJcbiAgICAgICAgaWYgKG9wdGlvbnMuaW5zZXJ0ICYmIHR5cGVvZiBvcHRpb25zLmluc2VydCAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3RvcmVQZXJtaXNzaW9uczogaW5zZXJ0IGlzIG5vdCBhIGZ1bmN0aW9uXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob3B0aW9ucy5yZW1vdmUgJiYgdHlwZW9mIG9wdGlvbnMucmVtb3ZlICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdG9yZVBlcm1pc3Npb25zOiByZW1vdmUgaXMgbm90IGEgZnVuY3Rpb25cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvcHRpb25zLnVwZGF0ZSAmJiB0eXBlb2Ygb3B0aW9ucy51cGRhdGUgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN0b3JlUGVybWlzc2lvbnM6IHVwZGF0ZSBpcyBub3QgYSBmdW5jdGlvblwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFB1YmxpYyBhdHRyaWJ1dGVzXHJcbiAgICAgICAgdGhpcy5hY3Rpb25zID0ge1xyXG4gICAgICAgICAgICBpbnNlcnQ6IG9wdGlvbnMuaW5zZXJ0LFxyXG4gICAgICAgICAgICByZW1vdmU6IG9wdGlvbnMucmVtb3ZlLFxyXG4gICAgICAgICAgICB1cGRhdGU6IG9wdGlvbnMudXBkYXRlLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgdGhlIHBlcm1pc3Npb24gZm9yIHRoZSBhY3Rpb25cclxuICAgICAqIEBwYXJhbSBhY3Rpb25cclxuICAgICAqIEBwYXJhbSB1c2VySWRcclxuICAgICAqIEBwYXJhbSBmaWxlXHJcbiAgICAgKiBAcGFyYW0gZmllbGRzXHJcbiAgICAgKiBAcGFyYW0gbW9kaWZpZXJzXHJcbiAgICAgKiBAcmV0dXJuIHsqfVxyXG4gICAgICovXHJcbiAgICBjaGVjayhhY3Rpb24sIHVzZXJJZCwgZmlsZSwgZmllbGRzLCBtb2RpZmllcnMpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuYWN0aW9uc1thY3Rpb25dID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFjdGlvbnNbYWN0aW9uXSh1c2VySWQsIGZpbGUsIGZpZWxkcywgbW9kaWZpZXJzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIGJ5IGRlZmF1bHQgYWxsb3cgYWxsXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgdGhlIGluc2VydCBwZXJtaXNzaW9uXHJcbiAgICAgKiBAcGFyYW0gdXNlcklkXHJcbiAgICAgKiBAcGFyYW0gZmlsZVxyXG4gICAgICogQHJldHVybnMgeyp9XHJcbiAgICAgKi9cclxuICAgIGNoZWNrSW5zZXJ0KHVzZXJJZCwgZmlsZSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNoZWNrKCdpbnNlcnQnLCB1c2VySWQsIGZpbGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIHRoZSByZW1vdmUgcGVybWlzc2lvblxyXG4gICAgICogQHBhcmFtIHVzZXJJZFxyXG4gICAgICogQHBhcmFtIGZpbGVcclxuICAgICAqIEByZXR1cm5zIHsqfVxyXG4gICAgICovXHJcbiAgICBjaGVja1JlbW92ZSh1c2VySWQsIGZpbGUpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jaGVjaygncmVtb3ZlJywgdXNlcklkLCBmaWxlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyB0aGUgdXBkYXRlIHBlcm1pc3Npb25cclxuICAgICAqIEBwYXJhbSB1c2VySWRcclxuICAgICAqIEBwYXJhbSBmaWxlXHJcbiAgICAgKiBAcGFyYW0gZmllbGRzXHJcbiAgICAgKiBAcGFyYW0gbW9kaWZpZXJzXHJcbiAgICAgKiBAcmV0dXJucyB7Kn1cclxuICAgICAqL1xyXG4gICAgY2hlY2tVcGRhdGUodXNlcklkLCBmaWxlLCBmaWVsZHMsIG1vZGlmaWVycykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNoZWNrKCd1cGRhdGUnLCB1c2VySWQsIGZpbGUsIGZpZWxkcywgbW9kaWZpZXJzKTtcclxuICAgIH1cclxufVxyXG4iLCIvKlxyXG4gKiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDE3IEthcmwgU1RFSU5cclxuICpcclxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuICpcclxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXHJcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXHJcbiAqIFNPRlRXQVJFLlxyXG4gKlxyXG4gKi9cclxuaW1wb3J0IHtffSBmcm9tIFwibWV0ZW9yL3VuZGVyc2NvcmVcIjtcclxuaW1wb3J0IHtjaGVja30gZnJvbSBcIm1ldGVvci9jaGVja1wiO1xyXG5pbXBvcnQge01ldGVvcn0gZnJvbSBcIm1ldGVvci9tZXRlb3JcIjtcclxuaW1wb3J0IHtNb25nb30gZnJvbSBcIm1ldGVvci9tb25nb1wiO1xyXG5pbXBvcnQge1VwbG9hZEZTfSBmcm9tIFwiLi91ZnNcIjtcclxuaW1wb3J0IHtGaWx0ZXJ9IGZyb20gXCIuL3Vmcy1maWx0ZXJcIjtcclxuaW1wb3J0IHtTdG9yZVBlcm1pc3Npb25zfSBmcm9tIFwiLi91ZnMtc3RvcmUtcGVybWlzc2lvbnNcIjtcclxuaW1wb3J0IHtUb2tlbnN9IGZyb20gXCIuL3Vmcy10b2tlbnNcIjtcclxuXHJcblxyXG4vKipcclxuICogRmlsZSBzdG9yZVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFN0b3JlIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICAvLyBEZWZhdWx0IG9wdGlvbnNcclxuICAgICAgICBvcHRpb25zID0gXy5leHRlbmQoe1xyXG4gICAgICAgICAgICBjb2xsZWN0aW9uOiBudWxsLFxyXG4gICAgICAgICAgICBmaWx0ZXI6IG51bGwsXHJcbiAgICAgICAgICAgIG5hbWU6IG51bGwsXHJcbiAgICAgICAgICAgIG9uQ29weUVycm9yOiB0aGlzLm9uQ29weUVycm9yLFxyXG4gICAgICAgICAgICBvbkZpbmlzaFVwbG9hZDogdGhpcy5vbkZpbmlzaFVwbG9hZCxcclxuICAgICAgICAgICAgb25SZWFkOiB0aGlzLm9uUmVhZCxcclxuICAgICAgICAgICAgb25SZWFkRXJyb3I6IHRoaXMub25SZWFkRXJyb3IsXHJcbiAgICAgICAgICAgIG9uVmFsaWRhdGU6IHRoaXMub25WYWxpZGF0ZSxcclxuICAgICAgICAgICAgb25Xcml0ZUVycm9yOiB0aGlzLm9uV3JpdGVFcnJvcixcclxuICAgICAgICAgICAgcGVybWlzc2lvbnM6IG51bGwsXHJcbiAgICAgICAgICAgIHRyYW5zZm9ybVJlYWQ6IG51bGwsXHJcbiAgICAgICAgICAgIHRyYW5zZm9ybVdyaXRlOiBudWxsXHJcbiAgICAgICAgfSwgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgIC8vIENoZWNrIG9wdGlvbnNcclxuICAgICAgICBpZiAoIShvcHRpb25zLmNvbGxlY3Rpb24gaW5zdGFuY2VvZiBNb25nby5Db2xsZWN0aW9uKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdG9yZTogY29sbGVjdGlvbiBpcyBub3QgYSBNb25nby5Db2xsZWN0aW9uJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvcHRpb25zLmZpbHRlciAmJiAhKG9wdGlvbnMuZmlsdGVyIGluc3RhbmNlb2YgRmlsdGVyKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdG9yZTogZmlsdGVyIGlzIG5vdCBhIFVwbG9hZEZTLkZpbHRlcicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMubmFtZSAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignU3RvcmU6IG5hbWUgaXMgbm90IGEgc3RyaW5nJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChVcGxvYWRGUy5nZXRTdG9yZShvcHRpb25zLm5hbWUpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1N0b3JlOiBuYW1lIGFscmVhZHkgZXhpc3RzJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvcHRpb25zLm9uQ29weUVycm9yICYmIHR5cGVvZiBvcHRpb25zLm9uQ29weUVycm9yICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1N0b3JlOiBvbkNvcHlFcnJvciBpcyBub3QgYSBmdW5jdGlvbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob3B0aW9ucy5vbkZpbmlzaFVwbG9hZCAmJiB0eXBlb2Ygb3B0aW9ucy5vbkZpbmlzaFVwbG9hZCAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdG9yZTogb25GaW5pc2hVcGxvYWQgaXMgbm90IGEgZnVuY3Rpb24nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9wdGlvbnMub25SZWFkICYmIHR5cGVvZiBvcHRpb25zLm9uUmVhZCAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdG9yZTogb25SZWFkIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvcHRpb25zLm9uUmVhZEVycm9yICYmIHR5cGVvZiBvcHRpb25zLm9uUmVhZEVycm9yICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1N0b3JlOiBvblJlYWRFcnJvciBpcyBub3QgYSBmdW5jdGlvbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob3B0aW9ucy5vbldyaXRlRXJyb3IgJiYgdHlwZW9mIG9wdGlvbnMub25Xcml0ZUVycm9yICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1N0b3JlOiBvbldyaXRlRXJyb3IgaXMgbm90IGEgZnVuY3Rpb24nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9wdGlvbnMucGVybWlzc2lvbnMgJiYgIShvcHRpb25zLnBlcm1pc3Npb25zIGluc3RhbmNlb2YgU3RvcmVQZXJtaXNzaW9ucykpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignU3RvcmU6IHBlcm1pc3Npb25zIGlzIG5vdCBhIFVwbG9hZEZTLlN0b3JlUGVybWlzc2lvbnMnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9wdGlvbnMudHJhbnNmb3JtUmVhZCAmJiB0eXBlb2Ygb3B0aW9ucy50cmFuc2Zvcm1SZWFkICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1N0b3JlOiB0cmFuc2Zvcm1SZWFkIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvcHRpb25zLnRyYW5zZm9ybVdyaXRlICYmIHR5cGVvZiBvcHRpb25zLnRyYW5zZm9ybVdyaXRlICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1N0b3JlOiB0cmFuc2Zvcm1Xcml0ZSBpcyBub3QgYSBmdW5jdGlvbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob3B0aW9ucy5vblZhbGlkYXRlICYmIHR5cGVvZiBvcHRpb25zLm9uVmFsaWRhdGUgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignU3RvcmU6IG9uVmFsaWRhdGUgaXMgbm90IGEgZnVuY3Rpb24nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFB1YmxpYyBhdHRyaWJ1dGVzXHJcbiAgICAgICAgc2VsZi5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICBzZWxmLnBlcm1pc3Npb25zID0gb3B0aW9ucy5wZXJtaXNzaW9ucztcclxuICAgICAgICBfLmVhY2goW1xyXG4gICAgICAgICAgICAnb25Db3B5RXJyb3InLFxyXG4gICAgICAgICAgICAnb25GaW5pc2hVcGxvYWQnLFxyXG4gICAgICAgICAgICAnb25SZWFkJyxcclxuICAgICAgICAgICAgJ29uUmVhZEVycm9yJyxcclxuICAgICAgICAgICAgJ29uV3JpdGVFcnJvcicsXHJcbiAgICAgICAgICAgICdvblZhbGlkYXRlJ1xyXG4gICAgICAgIF0sIChtZXRob2QpID0+IHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zW21ldGhvZF0gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIHNlbGZbbWV0aG9kXSA9IG9wdGlvbnNbbWV0aG9kXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBBZGQgdGhlIHN0b3JlIHRvIHRoZSBsaXN0XHJcbiAgICAgICAgVXBsb2FkRlMuYWRkU3RvcmUoc2VsZik7XHJcblxyXG4gICAgICAgIC8vIFNldCBkZWZhdWx0IHBlcm1pc3Npb25zXHJcbiAgICAgICAgaWYgKCEoc2VsZi5wZXJtaXNzaW9ucyBpbnN0YW5jZW9mIFN0b3JlUGVybWlzc2lvbnMpKSB7XHJcbiAgICAgICAgICAgIC8vIFVzZXMgY3VzdG9tIGRlZmF1bHQgcGVybWlzc2lvbnMgb3IgVUZTIGRlZmF1bHQgcGVybWlzc2lvbnNcclxuICAgICAgICAgICAgaWYgKFVwbG9hZEZTLmNvbmZpZy5kZWZhdWx0U3RvcmVQZXJtaXNzaW9ucyBpbnN0YW5jZW9mIFN0b3JlUGVybWlzc2lvbnMpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYucGVybWlzc2lvbnMgPSBVcGxvYWRGUy5jb25maWcuZGVmYXVsdFN0b3JlUGVybWlzc2lvbnM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnBlcm1pc3Npb25zID0gbmV3IFN0b3JlUGVybWlzc2lvbnMoKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgdWZzOiBwZXJtaXNzaW9ucyBhcmUgbm90IGRlZmluZWQgZm9yIHN0b3JlIFwiJHtvcHRpb25zLm5hbWV9XCJgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKE1ldGVvci5pc1NlcnZlcikge1xyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIENoZWNrcyB0b2tlbiB2YWxpZGl0eVxyXG4gICAgICAgICAgICAgKiBAcGFyYW0gdG9rZW5cclxuICAgICAgICAgICAgICogQHBhcmFtIGZpbGVJZFxyXG4gICAgICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIHNlbGYuY2hlY2tUb2tlbiA9IGZ1bmN0aW9uICh0b2tlbiwgZmlsZUlkKSB7XHJcbiAgICAgICAgICAgICAgICBjaGVjayh0b2tlbiwgU3RyaW5nKTtcclxuICAgICAgICAgICAgICAgIGNoZWNrKGZpbGVJZCwgU3RyaW5nKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBUb2tlbnMuZmluZCh7dmFsdWU6IHRva2VuLCBmaWxlSWQ6IGZpbGVJZH0pLmNvdW50KCkgPT09IDE7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICogQ29waWVzIHRoZSBmaWxlIHRvIGEgc3RvcmVcclxuICAgICAgICAgICAgICogQHBhcmFtIGZpbGVJZFxyXG4gICAgICAgICAgICAgKiBAcGFyYW0gc3RvcmVcclxuICAgICAgICAgICAgICogQHBhcmFtIGNhbGxiYWNrXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBzZWxmLmNvcHkgPSBmdW5jdGlvbiAoZmlsZUlkLCBzdG9yZSwgY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgIGNoZWNrKGZpbGVJZCwgU3RyaW5nKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIShzdG9yZSBpbnN0YW5jZW9mIFN0b3JlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3N0b3JlIGlzIG5vdCBhbiBpbnN0YW5jZSBvZiBVcGxvYWRGUy5TdG9yZScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gR2V0IG9yaWdpbmFsIGZpbGVcclxuICAgICAgICAgICAgICAgIGxldCBmaWxlID0gc2VsZi5nZXRDb2xsZWN0aW9uKCkuZmluZE9uZSh7X2lkOiBmaWxlSWR9KTtcclxuICAgICAgICAgICAgICAgIGlmICghZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ2ZpbGUtbm90LWZvdW5kJywgJ0ZpbGUgbm90IGZvdW5kJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBTaWxlbnRseSBpZ25vcmUgdGhlIGZpbGUgaWYgaXQgZG9lcyBub3QgbWF0Y2ggZmlsdGVyXHJcbiAgICAgICAgICAgICAgICBjb25zdCBmaWx0ZXIgPSBzdG9yZS5nZXRGaWx0ZXIoKTtcclxuICAgICAgICAgICAgICAgIGlmIChmaWx0ZXIgaW5zdGFuY2VvZiBGaWx0ZXIgJiYgIWZpbHRlci5pc1ZhbGlkKGZpbGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFByZXBhcmUgY29weVxyXG4gICAgICAgICAgICAgICAgbGV0IGNvcHkgPSBfLm9taXQoZmlsZSwgJ19pZCcsICd1cmwnKTtcclxuICAgICAgICAgICAgICAgIGNvcHkub3JpZ2luYWxTdG9yZSA9IHNlbGYuZ2V0TmFtZSgpO1xyXG4gICAgICAgICAgICAgICAgY29weS5vcmlnaW5hbElkID0gZmlsZUlkO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgY29weVxyXG4gICAgICAgICAgICAgICAgbGV0IGNvcHlJZCA9IHN0b3JlLmNyZWF0ZShjb3B5KTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBHZXQgb3JpZ2luYWwgc3RyZWFtXHJcbiAgICAgICAgICAgICAgICBsZXQgcnMgPSBzZWxmLmdldFJlYWRTdHJlYW0oZmlsZUlkLCBmaWxlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDYXRjaCBlcnJvcnMgdG8gYXZvaWQgYXBwIGNyYXNoaW5nXHJcbiAgICAgICAgICAgICAgICBycy5vbignZXJyb3InLCBNZXRlb3IuYmluZEVudmlyb25tZW50KGZ1bmN0aW9uIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKHNlbGYsIGVyciwgbnVsbCk7XHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ29weSBmaWxlIGRhdGFcclxuICAgICAgICAgICAgICAgIHN0b3JlLndyaXRlKHJzLCBjb3B5SWQsIE1ldGVvci5iaW5kRW52aXJvbm1lbnQoZnVuY3Rpb24gKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5nZXRDb2xsZWN0aW9uKCkucmVtb3ZlKHtfaWQ6IGNvcHlJZH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLm9uQ29weUVycm9yLmNhbGwoc2VsZiwgZXJyLCBmaWxlSWQsIGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoc2VsZiwgZXJyLCBjb3B5SWQsIGNvcHksIHN0b3JlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICogQ3JlYXRlcyB0aGUgZmlsZSBpbiB0aGUgY29sbGVjdGlvblxyXG4gICAgICAgICAgICAgKiBAcGFyYW0gZmlsZVxyXG4gICAgICAgICAgICAgKiBAcGFyYW0gY2FsbGJhY2tcclxuICAgICAgICAgICAgICogQHJldHVybiB7c3RyaW5nfVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgc2VsZi5jcmVhdGUgPSBmdW5jdGlvbiAoZmlsZSwgY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgIGNoZWNrKGZpbGUsIE9iamVjdCk7XHJcbiAgICAgICAgICAgICAgICBmaWxlLnN0b3JlID0gc2VsZi5vcHRpb25zLm5hbWU7IC8vIGFzc2lnbiBzdG9yZSB0byBmaWxlXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5nZXRDb2xsZWN0aW9uKCkuaW5zZXJ0KGZpbGUsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBDcmVhdGVzIGEgdG9rZW4gZm9yIHRoZSBmaWxlIChvbmx5IG5lZWRlZCBmb3IgY2xpZW50IHNpZGUgdXBsb2FkKVxyXG4gICAgICAgICAgICAgKiBAcGFyYW0gZmlsZUlkXHJcbiAgICAgICAgICAgICAqIEByZXR1cm5zIHsqfVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgc2VsZi5jcmVhdGVUb2tlbiA9IGZ1bmN0aW9uIChmaWxlSWQpIHtcclxuICAgICAgICAgICAgICAgIGxldCB0b2tlbiA9IHNlbGYuZ2VuZXJhdGVUb2tlbigpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHRva2VuIGV4aXN0c1xyXG4gICAgICAgICAgICAgICAgaWYgKFRva2Vucy5maW5kKHtmaWxlSWQ6IGZpbGVJZH0pLmNvdW50KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBUb2tlbnMudXBkYXRlKHtmaWxlSWQ6IGZpbGVJZH0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNldDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRva2VuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgVG9rZW5zLmluc2VydCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZUlkOiBmaWxlSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0b2tlblxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIFdyaXRlcyB0aGUgZmlsZSB0byB0aGUgc3RvcmVcclxuICAgICAgICAgICAgICogQHBhcmFtIHJzXHJcbiAgICAgICAgICAgICAqIEBwYXJhbSBmaWxlSWRcclxuICAgICAgICAgICAgICogQHBhcmFtIGNhbGxiYWNrXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBzZWxmLndyaXRlID0gZnVuY3Rpb24gKHJzLCBmaWxlSWQsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZmlsZSA9IHNlbGYuZ2V0Q29sbGVjdGlvbigpLmZpbmRPbmUoe19pZDogZmlsZUlkfSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgd3MgPSBzZWxmLmdldFdyaXRlU3RyZWFtKGZpbGVJZCwgZmlsZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGVycm9ySGFuZGxlciA9IE1ldGVvci5iaW5kRW52aXJvbm1lbnQoZnVuY3Rpb24gKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZ2V0Q29sbGVjdGlvbigpLnJlbW92ZSh7X2lkOiBmaWxlSWR9KTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLm9uV3JpdGVFcnJvci5jYWxsKHNlbGYsIGVyciwgZmlsZUlkLCBmaWxlKTtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKHNlbGYsIGVycik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB3cy5vbignZXJyb3InLCBlcnJvckhhbmRsZXIpO1xyXG4gICAgICAgICAgICAgICAgd3Mub24oJ2ZpbmlzaCcsIE1ldGVvci5iaW5kRW52aXJvbm1lbnQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzaXplID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcmVhZFN0cmVhbSA9IHNlbGYuZ2V0UmVhZFN0cmVhbShmaWxlSWQsIGZpbGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICByZWFkU3RyZWFtLm9uKCdlcnJvcicsIE1ldGVvci5iaW5kRW52aXJvbm1lbnQoZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoc2VsZiwgZXJyb3IsIG51bGwpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgICAgICByZWFkU3RyZWFtLm9uKCdkYXRhJywgTWV0ZW9yLmJpbmRFbnZpcm9ubWVudChmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplICs9IGRhdGEubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgICAgICByZWFkU3RyZWFtLm9uKCdlbmQnLCBNZXRlb3IuYmluZEVudmlyb25tZW50KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2V0IGZpbGUgYXR0cmlidXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuY29tcGxldGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLmV0YWcgPSBVcGxvYWRGUy5nZW5lcmF0ZUV0YWcoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5wYXRoID0gc2VsZi5nZXRGaWxlUmVsYXRpdmVVUkwoZmlsZUlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5wcm9ncmVzcyA9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuc2l6ZSA9IHNpemU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUudG9rZW4gPSBzZWxmLmdlbmVyYXRlVG9rZW4oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS51cGxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS51cGxvYWRlZEF0ID0gbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS51cmwgPSBzZWxmLmdldEZpbGVVUkwoZmlsZUlkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEV4ZWN1dGUgY2FsbGJhY2tcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzZWxmLm9uRmluaXNoVXBsb2FkID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLm9uRmluaXNoVXBsb2FkLmNhbGwoc2VsZiwgZmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNldHMgdGhlIGZpbGUgVVJMIHdoZW4gZmlsZSB0cmFuc2ZlciBpcyBjb21wbGV0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcyB3YXksIHRoZSBpbWFnZSB3aWxsIGxvYWRzIGVudGlyZWx5LlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmdldENvbGxlY3Rpb24oKS5kaXJlY3QudXBkYXRlKHtfaWQ6IGZpbGVJZH0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzZXQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogZmlsZS5jb21wbGV0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldGFnOiBmaWxlLmV0YWcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogZmlsZS5wYXRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzOiBmaWxlLnByb2dyZXNzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6IGZpbGUuc2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbjogZmlsZS50b2tlbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGxvYWRpbmc6IGZpbGUudXBsb2FkaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwbG9hZGVkQXQ6IGZpbGUudXBsb2FkZWRBdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGZpbGUudXJsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmV0dXJuIGZpbGUgaW5mb1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKHNlbGYsIG51bGwsIGZpbGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2ltdWxhdGUgd3JpdGUgc3BlZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFVwbG9hZEZTLmNvbmZpZy5zaW11bGF0ZVdyaXRlRGVsYXkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1ldGVvci5fc2xlZXBGb3JNcyhVcGxvYWRGUy5jb25maWcuc2ltdWxhdGVXcml0ZURlbGF5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29weSBmaWxlIHRvIG90aGVyIHN0b3Jlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5vcHRpb25zLmNvcHlUbyBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNlbGYub3B0aW9ucy5jb3B5VG8ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3RvcmUgPSBzZWxmLm9wdGlvbnMuY29weVRvW2ldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXN0b3JlLmdldEZpbHRlcigpIHx8IHN0b3JlLmdldEZpbHRlcigpLmlzVmFsaWQoZmlsZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5jb3B5KGZpbGVJZCwgc3RvcmUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBFeGVjdXRlIHRyYW5zZm9ybWF0aW9uXHJcbiAgICAgICAgICAgICAgICBzZWxmLnRyYW5zZm9ybVdyaXRlKHJzLCB3cywgZmlsZUlkLCBmaWxlKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcclxuICAgICAgICAgICAgY29uc3QgZnMgPSBOcG0ucmVxdWlyZSgnZnMnKTtcclxuICAgICAgICAgICAgY29uc3QgY29sbGVjdGlvbiA9IHNlbGYuZ2V0Q29sbGVjdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ29kZSBleGVjdXRlZCBhZnRlciByZW1vdmluZyBmaWxlXHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb24uYWZ0ZXIucmVtb3ZlKGZ1bmN0aW9uICh1c2VySWQsIGZpbGUpIHtcclxuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBhc3NvY2lhdGVkIHRva2Vuc1xyXG4gICAgICAgICAgICAgICAgVG9rZW5zLnJlbW92ZSh7ZmlsZUlkOiBmaWxlLl9pZH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzZWxmLm9wdGlvbnMuY29weVRvIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNlbGYub3B0aW9ucy5jb3B5VG8ubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIGNvcGllcyBpbiBzdG9yZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5vcHRpb25zLmNvcHlUb1tpXS5nZXRDb2xsZWN0aW9uKCkucmVtb3ZlKHtvcmlnaW5hbElkOiBmaWxlLl9pZH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBDb2RlIGV4ZWN1dGVkIGJlZm9yZSBpbnNlcnRpbmcgZmlsZVxyXG4gICAgICAgICAgICBjb2xsZWN0aW9uLmJlZm9yZS5pbnNlcnQoZnVuY3Rpb24gKHVzZXJJZCwgZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFzZWxmLnBlcm1pc3Npb25zLmNoZWNrSW5zZXJ0KHVzZXJJZCwgZmlsZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdmb3JiaWRkZW4nLCBcIkZvcmJpZGRlblwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBDb2RlIGV4ZWN1dGVkIGJlZm9yZSB1cGRhdGluZyBmaWxlXHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb24uYmVmb3JlLnVwZGF0ZShmdW5jdGlvbiAodXNlcklkLCBmaWxlLCBmaWVsZHMsIG1vZGlmaWVycykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFzZWxmLnBlcm1pc3Npb25zLmNoZWNrVXBkYXRlKHVzZXJJZCwgZmlsZSwgZmllbGRzLCBtb2RpZmllcnMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignZm9yYmlkZGVuJywgXCJGb3JiaWRkZW5cIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gQ29kZSBleGVjdXRlZCBiZWZvcmUgcmVtb3ZpbmcgZmlsZVxyXG4gICAgICAgICAgICBjb2xsZWN0aW9uLmJlZm9yZS5yZW1vdmUoZnVuY3Rpb24gKHVzZXJJZCwgZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFzZWxmLnBlcm1pc3Npb25zLmNoZWNrUmVtb3ZlKHVzZXJJZCwgZmlsZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdmb3JiaWRkZW4nLCBcIkZvcmJpZGRlblwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBEZWxldGUgdGhlIHBoeXNpY2FsIGZpbGUgaW4gdGhlIHN0b3JlXHJcbiAgICAgICAgICAgICAgICBzZWxmLmRlbGV0ZShmaWxlLl9pZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHRtcEZpbGUgPSBVcGxvYWRGUy5nZXRUZW1wRmlsZVBhdGgoZmlsZS5faWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIERlbGV0ZSB0aGUgdGVtcCBmaWxlXHJcbiAgICAgICAgICAgICAgICBmcy5zdGF0KHRtcEZpbGUsIGZ1bmN0aW9uIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAhZXJyICYmIGZzLnVubGluayh0bXBGaWxlLCBmdW5jdGlvbiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVyciAmJiBjb25zb2xlLmVycm9yKGB1ZnM6IGNhbm5vdCBkZWxldGUgdGVtcCBmaWxlIGF0ICR7dG1wRmlsZX0gKCR7ZXJyLm1lc3NhZ2V9KWApO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERlbGV0ZXMgYSBmaWxlIGFzeW5jXHJcbiAgICAgKiBAcGFyYW0gZmlsZUlkXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcclxuICAgICAqL1xyXG4gICAgZGVsZXRlKGZpbGVJZCwgY2FsbGJhY2spIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2RlbGV0ZSBpcyBub3QgaW1wbGVtZW50ZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdlbmVyYXRlcyBhIHJhbmRvbSB0b2tlblxyXG4gICAgICogQHBhcmFtIHBhdHRlcm5cclxuICAgICAqIEByZXR1cm4ge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgZ2VuZXJhdGVUb2tlbihwYXR0ZXJuKSB7XHJcbiAgICAgICAgcmV0dXJuIChwYXR0ZXJuIHx8ICd4eXh5eHl4eXh5JykucmVwbGFjZSgvW3h5XS9nLCAoYykgPT4ge1xyXG4gICAgICAgICAgICBsZXQgciA9IE1hdGgucmFuZG9tKCkgKiAxNiB8IDAsIHYgPSBjID09PSAneCcgPyByIDogKHIgJiAweDMgfCAweDgpO1xyXG4gICAgICAgICAgICBsZXQgcyA9IHYudG9TdHJpbmcoMTYpO1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpKSA/IHMudG9VcHBlckNhc2UoKSA6IHM7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBjb2xsZWN0aW9uXHJcbiAgICAgKiBAcmV0dXJuIHtNb25nby5Db2xsZWN0aW9ufVxyXG4gICAgICovXHJcbiAgICBnZXRDb2xsZWN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuY29sbGVjdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGZpbGUgVVJMXHJcbiAgICAgKiBAcGFyYW0gZmlsZUlkXHJcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd8bnVsbH1cclxuICAgICAqL1xyXG4gICAgZ2V0RmlsZVJlbGF0aXZlVVJMKGZpbGVJZCkge1xyXG4gICAgICAgIGxldCBmaWxlID0gdGhpcy5nZXRDb2xsZWN0aW9uKCkuZmluZE9uZShmaWxlSWQsIHtmaWVsZHM6IHtuYW1lOiAxfX0pO1xyXG4gICAgICAgIHJldHVybiBmaWxlID8gdGhpcy5nZXRSZWxhdGl2ZVVSTChgJHtmaWxlSWR9LyR7ZmlsZS5uYW1lfWApIDogbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGZpbGUgVVJMXHJcbiAgICAgKiBAcGFyYW0gZmlsZUlkXHJcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd8bnVsbH1cclxuICAgICAqL1xyXG4gICAgZ2V0RmlsZVVSTChmaWxlSWQpIHtcclxuICAgICAgICBsZXQgZmlsZSA9IHRoaXMuZ2V0Q29sbGVjdGlvbigpLmZpbmRPbmUoZmlsZUlkLCB7ZmllbGRzOiB7bmFtZTogMX19KTtcclxuICAgICAgICByZXR1cm4gZmlsZSA/IHRoaXMuZ2V0VVJMKGAke2ZpbGVJZH0vJHtmaWxlLm5hbWV9YCkgOiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgZmlsZSBmaWx0ZXJcclxuICAgICAqIEByZXR1cm4ge1VwbG9hZEZTLkZpbHRlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0RmlsdGVyKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuZmlsdGVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgc3RvcmUgbmFtZVxyXG4gICAgICogQHJldHVybiB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBnZXROYW1lKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMubmFtZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGZpbGUgcmVhZCBzdHJlYW1cclxuICAgICAqIEBwYXJhbSBmaWxlSWRcclxuICAgICAqIEBwYXJhbSBmaWxlXHJcbiAgICAgKi9cclxuICAgIGdldFJlYWRTdHJlYW0oZmlsZUlkLCBmaWxlKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTdG9yZS5nZXRSZWFkU3RyZWFtIGlzIG5vdCBpbXBsZW1lbnRlZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgc3RvcmUgcmVsYXRpdmUgVVJMXHJcbiAgICAgKiBAcGFyYW0gcGF0aFxyXG4gICAgICogQHJldHVybiB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBnZXRSZWxhdGl2ZVVSTChwYXRoKSB7XHJcbiAgICAgICAgY29uc3Qgcm9vdFVybCA9IE1ldGVvci5hYnNvbHV0ZVVybCgpLnJlcGxhY2UoL1xcLyskLywgJycpO1xyXG4gICAgICAgIGNvbnN0IHJvb3RQYXRoID0gcm9vdFVybC5yZXBsYWNlKC9eW2Etel0rOlxcL1xcL1teL10rXFwvKi9naSwgJycpO1xyXG4gICAgICAgIGNvbnN0IHN0b3JlTmFtZSA9IHRoaXMuZ2V0TmFtZSgpO1xyXG4gICAgICAgIHBhdGggPSBTdHJpbmcocGF0aCkucmVwbGFjZSgvXFwvJC8sICcnKS50cmltKCk7XHJcbiAgICAgICAgcmV0dXJuIGVuY29kZVVSSShgJHtyb290UGF0aH0vJHtVcGxvYWRGUy5jb25maWcuc3RvcmVzUGF0aH0vJHtzdG9yZU5hbWV9LyR7cGF0aH1gKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHN0b3JlIGFic29sdXRlIFVSTFxyXG4gICAgICogQHBhcmFtIHBhdGhcclxuICAgICAqIEByZXR1cm4ge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgZ2V0VVJMKHBhdGgpIHtcclxuICAgICAgICBjb25zdCByb290VXJsID0gTWV0ZW9yLmFic29sdXRlVXJsKHtzZWN1cmU6IFVwbG9hZEZTLmNvbmZpZy5odHRwc30pLnJlcGxhY2UoL1xcLyskLywgJycpO1xyXG4gICAgICAgIGNvbnN0IHN0b3JlTmFtZSA9IHRoaXMuZ2V0TmFtZSgpO1xyXG4gICAgICAgIHBhdGggPSBTdHJpbmcocGF0aCkucmVwbGFjZSgvXFwvJC8sICcnKS50cmltKCk7XHJcbiAgICAgICAgcmV0dXJuIGVuY29kZVVSSShgJHtyb290VXJsfS8ke1VwbG9hZEZTLmNvbmZpZy5zdG9yZXNQYXRofS8ke3N0b3JlTmFtZX0vJHtwYXRofWApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgZmlsZSB3cml0ZSBzdHJlYW1cclxuICAgICAqIEBwYXJhbSBmaWxlSWRcclxuICAgICAqIEBwYXJhbSBmaWxlXHJcbiAgICAgKi9cclxuICAgIGdldFdyaXRlU3RyZWFtKGZpbGVJZCwgZmlsZSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZ2V0V3JpdGVTdHJlYW0gaXMgbm90IGltcGxlbWVudGVkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb21wbGV0ZXMgdGhlIGZpbGUgdXBsb2FkXHJcbiAgICAgKiBAcGFyYW0gdXJsXHJcbiAgICAgKiBAcGFyYW0gZmlsZVxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrXHJcbiAgICAgKi9cclxuICAgIGltcG9ydEZyb21VUkwodXJsLCBmaWxlLCBjYWxsYmFjaykge1xyXG4gICAgICAgIE1ldGVvci5jYWxsKCd1ZnNJbXBvcnRVUkwnLCB1cmwsIGZpbGUsIHRoaXMuZ2V0TmFtZSgpLCBjYWxsYmFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsZWQgd2hlbiBhIGNvcHkgZXJyb3IgaGFwcGVuZWRcclxuICAgICAqIEBwYXJhbSBlcnJcclxuICAgICAqIEBwYXJhbSBmaWxlSWRcclxuICAgICAqIEBwYXJhbSBmaWxlXHJcbiAgICAgKi9cclxuICAgIG9uQ29weUVycm9yKGVyciwgZmlsZUlkLCBmaWxlKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgdWZzOiBjYW5ub3QgY29weSBmaWxlIFwiJHtmaWxlSWR9XCIgKCR7ZXJyLm1lc3NhZ2V9KWAsIGVycik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsZWQgd2hlbiBhIGZpbGUgaGFzIGJlZW4gdXBsb2FkZWRcclxuICAgICAqIEBwYXJhbSBmaWxlXHJcbiAgICAgKi9cclxuICAgIG9uRmluaXNoVXBsb2FkKGZpbGUpIHtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGxlZCB3aGVuIGEgZmlsZSBpcyByZWFkIGZyb20gdGhlIHN0b3JlXHJcbiAgICAgKiBAcGFyYW0gZmlsZUlkXHJcbiAgICAgKiBAcGFyYW0gZmlsZVxyXG4gICAgICogQHBhcmFtIHJlcXVlc3RcclxuICAgICAqIEBwYXJhbSByZXNwb25zZVxyXG4gICAgICogQHJldHVybiBib29sZWFuXHJcbiAgICAgKi9cclxuICAgIG9uUmVhZChmaWxlSWQsIGZpbGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsZWQgd2hlbiBhIHJlYWQgZXJyb3IgaGFwcGVuZWRcclxuICAgICAqIEBwYXJhbSBlcnJcclxuICAgICAqIEBwYXJhbSBmaWxlSWRcclxuICAgICAqIEBwYXJhbSBmaWxlXHJcbiAgICAgKiBAcmV0dXJuIGJvb2xlYW5cclxuICAgICAqL1xyXG4gICAgb25SZWFkRXJyb3IoZXJyLCBmaWxlSWQsIGZpbGUpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGB1ZnM6IGNhbm5vdCByZWFkIGZpbGUgXCIke2ZpbGVJZH1cIiAoJHtlcnIubWVzc2FnZX0pYCwgZXJyKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGxlZCB3aGVuIGZpbGUgaXMgYmVpbmcgdmFsaWRhdGVkXHJcbiAgICAgKiBAcGFyYW0gZmlsZVxyXG4gICAgICovXHJcbiAgICBvblZhbGlkYXRlKGZpbGUpIHtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGxlZCB3aGVuIGEgd3JpdGUgZXJyb3IgaGFwcGVuZWRcclxuICAgICAqIEBwYXJhbSBlcnJcclxuICAgICAqIEBwYXJhbSBmaWxlSWRcclxuICAgICAqIEBwYXJhbSBmaWxlXHJcbiAgICAgKiBAcmV0dXJuIGJvb2xlYW5cclxuICAgICAqL1xyXG4gICAgb25Xcml0ZUVycm9yKGVyciwgZmlsZUlkLCBmaWxlKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgdWZzOiBjYW5ub3Qgd3JpdGUgZmlsZSBcIiR7ZmlsZUlkfVwiICgke2Vyci5tZXNzYWdlfSlgLCBlcnIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgc3RvcmUgcGVybWlzc2lvbnNcclxuICAgICAqIEBwYXJhbSBwZXJtaXNzaW9uc1xyXG4gICAgICovXHJcbiAgICBzZXRQZXJtaXNzaW9ucyhwZXJtaXNzaW9ucykge1xyXG4gICAgICAgIGlmICghKHBlcm1pc3Npb25zIGluc3RhbmNlb2YgU3RvcmVQZXJtaXNzaW9ucykpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlBlcm1pc3Npb25zIGlzIG5vdCBhbiBpbnN0YW5jZSBvZiBVcGxvYWRGUy5TdG9yZVBlcm1pc3Npb25zXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBlcm1pc3Npb25zID0gcGVybWlzc2lvbnM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmFuc2Zvcm1zIHRoZSBmaWxlIG9uIHJlYWRpbmdcclxuICAgICAqIEBwYXJhbSByZWFkU3RyZWFtXHJcbiAgICAgKiBAcGFyYW0gd3JpdGVTdHJlYW1cclxuICAgICAqIEBwYXJhbSBmaWxlSWRcclxuICAgICAqIEBwYXJhbSBmaWxlXHJcbiAgICAgKiBAcGFyYW0gcmVxdWVzdFxyXG4gICAgICogQHBhcmFtIGhlYWRlcnNcclxuICAgICAqL1xyXG4gICAgdHJhbnNmb3JtUmVhZChyZWFkU3RyZWFtLCB3cml0ZVN0cmVhbSwgZmlsZUlkLCBmaWxlLCByZXF1ZXN0LCBoZWFkZXJzKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMudHJhbnNmb3JtUmVhZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMudHJhbnNmb3JtUmVhZC5jYWxsKHRoaXMsIHJlYWRTdHJlYW0sIHdyaXRlU3RyZWFtLCBmaWxlSWQsIGZpbGUsIHJlcXVlc3QsIGhlYWRlcnMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJlYWRTdHJlYW0ucGlwZSh3cml0ZVN0cmVhbSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJhbnNmb3JtcyB0aGUgZmlsZSBvbiB3cml0aW5nXHJcbiAgICAgKiBAcGFyYW0gcmVhZFN0cmVhbVxyXG4gICAgICogQHBhcmFtIHdyaXRlU3RyZWFtXHJcbiAgICAgKiBAcGFyYW0gZmlsZUlkXHJcbiAgICAgKiBAcGFyYW0gZmlsZVxyXG4gICAgICovXHJcbiAgICB0cmFuc2Zvcm1Xcml0ZShyZWFkU3RyZWFtLCB3cml0ZVN0cmVhbSwgZmlsZUlkLCBmaWxlKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMudHJhbnNmb3JtV3JpdGUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRyYW5zZm9ybVdyaXRlLmNhbGwodGhpcywgcmVhZFN0cmVhbSwgd3JpdGVTdHJlYW0sIGZpbGVJZCwgZmlsZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmVhZFN0cmVhbS5waXBlKHdyaXRlU3RyZWFtKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBWYWxpZGF0ZXMgdGhlIGZpbGVcclxuICAgICAqIEBwYXJhbSBmaWxlXHJcbiAgICAgKi9cclxuICAgIHZhbGlkYXRlKGZpbGUpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMub25WYWxpZGF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB0aGlzLm9uVmFsaWRhdGUoZmlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8qXHJcbiAqIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgS2FybCBTVEVJTlxyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4gKlxyXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcclxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuICpcclxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcclxuICogU09GVFdBUkUuXHJcbiAqXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtUZW1wbGF0ZX0gZnJvbSAnbWV0ZW9yL3RlbXBsYXRpbmcnO1xyXG5cclxuXHJcbmxldCBpc01JTUUgPSBmdW5jdGlvbiAodHlwZSwgbWltZSkge1xyXG4gICAgcmV0dXJuIHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJ1xyXG4gICAgICAgICYmIHR5cGVvZiBtaW1lID09PSAnc3RyaW5nJ1xyXG4gICAgICAgICYmIG1pbWUuaW5kZXhPZih0eXBlICsgJy8nKSA9PT0gMDtcclxufTtcclxuXHJcblRlbXBsYXRlLnJlZ2lzdGVySGVscGVyKCdpc0FwcGxpY2F0aW9uJywgZnVuY3Rpb24gKHR5cGUpIHtcclxuICAgIHJldHVybiBpc01JTUUoJ2FwcGxpY2F0aW9uJywgdGhpcy50eXBlIHx8IHR5cGUpO1xyXG59KTtcclxuXHJcblRlbXBsYXRlLnJlZ2lzdGVySGVscGVyKCdpc0F1ZGlvJywgZnVuY3Rpb24gKHR5cGUpIHtcclxuICAgIHJldHVybiBpc01JTUUoJ2F1ZGlvJywgdGhpcy50eXBlIHx8IHR5cGUpO1xyXG59KTtcclxuXHJcblRlbXBsYXRlLnJlZ2lzdGVySGVscGVyKCdpc0ltYWdlJywgZnVuY3Rpb24gKHR5cGUpIHtcclxuICAgIHJldHVybiBpc01JTUUoJ2ltYWdlJywgdGhpcy50eXBlIHx8IHR5cGUpO1xyXG59KTtcclxuXHJcblRlbXBsYXRlLnJlZ2lzdGVySGVscGVyKCdpc1RleHQnLCBmdW5jdGlvbiAodHlwZSkge1xyXG4gICAgcmV0dXJuIGlzTUlNRSgndGV4dCcsIHRoaXMudHlwZSB8fCB0eXBlKTtcclxufSk7XHJcblxyXG5UZW1wbGF0ZS5yZWdpc3RlckhlbHBlcignaXNWaWRlbycsIGZ1bmN0aW9uICh0eXBlKSB7XHJcbiAgICByZXR1cm4gaXNNSU1FKCd2aWRlbycsIHRoaXMudHlwZSB8fCB0eXBlKTtcclxufSk7XHJcbiIsIi8qXHJcbiAqIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgS2FybCBTVEVJTlxyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XHJcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcclxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xyXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXHJcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xyXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4gKlxyXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcclxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuICpcclxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcclxuICogU09GVFdBUkUuXHJcbiAqXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtNb25nb30gZnJvbSAnbWV0ZW9yL21vbmdvJztcclxuXHJcbi8qKlxyXG4gKiBDb2xsZWN0aW9uIG9mIHVwbG9hZCB0b2tlbnNcclxuICogQHR5cGUge01vbmdvLkNvbGxlY3Rpb259XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVG9rZW5zID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oJ3Vmc1Rva2VucycpO1xyXG4iLCIvKlxyXG4gKiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDE3IEthcmwgU1RFSU5cclxuICpcclxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuICpcclxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXHJcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcclxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXHJcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxyXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXHJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXHJcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXHJcbiAqIFNPRlRXQVJFLlxyXG4gKlxyXG4gKi9cclxuXHJcbmltcG9ydCB7X30gZnJvbSAnbWV0ZW9yL3VuZGVyc2NvcmUnO1xyXG5pbXBvcnQge01ldGVvcn0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XHJcbmltcG9ydCB7U3RvcmV9IGZyb20gJy4vdWZzLXN0b3JlJztcclxuXHJcblxyXG4vKipcclxuICogRmlsZSB1cGxvYWRlclxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFVwbG9hZGVyIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICAvLyBTZXQgZGVmYXVsdCBvcHRpb25zXHJcbiAgICAgICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHtcclxuICAgICAgICAgICAgYWRhcHRpdmU6IHRydWUsXHJcbiAgICAgICAgICAgIGNhcGFjaXR5OiAwLjksXHJcbiAgICAgICAgICAgIGNodW5rU2l6ZTogMTYgKiAxMDI0LFxyXG4gICAgICAgICAgICBkYXRhOiBudWxsLFxyXG4gICAgICAgICAgICBmaWxlOiBudWxsLFxyXG4gICAgICAgICAgICBtYXhDaHVua1NpemU6IDQgKiAxMDI0ICogMTAwMCxcclxuICAgICAgICAgICAgbWF4VHJpZXM6IDUsXHJcbiAgICAgICAgICAgIG9uQWJvcnQ6IHRoaXMub25BYm9ydCxcclxuICAgICAgICAgICAgb25Db21wbGV0ZTogdGhpcy5vbkNvbXBsZXRlLFxyXG4gICAgICAgICAgICBvbkNyZWF0ZTogdGhpcy5vbkNyZWF0ZSxcclxuICAgICAgICAgICAgb25FcnJvcjogdGhpcy5vbkVycm9yLFxyXG4gICAgICAgICAgICBvblByb2dyZXNzOiB0aGlzLm9uUHJvZ3Jlc3MsXHJcbiAgICAgICAgICAgIG9uU3RhcnQ6IHRoaXMub25TdGFydCxcclxuICAgICAgICAgICAgb25TdG9wOiB0aGlzLm9uU3RvcCxcclxuICAgICAgICAgICAgcmV0cnlEZWxheTogMjAwMCxcclxuICAgICAgICAgICAgc3RvcmU6IG51bGwsXHJcbiAgICAgICAgICAgIHRyYW5zZmVyRGVsYXk6IDEwMFxyXG4gICAgICAgIH0sIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICAvLyBDaGVjayBvcHRpb25zXHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmFkYXB0aXZlICE9PSAnYm9vbGVhbicpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYWRhcHRpdmUgaXMgbm90IGEgbnVtYmVyJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5jYXBhY2l0eSAhPT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignY2FwYWNpdHkgaXMgbm90IGEgbnVtYmVyJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvcHRpb25zLmNhcGFjaXR5IDw9IDAgfHwgb3B0aW9ucy5jYXBhY2l0eSA+IDEpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ2NhcGFjaXR5IG11c3QgYmUgYSBmbG9hdCBiZXR3ZWVuIDAuMSBhbmQgMS4wJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5jaHVua1NpemUgIT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2NodW5rU2l6ZSBpcyBub3QgYSBudW1iZXInKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCEob3B0aW9ucy5kYXRhIGluc3RhbmNlb2YgQmxvYikgJiYgIShvcHRpb25zLmRhdGEgaW5zdGFuY2VvZiBGaWxlKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdkYXRhIGlzIG5vdCBhbiBCbG9iIG9yIEZpbGUnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG9wdGlvbnMuZmlsZSA9PT0gbnVsbCB8fCB0eXBlb2Ygb3B0aW9ucy5maWxlICE9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdmaWxlIGlzIG5vdCBhbiBvYmplY3QnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLm1heENodW5rU2l6ZSAhPT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignbWF4Q2h1bmtTaXplIGlzIG5vdCBhIG51bWJlcicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMubWF4VHJpZXMgIT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ21heFRyaWVzIGlzIG5vdCBhIG51bWJlcicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMucmV0cnlEZWxheSAhPT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigncmV0cnlEZWxheSBpcyBub3QgYSBudW1iZXInKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLnRyYW5zZmVyRGVsYXkgIT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3RyYW5zZmVyRGVsYXkgaXMgbm90IGEgbnVtYmVyJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5vbkFib3J0ICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29uQWJvcnQgaXMgbm90IGEgZnVuY3Rpb24nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLm9uQ29tcGxldGUgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb25Db21wbGV0ZSBpcyBub3QgYSBmdW5jdGlvbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMub25DcmVhdGUgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb25DcmVhdGUgaXMgbm90IGEgZnVuY3Rpb24nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLm9uRXJyb3IgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb25FcnJvciBpcyBub3QgYSBmdW5jdGlvbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMub25Qcm9ncmVzcyAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvblByb2dyZXNzIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5vblN0YXJ0ICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29uU3RhcnQgaXMgbm90IGEgZnVuY3Rpb24nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLm9uU3RvcCAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvblN0b3AgaXMgbm90IGEgZnVuY3Rpb24nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLnN0b3JlICE9PSAnc3RyaW5nJyAmJiAhKG9wdGlvbnMuc3RvcmUgaW5zdGFuY2VvZiBTdG9yZSkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignc3RvcmUgbXVzdCBiZSB0aGUgbmFtZSBvZiB0aGUgc3RvcmUgb3IgYW4gaW5zdGFuY2Ugb2YgVXBsb2FkRlMuU3RvcmUnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFB1YmxpYyBhdHRyaWJ1dGVzXHJcbiAgICAgICAgc2VsZi5hZGFwdGl2ZSA9IG9wdGlvbnMuYWRhcHRpdmU7XHJcbiAgICAgICAgc2VsZi5jYXBhY2l0eSA9IHBhcnNlRmxvYXQob3B0aW9ucy5jYXBhY2l0eSk7XHJcbiAgICAgICAgc2VsZi5jaHVua1NpemUgPSBwYXJzZUludChvcHRpb25zLmNodW5rU2l6ZSk7XHJcbiAgICAgICAgc2VsZi5tYXhDaHVua1NpemUgPSBwYXJzZUludChvcHRpb25zLm1heENodW5rU2l6ZSk7XHJcbiAgICAgICAgc2VsZi5tYXhUcmllcyA9IHBhcnNlSW50KG9wdGlvbnMubWF4VHJpZXMpO1xyXG4gICAgICAgIHNlbGYucmV0cnlEZWxheSA9IHBhcnNlSW50KG9wdGlvbnMucmV0cnlEZWxheSk7XHJcbiAgICAgICAgc2VsZi50cmFuc2ZlckRlbGF5ID0gcGFyc2VJbnQob3B0aW9ucy50cmFuc2ZlckRlbGF5KTtcclxuICAgICAgICBzZWxmLm9uQWJvcnQgPSBvcHRpb25zLm9uQWJvcnQ7XHJcbiAgICAgICAgc2VsZi5vbkNvbXBsZXRlID0gb3B0aW9ucy5vbkNvbXBsZXRlO1xyXG4gICAgICAgIHNlbGYub25DcmVhdGUgPSBvcHRpb25zLm9uQ3JlYXRlO1xyXG4gICAgICAgIHNlbGYub25FcnJvciA9IG9wdGlvbnMub25FcnJvcjtcclxuICAgICAgICBzZWxmLm9uUHJvZ3Jlc3MgPSBvcHRpb25zLm9uUHJvZ3Jlc3M7XHJcbiAgICAgICAgc2VsZi5vblN0YXJ0ID0gb3B0aW9ucy5vblN0YXJ0O1xyXG4gICAgICAgIHNlbGYub25TdG9wID0gb3B0aW9ucy5vblN0b3A7XHJcblxyXG4gICAgICAgIC8vIFByaXZhdGUgYXR0cmlidXRlc1xyXG4gICAgICAgIGxldCBzdG9yZSA9IG9wdGlvbnMuc3RvcmU7XHJcbiAgICAgICAgbGV0IGRhdGEgPSBvcHRpb25zLmRhdGE7XHJcbiAgICAgICAgbGV0IGNhcGFjaXR5TWFyZ2luID0gMC4xO1xyXG4gICAgICAgIGxldCBmaWxlID0gb3B0aW9ucy5maWxlO1xyXG4gICAgICAgIGxldCBmaWxlSWQgPSBudWxsO1xyXG4gICAgICAgIGxldCBvZmZzZXQgPSAwO1xyXG4gICAgICAgIGxldCBsb2FkZWQgPSAwO1xyXG4gICAgICAgIGxldCB0b3RhbCA9IGRhdGEuc2l6ZTtcclxuICAgICAgICBsZXQgdHJpZXMgPSAwO1xyXG4gICAgICAgIGxldCBwb3N0VXJsID0gbnVsbDtcclxuICAgICAgICBsZXQgdG9rZW4gPSBudWxsO1xyXG4gICAgICAgIGxldCBjb21wbGV0ZSA9IGZhbHNlO1xyXG4gICAgICAgIGxldCB1cGxvYWRpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IHRpbWVBID0gbnVsbDtcclxuICAgICAgICBsZXQgdGltZUIgPSBudWxsO1xyXG5cclxuICAgICAgICBsZXQgZWxhcHNlZFRpbWUgPSAwO1xyXG4gICAgICAgIGxldCBzdGFydFRpbWUgPSAwO1xyXG5cclxuICAgICAgICAvLyBLZWVwIG9ubHkgdGhlIG5hbWUgb2YgdGhlIHN0b3JlXHJcbiAgICAgICAgaWYgKHN0b3JlIGluc3RhbmNlb2YgU3RvcmUpIHtcclxuICAgICAgICAgICAgc3RvcmUgPSBzdG9yZS5nZXROYW1lKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBc3NpZ24gZmlsZSB0byBzdG9yZVxyXG4gICAgICAgIGZpbGUuc3RvcmUgPSBzdG9yZTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZmluaXNoKCkge1xyXG4gICAgICAgICAgICAvLyBGaW5pc2ggdGhlIHVwbG9hZCBieSB0ZWxsaW5nIHRoZSBzdG9yZSB0aGUgdXBsb2FkIGlzIGNvbXBsZXRlXHJcbiAgICAgICAgICAgIE1ldGVvci5jYWxsKCd1ZnNDb21wbGV0ZScsIGZpbGVJZCwgc3RvcmUsIHRva2VuLCBmdW5jdGlvbiAoZXJyLCB1cGxvYWRlZEZpbGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLm9uRXJyb3IoZXJyLCBmaWxlKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmFib3J0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh1cGxvYWRlZEZpbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB1cGxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZSA9IHVwbG9hZGVkRmlsZTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLm9uQ29tcGxldGUodXBsb2FkZWRGaWxlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBYm9ydHMgdGhlIGN1cnJlbnQgdHJhbnNmZXJcclxuICAgICAgICAgKi9cclxuICAgICAgICBzZWxmLmFib3J0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBSZW1vdmUgdGhlIGZpbGUgZnJvbSBkYXRhYmFzZVxyXG4gICAgICAgICAgICBNZXRlb3IuY2FsbCgndWZzRGVsZXRlJywgZmlsZUlkLCBzdG9yZSwgdG9rZW4sIGZ1bmN0aW9uIChlcnIsIHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYub25FcnJvcihlcnIsIGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlc2V0IHVwbG9hZGVyIHN0YXR1c1xyXG4gICAgICAgICAgICB1cGxvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgZmlsZUlkID0gbnVsbDtcclxuICAgICAgICAgICAgb2Zmc2V0ID0gMDtcclxuICAgICAgICAgICAgdHJpZXMgPSAwO1xyXG4gICAgICAgICAgICBsb2FkZWQgPSAwO1xyXG4gICAgICAgICAgICBjb21wbGV0ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBzdGFydFRpbWUgPSBudWxsO1xyXG4gICAgICAgICAgICBzZWxmLm9uQWJvcnQoZmlsZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgYXZlcmFnZSBzcGVlZCBpbiBieXRlcyBwZXIgc2Vjb25kXHJcbiAgICAgICAgICogQHJldHVybnMge251bWJlcn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBzZWxmLmdldEF2ZXJhZ2VTcGVlZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IHNlY29uZHMgPSBzZWxmLmdldEVsYXBzZWRUaW1lKCkgLyAxMDAwO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VsZi5nZXRMb2FkZWQoKSAvIHNlY29uZHM7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgZWxhcHNlZCB0aW1lIGluIG1pbGxpc2Vjb25kc1xyXG4gICAgICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc2VsZi5nZXRFbGFwc2VkVGltZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHN0YXJ0VGltZSAmJiBzZWxmLmlzVXBsb2FkaW5nKCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbGFwc2VkVGltZSArIChEYXRlLm5vdygpIC0gc3RhcnRUaW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZWxhcHNlZFRpbWU7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgZmlsZVxyXG4gICAgICAgICAqIEByZXR1cm4ge29iamVjdH1cclxuICAgICAgICAgKi9cclxuICAgICAgICBzZWxmLmdldEZpbGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmaWxlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIGxvYWRlZCBieXRlc1xyXG4gICAgICAgICAqIEByZXR1cm4ge251bWJlcn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBzZWxmLmdldExvYWRlZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGxvYWRlZDtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIGN1cnJlbnQgcHJvZ3Jlc3NcclxuICAgICAgICAgKiBAcmV0dXJuIHtudW1iZXJ9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc2VsZi5nZXRQcm9ncmVzcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGgubWluKChsb2FkZWQgLyB0b3RhbCkgKiAxMDAgLyAxMDAsIDEuMCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgcmVtYWluaW5nIHRpbWUgaW4gbWlsbGlzZWNvbmRzXHJcbiAgICAgICAgICogQHJldHVybnMge251bWJlcn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBzZWxmLmdldFJlbWFpbmluZ1RpbWUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGxldCBhdmVyYWdlU3BlZWQgPSBzZWxmLmdldEF2ZXJhZ2VTcGVlZCgpO1xyXG4gICAgICAgICAgICBsZXQgcmVtYWluaW5nQnl0ZXMgPSB0b3RhbCAtIHNlbGYuZ2V0TG9hZGVkKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBhdmVyYWdlU3BlZWQgJiYgcmVtYWluaW5nQnl0ZXMgPyBNYXRoLm1heChyZW1haW5pbmdCeXRlcyAvIGF2ZXJhZ2VTcGVlZCwgMCkgOiAwO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIHVwbG9hZCBzcGVlZCBpbiBieXRlcyBwZXIgc2Vjb25kXHJcbiAgICAgICAgICogQHJldHVybnMge251bWJlcn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBzZWxmLmdldFNwZWVkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAodGltZUEgJiYgdGltZUIgJiYgc2VsZi5pc1VwbG9hZGluZygpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2Vjb25kcyA9ICh0aW1lQiAtIHRpbWVBKSAvIDEwMDA7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5jaHVua1NpemUgLyBzZWNvbmRzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIHRvdGFsIGJ5dGVzXHJcbiAgICAgICAgICogQHJldHVybiB7bnVtYmVyfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHNlbGYuZ2V0VG90YWwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0b3RhbDtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDaGVja3MgaWYgdGhlIHRyYW5zZmVyIGlzIGNvbXBsZXRlXHJcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBzZWxmLmlzQ29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjb21wbGV0ZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDaGVja3MgaWYgdGhlIHRyYW5zZmVyIGlzIGFjdGl2ZVxyXG4gICAgICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc2VsZi5pc1VwbG9hZGluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHVwbG9hZGluZztcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZWFkcyBhIHBvcnRpb24gb2YgZmlsZVxyXG4gICAgICAgICAqIEBwYXJhbSBzdGFydFxyXG4gICAgICAgICAqIEBwYXJhbSBsZW5ndGhcclxuICAgICAgICAgKiBAcGFyYW0gY2FsbGJhY2tcclxuICAgICAgICAgKiBAcmV0dXJucyB7QmxvYn1cclxuICAgICAgICAgKi9cclxuICAgICAgICBzZWxmLnJlYWRDaHVuayA9IGZ1bmN0aW9uIChzdGFydCwgbGVuZ3RoLCBjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigncmVhZENodW5rIGlzIG1pc3NpbmcgY2FsbGJhY2snKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGVuZDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGNodW5rIHNpemVcclxuICAgICAgICAgICAgICAgIGlmIChsZW5ndGggJiYgc3RhcnQgKyBsZW5ndGggPiB0b3RhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IHRvdGFsO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBlbmQgPSBzdGFydCArIGxlbmd0aDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIEdldCBjaHVua1xyXG4gICAgICAgICAgICAgICAgbGV0IGNodW5rID0gZGF0YS5zbGljZShzdGFydCwgZW5kKTtcclxuICAgICAgICAgICAgICAgIC8vIFBhc3MgY2h1bmsgdG8gY2FsbGJhY2tcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoc2VsZiwgbnVsbCwgY2h1bmspO1xyXG5cclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdyZWFkIGVycm9yJywgZXJyKTtcclxuICAgICAgICAgICAgICAgIC8vIFJldHJ5IHRvIHJlYWQgY2h1bmtcclxuICAgICAgICAgICAgICAgIE1ldGVvci5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJpZXMgPCBzZWxmLm1heFRyaWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyaWVzICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucmVhZENodW5rKHN0YXJ0LCBsZW5ndGgsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCBzZWxmLnJldHJ5RGVsYXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VuZHMgYSBmaWxlIGNodW5rIHRvIHRoZSBzdG9yZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHNlbGYuc2VuZENodW5rID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoIWNvbXBsZXRlICYmIHN0YXJ0VGltZSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldCA8IHRvdGFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNodW5rU2l6ZSA9IHNlbGYuY2h1bmtTaXplO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBVc2UgYWRhcHRpdmUgbGVuZ3RoXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYuYWRhcHRpdmUgJiYgdGltZUEgJiYgdGltZUIgJiYgdGltZUIgPiB0aW1lQSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZHVyYXRpb24gPSAodGltZUIgLSB0aW1lQSkgLyAxMDAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWF4ID0gc2VsZi5jYXBhY2l0eSAqICgxICsgY2FwYWNpdHlNYXJnaW4pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWluID0gc2VsZi5jYXBhY2l0eSAqICgxIC0gY2FwYWNpdHlNYXJnaW4pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGR1cmF0aW9uID49IG1heCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtTaXplID0gTWF0aC5hYnMoTWF0aC5yb3VuZChjaHVua1NpemUgKiAobWF4IC0gZHVyYXRpb24pKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGR1cmF0aW9uIDwgbWluKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHVua1NpemUgPSBNYXRoLnJvdW5kKGNodW5rU2l6ZSAqIChtaW4gLyBkdXJhdGlvbikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIExpbWl0IHRvIG1heCBjaHVuayBzaXplXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLm1heENodW5rU2l6ZSA+IDAgJiYgY2h1bmtTaXplID4gc2VsZi5tYXhDaHVua1NpemUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rU2l6ZSA9IHNlbGYubWF4Q2h1bmtTaXplO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBMaW1pdCB0byBtYXggY2h1bmsgc2l6ZVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLm1heENodW5rU2l6ZSA+IDAgJiYgY2h1bmtTaXplID4gc2VsZi5tYXhDaHVua1NpemUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtTaXplID0gc2VsZi5tYXhDaHVua1NpemU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBSZWR1Y2UgY2h1bmsgc2l6ZSB0byBmaXQgdG90YWxcclxuICAgICAgICAgICAgICAgICAgICBpZiAob2Zmc2V0ICsgY2h1bmtTaXplID4gdG90YWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtTaXplID0gdG90YWwgLSBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBQcmVwYXJlIHRoZSBjaHVua1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYucmVhZENodW5rKG9mZnNldCwgY2h1bmtTaXplLCBmdW5jdGlvbiAoZXJyLCBjaHVuaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLm9uRXJyb3IoZXJyLCBmaWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF8uY29udGFpbnMoWzIwMCwgMjAxLCAyMDIsIDIwNF0sIHhoci5zdGF0dXMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVCID0gRGF0ZS5ub3coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ICs9IGNodW5rU2l6ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGVkICs9IGNodW5rU2l6ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNlbmQgbmV4dCBjaHVua1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLm9uUHJvZ3Jlc3MoZmlsZSwgc2VsZi5nZXRQcm9ncmVzcygpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpbmlzaCB1cGxvYWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvYWRlZCA+PSB0b3RhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxhcHNlZFRpbWUgPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmluaXNoKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNZXRlb3Iuc2V0VGltZW91dChzZWxmLnNlbmRDaHVuaywgc2VsZi50cmFuc2ZlckRlbGF5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICghXy5jb250YWlucyhbNDAyLCA0MDMsIDQwNCwgNTAwXSwgeGhyLnN0YXR1cykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmV0cnkgdW50aWwgbWF4IHRyaWVzIGlzIHJlYWNoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJ1dCBkb24ndCByZXRyeSBpZiB0aGVzZSBlcnJvcnMgb2NjdXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRyaWVzIDw9IHNlbGYubWF4VHJpZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyaWVzICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXYWl0IGJlZm9yZSByZXRyeWluZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWV0ZW9yLnNldFRpbWVvdXQoc2VsZi5zZW5kQ2h1bmssIHNlbGYucmV0cnlEZWxheSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFib3J0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWJvcnQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgdXBsb2FkIHByb2dyZXNzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwcm9ncmVzcyA9IChvZmZzZXQgKyBjaHVua1NpemUpIC8gdG90YWw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxldCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmb3JtRGF0YS5hcHBlbmQoJ3Byb2dyZXNzJywgcHJvZ3Jlc3MpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmb3JtRGF0YS5hcHBlbmQoJ2NodW5rJywgY2h1bmspO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdXJsID0gYCR7cG9zdFVybH0mcHJvZ3Jlc3M9JHtwcm9ncmVzc31gO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZUEgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lQiA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwbG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTZW5kIGNodW5rIHRvIHRoZSBzdG9yZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIub3BlbignUE9TVCcsIHVybCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhoci5zZW5kKGNodW5rKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFN0YXJ0cyBvciByZXN1bWVzIHRoZSB0cmFuc2ZlclxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHNlbGYuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghZmlsZUlkKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgdGhlIGZpbGUgZG9jdW1lbnQgYW5kIGdldCB0aGUgdG9rZW5cclxuICAgICAgICAgICAgICAgIC8vIHRoYXQgYWxsb3dzIHRoZSB1c2VyIHRvIHNlbmQgY2h1bmtzIHRvIHRoZSBzdG9yZS5cclxuICAgICAgICAgICAgICAgIE1ldGVvci5jYWxsKCd1ZnNDcmVhdGUnLCBfLmV4dGVuZCh7fSwgZmlsZSksIGZ1bmN0aW9uIChlcnIsIHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5vbkVycm9yKGVyciwgZmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW4gPSByZXN1bHQudG9rZW47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3RVcmwgPSByZXN1bHQudXJsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlSWQgPSByZXN1bHQuZmlsZUlkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLl9pZCA9IHJlc3VsdC5maWxlSWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYub25DcmVhdGUoZmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyaWVzID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5vblN0YXJ0KGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNlbmRDaHVuaygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF1cGxvYWRpbmcgJiYgIWNvbXBsZXRlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBSZXN1bWUgdXBsb2FkaW5nXHJcbiAgICAgICAgICAgICAgICB0cmllcyA9IDA7XHJcbiAgICAgICAgICAgICAgICBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5vblN0YXJ0KGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZW5kQ2h1bmsoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFN0b3BzIHRoZSB0cmFuc2ZlclxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHNlbGYuc3RvcCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHVwbG9hZGluZykge1xyXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGVsYXBzZWQgdGltZVxyXG4gICAgICAgICAgICAgICAgZWxhcHNlZFRpbWUgPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xyXG4gICAgICAgICAgICAgICAgc3RhcnRUaW1lID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHVwbG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5vblN0b3AoZmlsZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgTWV0ZW9yLmNhbGwoJ3Vmc1N0b3AnLCBmaWxlSWQsIHN0b3JlLCB0b2tlbiwgZnVuY3Rpb24gKGVyciwgcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLm9uRXJyb3IoZXJyLCBmaWxlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsZWQgd2hlbiB0aGUgZmlsZSB1cGxvYWQgaXMgYWJvcnRlZFxyXG4gICAgICogQHBhcmFtIGZpbGVcclxuICAgICAqL1xyXG4gICAgb25BYm9ydChmaWxlKSB7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsZWQgd2hlbiB0aGUgZmlsZSB1cGxvYWQgaXMgY29tcGxldGVcclxuICAgICAqIEBwYXJhbSBmaWxlXHJcbiAgICAgKi9cclxuICAgIG9uQ29tcGxldGUoZmlsZSkge1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsbGVkIHdoZW4gdGhlIGZpbGUgaXMgY3JlYXRlZCBpbiB0aGUgY29sbGVjdGlvblxyXG4gICAgICogQHBhcmFtIGZpbGVcclxuICAgICAqL1xyXG4gICAgb25DcmVhdGUoZmlsZSkge1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsbGVkIHdoZW4gYW4gZXJyb3Igb2NjdXJzIGR1cmluZyBmaWxlIHVwbG9hZFxyXG4gICAgICogQHBhcmFtIGVyclxyXG4gICAgICogQHBhcmFtIGZpbGVcclxuICAgICAqL1xyXG4gICAgb25FcnJvcihlcnIsIGZpbGUpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGB1ZnM6ICR7ZXJyLm1lc3NhZ2V9YCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsZWQgd2hlbiBhIGZpbGUgY2h1bmsgaGFzIGJlZW4gc2VudFxyXG4gICAgICogQHBhcmFtIGZpbGVcclxuICAgICAqIEBwYXJhbSBwcm9ncmVzcyBpcyBhIGZsb2F0IGZyb20gMC4wIHRvIDEuMFxyXG4gICAgICovXHJcbiAgICBvblByb2dyZXNzKGZpbGUsIHByb2dyZXNzKSB7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsZWQgd2hlbiB0aGUgZmlsZSB1cGxvYWQgc3RhcnRzXHJcbiAgICAgKiBAcGFyYW0gZmlsZVxyXG4gICAgICovXHJcbiAgICBvblN0YXJ0KGZpbGUpIHtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGxlZCB3aGVuIHRoZSBmaWxlIHVwbG9hZCBzdG9wc1xyXG4gICAgICogQHBhcmFtIGZpbGVcclxuICAgICAqL1xyXG4gICAgb25TdG9wKGZpbGUpIHtcclxuICAgIH1cclxufVxyXG4iXX0=
