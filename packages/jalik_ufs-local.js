(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var check = Package.check.check;
var Match = Package.check.Match;
var ECMAScript = Package.ecmascript.ECMAScript;
var _ = Package.underscore._;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var options, file;

var require = meteorInstall({"node_modules":{"meteor":{"jalik:ufs-local":{"ufs-local.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/jalik_ufs-local/ufs-local.js                                                                    //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
module.export({
  LocalStore: () => LocalStore
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

class LocalStore extends UploadFS.Store {
  constructor(options) {
    // Default options
    options = _.extend({
      mode: '0744',
      path: 'ufs/uploads',
      writeMode: '0744'
    }, options); // Check options

    if (typeof options.mode !== "string") {
      throw new TypeError("LocalStore: mode is not a string");
    }

    if (typeof options.path !== "string") {
      throw new TypeError("LocalStore: path is not a string");
    }

    if (typeof options.writeMode !== "string") {
      throw new TypeError("LocalStore: writeMode is not a string");
    }

    super(options);
    let self = this; // Private attributes

    let mode = options.mode;
    let path = options.path;
    let writeMode = options.writeMode;

    if (Meteor.isServer) {
      const fs = Npm.require('fs');

      fs.stat(path, function (err) {
        if (err) {
          const mkdirp = Npm.require('mkdirp'); // Create the directory


          mkdirp(path, {
            mode: mode
          }, function (err) {
            if (err) {
              console.error(`LocalStore: cannot create store at ${path} (${err.message})`);
            } else {
              console.info(`LocalStore: store created at ${path}`);
            }
          });
        } else {
          // Set directory permissions
          fs.chmod(path, mode, function (err) {
            err && console.error(`LocalStore: cannot set store permissions ${mode} (${err.message})`);
          });
        }
      });
    }
    /**
     * Returns the path or sub path
     * @param file
     * @return {string}
     */


    this.getPath = function (file) {
      return path + (file ? `/${file}` : '');
    };

    if (Meteor.isServer) {
      /**
       * Removes the file
       * @param fileId
       * @param callback
       */
      this.delete = function (fileId, callback) {
        let path = this.getFilePath(fileId);

        if (typeof callback !== 'function') {
          callback = function (err) {
            err && console.error(`LocalStore: cannot delete file "${fileId}" at ${path} (${err.message})`);
          };
        }

        const fs = Npm.require('fs');

        fs.stat(path, Meteor.bindEnvironment(function (err, stat) {
          if (!err && stat && stat.isFile()) {
            fs.unlink(path, Meteor.bindEnvironment(function () {
              self.getCollection().remove(fileId);
              callback.call(self);
            }));
          }
        }));
      };
      /**
       * Returns the file read stream
       * @param fileId
       * @param file
       * @param options
       * @return {*}
       */


      this.getReadStream = function (fileId, file, options) {
        const fs = Npm.require('fs');

        options = _.extend({}, options);
        return fs.createReadStream(self.getFilePath(fileId, file), {
          flags: 'r',
          encoding: null,
          autoClose: true,
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
        const fs = Npm.require('fs');

        options = _.extend({}, options);
        return fs.createWriteStream(self.getFilePath(fileId, file), {
          flags: 'a',
          encoding: null,
          mode: writeMode,
          start: options.start
        });
      };
    }
  }
  /**
   * Returns the file path
   * @param fileId
   * @param file
   * @return {string}
   */


  getFilePath(fileId, file) {
    file = file || this.getCollection().findOne(fileId, {
      fields: {
        extension: 1
      }
    });
    return file && this.getPath(fileId + (file.extension ? `.${file.extension}` : ''));
  }

}

// Add store to UFS namespace
UploadFS.store.Local = LocalStore;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/jalik:ufs-local/ufs-local.js");

/* Exports */
Package._define("jalik:ufs-local", exports);

})();

//# sourceURL=meteor://💻app/packages/jalik_ufs-local.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvamFsaWs6dWZzLWxvY2FsL3Vmcy1sb2NhbC5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnQiLCJMb2NhbFN0b3JlIiwiXyIsImxpbmsiLCJ2IiwiY2hlY2siLCJNZXRlb3IiLCJVcGxvYWRGUyIsIlN0b3JlIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwiZXh0ZW5kIiwibW9kZSIsInBhdGgiLCJ3cml0ZU1vZGUiLCJUeXBlRXJyb3IiLCJzZWxmIiwiaXNTZXJ2ZXIiLCJmcyIsIk5wbSIsInJlcXVpcmUiLCJzdGF0IiwiZXJyIiwibWtkaXJwIiwiY29uc29sZSIsImVycm9yIiwibWVzc2FnZSIsImluZm8iLCJjaG1vZCIsImdldFBhdGgiLCJmaWxlIiwiZGVsZXRlIiwiZmlsZUlkIiwiY2FsbGJhY2siLCJnZXRGaWxlUGF0aCIsImJpbmRFbnZpcm9ubWVudCIsImlzRmlsZSIsInVubGluayIsImdldENvbGxlY3Rpb24iLCJyZW1vdmUiLCJjYWxsIiwiZ2V0UmVhZFN0cmVhbSIsImNyZWF0ZVJlYWRTdHJlYW0iLCJmbGFncyIsImVuY29kaW5nIiwiYXV0b0Nsb3NlIiwic3RhcnQiLCJlbmQiLCJnZXRXcml0ZVN0cmVhbSIsImNyZWF0ZVdyaXRlU3RyZWFtIiwiZmluZE9uZSIsImZpZWxkcyIsImV4dGVuc2lvbiIsInN0b3JlIiwiTG9jYWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQUEsTUFBTSxDQUFDQyxNQUFQLENBQWM7QUFBQ0MsWUFBVSxFQUFDLE1BQUlBO0FBQWhCLENBQWQ7O0FBQTJDLElBQUlDLENBQUo7O0FBQU1ILE1BQU0sQ0FBQ0ksSUFBUCxDQUFZLG1CQUFaLEVBQWdDO0FBQUNELEdBQUMsQ0FBQ0UsQ0FBRCxFQUFHO0FBQUNGLEtBQUMsR0FBQ0UsQ0FBRjtBQUFJOztBQUFWLENBQWhDLEVBQTRDLENBQTVDO0FBQStDLElBQUlDLEtBQUo7QUFBVU4sTUFB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Q0FBNkJsQixNQUE3QixFQUFxQztBQUFDbUIsWUFBTSxFQUFFO0FBQUNDLGlCQUFTLEVBQUU7QUFBWjtBQUFULEtBQXJDLENBQWY7QUFDQSxXQUFPdEIsSUFBSSxJQUFJLEtBQUtELE9BQUwsQ0FBYUcsTUFBTSxJQUFJRixJQUFJLENBQUNzQixTQUFMLEdBQWtCLElBQUd0QixJQUFJLENBQUNzQixTQUFXLEVBQXJDLEdBQXlDLEVBQTdDLENBQW5CLENBQWY7QUFDSDs7QUF4STBDOztBQTJJL0M7QUFDQTdDLFFBQVEsQ0FBQzhDLEtBQVQsQ0FBZUMsS0FBZixHQUF1QnJELFVBQXZCLEMiLCJmaWxlIjoiL3BhY2thZ2VzL2phbGlrX3Vmcy1sb2NhbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgS2FybCBTVEVJTlxuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICogU09GVFdBUkUuXG4gKlxuICovXG5cbmltcG9ydCB7X30gZnJvbSAnbWV0ZW9yL3VuZGVyc2NvcmUnO1xuaW1wb3J0IHtjaGVja30gZnJvbSAnbWV0ZW9yL2NoZWNrJztcbmltcG9ydCB7TWV0ZW9yfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7VXBsb2FkRlN9IGZyb20gJ21ldGVvci9qYWxpazp1ZnMnO1xuXG5cbi8qKlxuICogRmlsZSBzeXN0ZW0gc3RvcmVcbiAqIEBwYXJhbSBvcHRpb25zXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZXhwb3J0IGNsYXNzIExvY2FsU3RvcmUgZXh0ZW5kcyBVcGxvYWRGUy5TdG9yZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIC8vIERlZmF1bHQgb3B0aW9uc1xuICAgICAgICBvcHRpb25zID0gXy5leHRlbmQoe1xuICAgICAgICAgICAgbW9kZTogJzA3NDQnLFxuICAgICAgICAgICAgcGF0aDogJ3Vmcy91cGxvYWRzJyxcbiAgICAgICAgICAgIHdyaXRlTW9kZTogJzA3NDQnXG4gICAgICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgICAgIC8vIENoZWNrIG9wdGlvbnNcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLm1vZGUgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJMb2NhbFN0b3JlOiBtb2RlIGlzIG5vdCBhIHN0cmluZ1wiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMucGF0aCAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkxvY2FsU3RvcmU6IHBhdGggaXMgbm90IGEgc3RyaW5nXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy53cml0ZU1vZGUgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJMb2NhbFN0b3JlOiB3cml0ZU1vZGUgaXMgbm90IGEgc3RyaW5nXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3VwZXIob3B0aW9ucyk7XG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgICAgICAvLyBQcml2YXRlIGF0dHJpYnV0ZXNcbiAgICAgICAgbGV0IG1vZGUgPSBvcHRpb25zLm1vZGU7XG4gICAgICAgIGxldCBwYXRoID0gb3B0aW9ucy5wYXRoO1xuICAgICAgICBsZXQgd3JpdGVNb2RlID0gb3B0aW9ucy53cml0ZU1vZGU7XG5cbiAgICAgICAgaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICAgICAgICAgICAgY29uc3QgZnMgPSBOcG0ucmVxdWlyZSgnZnMnKTtcblxuICAgICAgICAgICAgZnMuc3RhdChwYXRoLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBta2RpcnAgPSBOcG0ucmVxdWlyZSgnbWtkaXJwJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBkaXJlY3RvcnlcbiAgICAgICAgICAgICAgICAgICAgbWtkaXJwKHBhdGgsIHttb2RlOiBtb2RlfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYExvY2FsU3RvcmU6IGNhbm5vdCBjcmVhdGUgc3RvcmUgYXQgJHtwYXRofSAoJHtlcnIubWVzc2FnZX0pYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgTG9jYWxTdG9yZTogc3RvcmUgY3JlYXRlZCBhdCAke3BhdGh9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNldCBkaXJlY3RvcnkgcGVybWlzc2lvbnNcbiAgICAgICAgICAgICAgICAgICAgZnMuY2htb2QocGF0aCwgbW9kZSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyICYmIGNvbnNvbGUuZXJyb3IoYExvY2FsU3RvcmU6IGNhbm5vdCBzZXQgc3RvcmUgcGVybWlzc2lvbnMgJHttb2RlfSAoJHtlcnIubWVzc2FnZX0pYCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgdGhlIHBhdGggb3Igc3ViIHBhdGhcbiAgICAgICAgICogQHBhcmFtIGZpbGVcbiAgICAgICAgICogQHJldHVybiB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5nZXRQYXRoID0gZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXRoICsgKGZpbGUgPyBgLyR7ZmlsZX1gIDogJycpO1xuICAgICAgICB9O1xuXG5cbiAgICAgICAgaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBSZW1vdmVzIHRoZSBmaWxlXG4gICAgICAgICAgICAgKiBAcGFyYW0gZmlsZUlkXG4gICAgICAgICAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5kZWxldGUgPSBmdW5jdGlvbiAoZmlsZUlkLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGxldCBwYXRoID0gdGhpcy5nZXRGaWxlUGF0aChmaWxlSWQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVyciAmJiBjb25zb2xlLmVycm9yKGBMb2NhbFN0b3JlOiBjYW5ub3QgZGVsZXRlIGZpbGUgXCIke2ZpbGVJZH1cIiBhdCAke3BhdGh9ICgke2Vyci5tZXNzYWdlfSlgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBmcyA9IE5wbS5yZXF1aXJlKCdmcycpO1xuICAgICAgICAgICAgICAgIGZzLnN0YXQocGF0aCwgTWV0ZW9yLmJpbmRFbnZpcm9ubWVudChmdW5jdGlvbiAoZXJyLCBzdGF0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZXJyICYmIHN0YXQgJiYgc3RhdC5pc0ZpbGUoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnMudW5saW5rKHBhdGgsIE1ldGVvci5iaW5kRW52aXJvbm1lbnQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZ2V0Q29sbGVjdGlvbigpLnJlbW92ZShmaWxlSWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoc2VsZik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFJldHVybnMgdGhlIGZpbGUgcmVhZCBzdHJlYW1cbiAgICAgICAgICAgICAqIEBwYXJhbSBmaWxlSWRcbiAgICAgICAgICAgICAqIEBwYXJhbSBmaWxlXG4gICAgICAgICAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAgICAgICAgICogQHJldHVybiB7Kn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5nZXRSZWFkU3RyZWFtID0gZnVuY3Rpb24gKGZpbGVJZCwgZmlsZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZzID0gTnBtLnJlcXVpcmUoJ2ZzJyk7XG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHt9LCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnMuY3JlYXRlUmVhZFN0cmVhbShzZWxmLmdldEZpbGVQYXRoKGZpbGVJZCwgZmlsZSksIHtcbiAgICAgICAgICAgICAgICAgICAgZmxhZ3M6ICdyJyxcbiAgICAgICAgICAgICAgICAgICAgZW5jb2Rpbmc6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGF1dG9DbG9zZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IG9wdGlvbnMuc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIGVuZDogb3B0aW9ucy5lbmRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUmV0dXJucyB0aGUgZmlsZSB3cml0ZSBzdHJlYW1cbiAgICAgICAgICAgICAqIEBwYXJhbSBmaWxlSWRcbiAgICAgICAgICAgICAqIEBwYXJhbSBmaWxlXG4gICAgICAgICAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAgICAgICAgICogQHJldHVybiB7Kn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy5nZXRXcml0ZVN0cmVhbSA9IGZ1bmN0aW9uIChmaWxlSWQsIGZpbGUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmcyA9IE5wbS5yZXF1aXJlKCdmcycpO1xuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSBfLmV4dGVuZCh7fSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZzLmNyZWF0ZVdyaXRlU3RyZWFtKHNlbGYuZ2V0RmlsZVBhdGgoZmlsZUlkLCBmaWxlKSwge1xuICAgICAgICAgICAgICAgICAgICBmbGFnczogJ2EnLFxuICAgICAgICAgICAgICAgICAgICBlbmNvZGluZzogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgbW9kZTogd3JpdGVNb2RlLFxuICAgICAgICAgICAgICAgICAgICBzdGFydDogb3B0aW9ucy5zdGFydFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGZpbGUgcGF0aFxuICAgICAqIEBwYXJhbSBmaWxlSWRcbiAgICAgKiBAcGFyYW0gZmlsZVxuICAgICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRGaWxlUGF0aChmaWxlSWQsIGZpbGUpIHtcbiAgICAgICAgZmlsZSA9IGZpbGUgfHwgdGhpcy5nZXRDb2xsZWN0aW9uKCkuZmluZE9uZShmaWxlSWQsIHtmaWVsZHM6IHtleHRlbnNpb246IDF9fSk7XG4gICAgICAgIHJldHVybiBmaWxlICYmIHRoaXMuZ2V0UGF0aChmaWxlSWQgKyAoZmlsZS5leHRlbnNpb24gPyBgLiR7ZmlsZS5leHRlbnNpb24gfWAgOiAnJykpO1xuICAgIH1cbn1cblxuLy8gQWRkIHN0b3JlIHRvIFVGUyBuYW1lc3BhY2VcblVwbG9hZEZTLnN0b3JlLkxvY2FsID0gTG9jYWxTdG9yZTtcbiJdfQ==
