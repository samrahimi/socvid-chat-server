(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var _ = Package.underscore._;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var options;

var require = meteorInstall({"node_modules":{"meteor":{"jalik:ufs-gridfs":{"ufs-gridfs.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////
//                                                                                    //
// packages/jalik_ufs-gridfs/ufs-gridfs.js                                            //
//                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////
                                                                                      //
module.export({
  GridFSStore: () => GridFSStore
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
let UploadFS;
module.link("meteor/jalik:ufs", {
  UploadFS(v) {
    UploadFS = v;
  }

}, 3);

class GridFSStore extends UploadFS.Store {
  constructor(options) {
    // Default options
    options = _.extend({
      chunkSize: 1024 * 255,
      collectionName: 'uploadfs'
    }, options); // Check options

    if (typeof options.chunkSize !== "number") {
      throw new TypeError("GridFSStore: chunkSize is not a number");
    }

    if (typeof options.collectionName !== "string") {
      throw new TypeError("GridFSStore: collectionName is not a string");
    }

    super(options);
    this.chunkSize = options.chunkSize;
    this.collectionName = options.collectionName;

    if (Meteor.isServer) {
      let mongo = Package.mongo.MongoInternals.NpmModule;
      let db = Package.mongo.MongoInternals.defaultRemoteCollectionDriver().mongo.db;
      let mongoStore = new mongo.GridFSBucket(db, {
        bucketName: options.collectionName,
        chunkSizeBytes: options.chunkSize
      });
      /**
       * Removes the file
       * @param fileId
       * @param callback
       */

      this.delete = function (fileId, callback) {
        if (typeof callback !== 'function') {
          callback = function (err) {
            if (err) {
              console.error(err);
            }
          };
        }

        return mongoStore.delete(fileId, callback);
      };
      /**
       * Returns the file read stream
       * @param fileId
       * @param file
       * @param options
       * @return {*}
       */


      this.getReadStream = function (fileId, file, options) {
        options = _.extend({}, options);
        return mongoStore.openDownloadStream(fileId, {
          start: options.start,
          end: options.end
        });
      };
      /**
       * Returns the file write stream
       * @param fileId
       * @param file
       * @param options
       * @return {*}
       */


      this.getWriteStream = function (fileId, file, options) {
        let writeStream = mongoStore.openUploadStreamWithId(fileId, fileId, {
          chunkSizeBytes: this.chunkSize,
          contentType: file.type
        });
        writeStream.on('close', function () {
          writeStream.emit('finish');
        });
        return writeStream;
      };
    }
  }

}

// Add store to UFS namespace
UploadFS.store.GridFS = GridFSStore;
////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/jalik:ufs-gridfs/ufs-gridfs.js");

/* Exports */
Package._define("jalik:ufs-gridfs", exports);

})();

//# sourceURL=meteor://💻app/packages/jalik_ufs-gridfs.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvamFsaWs6dWZzLWdyaWRmcy91ZnMtZ3JpZGZzLmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydCIsIkdyaWRGU1N0b3JlIiwiXyIsImxpbmsiLCJ2IiwiY2hlY2siLCJNZXRlb3IiLCJVcGxvYWRGUyIsIlN0b3JlIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwiZXh0ZW5kIiwiY2h1bmtTaXplIiwiY29sbGVjdGlvbk5hbWUiLCJUeXBlRXJyb3IiLCJpc1NlcnZlciIsIm1vbmdvIiwiUGFja2FnZSIsIk1vbmdvSW50ZXJuYWxzIiwiTnBtTW9kdWxlIiwiZGIiLCJkZWZhdWx0UmVtb3RlQ29sbGVjdGlvbkRyaXZlciIsIm1vbmdvU3RvcmUiLCJHcmlkRlNCdWNrZXQiLCJidWNrZXROYW1lIiwiY2h1bmtTaXplQnl0ZXMiLCJkZWxldGUiLCJmaWxlSWQiLCJjYWxsYmFjayIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsImdldFJlYWRTdHJlYW0iLCJmaWxlIiwib3BlbkRvd25sb2FkU3RyZWFtIiwic3RhcnQiLCJlbmQiLCJnZXRXcml0ZVN0cmVhbSIsIndyaXRlU3RyZWFtIiwib3BlblVwbG9hZFN0cmVhbVdpdGhJZCIsImNvbnRlbnRUeXBlIiwidHlwZSIsIm9uIiwiZW1pdCIsInN0b3JlIiwiR3JpZEZTIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUFBLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjO0FBQUNDLGFBQVcsRUFBQyxNQUFJQTtBQUFqQixDQUFkOztBQUE2QyxJQUFJQyxDQUFKOztBQUFNSCxNQUFNLENBQUNJLElBQVAsQ0FBWSxtQkFBWixFQUFnQztBQUFDRCxHQUFDLENBQUNFLENBQUQsRUFBRztBQUFDRixLQUFDLEdBQUNFLENBQUY7QUFBSTs7QUFBVixDQUFoQyxFQUE0QyxDQUE1QztBQUErQyxJQUFJQyxLQUFKO0FBQVVOLE1BQU0sQ0FBQ0ksSUFBUCxDQUFZLGNB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d0J2QixPQUF4QixFQUFpQztBQUNuRCxZQUFJNEIsV0FBVyxHQUFHaEIsVUFBVSxDQUFDaUIsc0JBQVgsQ0FBa0NaLE1BQWxDLEVBQTBDQSxNQUExQyxFQUFrRDtBQUNoRUYsd0JBQWMsRUFBRSxLQUFLYixTQUQyQztBQUVoRTRCLHFCQUFXLEVBQUVQLElBQUksQ0FBQ1E7QUFGOEMsU0FBbEQsQ0FBbEI7QUFJQUgsbUJBQVcsQ0FBQ0ksRUFBWixDQUFlLE9BQWYsRUFBd0IsWUFBWTtBQUNoQ0oscUJBQVcsQ0FBQ0ssSUFBWixDQUFpQixRQUFqQjtBQUNILFNBRkQ7QUFHQSxlQUFPTCxXQUFQO0FBQ0gsT0FURDtBQVVIO0FBQ0o7O0FBL0UyQzs7QUFrRmhEO0FBQ0EvQixRQUFRLENBQUNxQyxLQUFULENBQWVDLE1BQWYsR0FBd0I1QyxXQUF4QixDIiwiZmlsZSI6Ii9wYWNrYWdlcy9qYWxpa191ZnMtZ3JpZGZzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcclxuICogVGhlIE1JVCBMaWNlbnNlIChNSVQpXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxNyBLYXJsIFNURUlOXHJcbiAqXHJcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcclxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxyXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXHJcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcclxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXHJcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcbiAqXHJcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxyXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG4gKlxyXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXHJcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxyXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcclxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxyXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxyXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxyXG4gKiBTT0ZUV0FSRS5cclxuICpcclxuICovXHJcbmltcG9ydCB7X30gZnJvbSBcIm1ldGVvci91bmRlcnNjb3JlXCI7XHJcbmltcG9ydCB7Y2hlY2t9IGZyb20gXCJtZXRlb3IvY2hlY2tcIjtcclxuaW1wb3J0IHtNZXRlb3J9IGZyb20gXCJtZXRlb3IvbWV0ZW9yXCI7XHJcbmltcG9ydCB7VXBsb2FkRlN9IGZyb20gXCJtZXRlb3IvamFsaWs6dWZzXCI7XHJcblxyXG5cclxuLyoqXHJcbiAqIEdyaWRGUyBzdG9yZVxyXG4gKiBAcGFyYW0gb3B0aW9uc1xyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbmV4cG9ydCBjbGFzcyBHcmlkRlNTdG9yZSBleHRlbmRzIFVwbG9hZEZTLlN0b3JlIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XHJcbiAgICAgICAgLy8gRGVmYXVsdCBvcHRpb25zXHJcbiAgICAgICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHtcclxuICAgICAgICAgICAgY2h1bmtTaXplOiAxMDI0ICogMjU1LFxyXG4gICAgICAgICAgICBjb2xsZWN0aW9uTmFtZTogJ3VwbG9hZGZzJ1xyXG4gICAgICAgIH0sIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICAvLyBDaGVjayBvcHRpb25zXHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmNodW5rU2l6ZSAhPT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR3JpZEZTU3RvcmU6IGNodW5rU2l6ZSBpcyBub3QgYSBudW1iZXJcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5jb2xsZWN0aW9uTmFtZSAhPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR3JpZEZTU3RvcmU6IGNvbGxlY3Rpb25OYW1lIGlzIG5vdCBhIHN0cmluZ1wiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN1cGVyKG9wdGlvbnMpO1xyXG5cclxuICAgICAgICB0aGlzLmNodW5rU2l6ZSA9IG9wdGlvbnMuY2h1bmtTaXplO1xyXG4gICAgICAgIHRoaXMuY29sbGVjdGlvbk5hbWUgPSBvcHRpb25zLmNvbGxlY3Rpb25OYW1lO1xyXG5cclxuICAgICAgICBpZiAoTWV0ZW9yLmlzU2VydmVyKSB7XHJcbiAgICAgICAgICAgIGxldCBtb25nbyA9IFBhY2thZ2UubW9uZ28uTW9uZ29JbnRlcm5hbHMuTnBtTW9kdWxlO1xyXG4gICAgICAgICAgICBsZXQgZGIgPSBQYWNrYWdlLm1vbmdvLk1vbmdvSW50ZXJuYWxzLmRlZmF1bHRSZW1vdGVDb2xsZWN0aW9uRHJpdmVyKCkubW9uZ28uZGI7XHJcbiAgICAgICAgICAgIGxldCBtb25nb1N0b3JlID0gbmV3IG1vbmdvLkdyaWRGU0J1Y2tldChkYiwge1xyXG4gICAgICAgICAgICAgICAgYnVja2V0TmFtZTogb3B0aW9ucy5jb2xsZWN0aW9uTmFtZSxcclxuICAgICAgICAgICAgICAgIGNodW5rU2l6ZUJ5dGVzOiBvcHRpb25zLmNodW5rU2l6ZVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBSZW1vdmVzIHRoZSBmaWxlXHJcbiAgICAgICAgICAgICAqIEBwYXJhbSBmaWxlSWRcclxuICAgICAgICAgICAgICogQHBhcmFtIGNhbGxiYWNrXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICB0aGlzLmRlbGV0ZSA9IGZ1bmN0aW9uIChmaWxlSWQsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBtb25nb1N0b3JlLmRlbGV0ZShmaWxlSWQsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBSZXR1cm5zIHRoZSBmaWxlIHJlYWQgc3RyZWFtXHJcbiAgICAgICAgICAgICAqIEBwYXJhbSBmaWxlSWRcclxuICAgICAgICAgICAgICogQHBhcmFtIGZpbGVcclxuICAgICAgICAgICAgICogQHBhcmFtIG9wdGlvbnNcclxuICAgICAgICAgICAgICogQHJldHVybiB7Kn1cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0UmVhZFN0cmVhbSA9IGZ1bmN0aW9uIChmaWxlSWQsIGZpbGUsIG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSBfLmV4dGVuZCh7fSwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbW9uZ29TdG9yZS5vcGVuRG93bmxvYWRTdHJlYW0oZmlsZUlkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IG9wdGlvbnMuc3RhcnQsXHJcbiAgICAgICAgICAgICAgICAgICAgZW5kOiBvcHRpb25zLmVuZFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICogUmV0dXJucyB0aGUgZmlsZSB3cml0ZSBzdHJlYW1cclxuICAgICAgICAgICAgICogQHBhcmFtIGZpbGVJZFxyXG4gICAgICAgICAgICAgKiBAcGFyYW0gZmlsZVxyXG4gICAgICAgICAgICAgKiBAcGFyYW0gb3B0aW9uc1xyXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHsqfVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgdGhpcy5nZXRXcml0ZVN0cmVhbSA9IGZ1bmN0aW9uIChmaWxlSWQsIGZpbGUsIG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIGxldCB3cml0ZVN0cmVhbSA9IG1vbmdvU3RvcmUub3BlblVwbG9hZFN0cmVhbVdpdGhJZChmaWxlSWQsIGZpbGVJZCwge1xyXG4gICAgICAgICAgICAgICAgICAgIGNodW5rU2l6ZUJ5dGVzOiB0aGlzLmNodW5rU2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICBjb250ZW50VHlwZTogZmlsZS50eXBlXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHdyaXRlU3RyZWFtLm9uKCdjbG9zZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB3cml0ZVN0cmVhbS5lbWl0KCdmaW5pc2gnKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHdyaXRlU3RyZWFtO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLy8gQWRkIHN0b3JlIHRvIFVGUyBuYW1lc3BhY2VcclxuVXBsb2FkRlMuc3RvcmUuR3JpZEZTID0gR3JpZEZTU3RvcmU7XHJcbiJdfQ==
