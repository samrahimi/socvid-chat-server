(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var EventState = Package['raix:eventstate'].EventState;
var check = Package.check.check;
var Match = Package.check.Match;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var _ = Package.underscore._;
var EJSON = Package.ejson.EJSON;
var Random = Package.random.Random;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Push, checkClientSecurity, _matchToken, _replaceToken, _removeToken, initPushUpdates;

var require = meteorInstall({"node_modules":{"meteor":{"rocketchat:push":{"lib":{"common":{"main.js":function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/rocketchat_push/lib/common/main.js                                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
// The push object is an event emitter
Push = new EventState(); // Client-side security warnings, used to check options

checkClientSecurity = function (options) {
  // Warn if certificates or keys are added here on client. We dont allow the
  // user to do this for security reasons.
  if (options.apn && options.apn.certData) {
    throw new Error('Push.init: Dont add your APN certificate in client code!');
  }

  if (options.apn && options.apn.keyData) {
    throw new Error('Push.init: Dont add your APN key in client code!');
  }

  if (options.apn && options.apn.passphrase) {
    throw new Error('Push.init: Dont add your APN passphrase in client code!');
  }

  if (options.gcm && options.gcm.apiKey) {
    throw new Error('Push.init: Dont add your GCM api key in client code!');
  }
}; // DEPRECATED


Push.init = function () {
  console.warn('Push.init have been deprecated in favor of "config.push.json" please migrate');
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"notifications.js":function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/rocketchat_push/lib/common/notifications.js                                                              //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
// This is the match pattern for tokens
_matchToken = Match.OneOf({
  apn: String
}, {
  gcm: String
}); // Notifications collection

Push.notifications = new Mongo.Collection('_raix_push_notifications'); // This is a general function to validate that the data added to notifications
// is in the correct format. If not this function will throw errors

var _validateDocument = function (notification) {
  // Check the general notification
  check(notification, {
    from: String,
    title: String,
    text: String,
    sent: Match.Optional(Boolean),
    sending: Match.Optional(Match.Integer),
    badge: Match.Optional(Match.Integer),
    sound: Match.Optional(String),
    notId: Match.Optional(Match.Integer),
    contentAvailable: Match.Optional(Match.Integer),
    apn: Match.Optional({
      from: Match.Optional(String),
      title: Match.Optional(String),
      text: Match.Optional(String),
      badge: Match.Optional(Match.Integer),
      sound: Match.Optional(String),
      notId: Match.Optional(Match.Integer),
      category: Match.Optional(String)
    }),
    gcm: Match.Optional({
      from: Match.Optional(String),
      title: Match.Optional(String),
      text: Match.Optional(String),
      image: Match.Optional(String),
      style: Match.Optional(String),
      summaryText: Match.Optional(String),
      picture: Match.Optional(String),
      badge: Match.Optional(Match.Integer),
      sound: Match.Optional(String),
      notId: Match.Optional(Match.Integer)
    }),
    query: Match.Optional(String),
    token: Match.Optional(_matchToken),
    tokens: Match.Optional([_matchToken]),
    payload: Match.Optional(Object),
    delayUntil: Match.Optional(Date),
    createdAt: Date,
    createdBy: Match.OneOf(String, null)
  }); // Make sure a token selector or query have been set

  if (!notification.token && !notification.tokens && !notification.query) {
    throw new Error('No token selector or query found');
  } // If tokens array is set it should not be empty


  if (notification.tokens && !notification.tokens.length) {
    throw new Error('No tokens in array');
  }
};

Push.send = function (options) {
  // If on the client we set the user id - on the server we need an option
  // set or we default to "<SERVER>" as the creator of the notification
  // If current user not set see if we can set it to the logged in user
  // this will only run on the client if Meteor.userId is available
  var currentUser = Meteor.isClient && Meteor.userId && Meteor.userId() || Meteor.isServer && (options.createdBy || '<SERVER>') || null; // Rig the notification object

  var notification = _.extend({
    createdAt: new Date(),
    createdBy: currentUser
  }, _.pick(options, 'from', 'title', 'text')); // Add extra


  _.extend(notification, _.pick(options, 'payload', 'badge', 'sound', 'notId', 'delayUntil'));

  if (Match.test(options.apn, Object)) {
    notification.apn = _.pick(options.apn, 'from', 'title', 'text', 'badge', 'sound', 'notId', 'category');
  }

  if (Match.test(options.gcm, Object)) {
    notification.gcm = _.pick(options.gcm, 'image', 'style', 'summaryText', 'picture', 'from', 'title', 'text', 'badge', 'sound', 'notId');
  } // Set one token selector, this can be token, array of tokens or query


  if (options.query) {
    // Set query to the json string version fixing #43 and #39
    notification.query = JSON.stringify(options.query);
  } else if (options.token) {
    // Set token
    notification.token = options.token;
  } else if (options.tokens) {
    // Set tokens
    notification.tokens = options.tokens;
  } //console.log(options);


  if (typeof options.contentAvailable !== 'undefined') {
    notification.contentAvailable = options.contentAvailable;
  }

  notification.sent = false;
  notification.sending = 0; // Validate the notification

  _validateDocument(notification); // Try to add the notification to send, we return an id to keep track


  return Push.notifications.insert(notification);
};

Push.allow = function (rules) {
  if (rules.send) {
    Push.notifications.allow({
      'insert': function (userId, notification) {
        // Validate the notification
        _validateDocument(notification); // Set the user defined "send" rules


        return rules.send.apply(this, [userId, notification]);
      }
    });
  }
};

Push.deny = function (rules) {
  if (rules.send) {
    Push.notifications.deny({
      'insert': function (userId, notification) {
        // Validate the notification
        _validateDocument(notification); // Set the user defined "send" rules


        return rules.send.apply(this, [userId, notification]);
      }
    });
  }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"server":{"push.api.js":function(require){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/rocketchat_push/lib/server/push.api.js                                                                   //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
/*
  A general purpose user CordovaPush
  ios, android, mail, twitter?, facebook?, sms?, snailMail? :)

  Phonegap generic :
  https://github.com/phonegap-build/PushPlugin
 */
// getText / getBinary
Push.setBadge = function ()
/* id, count */
{// throw new Error('Push.setBadge not implemented on the server');
};

var isConfigured = false;

var sendWorker = function (task, interval) {
  if (typeof Push.Log === 'function') {
    Push.Log('Push: Send worker started, using interval:', interval);
  }

  if (Push.debug) {
    console.log('Push: Send worker started, using interval: ' + interval);
  }

  return Meteor.setInterval(function () {
    // xxx: add exponential backoff on error
    try {
      task();
    } catch (error) {
      if (typeof Push.Log === 'function') {
        Push.Log('Push: Error while sending:', error.message);
      }

      if (Push.debug) {
        console.log('Push: Error while sending: ' + error.message);
      }
    }
  }, interval);
};

Push.Configure = function (options) {
  var self = this;
  options = _.extend({
    sendTimeout: 60000 // Timeout period for notification send

  }, options); // https://npmjs.org/package/apn
  // After requesting the certificate from Apple, export your private key as
  // a .p12 file anddownload the .cer file from the iOS Provisioning Portal.
  // gateway.push.apple.com, port 2195
  // gateway.sandbox.push.apple.com, port 2195
  // Now, in the directory containing cert.cer and key.p12 execute the
  // following commands to generate your .pem files:
  // $ openssl x509 -in cert.cer -inform DER -outform PEM -out cert.pem
  // $ openssl pkcs12 -in key.p12 -out key.pem -nodes
  // Block multiple calls

  if (isConfigured) {
    throw new Error('Push.Configure should not be called more than once!');
  }

  isConfigured = true; // Add debug info

  if (Push.debug) {
    console.log('Push.Configure', options);
  } // This function is called when a token is replaced on a device - normally
  // this should not happen, but if it does we should take action on it


  _replaceToken = function (currentToken, newToken) {
    // console.log('Replace token: ' + currentToken + ' -- ' + newToken);
    // If the server gets a token event its passing in the current token and
    // the new value - if new value is undefined this empty the token
    self.emitState('token', currentToken, newToken);
  }; // Rig the removeToken callback


  _removeToken = function (token) {
    // console.log('Remove token: ' + token);
    // Invalidate the token
    self.emitState('token', token, null);
  };

  if (options.apn) {
    if (Push.debug) {
      console.log('Push: APN configured');
    } // Allow production to be a general option for push notifications


    if (options.production === Boolean(options.production)) {
      options.apn.production = options.production;
    } // Give the user warnings about development settings


    if (options.apn.development) {
      // This flag is normally set by the configuration file
      console.warn('WARNING: Push APN is using development key and certificate');
    } else {
      // We check the apn gateway i the options, we could risk shipping
      // server into production while using the production configuration.
      // On the other hand we could be in development but using the production
      // configuration. And finally we could have configured an unknown apn
      // gateway (this could change in the future - but a warning about typos
      // can save hours of debugging)
      //
      // Warn about gateway configurations - it's more a guide
      if (options.apn.gateway) {
        if (options.apn.gateway === 'gateway.sandbox.push.apple.com') {
          // Using the development sandbox
          console.warn('WARNING: Push APN is in development mode');
        } else if (options.apn.gateway === 'gateway.push.apple.com') {
          // In production - but warn if we are running on localhost
          if (/http:\/\/localhost/.test(Meteor.absoluteUrl())) {
            console.warn('WARNING: Push APN is configured to production mode - but server is running' + ' from localhost');
          }
        } else {
          // Warn about gateways we dont know about
          console.warn('WARNING: Push APN unkown gateway "' + options.apn.gateway + '"');
        }
      } else {
        if (options.apn.production) {
          if (/http:\/\/localhost/.test(Meteor.absoluteUrl())) {
            console.warn('WARNING: Push APN is configured to production mode - but server is running' + ' from localhost');
          }
        } else {
          console.warn('WARNING: Push APN is in development mode');
        }
      }
    } // Check certificate data


    if (!options.apn.certData || !options.apn.certData.length) {
      console.error('ERROR: Push server could not find certData');
    } // Check key data


    if (!options.apn.keyData || !options.apn.keyData.length) {
      console.error('ERROR: Push server could not find keyData');
    } // Rig apn connection


    var apn = Npm.require('apn');

    var apnConnection = new apn.Connection(options.apn); // Listen to transmission errors - should handle the same way as feedback.

    apnConnection.on('transmissionError', Meteor.bindEnvironment(function (errCode, notification, recipient) {
      if (Push.debug) {
        console.log('Got error code %d for token %s', errCode, notification.token);
      }

      if ([2, 5, 8].indexOf(errCode) >= 0) {
        // Invalid token errors...
        _removeToken({
          apn: notification.token
        });
      }
    })); // XXX: should we do a test of the connection? It would be nice to know
    // That the server/certificates/network are correct configured
    // apnConnection.connect().then(function() {
    //     console.info('CHECK: Push APN connection OK');
    // }, function(err) {
    //     console.warn('CHECK: Push APN connection FAILURE');
    // });
    // Note: the above code spoils the connection - investigate how to
    // shutdown/close it.

    self.sendAPN = function (userToken, notification) {
      if (Match.test(notification.apn, Object)) {
        notification = _.extend({}, notification, notification.apn);
      } // console.log('sendAPN', notification.from, userToken, notification.title, notification.text,
      // notification.badge, notification.priority);


      var priority = notification.priority || notification.priority === 0 ? notification.priority : 10;
      var myDevice = new apn.Device(userToken);
      var note = new apn.Notification();
      note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.

      if (typeof notification.badge !== 'undefined') {
        note.badge = notification.badge;
      }

      if (typeof notification.sound !== 'undefined') {
        note.sound = notification.sound;
      } //console.log(notification.contentAvailable);
      //console.log("lala2");
      //console.log(notification);


      if (typeof notification.contentAvailable !== 'undefined') {
        //console.log("lala");
        note.setContentAvailable(notification.contentAvailable); //console.log(note);
      } // adds category support for iOS8 custom actions as described here:
      // https://developer.apple.com/library/ios/documentation/NetworkingInternet/Conceptual/
      // RemoteNotificationsPG/Chapters/IPhoneOSClientImp.html#//apple_ref/doc/uid/TP40008194-CH103-SW36


      if (typeof notification.category !== 'undefined') {
        note.category = notification.category;
      }

      note.alert = {
        body: notification.text
      };

      if (typeof notification.title !== 'undefined') {
        note.alert.title = notification.title;
      } // Allow the user to set payload data


      note.payload = notification.payload ? {
        ejson: EJSON.stringify(notification.payload)
      } : {};
      note.payload.messageFrom = notification.from;
      note.priority = priority; // Store the token on the note so we can reference it if there was an error

      note.token = userToken; // console.log('I:Send message to: ' + userToken + ' count=' + count);

      apnConnection.pushNotification(note, myDevice);
    };

    var initFeedback = function () {
      var apn = Npm.require('apn'); // console.log('Init feedback');


      var feedbackOptions = {
        'batchFeedback': true,
        // Time in SECONDS
        'interval': 5,
        production: !options.apn.development,
        cert: options.certData,
        key: options.keyData,
        passphrase: options.passphrase
      };
      var feedback = new apn.Feedback(feedbackOptions);
      feedback.on('feedback', function (devices) {
        devices.forEach(function (item) {
          // Do something with item.device and item.time;
          // console.log('A:PUSH FEEDBACK ' + item.device + ' - ' + item.time);
          // The app is most likely removed from the device, we should
          // remove the token
          _removeToken({
            apn: item.device
          });
        });
      });
      feedback.start();
    }; // Init feedback from apn server
    // This will help keep the appCollection up-to-date, it will help update
    // and remove token from appCollection.


    initFeedback();
  } // EO ios notification


  if (options.gcm && options.gcm.apiKey) {
    if (Push.debug) {
      console.log('GCM configured');
    } //self.sendGCM = function(options.from, userTokens, options.title, options.text, options.badge, options.priority) {


    self.sendGCM = function (userTokens, notification) {
      if (Match.test(notification.gcm, Object)) {
        notification = _.extend({}, notification, notification.gcm);
      } // Make sure userTokens are an array of strings


      if (userTokens === '' + userTokens) {
        userTokens = [userTokens];
      } // Check if any tokens in there to send


      if (!userTokens.length) {
        if (Push.debug) {
          console.log('sendGCM no push tokens found');
        }

        return;
      }

      if (Push.debug) {
        console.log('sendGCM', userTokens, notification);
      }

      var gcm = Npm.require('node-gcm');

      var Fiber = Npm.require('fibers'); // Allow user to set payload


      var data = notification.payload ? {
        ejson: EJSON.stringify(notification.payload)
      } : {};
      data.title = notification.title;
      data.message = notification.text; // Set image

      if (typeof notification.image !== 'undefined') {
        data.image = notification.image;
      } // Set extra details


      if (typeof notification.badge !== 'undefined') {
        data.msgcnt = notification.badge;
      }

      if (typeof notification.sound !== 'undefined') {
        data.soundname = notification.sound;
      }

      if (typeof notification.notId !== 'undefined') {
        data.notId = notification.notId;
      }

      if (typeof notification.style !== 'undefined') {
        data.style = notification.style;
      }

      if (typeof notification.summaryText !== 'undefined') {
        data.summaryText = notification.summaryText;
      }

      if (typeof notification.picture !== 'undefined') {
        data.picture = notification.picture;
      } //var message = new gcm.Message();


      var message = new gcm.Message({
        collapseKey: notification.from,
        //    delayWhileIdle: true,
        //    timeToLive: 4,
        //    restricted_package_name: 'dk.gi2.app'
        data: data
      });

      if (Push.debug) {
        console.log('Create GCM Sender using "' + options.gcm.apiKey + '"');
      }

      var sender = new gcm.Sender(options.gcm.apiKey);

      _.each(userTokens, function (value
      /*, key */
      ) {
        if (Push.debug) {
          console.log('A:Send message to: ' + value);
        }
      });
      /*message.addData('title', title);
      message.addData('message', text);
      message.addData('msgcnt', '1');
      message.collapseKey = 'sitDrift';
      message.delayWhileIdle = true;
      message.timeToLive = 3;*/
      // /**
      //  * Parameters: message-literal, userTokens-array, No. of retries, callback-function
      //  */


      var userToken = userTokens.length === 1 ? userTokens[0] : null;
      sender.send(message, userTokens, 5, function (err, result) {
        if (err) {
          if (Push.debug) {
            console.log('ANDROID ERROR: result of sender: ' + result);
          }
        } else {
          if (result === null) {
            if (Push.debug) {
              console.log('ANDROID: Result of sender is null');
            }

            return;
          }

          if (Push.debug) {
            console.log('ANDROID: Result of sender: ' + JSON.stringify(result));
          }

          if (result.canonical_ids === 1 && userToken) {
            // jshint ignore:line
            // This is an old device, token is replaced
            Fiber(function (self) {
              // Run in fiber
              try {
                self.callback(self.oldToken, self.newToken);
              } catch (err) {}
            }).run({
              oldToken: {
                gcm: userToken
              },
              newToken: {
                gcm: result.results[0].registration_id
              },
              // jshint ignore:line
              callback: _replaceToken
            }); //_replaceToken({ gcm: userToken }, { gcm: result.results[0].registration_id });
          } // We cant send to that token - might not be registred
          // ask the user to remove the token from the list


          if (result.failure !== 0 && userToken) {
            // This is an old device, token is replaced
            Fiber(function (self) {
              // Run in fiber
              try {
                self.callback(self.token);
              } catch (err) {}
            }).run({
              token: {
                gcm: userToken
              },
              callback: _removeToken
            }); //_replaceToken({ gcm: userToken }, { gcm: result.results[0].registration_id });
          }
        }
      }); // /** Use the following line if you want to send the message without retries
      // sender.sendNoRetry(message, userTokens, function (result) {
      //     console.log('ANDROID: ' + JSON.stringify(result));
      // });
      // **/
    }; // EO sendAndroid

  } // EO Android
  // Universal send function


  var _querySend = function (query, options) {
    var countApn = [];
    var countGcm = [];
    Push.appCollection.find(query).forEach(function (app) {
      if (Push.debug) {
        console.log('send to token', app.token);
      }

      if (app.token.apn) {
        countApn.push(app._id); // Send to APN

        if (self.sendAPN) {
          self.sendAPN(app.token.apn, options);
        }
      } else if (app.token.gcm) {
        countGcm.push(app._id); // Send to GCM
        // We do support multiple here - so we should construct an array
        // and send it bulk - Investigate limit count of id's

        if (self.sendGCM) {
          self.sendGCM(app.token.gcm, options);
        }
      } else {
        throw new Error('Push.send got a faulty query');
      }
    });

    if (Push.debug) {
      console.log('Push: Sent message "' + options.title + '" to ' + countApn.length + ' ios apps ' + countGcm.length + ' android apps'); // Add some verbosity about the send result, making sure the developer
      // understands what just happened.

      if (!countApn.length && !countGcm.length) {
        if (Push.appCollection.find().count() === 0) {
          console.log('Push, GUIDE: The "Push.appCollection" is empty -' + ' No clients have registred on the server yet...');
        }
      } else if (!countApn.length) {
        if (Push.appCollection.find({
          'token.apn': {
            $exists: true
          }
        }).count() === 0) {
          console.log('Push, GUIDE: The "Push.appCollection" - No APN clients have registred on the server yet...');
        }
      } else if (!countGcm.length) {
        if (Push.appCollection.find({
          'token.gcm': {
            $exists: true
          }
        }).count() === 0) {
          console.log('Push, GUIDE: The "Push.appCollection" - No GCM clients have registred on the server yet...');
        }
      }
    }

    return {
      apn: countApn,
      gcm: countGcm
    };
  };

  self.serverSend = function (options) {
    options = options || {
      badge: 0
    };
    var query; // Check basic options

    if (options.from !== '' + options.from) {
      throw new Error('Push.send: option "from" not a string');
    }

    if (options.title !== '' + options.title) {
      throw new Error('Push.send: option "title" not a string');
    }

    if (options.text !== '' + options.text) {
      throw new Error('Push.send: option "text" not a string');
    }

    if (options.token || options.tokens) {
      // The user set one token or array of tokens
      var tokenList = options.token ? [options.token] : options.tokens;

      if (Push.debug) {
        console.log('Push: Send message "' + options.title + '" via token(s)', tokenList);
      }

      query = {
        $or: [// XXX: Test this query: can we hand in a list of push tokens?
        {
          $and: [{
            token: {
              $in: tokenList
            }
          }, // And is not disabled
          {
            enabled: {
              $ne: false
            }
          }]
        }, // XXX: Test this query: does this work on app id?
        {
          $and: [{
            _id: {
              $in: tokenList
            }
          }, // one of the app ids
          {
            $or: [{
              'token.apn': {
                $exists: true
              }
            }, // got apn token
            {
              'token.gcm': {
                $exists: true
              } // got gcm token

            }]
          }, // And is not disabled
          {
            enabled: {
              $ne: false
            }
          }]
        }]
      };
    } else if (options.query) {
      if (Push.debug) {
        console.log('Push: Send message "' + options.title + '" via query', options.query);
      }

      query = {
        $and: [options.query, // query object
        {
          $or: [{
            'token.apn': {
              $exists: true
            }
          }, // got apn token
          {
            'token.gcm': {
              $exists: true
            } // got gcm token

          }]
        }, // And is not disabled
        {
          enabled: {
            $ne: false
          }
        }]
      };
    }

    if (query) {
      // Convert to querySend and return status
      return _querySend(query, options);
    } else {
      throw new Error('Push.send: please set option "token"/"tokens" or "query"');
    }
  }; // This interval will allow only one notification to be sent at a time, it
  // will check for new notifications at every `options.sendInterval`
  // (default interval is 15000 ms)
  //
  // It looks in notifications collection to see if theres any pending
  // notifications, if so it will try to reserve the pending notification.
  // If successfully reserved the send is started.
  //
  // If notification.query is type string, it's assumed to be a json string
  // version of the query selector. Making it able to carry `$` properties in
  // the mongo collection.
  //
  // Pr. default notifications are removed from the collection after send have
  // completed. Setting `options.keepNotifications` will update and keep the
  // notification eg. if needed for historical reasons.
  //
  // After the send have completed a "send" event will be emitted with a
  // status object containing notification id and the send result object.
  //


  var isSendingNotification = false;

  if (options.sendInterval !== null) {
    // This will require index since we sort notifications by createdAt
    Push.notifications._ensureIndex({
      createdAt: 1
    });

    Push.notifications._ensureIndex({
      sent: 1
    });

    Push.notifications._ensureIndex({
      sending: 1
    });

    Push.notifications._ensureIndex({
      delayUntil: 1
    });

    var sendNotification = function (notification) {
      // Reserve notification
      var now = +new Date();
      var timeoutAt = now + options.sendTimeout;
      var reserved = Push.notifications.update({
        _id: notification._id,
        sent: false,
        // xxx: need to make sure this is set on create
        sending: {
          $lt: now
        }
      }, {
        $set: {
          sending: timeoutAt
        }
      }); // Make sure we only handle notifications reserved by this
      // instance

      if (reserved) {
        // Check if query is set and is type String
        if (notification.query && notification.query === '' + notification.query) {
          try {
            // The query is in string json format - we need to parse it
            notification.query = JSON.parse(notification.query);
          } catch (err) {
            // Did the user tamper with this??
            throw new Error('Push: Error while parsing query string, Error: ' + err.message);
          }
        } // Send the notification


        var result = Push.serverSend(notification);

        if (!options.keepNotifications) {
          // Pr. Default we will remove notifications
          Push.notifications.remove({
            _id: notification._id
          });
        } else {
          // Update the notification
          Push.notifications.update({
            _id: notification._id
          }, {
            $set: {
              // Mark as sent
              sent: true,
              // Set the sent date
              sentAt: new Date(),
              // Count
              count: result,
              // Not being sent anymore
              sending: 0
            }
          });
        } // Emit the send


        self.emit('send', {
          notification: notification._id,
          result: result
        });
      } // Else could not reserve

    }; // EO sendNotification


    sendWorker(function () {
      if (isSendingNotification) {
        return;
      }

      try {
        // Set send fence
        isSendingNotification = true; // var countSent = 0;

        var batchSize = options.sendBatchSize || 1;
        var now = +new Date(); // Find notifications that are not being or already sent

        var pendingNotifications = Push.notifications.find({
          $and: [// Message is not sent
          {
            sent: false
          }, // And not being sent by other instances
          {
            sending: {
              $lt: now
            }
          }, // And not queued for future
          {
            $or: [{
              delayUntil: {
                $exists: false
              }
            }, {
              delayUntil: {
                $lte: new Date()
              }
            }]
          }]
        }, {
          // Sort by created date
          sort: {
            createdAt: 1
          },
          limit: batchSize
        });
        pendingNotifications.forEach(function (notification) {
          try {
            sendNotification(notification);
          } catch (error) {
            if (typeof Push.Log === 'function') {
              Push.Log('Push: Could not send notification id: "' + notification._id + '", Error:', error.message);
            }

            if (Push.debug) {
              console.log('Push: Could not send notification id: "' + notification._id + '", Error: ' + error.message);
            }
          }
        }); // EO forEach
      } finally {
        // Remove the send fence
        isSendingNotification = false;
      }
    }, options.sendInterval || 15000); // Default every 15th sec
  } else {
    if (Push.debug) {
      console.log('Push: Send server is disabled');
    }
  }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"server.js":function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/rocketchat_push/lib/server/server.js                                                                     //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
Push.appCollection = new Mongo.Collection('_raix_push_app_tokens');

Push.appCollection._ensureIndex({
  userId: 1
});

Push.addListener('token', function (currentToken, value) {
  if (value) {
    // Update the token for app
    Push.appCollection.update({
      token: currentToken
    }, {
      $set: {
        token: value
      }
    }, {
      multi: true
    });
  } else if (value === null) {
    // Remove the token for app
    Push.appCollection.update({
      token: currentToken
    }, {
      $unset: {
        token: true
      }
    }, {
      multi: true
    });
  }
});
Meteor.methods({
  'raix:push-update': function (options) {
    if (Push.debug) {
      console.log('Push: Got push token from app:', options);
    }

    check(options, {
      id: Match.Optional(String),
      token: _matchToken,
      appName: String,
      userId: Match.OneOf(String, null),
      metadata: Match.Optional(Object)
    }); // The if user id is set then user id should match on client and connection

    if (options.userId && options.userId !== this.userId) {
      throw new Meteor.Error(403, 'Forbidden access');
    }

    var doc; // lookup app by id if one was included

    if (options.id) {
      doc = Push.appCollection.findOne({
        _id: options.id
      });
    } else if (options.userId) {
      doc = Push.appCollection.findOne({
        userId: options.userId
      });
    } // No doc was found - we check the database to see if
    // we can find a match for the app via token and appName


    if (!doc) {
      doc = Push.appCollection.findOne({
        $and: [{
          token: options.token
        }, // Match token
        {
          appName: options.appName
        }, // Match appName
        {
          token: {
            $exists: true
          } // Make sure token exists

        }]
      });
    } // if we could not find the id or token then create it


    if (!doc) {
      // Rig default doc
      doc = {
        token: options.token,
        appName: options.appName,
        userId: options.userId,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }; // XXX: We might want to check the id - Why isnt there a match for id
      // in the Meteor check... Normal length 17 (could be larger), and
      // numbers+letters are used in Random.id() with exception of 0 and 1

      doc._id = options.id || Random.id(); // The user wanted us to use a specific id, we didn't find this while
      // searching. The client could depend on the id eg. as reference so
      // we respect this and try to create a document with the selected id;

      Push.appCollection._collection.insert(doc);
    } else {
      // We found the app so update the updatedAt and set the token
      Push.appCollection.update({
        _id: doc._id
      }, {
        $set: {
          updatedAt: new Date(),
          token: options.token
        }
      });
    }

    if (doc) {
      // xxx: Hack
      // Clean up mech making sure tokens are uniq - android sometimes generate
      // new tokens resulting in duplicates
      var removed = Push.appCollection.remove({
        $and: [{
          _id: {
            $ne: doc._id
          }
        }, {
          token: doc.token
        }, // Match token
        {
          appName: doc.appName
        }, // Match appName
        {
          token: {
            $exists: true
          } // Make sure token exists

        }]
      });

      if (removed && Push.debug) {
        console.log('Push: Removed ' + removed + ' existing app items');
      }
    }

    if (doc && Push.debug) {
      console.log('Push: updated', doc);
    }

    if (!doc) {
      throw new Meteor.Error(500, 'setPushToken could not create record');
    } // Return the doc we want to use


    return doc;
  },
  'raix:push-setuser': function (id) {
    check(id, String);

    if (Push.debug) {
      console.log('Push: Settings userId "' + this.userId + '" for app:', id);
    } // We update the appCollection id setting the Meteor.userId


    var found = Push.appCollection.update({
      _id: id
    }, {
      $set: {
        userId: this.userId
      }
    }); // Note that the app id might not exist because no token is set yet.
    // We do create the new app id for the user since we might store additional
    // metadata for the app / user
    // If id not found then create it?
    // We dont, its better to wait until the user wants to
    // store metadata or token - We could end up with unused data in the
    // collection at every app re-install / update
    //
    // The user could store some metadata in appCollectin but only if they
    // have created the app and provided a token.
    // If not the metadata should be set via ground:db

    return !!found;
  },
  'raix:push-metadata': function (data) {
    check(data, {
      id: String,
      metadata: Object
    }); // Set the metadata

    var found = Push.appCollection.update({
      _id: data.id
    }, {
      $set: {
        metadata: data.metadata
      }
    });
    return !!found;
  },
  'raix:push-enable': function (data) {
    check(data, {
      id: String,
      enabled: Boolean
    });

    if (Push.debug) {
      console.log('Push: Setting enabled to "' + data.enabled + '" for app:', data.id);
    }

    var found = Push.appCollection.update({
      _id: data.id
    }, {
      $set: {
        enabled: data.enabled
      }
    });
    return !!found;
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/rocketchat:push/lib/common/main.js");
require("/node_modules/meteor/rocketchat:push/lib/common/notifications.js");
require("/node_modules/meteor/rocketchat:push/lib/server/push.api.js");
require("/node_modules/meteor/rocketchat:push/lib/server/server.js");

/* Exports */
Package._define("rocketchat:push", {
  Push: Push,
  _matchToken: _matchToken,
  checkClientSecurity: checkClientSecurity,
  initPushUpdates: initPushUpdates,
  _replaceToken: _replaceToken,
  _removeToken: _removeToken
});

})();

//# sourceURL=meteor://💻app/packages/rocketchat_push.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcm9ja2V0Y2hhdDpwdXNoL2xpYi9jb21tb24vbWFpbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcm9ja2V0Y2hhdDpwdXNoL2xpYi9jb21tb24vbm90aWZpY2F0aW9ucy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcm9ja2V0Y2hhdDpwdXNoL2xpYi9zZXJ2ZXIvcHVzaC5hcGkuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL3JvY2tldGNoYXQ6cHVzaC9saWIvc2VydmVyL3NlcnZlci5qcyJdLCJuYW1lcyI6WyJQdXNoIiwiRXZlbnRTdGF0ZSIsImNoZWNrQ2xpZW50U2VjdXJpdHkiLCJvcHRpb25zIiwiYXBuIiwiY2VydERhdGEiLCJFcnJvciIsImtleURhdGEiLCJwYXNzcGhyYXNlIiwiZ2NtIiwiYXBpS2V5IiwiaW5pdCIsImNvbnNvbGUiLCJ3YXJuIiwiX21hdGNoVG9rZW4iLCJNYXRjaCIsIk9uZU9mIiwiU3RyaW5nIiwibm90aWZpY2F0aW9ucyIsIk1vbmdvIiwiQ29sbGVjdGlvbiIsIl92YWxpZGF0ZURvY3VtZW50Iiwibm90aWZpY2F0aW9uIiwiY2hlY2siLCJmcm9tIiwidGl0bGUiLCJ0ZXh0Iiwic2VudCIsIk9wdGlvbmFsIiwiQm9vbGVhbiIsInNlbmRpbmciLCJJbnRlZ2VyIiwiYmFkZ2UiLCJzb3VuZCIsIm5vdElkIiwiY29udGVudEF2YWlsYWJsZSIsImNhdGVnb3J5IiwiaW1hZ2UiLCJzdHlsZSIsInN1bW1hcnlUZXh0IiwicGljdHVyZSIsInF1ZXJ5IiwidG9rZW4iLCJ0b2tlbnMiLCJwYXlsb2FkIiwiT2JqZWN0IiwiZGVsYXlVbnRpbCIsIkRhdGUiLCJjcmVhdGVkQXQiLCJjcmVhdGVkQnkiLCJsZW5ndGgiLCJzZW5kIiwiY3VycmVudFVzZXIiLCJNZXRlb3IiLCJpc0NsaWVudCIsInVzZXJJZCIsImlzU2VydmVyIiwiXyIsImV4dGVuZCIsInBpY2siLCJ0ZXN0IiwiSlNPTiIsInN0cmluZ2lmeSIsImluc2VydCIsImFsbG93IiwicnVsZXMiLCJhcHBseSIsImRlbnkiLCJzZXRCYWRnZSIsImlzQ29uZmlndXJlZCIsInNlbmRXb3JrZXIiLCJ0YXNrIiwiaW50ZXJ2YWwiLCJMb2ciLCJkZWJ1ZyIsImxvZyIsInNldEludGVydmFsIiwiZXJyb3IiLCJtZXNzYWdlIiwiQ29uZmlndXJlIiwic2VsZiIsInNlbmRUaW1lb3V0IiwiX3JlcGxhY2VUb2tlbiIsImN1cnJlbnRUb2tlbiIsIm5ld1Rva2VuIiwiZW1pdFN0YXRlIiwiX3JlbW92ZVRva2VuIiwicHJvZHVjdGlvbiIsImRldmVsb3BtZW50IiwiZ2F0ZXdheSIsImFic29sdXRlVXJsIiwiTnBtIiwicmVxdWlyZSIsImFwbkNvbm5lY3Rpb24iLCJDb25uZWN0aW9uIiwib24iLCJiaW5kRW52aXJvbm1lbnQiLCJlcnJDb2RlIiwicmVjaXBpZW50IiwiaW5kZXhPZiIsInNlbmRBUE4iLCJ1c2VyVG9rZW4iLCJwcmlvcml0eSIsIm15RGV2aWNlIiwiRGV2aWNlIiwibm90ZSIsIk5vdGlmaWNhdGlvbiIsImV4cGlyeSIsIk1hdGgiLCJmbG9vciIsIm5vdyIsInNldENvbnRlbnRBdmFpbGFibGUiLCJhbGVydCIsImJvZHkiLCJlanNvbiIsIkVKU09OIiwibWVzc2FnZUZyb20iLCJwdXNoTm90aWZpY2F0aW9uIiwiaW5pdEZlZWRiYWNrIiwiZmVlZGJhY2tPcHRpb25zIiwiY2VydCIsImtleSIsImZlZWRiYWNrIiwiRmVlZGJhY2siLCJkZXZpY2VzIiwiZm9yRWFjaCIsIml0ZW0iLCJkZXZpY2UiLCJzdGFydCIsInNlbmRHQ00iLCJ1c2VyVG9rZW5zIiwiRmliZXIiLCJkYXRhIiwibXNnY250Iiwic291bmRuYW1lIiwiTWVzc2FnZSIsImNvbGxhcHNlS2V5Iiwic2VuZGVyIiwiU2VuZGVyIiwiZWFjaCIsInZhbHVlIiwiZXJyIiwicmVzdWx0IiwiY2Fub25pY2FsX2lkcyIsImNhbGxiYWNrIiwib2xkVG9rZW4iLCJydW4iLCJyZXN1bHRzIiwicmVnaXN0cmF0aW9uX2lkIiwiZmFpbHVyZSIsIl9xdWVyeVNlbmQiLCJjb3VudEFwbiIsImNvdW50R2NtIiwiYXBwQ29sbGVjdGlvbiIsImZpbmQiLCJhcHAiLCJwdXNoIiwiX2lkIiwiY291bnQiLCIkZXhpc3RzIiwic2VydmVyU2VuZCIsInRva2VuTGlzdCIsIiRvciIsIiRhbmQiLCIkaW4iLCJlbmFibGVkIiwiJG5lIiwiaXNTZW5kaW5nTm90aWZpY2F0aW9uIiwic2VuZEludGVydmFsIiwiX2Vuc3VyZUluZGV4Iiwic2VuZE5vdGlmaWNhdGlvbiIsInRpbWVvdXRBdCIsInJlc2VydmVkIiwidXBkYXRlIiwiJGx0IiwiJHNldCIsInBhcnNlIiwia2VlcE5vdGlmaWNhdGlvbnMiLCJyZW1vdmUiLCJzZW50QXQiLCJlbWl0IiwiYmF0Y2hTaXplIiwic2VuZEJhdGNoU2l6ZSIsInBlbmRpbmdOb3RpZmljYXRpb25zIiwiJGx0ZSIsInNvcnQiLCJsaW1pdCIsImFkZExpc3RlbmVyIiwibXVsdGkiLCIkdW5zZXQiLCJtZXRob2RzIiwiaWQiLCJhcHBOYW1lIiwibWV0YWRhdGEiLCJkb2MiLCJmaW5kT25lIiwidXBkYXRlZEF0IiwiUmFuZG9tIiwiX2NvbGxlY3Rpb24iLCJyZW1vdmVkIiwiZm91bmQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0FBLElBQUksR0FBRyxJQUFJQyxVQUFKLEVBQVAsQyxDQUdBOztBQUNBQyxtQkFBbUIsR0FBRyxVQUFTQyxPQUFULEVBQWtCO0FBRXRDO0FBQ0E7QUFDQSxNQUFJQSxPQUFPLENBQUNDLEdBQVIsSUFBZUQsT0FBTyxDQUFDQyxHQUFSLENBQVlDLFFBQS9CLEVBQXlDO0FBQ3ZDLFVBQU0sSUFBSUMsS0FBSixDQUFVLDBEQUFWLENBQU47QUFDRDs7QUFFRCxNQUFJSCxPQUFPLENBQUNDLEdBQVIsSUFBZUQsT0FBTyxDQUFDQyxHQUFSLENBQVlHLE9BQS9CLEVBQXdDO0FBQ3RDLFVB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NEM7QUFBRWhCLFVBQUksRUFBRTtBQUFFVixlQUFPLEVBQUVqQyxJQUFJLENBQUNpQztBQUFoQjtBQUFSLEtBQTVDLENBQVo7QUFFQSxXQUFPLENBQUMsQ0FBQ21DLEtBQVQ7QUFDRDtBQWxKWSxDQUFmLEUiLCJmaWxlIjoiL3BhY2thZ2VzL3JvY2tldGNoYXRfcHVzaC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIFRoZSBwdXNoIG9iamVjdCBpcyBhbiBldmVudCBlbWl0dGVyXG5QdXNoID0gbmV3IEV2ZW50U3RhdGUoKTtcblxuXG4vLyBDbGllbnQtc2lkZSBzZWN1cml0eSB3YXJuaW5ncywgdXNlZCB0byBjaGVjayBvcHRpb25zXG5jaGVja0NsaWVudFNlY3VyaXR5ID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXG4gIC8vIFdhcm4gaWYgY2VydGlmaWNhdGVzIG9yIGtleXMgYXJlIGFkZGVkIGhlcmUgb24gY2xpZW50LiBXZSBkb250IGFsbG93IHRoZVxuICAvLyB1c2VyIHRvIGRvIHRoaXMgZm9yIHNlY3VyaXR5IHJlYXNvbnMuXG4gIGlmIChvcHRpb25zLmFwbiAmJiBvcHRpb25zLmFwbi5jZXJ0RGF0YSkge1xuICAgIHRocm93IG5ldyBFcnJvcignUHVzaC5pbml0OiBEb250IGFkZCB5b3VyIEFQTiBjZXJ0aWZpY2F0ZSBpbiBjbGllbnQgY29kZSEnKTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLmFwbiAmJiBvcHRpb25zLmFwbi5rZXlEYXRhKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdQdXNoLmluaXQ6IERvbnQgYWRkIHlvdXIgQVBOIGtleSBpbiBjbGllbnQgY29kZSEnKTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLmFwbiAmJiBvcHRpb25zLmFwbi5wYXNzcGhyYXNlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdQdXNoLmluaXQ6IERvbnQgYWRkIHlvdXIgQVBOIHBhc3NwaHJhc2UgaW4gY2xpZW50IGNvZGUhJyk7XG4gIH1cblxuICBpZiAob3B0aW9ucy5nY20gJiYgb3B0aW9ucy5nY20uYXBpS2V5KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdQdXNoLmluaXQ6IERvbnQgYWRkIHlvdXIgR0NNIGFwaSBrZXkgaW4gY2xpZW50IGNvZGUhJyk7XG4gIH1cbn07XG5cbi8vIERFUFJFQ0FURURcblB1c2guaW5pdCA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLndhcm4oJ1B1c2guaW5pdCBoYXZlIGJlZW4gZGVwcmVjYXRlZCBpbiBmYXZvciBvZiBcImNvbmZpZy5wdXNoLmpzb25cIiBwbGVhc2UgbWlncmF0ZScpO1xufTtcbiIsIi8vIFRoaXMgaXMgdGhlIG1hdGNoIHBhdHRlcm4gZm9yIHRva2Vuc1xuX21hdGNoVG9rZW4gPSBNYXRjaC5PbmVPZih7IGFwbjogU3RyaW5nIH0sIHsgZ2NtOiBTdHJpbmcgfSk7XG5cbi8vIE5vdGlmaWNhdGlvbnMgY29sbGVjdGlvblxuUHVzaC5ub3RpZmljYXRpb25zID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oJ19yYWl4X3B1c2hfbm90aWZpY2F0aW9ucycpO1xuXG4vLyBUaGlzIGlzIGEgZ2VuZXJhbCBmdW5jdGlvbiB0byB2YWxpZGF0ZSB0aGF0IHRoZSBkYXRhIGFkZGVkIHRvIG5vdGlmaWNhdGlvbnNcbi8vIGlzIGluIHRoZSBjb3JyZWN0IGZvcm1hdC4gSWYgbm90IHRoaXMgZnVuY3Rpb24gd2lsbCB0aHJvdyBlcnJvcnNcbnZhciBfdmFsaWRhdGVEb2N1bWVudCA9IGZ1bmN0aW9uKG5vdGlmaWNhdGlvbikge1xuXG4gIC8vIENoZWNrIHRoZSBnZW5lcmFsIG5vdGlmaWNhdGlvblxuICBjaGVjayhub3RpZmljYXRpb24sIHtcbiAgICBmcm9tOiBTdHJpbmcsXG4gICAgdGl0bGU6IFN0cmluZyxcbiAgICB0ZXh0OiBTdHJpbmcsXG4gICAgc2VudDogTWF0Y2guT3B0aW9uYWwoQm9vbGVhbiksXG4gICAgc2VuZGluZzogTWF0Y2guT3B0aW9uYWwoTWF0Y2guSW50ZWdlciksXG4gICAgYmFkZ2U6IE1hdGNoLk9wdGlvbmFsKE1hdGNoLkludGVnZXIpLFxuICAgIHNvdW5kOiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgIG5vdElkOiBNYXRjaC5PcHRpb25hbChNYXRjaC5JbnRlZ2VyKSxcbiAgICBjb250ZW50QXZhaWxhYmxlOiBNYXRjaC5PcHRpb25hbChNYXRjaC5JbnRlZ2VyKSxcbiAgICBhcG46IE1hdGNoLk9wdGlvbmFsKHtcbiAgICAgIGZyb206IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICB0aXRsZTogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgIHRleHQ6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICBiYWRnZTogTWF0Y2guT3B0aW9uYWwoTWF0Y2guSW50ZWdlciksXG4gICAgICBzb3VuZDogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgIG5vdElkOiBNYXRjaC5PcHRpb25hbChNYXRjaC5JbnRlZ2VyKSxcbiAgICAgIGNhdGVnb3J5OiBNYXRjaC5PcHRpb25hbChTdHJpbmcpXG4gICAgfSksXG4gICAgZ2NtOiBNYXRjaC5PcHRpb25hbCh7XG4gICAgICBmcm9tOiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgdGl0bGU6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICB0ZXh0OiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgaW1hZ2U6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICBzdHlsZTogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgIHN1bW1hcnlUZXh0OiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgcGljdHVyZTogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgIGJhZGdlOiBNYXRjaC5PcHRpb25hbChNYXRjaC5JbnRlZ2VyKSxcbiAgICAgIHNvdW5kOiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgbm90SWQ6IE1hdGNoLk9wdGlvbmFsKE1hdGNoLkludGVnZXIpXG4gICAgfSksXG4gICAgcXVlcnk6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgdG9rZW46IE1hdGNoLk9wdGlvbmFsKF9tYXRjaFRva2VuKSxcbiAgICB0b2tlbnM6IE1hdGNoLk9wdGlvbmFsKFtfbWF0Y2hUb2tlbl0pLFxuICAgIHBheWxvYWQ6IE1hdGNoLk9wdGlvbmFsKE9iamVjdCksXG4gICAgZGVsYXlVbnRpbDogTWF0Y2guT3B0aW9uYWwoRGF0ZSksXG4gICAgY3JlYXRlZEF0OiBEYXRlLFxuICAgIGNyZWF0ZWRCeTogTWF0Y2guT25lT2YoU3RyaW5nLCBudWxsKVxuICB9KTtcblxuICAvLyBNYWtlIHN1cmUgYSB0b2tlbiBzZWxlY3RvciBvciBxdWVyeSBoYXZlIGJlZW4gc2V0XG4gIGlmICghbm90aWZpY2F0aW9uLnRva2VuICYmICFub3RpZmljYXRpb24udG9rZW5zICYmICFub3RpZmljYXRpb24ucXVlcnkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHRva2VuIHNlbGVjdG9yIG9yIHF1ZXJ5IGZvdW5kJyk7XG4gIH1cblxuICAvLyBJZiB0b2tlbnMgYXJyYXkgaXMgc2V0IGl0IHNob3VsZCBub3QgYmUgZW1wdHlcbiAgaWYgKG5vdGlmaWNhdGlvbi50b2tlbnMgJiYgIW5vdGlmaWNhdGlvbi50b2tlbnMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdObyB0b2tlbnMgaW4gYXJyYXknKTtcbiAgfVxufTtcblxuUHVzaC5zZW5kID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAvLyBJZiBvbiB0aGUgY2xpZW50IHdlIHNldCB0aGUgdXNlciBpZCAtIG9uIHRoZSBzZXJ2ZXIgd2UgbmVlZCBhbiBvcHRpb25cbiAgLy8gc2V0IG9yIHdlIGRlZmF1bHQgdG8gXCI8U0VSVkVSPlwiIGFzIHRoZSBjcmVhdG9yIG9mIHRoZSBub3RpZmljYXRpb25cbiAgLy8gSWYgY3VycmVudCB1c2VyIG5vdCBzZXQgc2VlIGlmIHdlIGNhbiBzZXQgaXQgdG8gdGhlIGxvZ2dlZCBpbiB1c2VyXG4gIC8vIHRoaXMgd2lsbCBvbmx5IHJ1biBvbiB0aGUgY2xpZW50IGlmIE1ldGVvci51c2VySWQgaXMgYXZhaWxhYmxlXG4gIHZhciBjdXJyZW50VXNlciA9IE1ldGVvci5pc0NsaWVudCAmJiBNZXRlb3IudXNlcklkICYmIE1ldGVvci51c2VySWQoKSB8fFxuICAgICAgICAgIE1ldGVvci5pc1NlcnZlciAmJiAob3B0aW9ucy5jcmVhdGVkQnkgfHwgJzxTRVJWRVI+JykgfHwgbnVsbDtcblxuICAvLyBSaWcgdGhlIG5vdGlmaWNhdGlvbiBvYmplY3RcbiAgIHZhciBub3RpZmljYXRpb24gPSBfLmV4dGVuZCh7XG4gICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLFxuICAgIGNyZWF0ZWRCeTogY3VycmVudFVzZXJcbiAgfSwgXy5waWNrKG9wdGlvbnMsICdmcm9tJywgJ3RpdGxlJywgJ3RleHQnKSk7XG5cbiAgIC8vIEFkZCBleHRyYVxuICAgXy5leHRlbmQobm90aWZpY2F0aW9uLCBfLnBpY2sob3B0aW9ucywgJ3BheWxvYWQnLCAnYmFkZ2UnLCAnc291bmQnLCAnbm90SWQnLCAnZGVsYXlVbnRpbCcpKTtcblxuICBpZiAoTWF0Y2gudGVzdChvcHRpb25zLmFwbiwgT2JqZWN0KSkge1xuICAgIG5vdGlmaWNhdGlvbi5hcG4gPSBfLnBpY2sob3B0aW9ucy5hcG4sICdmcm9tJywgJ3RpdGxlJywgJ3RleHQnLCAnYmFkZ2UnLCAnc291bmQnLCAnbm90SWQnLCAnY2F0ZWdvcnknKTtcbiAgfVxuXG4gIGlmIChNYXRjaC50ZXN0KG9wdGlvbnMuZ2NtLCBPYmplY3QpKSB7XG4gICAgbm90aWZpY2F0aW9uLmdjbSA9IF8ucGljayhvcHRpb25zLmdjbSwgJ2ltYWdlJywgJ3N0eWxlJywgJ3N1bW1hcnlUZXh0JywgJ3BpY3R1cmUnLCAnZnJvbScsICd0aXRsZScsICd0ZXh0JywgJ2JhZGdlJywgJ3NvdW5kJywgJ25vdElkJyk7XG4gIH1cblxuICAvLyBTZXQgb25lIHRva2VuIHNlbGVjdG9yLCB0aGlzIGNhbiBiZSB0b2tlbiwgYXJyYXkgb2YgdG9rZW5zIG9yIHF1ZXJ5XG4gIGlmIChvcHRpb25zLnF1ZXJ5KSB7XG4gICAgLy8gU2V0IHF1ZXJ5IHRvIHRoZSBqc29uIHN0cmluZyB2ZXJzaW9uIGZpeGluZyAjNDMgYW5kICMzOVxuICAgIG5vdGlmaWNhdGlvbi5xdWVyeSA9IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMucXVlcnkpO1xuICB9IGVsc2UgaWYgKG9wdGlvbnMudG9rZW4pIHtcbiAgICAvLyBTZXQgdG9rZW5cbiAgICBub3RpZmljYXRpb24udG9rZW4gPSBvcHRpb25zLnRva2VuO1xuICB9IGVsc2UgaWYgKG9wdGlvbnMudG9rZW5zKSB7XG4gICAgLy8gU2V0IHRva2Vuc1xuICAgIG5vdGlmaWNhdGlvbi50b2tlbnMgPSBvcHRpb25zLnRva2VucztcbiAgfVxuICAvL2NvbnNvbGUubG9nKG9wdGlvbnMpO1xuICBpZiAodHlwZW9mIG9wdGlvbnMuY29udGVudEF2YWlsYWJsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBub3RpZmljYXRpb24uY29udGVudEF2YWlsYWJsZSA9IG9wdGlvbnMuY29udGVudEF2YWlsYWJsZTtcbiAgfVxuXG4gIG5vdGlmaWNhdGlvbi5zZW50ID0gZmFsc2U7XG4gIG5vdGlmaWNhdGlvbi5zZW5kaW5nID0gMDtcblxuICAvLyBWYWxpZGF0ZSB0aGUgbm90aWZpY2F0aW9uXG4gIF92YWxpZGF0ZURvY3VtZW50KG5vdGlmaWNhdGlvbik7XG5cbiAgLy8gVHJ5IHRvIGFkZCB0aGUgbm90aWZpY2F0aW9uIHRvIHNlbmQsIHdlIHJldHVybiBhbiBpZCB0byBrZWVwIHRyYWNrXG4gIHJldHVybiBQdXNoLm5vdGlmaWNhdGlvbnMuaW5zZXJ0KG5vdGlmaWNhdGlvbik7XG59O1xuXG5QdXNoLmFsbG93ID0gZnVuY3Rpb24ocnVsZXMpIHtcbiAgaWYgKHJ1bGVzLnNlbmQpIHtcbiAgICBQdXNoLm5vdGlmaWNhdGlvbnMuYWxsb3coe1xuICAgICAgJ2luc2VydCc6IGZ1bmN0aW9uKHVzZXJJZCwgbm90aWZpY2F0aW9uKSB7XG4gICAgICAgIC8vIFZhbGlkYXRlIHRoZSBub3RpZmljYXRpb25cbiAgICAgICAgX3ZhbGlkYXRlRG9jdW1lbnQobm90aWZpY2F0aW9uKTtcbiAgICAgICAgLy8gU2V0IHRoZSB1c2VyIGRlZmluZWQgXCJzZW5kXCIgcnVsZXNcbiAgICAgICAgcmV0dXJuIHJ1bGVzLnNlbmQuYXBwbHkodGhpcywgW3VzZXJJZCwgbm90aWZpY2F0aW9uXSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn07XG5cblB1c2guZGVueSA9IGZ1bmN0aW9uKHJ1bGVzKSB7XG4gIGlmIChydWxlcy5zZW5kKSB7XG4gICAgUHVzaC5ub3RpZmljYXRpb25zLmRlbnkoe1xuICAgICAgJ2luc2VydCc6IGZ1bmN0aW9uKHVzZXJJZCwgbm90aWZpY2F0aW9uKSB7XG4gICAgICAgIC8vIFZhbGlkYXRlIHRoZSBub3RpZmljYXRpb25cbiAgICAgICAgX3ZhbGlkYXRlRG9jdW1lbnQobm90aWZpY2F0aW9uKTtcbiAgICAgICAgLy8gU2V0IHRoZSB1c2VyIGRlZmluZWQgXCJzZW5kXCIgcnVsZXNcbiAgICAgICAgcmV0dXJuIHJ1bGVzLnNlbmQuYXBwbHkodGhpcywgW3VzZXJJZCwgbm90aWZpY2F0aW9uXSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn07XG4iLCIvKlxuICBBIGdlbmVyYWwgcHVycG9zZSB1c2VyIENvcmRvdmFQdXNoXG4gIGlvcywgYW5kcm9pZCwgbWFpbCwgdHdpdHRlcj8sIGZhY2Vib29rPywgc21zPywgc25haWxNYWlsPyA6KVxuXG4gIFBob25lZ2FwIGdlbmVyaWMgOlxuICBodHRwczovL2dpdGh1Yi5jb20vcGhvbmVnYXAtYnVpbGQvUHVzaFBsdWdpblxuICovXG5cbi8vIGdldFRleHQgLyBnZXRCaW5hcnlcblxuUHVzaC5zZXRCYWRnZSA9IGZ1bmN0aW9uKC8qIGlkLCBjb3VudCAqLykge1xuICAgIC8vIHRocm93IG5ldyBFcnJvcignUHVzaC5zZXRCYWRnZSBub3QgaW1wbGVtZW50ZWQgb24gdGhlIHNlcnZlcicpO1xufTtcblxudmFyIGlzQ29uZmlndXJlZCA9IGZhbHNlO1xuXG52YXIgc2VuZFdvcmtlciA9IGZ1bmN0aW9uKHRhc2ssIGludGVydmFsKSB7XG4gIGlmICh0eXBlb2YgUHVzaC5Mb2cgPT09ICdmdW5jdGlvbicpIHtcbiAgICBQdXNoLkxvZygnUHVzaDogU2VuZCB3b3JrZXIgc3RhcnRlZCwgdXNpbmcgaW50ZXJ2YWw6JywgaW50ZXJ2YWwpO1xuICB9XG4gIGlmIChQdXNoLmRlYnVnKSB7XG4gICAgY29uc29sZS5sb2coJ1B1c2g6IFNlbmQgd29ya2VyIHN0YXJ0ZWQsIHVzaW5nIGludGVydmFsOiAnICsgaW50ZXJ2YWwpO1xuICB9XG5cbiAgcmV0dXJuIE1ldGVvci5zZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAvLyB4eHg6IGFkZCBleHBvbmVudGlhbCBiYWNrb2ZmIG9uIGVycm9yXG4gICAgdHJ5IHtcbiAgICAgIHRhc2soKTtcbiAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICBpZiAodHlwZW9mIFB1c2guTG9nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIFB1c2guTG9nKCdQdXNoOiBFcnJvciB3aGlsZSBzZW5kaW5nOicsIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgaWYgKFB1c2guZGVidWcpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1B1c2g6IEVycm9yIHdoaWxlIHNlbmRpbmc6ICcgKyBlcnJvci5tZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIGludGVydmFsKTtcbn07XG5cblB1c2guQ29uZmlndXJlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBvcHRpb25zID0gXy5leHRlbmQoe1xuICAgICAgc2VuZFRpbWVvdXQ6IDYwMDAwLCAvLyBUaW1lb3V0IHBlcmlvZCBmb3Igbm90aWZpY2F0aW9uIHNlbmRcbiAgICB9LCBvcHRpb25zKTtcbiAgICAvLyBodHRwczovL25wbWpzLm9yZy9wYWNrYWdlL2FwblxuXG4gICAgLy8gQWZ0ZXIgcmVxdWVzdGluZyB0aGUgY2VydGlmaWNhdGUgZnJvbSBBcHBsZSwgZXhwb3J0IHlvdXIgcHJpdmF0ZSBrZXkgYXNcbiAgICAvLyBhIC5wMTIgZmlsZSBhbmRkb3dubG9hZCB0aGUgLmNlciBmaWxlIGZyb20gdGhlIGlPUyBQcm92aXNpb25pbmcgUG9ydGFsLlxuXG4gICAgLy8gZ2F0ZXdheS5wdXNoLmFwcGxlLmNvbSwgcG9ydCAyMTk1XG4gICAgLy8gZ2F0ZXdheS5zYW5kYm94LnB1c2guYXBwbGUuY29tLCBwb3J0IDIxOTVcblxuICAgIC8vIE5vdywgaW4gdGhlIGRpcmVjdG9yeSBjb250YWluaW5nIGNlcnQuY2VyIGFuZCBrZXkucDEyIGV4ZWN1dGUgdGhlXG4gICAgLy8gZm9sbG93aW5nIGNvbW1hbmRzIHRvIGdlbmVyYXRlIHlvdXIgLnBlbSBmaWxlczpcbiAgICAvLyAkIG9wZW5zc2wgeDUwOSAtaW4gY2VydC5jZXIgLWluZm9ybSBERVIgLW91dGZvcm0gUEVNIC1vdXQgY2VydC5wZW1cbiAgICAvLyAkIG9wZW5zc2wgcGtjczEyIC1pbiBrZXkucDEyIC1vdXQga2V5LnBlbSAtbm9kZXNcblxuICAgIC8vIEJsb2NrIG11bHRpcGxlIGNhbGxzXG4gICAgaWYgKGlzQ29uZmlndXJlZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQdXNoLkNvbmZpZ3VyZSBzaG91bGQgbm90IGJlIGNhbGxlZCBtb3JlIHRoYW4gb25jZSEnKTtcbiAgICB9XG5cbiAgICBpc0NvbmZpZ3VyZWQgPSB0cnVlO1xuXG4gICAgLy8gQWRkIGRlYnVnIGluZm9cbiAgICBpZiAoUHVzaC5kZWJ1Zykge1xuICAgICAgY29uc29sZS5sb2coJ1B1c2guQ29uZmlndXJlJywgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgd2hlbiBhIHRva2VuIGlzIHJlcGxhY2VkIG9uIGEgZGV2aWNlIC0gbm9ybWFsbHlcbiAgICAvLyB0aGlzIHNob3VsZCBub3QgaGFwcGVuLCBidXQgaWYgaXQgZG9lcyB3ZSBzaG91bGQgdGFrZSBhY3Rpb24gb24gaXRcbiAgICBfcmVwbGFjZVRva2VuID0gZnVuY3Rpb24oY3VycmVudFRva2VuLCBuZXdUb2tlbikge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnUmVwbGFjZSB0b2tlbjogJyArIGN1cnJlbnRUb2tlbiArICcgLS0gJyArIG5ld1Rva2VuKTtcbiAgICAgICAgLy8gSWYgdGhlIHNlcnZlciBnZXRzIGEgdG9rZW4gZXZlbnQgaXRzIHBhc3NpbmcgaW4gdGhlIGN1cnJlbnQgdG9rZW4gYW5kXG4gICAgICAgIC8vIHRoZSBuZXcgdmFsdWUgLSBpZiBuZXcgdmFsdWUgaXMgdW5kZWZpbmVkIHRoaXMgZW1wdHkgdGhlIHRva2VuXG4gICAgICAgIHNlbGYuZW1pdFN0YXRlKCd0b2tlbicsIGN1cnJlbnRUb2tlbiwgbmV3VG9rZW4pO1xuICAgIH07XG5cbiAgICAvLyBSaWcgdGhlIHJlbW92ZVRva2VuIGNhbGxiYWNrXG4gICAgX3JlbW92ZVRva2VuID0gZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ1JlbW92ZSB0b2tlbjogJyArIHRva2VuKTtcbiAgICAgICAgLy8gSW52YWxpZGF0ZSB0aGUgdG9rZW5cbiAgICAgICAgc2VsZi5lbWl0U3RhdGUoJ3Rva2VuJywgdG9rZW4sIG51bGwpO1xuICAgIH07XG5cblxuICAgIGlmIChvcHRpb25zLmFwbikge1xuICAgICAgICBpZiAoUHVzaC5kZWJ1Zykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdQdXNoOiBBUE4gY29uZmlndXJlZCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWxsb3cgcHJvZHVjdGlvbiB0byBiZSBhIGdlbmVyYWwgb3B0aW9uIGZvciBwdXNoIG5vdGlmaWNhdGlvbnNcbiAgICAgICAgaWYgKG9wdGlvbnMucHJvZHVjdGlvbiA9PT0gQm9vbGVhbihvcHRpb25zLnByb2R1Y3Rpb24pKSB7XG4gICAgICAgICAgb3B0aW9ucy5hcG4ucHJvZHVjdGlvbiA9IG9wdGlvbnMucHJvZHVjdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdpdmUgdGhlIHVzZXIgd2FybmluZ3MgYWJvdXQgZGV2ZWxvcG1lbnQgc2V0dGluZ3NcbiAgICAgICAgaWYgKG9wdGlvbnMuYXBuLmRldmVsb3BtZW50KSB7XG4gICAgICAgICAgLy8gVGhpcyBmbGFnIGlzIG5vcm1hbGx5IHNldCBieSB0aGUgY29uZmlndXJhdGlvbiBmaWxlXG4gICAgICAgICAgY29uc29sZS53YXJuKCdXQVJOSU5HOiBQdXNoIEFQTiBpcyB1c2luZyBkZXZlbG9wbWVudCBrZXkgYW5kIGNlcnRpZmljYXRlJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gV2UgY2hlY2sgdGhlIGFwbiBnYXRld2F5IGkgdGhlIG9wdGlvbnMsIHdlIGNvdWxkIHJpc2sgc2hpcHBpbmdcbiAgICAgICAgICAvLyBzZXJ2ZXIgaW50byBwcm9kdWN0aW9uIHdoaWxlIHVzaW5nIHRoZSBwcm9kdWN0aW9uIGNvbmZpZ3VyYXRpb24uXG4gICAgICAgICAgLy8gT24gdGhlIG90aGVyIGhhbmQgd2UgY291bGQgYmUgaW4gZGV2ZWxvcG1lbnQgYnV0IHVzaW5nIHRoZSBwcm9kdWN0aW9uXG4gICAgICAgICAgLy8gY29uZmlndXJhdGlvbi4gQW5kIGZpbmFsbHkgd2UgY291bGQgaGF2ZSBjb25maWd1cmVkIGFuIHVua25vd24gYXBuXG4gICAgICAgICAgLy8gZ2F0ZXdheSAodGhpcyBjb3VsZCBjaGFuZ2UgaW4gdGhlIGZ1dHVyZSAtIGJ1dCBhIHdhcm5pbmcgYWJvdXQgdHlwb3NcbiAgICAgICAgICAvLyBjYW4gc2F2ZSBob3VycyBvZiBkZWJ1Z2dpbmcpXG4gICAgICAgICAgLy9cbiAgICAgICAgICAvLyBXYXJuIGFib3V0IGdhdGV3YXkgY29uZmlndXJhdGlvbnMgLSBpdCdzIG1vcmUgYSBndWlkZVxuICAgICAgICAgIGlmIChvcHRpb25zLmFwbi5nYXRld2F5KSB7XG5cbiAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuYXBuLmdhdGV3YXkgPT09ICdnYXRld2F5LnNhbmRib3gucHVzaC5hcHBsZS5jb20nKSB7XG4gICAgICAgICAgICAgICAgICAvLyBVc2luZyB0aGUgZGV2ZWxvcG1lbnQgc2FuZGJveFxuICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdXQVJOSU5HOiBQdXNoIEFQTiBpcyBpbiBkZXZlbG9wbWVudCBtb2RlJyk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5hcG4uZ2F0ZXdheSA9PT0gJ2dhdGV3YXkucHVzaC5hcHBsZS5jb20nKSB7XG4gICAgICAgICAgICAgICAgICAvLyBJbiBwcm9kdWN0aW9uIC0gYnV0IHdhcm4gaWYgd2UgYXJlIHJ1bm5pbmcgb24gbG9jYWxob3N0XG4gICAgICAgICAgICAgICAgICBpZiAoL2h0dHA6XFwvXFwvbG9jYWxob3N0Ly50ZXN0KE1ldGVvci5hYnNvbHV0ZVVybCgpKSkge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignV0FSTklORzogUHVzaCBBUE4gaXMgY29uZmlndXJlZCB0byBwcm9kdWN0aW9uIG1vZGUgLSBidXQgc2VydmVyIGlzIHJ1bm5pbmcnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcgZnJvbSBsb2NhbGhvc3QnKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIC8vIFdhcm4gYWJvdXQgZ2F0ZXdheXMgd2UgZG9udCBrbm93IGFib3V0XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1dBUk5JTkc6IFB1c2ggQVBOIHVua293biBnYXRld2F5IFwiJyArIG9wdGlvbnMuYXBuLmdhdGV3YXkgKyAnXCInKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuYXBuLnByb2R1Y3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgIGlmICgvaHR0cDpcXC9cXC9sb2NhbGhvc3QvLnRlc3QoTWV0ZW9yLmFic29sdXRlVXJsKCkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdXQVJOSU5HOiBQdXNoIEFQTiBpcyBjb25maWd1cmVkIHRvIHByb2R1Y3Rpb24gbW9kZSAtIGJ1dCBzZXJ2ZXIgaXMgcnVubmluZycgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJyBmcm9tIGxvY2FsaG9zdCcpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdXQVJOSU5HOiBQdXNoIEFQTiBpcyBpbiBkZXZlbG9wbWVudCBtb2RlJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIGNlcnRpZmljYXRlIGRhdGFcbiAgICAgICAgaWYgKCFvcHRpb25zLmFwbi5jZXJ0RGF0YSB8fCAhb3B0aW9ucy5hcG4uY2VydERhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRVJST1I6IFB1c2ggc2VydmVyIGNvdWxkIG5vdCBmaW5kIGNlcnREYXRhJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBrZXkgZGF0YVxuICAgICAgICBpZiAoIW9wdGlvbnMuYXBuLmtleURhdGEgfHwgIW9wdGlvbnMuYXBuLmtleURhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRVJST1I6IFB1c2ggc2VydmVyIGNvdWxkIG5vdCBmaW5kIGtleURhdGEnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJpZyBhcG4gY29ubmVjdGlvblxuICAgICAgICB2YXIgYXBuID0gTnBtLnJlcXVpcmUoJ2FwbicpO1xuICAgICAgICB2YXIgYXBuQ29ubmVjdGlvbiA9IG5ldyBhcG4uQ29ubmVjdGlvbiggb3B0aW9ucy5hcG4gKTtcblxuICAgICAgICAvLyBMaXN0ZW4gdG8gdHJhbnNtaXNzaW9uIGVycm9ycyAtIHNob3VsZCBoYW5kbGUgdGhlIHNhbWUgd2F5IGFzIGZlZWRiYWNrLlxuICAgICAgICBhcG5Db25uZWN0aW9uLm9uKCd0cmFuc21pc3Npb25FcnJvcicsIE1ldGVvci5iaW5kRW52aXJvbm1lbnQoZnVuY3Rpb24gKGVyckNvZGUsIG5vdGlmaWNhdGlvbiwgcmVjaXBpZW50KSB7XG4gICAgICAgICAgaWYgKFB1c2guZGVidWcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdHb3QgZXJyb3IgY29kZSAlZCBmb3IgdG9rZW4gJXMnLCBlcnJDb2RlLCBub3RpZmljYXRpb24udG9rZW4pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoWzIsIDUsIDhdLmluZGV4T2YoZXJyQ29kZSkgPj0gMCkge1xuXG5cbiAgICAgICAgICAgIC8vIEludmFsaWQgdG9rZW4gZXJyb3JzLi4uXG4gICAgICAgICAgICBfcmVtb3ZlVG9rZW4oe1xuICAgICAgICAgICAgICBhcG46IG5vdGlmaWNhdGlvbi50b2tlblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgICAgIC8vIFhYWDogc2hvdWxkIHdlIGRvIGEgdGVzdCBvZiB0aGUgY29ubmVjdGlvbj8gSXQgd291bGQgYmUgbmljZSB0byBrbm93XG4gICAgICAgIC8vIFRoYXQgdGhlIHNlcnZlci9jZXJ0aWZpY2F0ZXMvbmV0d29yayBhcmUgY29ycmVjdCBjb25maWd1cmVkXG5cbiAgICAgICAgLy8gYXBuQ29ubmVjdGlvbi5jb25uZWN0KCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gICAgIGNvbnNvbGUuaW5mbygnQ0hFQ0s6IFB1c2ggQVBOIGNvbm5lY3Rpb24gT0snKTtcbiAgICAgICAgLy8gfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIC8vICAgICBjb25zb2xlLndhcm4oJ0NIRUNLOiBQdXNoIEFQTiBjb25uZWN0aW9uIEZBSUxVUkUnKTtcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIC8vIE5vdGU6IHRoZSBhYm92ZSBjb2RlIHNwb2lscyB0aGUgY29ubmVjdGlvbiAtIGludmVzdGlnYXRlIGhvdyB0b1xuICAgICAgICAvLyBzaHV0ZG93bi9jbG9zZSBpdC5cblxuICAgICAgICBzZWxmLnNlbmRBUE4gPSBmdW5jdGlvbih1c2VyVG9rZW4sIG5vdGlmaWNhdGlvbikge1xuICAgICAgICAgICAgaWYgKE1hdGNoLnRlc3Qobm90aWZpY2F0aW9uLmFwbiwgT2JqZWN0KSkge1xuICAgICAgICAgICAgICBub3RpZmljYXRpb24gPSBfLmV4dGVuZCh7fSwgbm90aWZpY2F0aW9uLCBub3RpZmljYXRpb24uYXBuKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3NlbmRBUE4nLCBub3RpZmljYXRpb24uZnJvbSwgdXNlclRva2VuLCBub3RpZmljYXRpb24udGl0bGUsIG5vdGlmaWNhdGlvbi50ZXh0LFxuICAgICAgICAgICAgLy8gbm90aWZpY2F0aW9uLmJhZGdlLCBub3RpZmljYXRpb24ucHJpb3JpdHkpO1xuICAgICAgICAgICAgdmFyIHByaW9yaXR5ID0gKG5vdGlmaWNhdGlvbi5wcmlvcml0eSB8fCBub3RpZmljYXRpb24ucHJpb3JpdHkgPT09IDApPyBub3RpZmljYXRpb24ucHJpb3JpdHkgOiAxMDtcblxuICAgICAgICAgICAgdmFyIG15RGV2aWNlID0gbmV3IGFwbi5EZXZpY2UodXNlclRva2VuKTtcblxuICAgICAgICAgICAgdmFyIG5vdGUgPSBuZXcgYXBuLk5vdGlmaWNhdGlvbigpO1xuXG4gICAgICAgICAgICBub3RlLmV4cGlyeSA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApICsgMzYwMDsgLy8gRXhwaXJlcyAxIGhvdXIgZnJvbSBub3cuXG4gICAgICAgICAgICBpZiAodHlwZW9mIG5vdGlmaWNhdGlvbi5iYWRnZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgbm90ZS5iYWRnZSA9IG5vdGlmaWNhdGlvbi5iYWRnZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygbm90aWZpY2F0aW9uLnNvdW5kICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICBub3RlLnNvdW5kID0gbm90aWZpY2F0aW9uLnNvdW5kO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhub3RpZmljYXRpb24uY29udGVudEF2YWlsYWJsZSk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwibGFsYTJcIik7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKG5vdGlmaWNhdGlvbik7XG4gICAgICAgICAgICBpZiAodHlwZW9mIG5vdGlmaWNhdGlvbi5jb250ZW50QXZhaWxhYmxlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwibGFsYVwiKTtcbiAgICAgICAgICAgICAgbm90ZS5zZXRDb250ZW50QXZhaWxhYmxlKG5vdGlmaWNhdGlvbi5jb250ZW50QXZhaWxhYmxlKTtcbiAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhub3RlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGFkZHMgY2F0ZWdvcnkgc3VwcG9ydCBmb3IgaU9TOCBjdXN0b20gYWN0aW9ucyBhcyBkZXNjcmliZWQgaGVyZTpcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLmFwcGxlLmNvbS9saWJyYXJ5L2lvcy9kb2N1bWVudGF0aW9uL05ldHdvcmtpbmdJbnRlcm5ldC9Db25jZXB0dWFsL1xuICAgICAgICAgICAgLy8gUmVtb3RlTm90aWZpY2F0aW9uc1BHL0NoYXB0ZXJzL0lQaG9uZU9TQ2xpZW50SW1wLmh0bWwjLy9hcHBsZV9yZWYvZG9jL3VpZC9UUDQwMDA4MTk0LUNIMTAzLVNXMzZcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygbm90aWZpY2F0aW9uLmNhdGVnb3J5ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICBub3RlLmNhdGVnb3J5ID0gbm90aWZpY2F0aW9uLmNhdGVnb3J5O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBub3RlLmFsZXJ0ID0ge1xuICAgICAgICAgICAgICBib2R5OiBub3RpZmljYXRpb24udGV4dFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBub3RpZmljYXRpb24udGl0bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIG5vdGUuYWxlcnQudGl0bGUgPSBub3RpZmljYXRpb24udGl0bGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEFsbG93IHRoZSB1c2VyIHRvIHNldCBwYXlsb2FkIGRhdGFcbiAgICAgICAgICAgIG5vdGUucGF5bG9hZCA9IChub3RpZmljYXRpb24ucGF5bG9hZCkgPyB7IGVqc29uOiBFSlNPTi5zdHJpbmdpZnkobm90aWZpY2F0aW9uLnBheWxvYWQpIH0gOiB7fTtcblxuICAgICAgICAgICAgbm90ZS5wYXlsb2FkLm1lc3NhZ2VGcm9tID0gbm90aWZpY2F0aW9uLmZyb207XG4gICAgICAgICAgICBub3RlLnByaW9yaXR5ID0gcHJpb3JpdHk7XG5cblxuICAgICAgICAgICAgLy8gU3RvcmUgdGhlIHRva2VuIG9uIHRoZSBub3RlIHNvIHdlIGNhbiByZWZlcmVuY2UgaXQgaWYgdGhlcmUgd2FzIGFuIGVycm9yXG4gICAgICAgICAgICBub3RlLnRva2VuID0gdXNlclRva2VuO1xuXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnSTpTZW5kIG1lc3NhZ2UgdG86ICcgKyB1c2VyVG9rZW4gKyAnIGNvdW50PScgKyBjb3VudCk7XG5cbiAgICAgICAgICAgIGFwbkNvbm5lY3Rpb24ucHVzaE5vdGlmaWNhdGlvbihub3RlLCBteURldmljZSk7XG5cbiAgICAgICAgfTtcblxuXG4gICAgICAgIHZhciBpbml0RmVlZGJhY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYXBuID0gTnBtLnJlcXVpcmUoJ2FwbicpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ0luaXQgZmVlZGJhY2snKTtcbiAgICAgICAgICAgIHZhciBmZWVkYmFja09wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgJ2JhdGNoRmVlZGJhY2snOiB0cnVlLFxuXG4gICAgICAgICAgICAgICAgLy8gVGltZSBpbiBTRUNPTkRTXG4gICAgICAgICAgICAgICAgJ2ludGVydmFsJzogNSxcbiAgICAgICAgICAgICAgICBwcm9kdWN0aW9uOiAhb3B0aW9ucy5hcG4uZGV2ZWxvcG1lbnQsXG4gICAgICAgICAgICAgICAgY2VydDogb3B0aW9ucy5jZXJ0RGF0YSxcbiAgICAgICAgICAgICAgICBrZXk6IG9wdGlvbnMua2V5RGF0YSxcbiAgICAgICAgICAgICAgICBwYXNzcGhyYXNlOiBvcHRpb25zLnBhc3NwaHJhc2VcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBmZWVkYmFjayA9IG5ldyBhcG4uRmVlZGJhY2soZmVlZGJhY2tPcHRpb25zKTtcbiAgICAgICAgICAgIGZlZWRiYWNrLm9uKCdmZWVkYmFjaycsIGZ1bmN0aW9uIChkZXZpY2VzKSB7XG4gICAgICAgICAgICAgICAgZGV2aWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIERvIHNvbWV0aGluZyB3aXRoIGl0ZW0uZGV2aWNlIGFuZCBpdGVtLnRpbWU7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdBOlBVU0ggRkVFREJBQ0sgJyArIGl0ZW0uZGV2aWNlICsgJyAtICcgKyBpdGVtLnRpbWUpO1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgYXBwIGlzIG1vc3QgbGlrZWx5IHJlbW92ZWQgZnJvbSB0aGUgZGV2aWNlLCB3ZSBzaG91bGRcbiAgICAgICAgICAgICAgICAgICAgLy8gcmVtb3ZlIHRoZSB0b2tlblxuICAgICAgICAgICAgICAgICAgICBfcmVtb3ZlVG9rZW4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBuOiBpdGVtLmRldmljZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmZWVkYmFjay5zdGFydCgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEluaXQgZmVlZGJhY2sgZnJvbSBhcG4gc2VydmVyXG4gICAgICAgIC8vIFRoaXMgd2lsbCBoZWxwIGtlZXAgdGhlIGFwcENvbGxlY3Rpb24gdXAtdG8tZGF0ZSwgaXQgd2lsbCBoZWxwIHVwZGF0ZVxuICAgICAgICAvLyBhbmQgcmVtb3ZlIHRva2VuIGZyb20gYXBwQ29sbGVjdGlvbi5cbiAgICAgICAgaW5pdEZlZWRiYWNrKCk7XG5cbiAgICB9IC8vIEVPIGlvcyBub3RpZmljYXRpb25cblxuICAgIGlmIChvcHRpb25zLmdjbSAmJiBvcHRpb25zLmdjbS5hcGlLZXkpIHtcbiAgICAgICAgaWYgKFB1c2guZGVidWcpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnR0NNIGNvbmZpZ3VyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICAvL3NlbGYuc2VuZEdDTSA9IGZ1bmN0aW9uKG9wdGlvbnMuZnJvbSwgdXNlclRva2Vucywgb3B0aW9ucy50aXRsZSwgb3B0aW9ucy50ZXh0LCBvcHRpb25zLmJhZGdlLCBvcHRpb25zLnByaW9yaXR5KSB7XG4gICAgICAgIHNlbGYuc2VuZEdDTSA9IGZ1bmN0aW9uKHVzZXJUb2tlbnMsIG5vdGlmaWNhdGlvbikge1xuICAgICAgICAgICAgaWYgKE1hdGNoLnRlc3Qobm90aWZpY2F0aW9uLmdjbSwgT2JqZWN0KSkge1xuICAgICAgICAgICAgICBub3RpZmljYXRpb24gPSBfLmV4dGVuZCh7fSwgbm90aWZpY2F0aW9uLCBub3RpZmljYXRpb24uZ2NtKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHVzZXJUb2tlbnMgYXJlIGFuIGFycmF5IG9mIHN0cmluZ3NcbiAgICAgICAgICAgIGlmICh1c2VyVG9rZW5zID09PSAnJyt1c2VyVG9rZW5zKSB7XG4gICAgICAgICAgICAgIHVzZXJUb2tlbnMgPSBbdXNlclRva2Vuc107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIGFueSB0b2tlbnMgaW4gdGhlcmUgdG8gc2VuZFxuICAgICAgICAgICAgaWYgKCF1c2VyVG9rZW5zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmIChQdXNoLmRlYnVnKSB7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc2VuZEdDTSBubyBwdXNoIHRva2VucyBmb3VuZCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChQdXNoLmRlYnVnKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzZW5kR0NNJywgdXNlclRva2Vucywgbm90aWZpY2F0aW9uKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGdjbSA9IE5wbS5yZXF1aXJlKCdub2RlLWdjbScpO1xuICAgICAgICAgICAgdmFyIEZpYmVyID0gTnBtLnJlcXVpcmUoJ2ZpYmVycycpO1xuXG4gICAgICAgICAgICAvLyBBbGxvdyB1c2VyIHRvIHNldCBwYXlsb2FkXG4gICAgICAgICAgICB2YXIgZGF0YSA9IChub3RpZmljYXRpb24ucGF5bG9hZCkgPyB7IGVqc29uOiBFSlNPTi5zdHJpbmdpZnkobm90aWZpY2F0aW9uLnBheWxvYWQpIH0gOiB7fTtcblxuICAgICAgICAgICAgZGF0YS50aXRsZSA9IG5vdGlmaWNhdGlvbi50aXRsZTtcbiAgICAgICAgICAgIGRhdGEubWVzc2FnZSA9IG5vdGlmaWNhdGlvbi50ZXh0O1xuXG4gICAgICAgICAgICAvLyBTZXQgaW1hZ2VcbiAgICAgICAgICAgIGlmKHR5cGVvZiBub3RpZmljYXRpb24uaW1hZ2UgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIGRhdGEuaW1hZ2UgPSBub3RpZmljYXRpb24uaW1hZ2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNldCBleHRyYSBkZXRhaWxzXG4gICAgICAgICAgICBpZiAodHlwZW9mIG5vdGlmaWNhdGlvbi5iYWRnZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgZGF0YS5tc2djbnQgPSBub3RpZmljYXRpb24uYmFkZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIG5vdGlmaWNhdGlvbi5zb3VuZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgZGF0YS5zb3VuZG5hbWUgPSBub3RpZmljYXRpb24uc291bmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIG5vdGlmaWNhdGlvbi5ub3RJZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgZGF0YS5ub3RJZCA9IG5vdGlmaWNhdGlvbi5ub3RJZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHR5cGVvZiBub3RpZmljYXRpb24uc3R5bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIGRhdGEuc3R5bGUgPSBub3RpZmljYXRpb24uc3R5bGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZih0eXBlb2Ygbm90aWZpY2F0aW9uLnN1bW1hcnlUZXh0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICBkYXRhLnN1bW1hcnlUZXh0ID0gbm90aWZpY2F0aW9uLnN1bW1hcnlUZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYodHlwZW9mIG5vdGlmaWNhdGlvbi5waWN0dXJlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICBkYXRhLnBpY3R1cmUgPSBub3RpZmljYXRpb24ucGljdHVyZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy92YXIgbWVzc2FnZSA9IG5ldyBnY20uTWVzc2FnZSgpO1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBuZXcgZ2NtLk1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIGNvbGxhcHNlS2V5OiBub3RpZmljYXRpb24uZnJvbSxcbiAgICAgICAgICAgIC8vICAgIGRlbGF5V2hpbGVJZGxlOiB0cnVlLFxuICAgICAgICAgICAgLy8gICAgdGltZVRvTGl2ZTogNCxcbiAgICAgICAgICAgIC8vICAgIHJlc3RyaWN0ZWRfcGFja2FnZV9uYW1lOiAnZGsuZ2kyLmFwcCdcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKFB1c2guZGVidWcpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NyZWF0ZSBHQ00gU2VuZGVyIHVzaW5nIFwiJyArIG9wdGlvbnMuZ2NtLmFwaUtleSArICdcIicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHNlbmRlciA9IG5ldyBnY20uU2VuZGVyKG9wdGlvbnMuZ2NtLmFwaUtleSk7XG5cbiAgICAgICAgICAgIF8uZWFjaCh1c2VyVG9rZW5zLCBmdW5jdGlvbih2YWx1ZSAvKiwga2V5ICovKSB7XG4gICAgICAgICAgICAgICAgaWYgKFB1c2guZGVidWcpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBOlNlbmQgbWVzc2FnZSB0bzogJyArIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLyptZXNzYWdlLmFkZERhdGEoJ3RpdGxlJywgdGl0bGUpO1xuICAgICAgICAgICAgbWVzc2FnZS5hZGREYXRhKCdtZXNzYWdlJywgdGV4dCk7XG4gICAgICAgICAgICBtZXNzYWdlLmFkZERhdGEoJ21zZ2NudCcsICcxJyk7XG4gICAgICAgICAgICBtZXNzYWdlLmNvbGxhcHNlS2V5ID0gJ3NpdERyaWZ0JztcbiAgICAgICAgICAgIG1lc3NhZ2UuZGVsYXlXaGlsZUlkbGUgPSB0cnVlO1xuICAgICAgICAgICAgbWVzc2FnZS50aW1lVG9MaXZlID0gMzsqL1xuXG4gICAgICAgICAgICAvLyAvKipcbiAgICAgICAgICAgIC8vICAqIFBhcmFtZXRlcnM6IG1lc3NhZ2UtbGl0ZXJhbCwgdXNlclRva2Vucy1hcnJheSwgTm8uIG9mIHJldHJpZXMsIGNhbGxiYWNrLWZ1bmN0aW9uXG4gICAgICAgICAgICAvLyAgKi9cblxuICAgICAgICAgICAgdmFyIHVzZXJUb2tlbiA9ICh1c2VyVG9rZW5zLmxlbmd0aCA9PT0gMSk/dXNlclRva2Vuc1swXTpudWxsO1xuXG4gICAgICAgICAgICBzZW5kZXIuc2VuZChtZXNzYWdlLCB1c2VyVG9rZW5zLCA1LCBmdW5jdGlvbiAoZXJyLCByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChQdXNoLmRlYnVnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0FORFJPSUQgRVJST1I6IHJlc3VsdCBvZiBzZW5kZXI6ICcgKyByZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChQdXNoLmRlYnVnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQU5EUk9JRDogUmVzdWx0IG9mIHNlbmRlciBpcyBudWxsJyk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoUHVzaC5kZWJ1Zykge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBTkRST0lEOiBSZXN1bHQgb2Ygc2VuZGVyOiAnICsgSlNPTi5zdHJpbmdpZnkocmVzdWx0KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5jYW5vbmljYWxfaWRzID09PSAxICYmIHVzZXJUb2tlbikgeyAvLyBqc2hpbnQgaWdub3JlOmxpbmVcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBhbiBvbGQgZGV2aWNlLCB0b2tlbiBpcyByZXBsYWNlZFxuICAgICAgICAgICAgICAgICAgICAgICAgRmliZXIoZnVuY3Rpb24oc2VsZikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJ1biBpbiBmaWJlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY2FsbGJhY2soc2VsZi5vbGRUb2tlbiwgc2VsZi5uZXdUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaChlcnIpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgfSkucnVuKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRUb2tlbjogeyBnY206IHVzZXJUb2tlbiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1Rva2VuOiB7IGdjbTogcmVzdWx0LnJlc3VsdHNbMF0ucmVnaXN0cmF0aW9uX2lkIH0sIC8vIGpzaGludCBpZ25vcmU6bGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBfcmVwbGFjZVRva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vX3JlcGxhY2VUb2tlbih7IGdjbTogdXNlclRva2VuIH0sIHsgZ2NtOiByZXN1bHQucmVzdWx0c1swXS5yZWdpc3RyYXRpb25faWQgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBXZSBjYW50IHNlbmQgdG8gdGhhdCB0b2tlbiAtIG1pZ2h0IG5vdCBiZSByZWdpc3RyZWRcbiAgICAgICAgICAgICAgICAgICAgLy8gYXNrIHRoZSB1c2VyIHRvIHJlbW92ZSB0aGUgdG9rZW4gZnJvbSB0aGUgbGlzdFxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmZhaWx1cmUgIT09IDAgJiYgdXNlclRva2VuKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgYW4gb2xkIGRldmljZSwgdG9rZW4gaXMgcmVwbGFjZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIEZpYmVyKGZ1bmN0aW9uKHNlbGYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSdW4gaW4gZmliZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmNhbGxiYWNrKHNlbGYudG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2goZXJyKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLnJ1bih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW46IHsgZ2NtOiB1c2VyVG9rZW4gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogX3JlbW92ZVRva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vX3JlcGxhY2VUb2tlbih7IGdjbTogdXNlclRva2VuIH0sIHsgZ2NtOiByZXN1bHQucmVzdWx0c1swXS5yZWdpc3RyYXRpb25faWQgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyAvKiogVXNlIHRoZSBmb2xsb3dpbmcgbGluZSBpZiB5b3Ugd2FudCB0byBzZW5kIHRoZSBtZXNzYWdlIHdpdGhvdXQgcmV0cmllc1xuICAgICAgICAgICAgLy8gc2VuZGVyLnNlbmROb1JldHJ5KG1lc3NhZ2UsIHVzZXJUb2tlbnMsIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZygnQU5EUk9JRDogJyArIEpTT04uc3RyaW5naWZ5KHJlc3VsdCkpO1xuICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgICAvLyAqKi9cbiAgICAgICAgfTsgLy8gRU8gc2VuZEFuZHJvaWRcblxuICAgIH0gLy8gRU8gQW5kcm9pZFxuXG4gICAgLy8gVW5pdmVyc2FsIHNlbmQgZnVuY3Rpb25cbiAgICB2YXIgX3F1ZXJ5U2VuZCA9IGZ1bmN0aW9uKHF1ZXJ5LCBvcHRpb25zKSB7XG5cbiAgICAgIHZhciBjb3VudEFwbiA9IFtdO1xuICAgICAgdmFyIGNvdW50R2NtID0gW107XG5cbiAgICAgICAgUHVzaC5hcHBDb2xsZWN0aW9uLmZpbmQocXVlcnkpLmZvckVhY2goZnVuY3Rpb24oYXBwKSB7XG5cbiAgICAgICAgICBpZiAoUHVzaC5kZWJ1Zykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3NlbmQgdG8gdG9rZW4nLCBhcHAudG9rZW4pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGFwcC50b2tlbi5hcG4pIHtcbiAgICAgICAgICAgICAgY291bnRBcG4ucHVzaChhcHAuX2lkKTtcbiAgICAgICAgICAgICAgICAvLyBTZW5kIHRvIEFQTlxuICAgICAgICAgICAgICAgIGlmIChzZWxmLnNlbmRBUE4pIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYuc2VuZEFQTihhcHAudG9rZW4uYXBuLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXBwLnRva2VuLmdjbSkge1xuICAgICAgICAgICAgICBjb3VudEdjbS5wdXNoKGFwcC5faWQpO1xuXG4gICAgICAgICAgICAgICAgLy8gU2VuZCB0byBHQ01cbiAgICAgICAgICAgICAgICAvLyBXZSBkbyBzdXBwb3J0IG11bHRpcGxlIGhlcmUgLSBzbyB3ZSBzaG91bGQgY29uc3RydWN0IGFuIGFycmF5XG4gICAgICAgICAgICAgICAgLy8gYW5kIHNlbmQgaXQgYnVsayAtIEludmVzdGlnYXRlIGxpbWl0IGNvdW50IG9mIGlkJ3NcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5zZW5kR0NNKSB7XG4gICAgICAgICAgICAgICAgICBzZWxmLnNlbmRHQ00oYXBwLnRva2VuLmdjbSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUHVzaC5zZW5kIGdvdCBhIGZhdWx0eSBxdWVyeScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChQdXNoLmRlYnVnKSB7XG5cbiAgICAgICAgICBjb25zb2xlLmxvZygnUHVzaDogU2VudCBtZXNzYWdlIFwiJyArIG9wdGlvbnMudGl0bGUgKyAnXCIgdG8gJyArIGNvdW50QXBuLmxlbmd0aCArICcgaW9zIGFwcHMgJyArXG4gICAgICAgICAgICBjb3VudEdjbS5sZW5ndGggKyAnIGFuZHJvaWQgYXBwcycpO1xuXG4gICAgICAgICAgLy8gQWRkIHNvbWUgdmVyYm9zaXR5IGFib3V0IHRoZSBzZW5kIHJlc3VsdCwgbWFraW5nIHN1cmUgdGhlIGRldmVsb3BlclxuICAgICAgICAgIC8vIHVuZGVyc3RhbmRzIHdoYXQganVzdCBoYXBwZW5lZC5cbiAgICAgICAgICBpZiAoIWNvdW50QXBuLmxlbmd0aCAmJiAhY291bnRHY20ubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoUHVzaC5hcHBDb2xsZWN0aW9uLmZpbmQoKS5jb3VudCgpID09PSAwKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQdXNoLCBHVUlERTogVGhlIFwiUHVzaC5hcHBDb2xsZWN0aW9uXCIgaXMgZW1wdHkgLScgK1xuICAgICAgICAgICAgICAgICcgTm8gY2xpZW50cyBoYXZlIHJlZ2lzdHJlZCBvbiB0aGUgc2VydmVyIHlldC4uLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoIWNvdW50QXBuLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKFB1c2guYXBwQ29sbGVjdGlvbi5maW5kKHsgJ3Rva2VuLmFwbic6IHsgJGV4aXN0czogdHJ1ZSB9IH0pLmNvdW50KCkgPT09IDApIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1B1c2gsIEdVSURFOiBUaGUgXCJQdXNoLmFwcENvbGxlY3Rpb25cIiAtIE5vIEFQTiBjbGllbnRzIGhhdmUgcmVnaXN0cmVkIG9uIHRoZSBzZXJ2ZXIgeWV0Li4uJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmICghY291bnRHY20ubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoUHVzaC5hcHBDb2xsZWN0aW9uLmZpbmQoeyAndG9rZW4uZ2NtJzogeyAkZXhpc3RzOiB0cnVlIH0gfSkuY291bnQoKSA9PT0gMCkge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUHVzaCwgR1VJREU6IFRoZSBcIlB1c2guYXBwQ29sbGVjdGlvblwiIC0gTm8gR0NNIGNsaWVudHMgaGF2ZSByZWdpc3RyZWQgb24gdGhlIHNlcnZlciB5ZXQuLi4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgYXBuOiBjb3VudEFwbixcbiAgICAgICAgICBnY206IGNvdW50R2NtXG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIHNlbGYuc2VydmVyU2VuZCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHsgYmFkZ2U6IDAgfTtcbiAgICAgIHZhciBxdWVyeTtcblxuICAgICAgLy8gQ2hlY2sgYmFzaWMgb3B0aW9uc1xuICAgICAgaWYgKG9wdGlvbnMuZnJvbSAhPT0gJycrb3B0aW9ucy5mcm9tKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUHVzaC5zZW5kOiBvcHRpb24gXCJmcm9tXCIgbm90IGEgc3RyaW5nJyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLnRpdGxlICE9PSAnJytvcHRpb25zLnRpdGxlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUHVzaC5zZW5kOiBvcHRpb24gXCJ0aXRsZVwiIG5vdCBhIHN0cmluZycpO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy50ZXh0ICE9PSAnJytvcHRpb25zLnRleHQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQdXNoLnNlbmQ6IG9wdGlvbiBcInRleHRcIiBub3QgYSBzdHJpbmcnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMudG9rZW4gfHwgb3B0aW9ucy50b2tlbnMpIHtcblxuICAgICAgICAvLyBUaGUgdXNlciBzZXQgb25lIHRva2VuIG9yIGFycmF5IG9mIHRva2Vuc1xuICAgICAgICB2YXIgdG9rZW5MaXN0ID0gKG9wdGlvbnMudG9rZW4pPyBbb3B0aW9ucy50b2tlbl0gOiBvcHRpb25zLnRva2VucztcblxuICAgICAgICBpZiAoUHVzaC5kZWJ1Zykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdQdXNoOiBTZW5kIG1lc3NhZ2UgXCInICsgb3B0aW9ucy50aXRsZSArICdcIiB2aWEgdG9rZW4ocyknLCB0b2tlbkxpc3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgcXVlcnkgPSB7XG4gICAgICAgICAgJG9yOiBbXG4gICAgICAgICAgICAgIC8vIFhYWDogVGVzdCB0aGlzIHF1ZXJ5OiBjYW4gd2UgaGFuZCBpbiBhIGxpc3Qgb2YgcHVzaCB0b2tlbnM/XG4gICAgICAgICAgICAgIHsgJGFuZDogW1xuICAgICAgICAgICAgICAgICAgeyB0b2tlbjogeyAkaW46IHRva2VuTGlzdCB9IH0sXG4gICAgICAgICAgICAgICAgICAvLyBBbmQgaXMgbm90IGRpc2FibGVkXG4gICAgICAgICAgICAgICAgICB7IGVuYWJsZWQ6IHsgJG5lOiBmYWxzZSB9fVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgLy8gWFhYOiBUZXN0IHRoaXMgcXVlcnk6IGRvZXMgdGhpcyB3b3JrIG9uIGFwcCBpZD9cbiAgICAgICAgICAgICAgeyAkYW5kOiBbXG4gICAgICAgICAgICAgICAgICB7IF9pZDogeyAkaW46IHRva2VuTGlzdCB9IH0sIC8vIG9uZSBvZiB0aGUgYXBwIGlkc1xuICAgICAgICAgICAgICAgICAgeyAkb3I6IFtcbiAgICAgICAgICAgICAgICAgICAgICB7ICd0b2tlbi5hcG4nOiB7ICRleGlzdHM6IHRydWUgfSAgfSwgLy8gZ290IGFwbiB0b2tlblxuICAgICAgICAgICAgICAgICAgICAgIHsgJ3Rva2VuLmdjbSc6IHsgJGV4aXN0czogdHJ1ZSB9ICB9ICAvLyBnb3QgZ2NtIHRva2VuXG4gICAgICAgICAgICAgICAgICBdfSxcbiAgICAgICAgICAgICAgICAgIC8vIEFuZCBpcyBub3QgZGlzYWJsZWRcbiAgICAgICAgICAgICAgICAgIHsgZW5hYmxlZDogeyAkbmU6IGZhbHNlIH19XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgXVxuICAgICAgICB9O1xuXG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbnMucXVlcnkpIHtcblxuICAgICAgICBpZiAoUHVzaC5kZWJ1Zykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdQdXNoOiBTZW5kIG1lc3NhZ2UgXCInICsgb3B0aW9ucy50aXRsZSArICdcIiB2aWEgcXVlcnknLCBvcHRpb25zLnF1ZXJ5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHF1ZXJ5ID0ge1xuICAgICAgICAgICRhbmQ6IFtcbiAgICAgICAgICAgICAgb3B0aW9ucy5xdWVyeSwgLy8gcXVlcnkgb2JqZWN0XG4gICAgICAgICAgICAgIHsgJG9yOiBbXG4gICAgICAgICAgICAgICAgICB7ICd0b2tlbi5hcG4nOiB7ICRleGlzdHM6IHRydWUgfSAgfSwgLy8gZ290IGFwbiB0b2tlblxuICAgICAgICAgICAgICAgICAgeyAndG9rZW4uZ2NtJzogeyAkZXhpc3RzOiB0cnVlIH0gIH0gIC8vIGdvdCBnY20gdG9rZW5cbiAgICAgICAgICAgICAgXX0sXG4gICAgICAgICAgICAgIC8vIEFuZCBpcyBub3QgZGlzYWJsZWRcbiAgICAgICAgICAgICAgeyBlbmFibGVkOiB7ICRuZTogZmFsc2UgfX1cbiAgICAgICAgICBdXG4gICAgICAgIH07XG4gICAgICB9XG5cblxuICAgICAgaWYgKHF1ZXJ5KSB7XG5cbiAgICAgICAgLy8gQ29udmVydCB0byBxdWVyeVNlbmQgYW5kIHJldHVybiBzdGF0dXNcbiAgICAgICAgcmV0dXJuIF9xdWVyeVNlbmQocXVlcnksIG9wdGlvbnMpO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1B1c2guc2VuZDogcGxlYXNlIHNldCBvcHRpb24gXCJ0b2tlblwiL1widG9rZW5zXCIgb3IgXCJxdWVyeVwiJyk7XG4gICAgICB9XG5cbiAgICB9O1xuXG5cbiAgICAvLyBUaGlzIGludGVydmFsIHdpbGwgYWxsb3cgb25seSBvbmUgbm90aWZpY2F0aW9uIHRvIGJlIHNlbnQgYXQgYSB0aW1lLCBpdFxuICAgIC8vIHdpbGwgY2hlY2sgZm9yIG5ldyBub3RpZmljYXRpb25zIGF0IGV2ZXJ5IGBvcHRpb25zLnNlbmRJbnRlcnZhbGBcbiAgICAvLyAoZGVmYXVsdCBpbnRlcnZhbCBpcyAxNTAwMCBtcylcbiAgICAvL1xuICAgIC8vIEl0IGxvb2tzIGluIG5vdGlmaWNhdGlvbnMgY29sbGVjdGlvbiB0byBzZWUgaWYgdGhlcmVzIGFueSBwZW5kaW5nXG4gICAgLy8gbm90aWZpY2F0aW9ucywgaWYgc28gaXQgd2lsbCB0cnkgdG8gcmVzZXJ2ZSB0aGUgcGVuZGluZyBub3RpZmljYXRpb24uXG4gICAgLy8gSWYgc3VjY2Vzc2Z1bGx5IHJlc2VydmVkIHRoZSBzZW5kIGlzIHN0YXJ0ZWQuXG4gICAgLy9cbiAgICAvLyBJZiBub3RpZmljYXRpb24ucXVlcnkgaXMgdHlwZSBzdHJpbmcsIGl0J3MgYXNzdW1lZCB0byBiZSBhIGpzb24gc3RyaW5nXG4gICAgLy8gdmVyc2lvbiBvZiB0aGUgcXVlcnkgc2VsZWN0b3IuIE1ha2luZyBpdCBhYmxlIHRvIGNhcnJ5IGAkYCBwcm9wZXJ0aWVzIGluXG4gICAgLy8gdGhlIG1vbmdvIGNvbGxlY3Rpb24uXG4gICAgLy9cbiAgICAvLyBQci4gZGVmYXVsdCBub3RpZmljYXRpb25zIGFyZSByZW1vdmVkIGZyb20gdGhlIGNvbGxlY3Rpb24gYWZ0ZXIgc2VuZCBoYXZlXG4gICAgLy8gY29tcGxldGVkLiBTZXR0aW5nIGBvcHRpb25zLmtlZXBOb3RpZmljYXRpb25zYCB3aWxsIHVwZGF0ZSBhbmQga2VlcCB0aGVcbiAgICAvLyBub3RpZmljYXRpb24gZWcuIGlmIG5lZWRlZCBmb3IgaGlzdG9yaWNhbCByZWFzb25zLlxuICAgIC8vXG4gICAgLy8gQWZ0ZXIgdGhlIHNlbmQgaGF2ZSBjb21wbGV0ZWQgYSBcInNlbmRcIiBldmVudCB3aWxsIGJlIGVtaXR0ZWQgd2l0aCBhXG4gICAgLy8gc3RhdHVzIG9iamVjdCBjb250YWluaW5nIG5vdGlmaWNhdGlvbiBpZCBhbmQgdGhlIHNlbmQgcmVzdWx0IG9iamVjdC5cbiAgICAvL1xuICAgIHZhciBpc1NlbmRpbmdOb3RpZmljYXRpb24gPSBmYWxzZTtcblxuICAgIGlmIChvcHRpb25zLnNlbmRJbnRlcnZhbCAhPT0gbnVsbCkge1xuXG4gICAgICAvLyBUaGlzIHdpbGwgcmVxdWlyZSBpbmRleCBzaW5jZSB3ZSBzb3J0IG5vdGlmaWNhdGlvbnMgYnkgY3JlYXRlZEF0XG4gICAgICBQdXNoLm5vdGlmaWNhdGlvbnMuX2Vuc3VyZUluZGV4KHsgY3JlYXRlZEF0OiAxIH0pO1xuICAgICAgUHVzaC5ub3RpZmljYXRpb25zLl9lbnN1cmVJbmRleCh7IHNlbnQ6IDEgfSk7XG4gICAgICBQdXNoLm5vdGlmaWNhdGlvbnMuX2Vuc3VyZUluZGV4KHsgc2VuZGluZzogMSB9KTtcbiAgICAgIFB1c2gubm90aWZpY2F0aW9ucy5fZW5zdXJlSW5kZXgoeyBkZWxheVVudGlsOiAxIH0pO1xuXG4gICAgICB2YXIgc2VuZE5vdGlmaWNhdGlvbiA9IGZ1bmN0aW9uKG5vdGlmaWNhdGlvbikge1xuICAgICAgICAvLyBSZXNlcnZlIG5vdGlmaWNhdGlvblxuICAgICAgICB2YXIgbm93ID0gK25ldyBEYXRlKCk7XG4gICAgICAgIHZhciB0aW1lb3V0QXQgPSBub3cgKyBvcHRpb25zLnNlbmRUaW1lb3V0O1xuICAgICAgICB2YXIgcmVzZXJ2ZWQgPSBQdXNoLm5vdGlmaWNhdGlvbnMudXBkYXRlKHtcbiAgICAgICAgICBfaWQ6IG5vdGlmaWNhdGlvbi5faWQsXG4gICAgICAgICAgc2VudDogZmFsc2UsIC8vIHh4eDogbmVlZCB0byBtYWtlIHN1cmUgdGhpcyBpcyBzZXQgb24gY3JlYXRlXG4gICAgICAgICAgc2VuZGluZzogeyAkbHQ6IG5vdyB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgJHNldDoge1xuICAgICAgICAgICAgc2VuZGluZzogdGltZW91dEF0LFxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gTWFrZSBzdXJlIHdlIG9ubHkgaGFuZGxlIG5vdGlmaWNhdGlvbnMgcmVzZXJ2ZWQgYnkgdGhpc1xuICAgICAgICAvLyBpbnN0YW5jZVxuICAgICAgICBpZiAocmVzZXJ2ZWQpIHtcblxuICAgICAgICAgIC8vIENoZWNrIGlmIHF1ZXJ5IGlzIHNldCBhbmQgaXMgdHlwZSBTdHJpbmdcbiAgICAgICAgICBpZiAobm90aWZpY2F0aW9uLnF1ZXJ5ICYmIG5vdGlmaWNhdGlvbi5xdWVyeSA9PT0gJycrbm90aWZpY2F0aW9uLnF1ZXJ5KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAvLyBUaGUgcXVlcnkgaXMgaW4gc3RyaW5nIGpzb24gZm9ybWF0IC0gd2UgbmVlZCB0byBwYXJzZSBpdFxuICAgICAgICAgICAgICBub3RpZmljYXRpb24ucXVlcnkgPSBKU09OLnBhcnNlKG5vdGlmaWNhdGlvbi5xdWVyeSk7XG4gICAgICAgICAgICB9IGNhdGNoKGVycikge1xuICAgICAgICAgICAgICAvLyBEaWQgdGhlIHVzZXIgdGFtcGVyIHdpdGggdGhpcz8/XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUHVzaDogRXJyb3Igd2hpbGUgcGFyc2luZyBxdWVyeSBzdHJpbmcsIEVycm9yOiAnICsgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFNlbmQgdGhlIG5vdGlmaWNhdGlvblxuICAgICAgICAgIHZhciByZXN1bHQgPSBQdXNoLnNlcnZlclNlbmQobm90aWZpY2F0aW9uKTtcblxuICAgICAgICAgIGlmICghb3B0aW9ucy5rZWVwTm90aWZpY2F0aW9ucykge1xuICAgICAgICAgICAgICAvLyBQci4gRGVmYXVsdCB3ZSB3aWxsIHJlbW92ZSBub3RpZmljYXRpb25zXG4gICAgICAgICAgICAgIFB1c2gubm90aWZpY2F0aW9ucy5yZW1vdmUoeyBfaWQ6IG5vdGlmaWNhdGlvbi5faWQgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAvLyBVcGRhdGUgdGhlIG5vdGlmaWNhdGlvblxuICAgICAgICAgICAgICBQdXNoLm5vdGlmaWNhdGlvbnMudXBkYXRlKHsgX2lkOiBub3RpZmljYXRpb24uX2lkIH0sIHtcbiAgICAgICAgICAgICAgICAgICRzZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTWFyayBhcyBzZW50XG4gICAgICAgICAgICAgICAgICAgIHNlbnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIC8vIFNldCB0aGUgc2VudCBkYXRlXG4gICAgICAgICAgICAgICAgICAgIHNlbnRBdDogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgLy8gQ291bnRcbiAgICAgICAgICAgICAgICAgICAgY291bnQ6IHJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90IGJlaW5nIHNlbnQgYW55bW9yZVxuICAgICAgICAgICAgICAgICAgICBzZW5kaW5nOiAwXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRW1pdCB0aGUgc2VuZFxuICAgICAgICAgIHNlbGYuZW1pdCgnc2VuZCcsIHsgbm90aWZpY2F0aW9uOiBub3RpZmljYXRpb24uX2lkLCByZXN1bHQ6IHJlc3VsdCB9KTtcblxuICAgICAgICB9IC8vIEVsc2UgY291bGQgbm90IHJlc2VydmVcbiAgICAgIH07IC8vIEVPIHNlbmROb3RpZmljYXRpb25cblxuICAgICAgc2VuZFdvcmtlcihmdW5jdGlvbigpIHtcblxuICAgICAgICAgIGlmIChpc1NlbmRpbmdOb3RpZmljYXRpb24pIHtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRyeSB7XG5cbiAgICAgICAgICAgIC8vIFNldCBzZW5kIGZlbmNlXG4gICAgICAgICAgICBpc1NlbmRpbmdOb3RpZmljYXRpb24gPSB0cnVlO1xuXG4gICAgICAgICAgICAvLyB2YXIgY291bnRTZW50ID0gMDtcbiAgICAgICAgICAgIHZhciBiYXRjaFNpemUgPSBvcHRpb25zLnNlbmRCYXRjaFNpemUgfHwgMTtcblxuICAgICAgICAgICAgdmFyIG5vdyA9ICtuZXcgRGF0ZSgpO1xuXG4gICAgICAgICAgICAvLyBGaW5kIG5vdGlmaWNhdGlvbnMgdGhhdCBhcmUgbm90IGJlaW5nIG9yIGFscmVhZHkgc2VudFxuICAgICAgICAgICAgdmFyIHBlbmRpbmdOb3RpZmljYXRpb25zID0gUHVzaC5ub3RpZmljYXRpb25zLmZpbmQoeyAkYW5kOiBbXG4gICAgICAgICAgICAgICAgICAvLyBNZXNzYWdlIGlzIG5vdCBzZW50XG4gICAgICAgICAgICAgICAgICB7IHNlbnQgOiBmYWxzZSB9LFxuICAgICAgICAgICAgICAgICAgLy8gQW5kIG5vdCBiZWluZyBzZW50IGJ5IG90aGVyIGluc3RhbmNlc1xuICAgICAgICAgICAgICAgICAgeyBzZW5kaW5nOiB7ICRsdDogbm93IH0gfSxcbiAgICAgICAgICAgICAgICAgIC8vIEFuZCBub3QgcXVldWVkIGZvciBmdXR1cmVcbiAgICAgICAgICAgICAgICAgIHsgJG9yOiBbXG4gICAgICAgICAgICAgICAgICAgICAgeyBkZWxheVVudGlsOiB7ICRleGlzdHM6IGZhbHNlIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICB7IGRlbGF5VW50aWw6ICB7ICRsdGU6IG5ldyBEYXRlKCkgfSB9XG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXX0sIHtcbiAgICAgICAgICAgICAgICAvLyBTb3J0IGJ5IGNyZWF0ZWQgZGF0ZVxuICAgICAgICAgICAgICAgIHNvcnQ6IHsgY3JlYXRlZEF0OiAxIH0sXG4gICAgICAgICAgICAgICAgbGltaXQ6IGJhdGNoU2l6ZVxuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcGVuZGluZ05vdGlmaWNhdGlvbnMuZm9yRWFjaChmdW5jdGlvbihub3RpZmljYXRpb24pIHtcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBzZW5kTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbik7XG4gICAgICAgICAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIFB1c2guTG9nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICBQdXNoLkxvZygnUHVzaDogQ291bGQgbm90IHNlbmQgbm90aWZpY2F0aW9uIGlkOiBcIicgKyBub3RpZmljYXRpb24uX2lkICsgJ1wiLCBFcnJvcjonLCBlcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKFB1c2guZGVidWcpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQdXNoOiBDb3VsZCBub3Qgc2VuZCBub3RpZmljYXRpb24gaWQ6IFwiJyArIG5vdGlmaWNhdGlvbi5faWQgKyAnXCIsIEVycm9yOiAnICsgZXJyb3IubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTsgLy8gRU8gZm9yRWFjaFxuICAgICAgICAgIH0gZmluYWxseSB7XG5cbiAgICAgICAgICAgIC8vIFJlbW92ZSB0aGUgc2VuZCBmZW5jZVxuICAgICAgICAgICAgaXNTZW5kaW5nTm90aWZpY2F0aW9uID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgfSwgb3B0aW9ucy5zZW5kSW50ZXJ2YWwgfHwgMTUwMDApOyAvLyBEZWZhdWx0IGV2ZXJ5IDE1dGggc2VjXG5cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKFB1c2guZGVidWcpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1B1c2g6IFNlbmQgc2VydmVyIGlzIGRpc2FibGVkJyk7XG4gICAgICB9XG4gICAgfVxuXG59O1xuIiwiUHVzaC5hcHBDb2xsZWN0aW9uID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oJ19yYWl4X3B1c2hfYXBwX3Rva2VucycpO1xuUHVzaC5hcHBDb2xsZWN0aW9uLl9lbnN1cmVJbmRleCh7IHVzZXJJZDogMSB9KTtcblxuUHVzaC5hZGRMaXN0ZW5lcigndG9rZW4nLCBmdW5jdGlvbihjdXJyZW50VG9rZW4sIHZhbHVlKSB7XG4gIGlmICh2YWx1ZSkge1xuICAgIC8vIFVwZGF0ZSB0aGUgdG9rZW4gZm9yIGFwcFxuICAgIFB1c2guYXBwQ29sbGVjdGlvbi51cGRhdGUoeyB0b2tlbjogY3VycmVudFRva2VuIH0sIHsgJHNldDogeyB0b2tlbjogdmFsdWUgfSB9LCB7IG11bHRpOiB0cnVlIH0pO1xuICB9IGVsc2UgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgLy8gUmVtb3ZlIHRoZSB0b2tlbiBmb3IgYXBwXG4gICAgUHVzaC5hcHBDb2xsZWN0aW9uLnVwZGF0ZSh7IHRva2VuOiBjdXJyZW50VG9rZW4gfSwgeyAkdW5zZXQ6IHsgdG9rZW46IHRydWUgfSB9LCB7IG11bHRpOiB0cnVlIH0pO1xuICB9XG59KTtcblxuTWV0ZW9yLm1ldGhvZHMoe1xuICAncmFpeDpwdXNoLXVwZGF0ZSc6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICBpZiAoUHVzaC5kZWJ1Zykge1xuICAgICAgY29uc29sZS5sb2coJ1B1c2g6IEdvdCBwdXNoIHRva2VuIGZyb20gYXBwOicsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGNoZWNrKG9wdGlvbnMsIHtcbiAgICAgIGlkOiBNYXRjaC5PcHRpb25hbChTdHJpbmcpLFxuICAgICAgdG9rZW46IF9tYXRjaFRva2VuLFxuICAgICAgYXBwTmFtZTogU3RyaW5nLFxuICAgICAgdXNlcklkOiBNYXRjaC5PbmVPZihTdHJpbmcsIG51bGwpLFxuICAgICAgbWV0YWRhdGE6IE1hdGNoLk9wdGlvbmFsKE9iamVjdClcbiAgICB9KTtcblxuICAgIC8vIFRoZSBpZiB1c2VyIGlkIGlzIHNldCB0aGVuIHVzZXIgaWQgc2hvdWxkIG1hdGNoIG9uIGNsaWVudCBhbmQgY29ubmVjdGlvblxuICAgIGlmIChvcHRpb25zLnVzZXJJZCAmJiBvcHRpb25zLnVzZXJJZCAhPT0gdGhpcy51c2VySWQpIHtcbiAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDAzLCAnRm9yYmlkZGVuIGFjY2VzcycpO1xuICAgIH1cblxuICAgIHZhciBkb2M7XG5cbiAgICAvLyBsb29rdXAgYXBwIGJ5IGlkIGlmIG9uZSB3YXMgaW5jbHVkZWRcbiAgICBpZiAob3B0aW9ucy5pZCkge1xuICAgICAgZG9jID0gUHVzaC5hcHBDb2xsZWN0aW9uLmZpbmRPbmUoe19pZDogb3B0aW9ucy5pZH0pO1xuICAgIH0gZWxzZSBpZiAob3B0aW9ucy51c2VySWQpIHtcbiAgICAgIGRvYyA9IFB1c2guYXBwQ29sbGVjdGlvbi5maW5kT25lKHt1c2VySWQ6IG9wdGlvbnMudXNlcklkfSk7XG4gICAgfVxuXG4gICAgLy8gTm8gZG9jIHdhcyBmb3VuZCAtIHdlIGNoZWNrIHRoZSBkYXRhYmFzZSB0byBzZWUgaWZcbiAgICAvLyB3ZSBjYW4gZmluZCBhIG1hdGNoIGZvciB0aGUgYXBwIHZpYSB0b2tlbiBhbmQgYXBwTmFtZVxuICAgIGlmICghZG9jKSB7XG4gICAgICBkb2MgPSBQdXNoLmFwcENvbGxlY3Rpb24uZmluZE9uZSh7XG4gICAgICAgICRhbmQ6IFtcbiAgICAgICAgICB7IHRva2VuOiBvcHRpb25zLnRva2VuIH0sICAgICAvLyBNYXRjaCB0b2tlblxuICAgICAgICAgIHsgYXBwTmFtZTogb3B0aW9ucy5hcHBOYW1lIH0sIC8vIE1hdGNoIGFwcE5hbWVcbiAgICAgICAgICB7IHRva2VuOiB7ICRleGlzdHM6IHRydWUgfSB9ICAvLyBNYWtlIHN1cmUgdG9rZW4gZXhpc3RzXG4gICAgICAgIF1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIGlmIHdlIGNvdWxkIG5vdCBmaW5kIHRoZSBpZCBvciB0b2tlbiB0aGVuIGNyZWF0ZSBpdFxuICAgIGlmICghZG9jKSB7XG4gICAgICAvLyBSaWcgZGVmYXVsdCBkb2NcbiAgICAgIGRvYyA9IHtcbiAgICAgICAgdG9rZW46IG9wdGlvbnMudG9rZW4sXG4gICAgICAgIGFwcE5hbWU6IG9wdGlvbnMuYXBwTmFtZSxcbiAgICAgICAgdXNlcklkOiBvcHRpb25zLnVzZXJJZCxcbiAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLFxuICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKClcbiAgICAgIH07XG5cbiAgICAgIC8vIFhYWDogV2UgbWlnaHQgd2FudCB0byBjaGVjayB0aGUgaWQgLSBXaHkgaXNudCB0aGVyZSBhIG1hdGNoIGZvciBpZFxuICAgICAgLy8gaW4gdGhlIE1ldGVvciBjaGVjay4uLiBOb3JtYWwgbGVuZ3RoIDE3IChjb3VsZCBiZSBsYXJnZXIpLCBhbmRcbiAgICAgIC8vIG51bWJlcnMrbGV0dGVycyBhcmUgdXNlZCBpbiBSYW5kb20uaWQoKSB3aXRoIGV4Y2VwdGlvbiBvZiAwIGFuZCAxXG4gICAgICBkb2MuX2lkID0gb3B0aW9ucy5pZCB8fCBSYW5kb20uaWQoKTtcbiAgICAgIC8vIFRoZSB1c2VyIHdhbnRlZCB1cyB0byB1c2UgYSBzcGVjaWZpYyBpZCwgd2UgZGlkbid0IGZpbmQgdGhpcyB3aGlsZVxuICAgICAgLy8gc2VhcmNoaW5nLiBUaGUgY2xpZW50IGNvdWxkIGRlcGVuZCBvbiB0aGUgaWQgZWcuIGFzIHJlZmVyZW5jZSBzb1xuICAgICAgLy8gd2UgcmVzcGVjdCB0aGlzIGFuZCB0cnkgdG8gY3JlYXRlIGEgZG9jdW1lbnQgd2l0aCB0aGUgc2VsZWN0ZWQgaWQ7XG4gICAgICBQdXNoLmFwcENvbGxlY3Rpb24uX2NvbGxlY3Rpb24uaW5zZXJ0KGRvYyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFdlIGZvdW5kIHRoZSBhcHAgc28gdXBkYXRlIHRoZSB1cGRhdGVkQXQgYW5kIHNldCB0aGUgdG9rZW5cbiAgICAgIFB1c2guYXBwQ29sbGVjdGlvbi51cGRhdGUoeyBfaWQ6IGRvYy5faWQgfSwge1xuICAgICAgICAkc2V0OiB7XG4gICAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLFxuICAgICAgICAgIHRva2VuOiBvcHRpb25zLnRva2VuXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChkb2MpIHtcbiAgICAgIC8vIHh4eDogSGFja1xuICAgICAgLy8gQ2xlYW4gdXAgbWVjaCBtYWtpbmcgc3VyZSB0b2tlbnMgYXJlIHVuaXEgLSBhbmRyb2lkIHNvbWV0aW1lcyBnZW5lcmF0ZVxuICAgICAgLy8gbmV3IHRva2VucyByZXN1bHRpbmcgaW4gZHVwbGljYXRlc1xuICAgICAgdmFyIHJlbW92ZWQgPSBQdXNoLmFwcENvbGxlY3Rpb24ucmVtb3ZlKHtcbiAgICAgICAgJGFuZDogW1xuICAgICAgICAgIHsgX2lkOiB7ICRuZTogZG9jLl9pZCB9IH0sXG4gICAgICAgICAgeyB0b2tlbjogZG9jLnRva2VuIH0sICAgICAvLyBNYXRjaCB0b2tlblxuICAgICAgICAgIHsgYXBwTmFtZTogZG9jLmFwcE5hbWUgfSwgLy8gTWF0Y2ggYXBwTmFtZVxuICAgICAgICAgIHsgdG9rZW46IHsgJGV4aXN0czogdHJ1ZSB9IH0gIC8vIE1ha2Ugc3VyZSB0b2tlbiBleGlzdHNcbiAgICAgICAgXVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChyZW1vdmVkICYmIFB1c2guZGVidWcpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1B1c2g6IFJlbW92ZWQgJyArIHJlbW92ZWQgKyAnIGV4aXN0aW5nIGFwcCBpdGVtcycpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChkb2MgJiYgUHVzaC5kZWJ1Zykge1xuICAgICAgY29uc29sZS5sb2coJ1B1c2g6IHVwZGF0ZWQnLCBkb2MpO1xuICAgIH1cblxuICAgIGlmICghZG9jKSB7XG4gICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDUwMCwgJ3NldFB1c2hUb2tlbiBjb3VsZCBub3QgY3JlYXRlIHJlY29yZCcpO1xuICAgIH1cbiAgICAvLyBSZXR1cm4gdGhlIGRvYyB3ZSB3YW50IHRvIHVzZVxuICAgIHJldHVybiBkb2M7XG4gIH0sXG4gICdyYWl4OnB1c2gtc2V0dXNlcic6IGZ1bmN0aW9uKGlkKSB7XG4gICAgY2hlY2soaWQsIFN0cmluZyk7XG5cbiAgICBpZiAoUHVzaC5kZWJ1Zykge1xuICAgICAgY29uc29sZS5sb2coJ1B1c2g6IFNldHRpbmdzIHVzZXJJZCBcIicgKyB0aGlzLnVzZXJJZCArICdcIiBmb3IgYXBwOicsIGlkKTtcbiAgICB9XG4gICAgLy8gV2UgdXBkYXRlIHRoZSBhcHBDb2xsZWN0aW9uIGlkIHNldHRpbmcgdGhlIE1ldGVvci51c2VySWRcbiAgICB2YXIgZm91bmQgPSBQdXNoLmFwcENvbGxlY3Rpb24udXBkYXRlKHsgX2lkOiBpZCB9LCB7ICRzZXQ6IHsgdXNlcklkOiB0aGlzLnVzZXJJZCB9IH0pO1xuXG4gICAgLy8gTm90ZSB0aGF0IHRoZSBhcHAgaWQgbWlnaHQgbm90IGV4aXN0IGJlY2F1c2Ugbm8gdG9rZW4gaXMgc2V0IHlldC5cbiAgICAvLyBXZSBkbyBjcmVhdGUgdGhlIG5ldyBhcHAgaWQgZm9yIHRoZSB1c2VyIHNpbmNlIHdlIG1pZ2h0IHN0b3JlIGFkZGl0aW9uYWxcbiAgICAvLyBtZXRhZGF0YSBmb3IgdGhlIGFwcCAvIHVzZXJcblxuICAgIC8vIElmIGlkIG5vdCBmb3VuZCB0aGVuIGNyZWF0ZSBpdD9cbiAgICAvLyBXZSBkb250LCBpdHMgYmV0dGVyIHRvIHdhaXQgdW50aWwgdGhlIHVzZXIgd2FudHMgdG9cbiAgICAvLyBzdG9yZSBtZXRhZGF0YSBvciB0b2tlbiAtIFdlIGNvdWxkIGVuZCB1cCB3aXRoIHVudXNlZCBkYXRhIGluIHRoZVxuICAgIC8vIGNvbGxlY3Rpb24gYXQgZXZlcnkgYXBwIHJlLWluc3RhbGwgLyB1cGRhdGVcbiAgICAvL1xuICAgIC8vIFRoZSB1c2VyIGNvdWxkIHN0b3JlIHNvbWUgbWV0YWRhdGEgaW4gYXBwQ29sbGVjdGluIGJ1dCBvbmx5IGlmIHRoZXlcbiAgICAvLyBoYXZlIGNyZWF0ZWQgdGhlIGFwcCBhbmQgcHJvdmlkZWQgYSB0b2tlbi5cbiAgICAvLyBJZiBub3QgdGhlIG1ldGFkYXRhIHNob3VsZCBiZSBzZXQgdmlhIGdyb3VuZDpkYlxuXG4gICAgcmV0dXJuICEhZm91bmQ7XG4gIH0sXG4gICdyYWl4OnB1c2gtbWV0YWRhdGEnOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgY2hlY2soZGF0YSwge1xuICAgICAgaWQ6IFN0cmluZyxcbiAgICAgIG1ldGFkYXRhOiBPYmplY3RcbiAgICB9KTtcblxuICAgIC8vIFNldCB0aGUgbWV0YWRhdGFcbiAgICB2YXIgZm91bmQgPSBQdXNoLmFwcENvbGxlY3Rpb24udXBkYXRlKHsgX2lkOiBkYXRhLmlkIH0sIHsgJHNldDogeyBtZXRhZGF0YTogZGF0YS5tZXRhZGF0YSB9IH0pO1xuXG4gICAgcmV0dXJuICEhZm91bmQ7XG4gIH0sXG4gICdyYWl4OnB1c2gtZW5hYmxlJzogZnVuY3Rpb24oZGF0YSkge1xuICAgIGNoZWNrKGRhdGEsIHtcbiAgICAgIGlkOiBTdHJpbmcsXG4gICAgICBlbmFibGVkOiBCb29sZWFuXG4gICAgfSk7XG5cbiAgICBpZiAoUHVzaC5kZWJ1Zykge1xuICAgICAgY29uc29sZS5sb2coJ1B1c2g6IFNldHRpbmcgZW5hYmxlZCB0byBcIicgKyBkYXRhLmVuYWJsZWQgKyAnXCIgZm9yIGFwcDonLCBkYXRhLmlkKTtcbiAgICB9XG5cbiAgICB2YXIgZm91bmQgPSBQdXNoLmFwcENvbGxlY3Rpb24udXBkYXRlKHsgX2lkOiBkYXRhLmlkIH0sIHsgJHNldDogeyBlbmFibGVkOiBkYXRhLmVuYWJsZWQgfSB9KTtcblxuICAgIHJldHVybiAhIWZvdW5kO1xuICB9XG59KTtcblxuIl19
