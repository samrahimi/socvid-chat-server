(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var check = Package.check.check;
var Match = Package.check.Match;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var UsersSessions, UserPresence, UserPresenceEvents, UserPresenceMonitor;

var require = meteorInstall({"node_modules":{"meteor":{"konecty:user-presence":{"common":{"common.js":function(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/konecty_user-presence/common/common.js                                                          //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
/* globals UsersSessions */

/* exported UsersSessions */
UsersSessions = new Meteor.Collection('usersSessions');
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"server":{"server.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/konecty_user-presence/server/server.js                                                          //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
module.link("colors");

UsersSessions._ensureIndex({
  'connections.instanceId': 1
}, {
  sparse: 1,
  name: 'connections.instanceId'
});

UsersSessions._ensureIndex({
  'connections.id': 1
}, {
  sparse: 1,
  name: 'connections.id'
});

var allowedStatus = ['online', 'away', 'busy', 'offline'];
var logEnable = false;

var log = function (msg, color) {
  if (logEnable) {
    if (color) {
      console.log(msg[color]);
    } else {
      console.log(msg);
    }
  }
};

var logRed = function () {
  log(Array.prototype.slice.call(arguments).join(' '), 'red');
};

var logGrey = function () {
  log(Array.prototype.slice.call(arguments).join(' '), 'grey');
};

var logGreen = function () {
  log(Array.prototype.slice.call(arguments).join(' '), 'green');
};

var logYellow = function () {
  log(Array.prototype.slice.call(arguments).join(' '), 'yellow');
};

var checkUser = function (id, userId) {
  if (!id || !userId || id === userId) {
    return true;
  }

  var user = Meteor.users.findOne(id, {
    fields: {
      _id: 1
    }
  });

  if (user) {
    throw new Meteor.Error('cannot-change-other-users-status');
  }

  return true;
};

UserPresence = {
  activeLogs: function () {
    logEnable = true;
  },
  removeConnectionsByInstanceId: function (instanceId) {
    logRed('[user-presence] removeConnectionsByInstanceId', instanceId);
    var update = {
      $pull: {
        connections: {
          instanceId: instanceId
        }
      }
    };
    UsersSessions.update({}, update, {
      multi: true
    });
  },
  removeAllConnections: function () {
    logRed('[user-presence] removeAllConnections');
    UsersSessions.remove({});
  },
  createConnection: function (userId, connection, status, metadata) {
    // if connections is invalid, does not have an userId or is already closed, don't save it on db
    if (!userId || !connection.id || connection.closed) {
      return;
    }

    connection.UserPresenceUserId = userId;
    status = status || 'online';
    logGreen('[user-presence] createConnection', userId, connection.id, status, metadata);
    var query = {
      _id: userId
    };
    var now = new Date();
    var instanceId = undefined;

    if (Package['konecty:multiple-instances-status']) {
      instanceId = InstanceStatus.id();
    }

    var update = {
      $push: {
        connections: {
          id: connection.id,
          instanceId: instanceId,
          status: status,
          _createdAt: now,
          _updatedAt: now
        }
      }
    };

    if (metadata) {
      update.$set = {
        metadata: metadata
      };
      connection.metadata = metadata;
    } // make sure closed connections are being created


    if (!connection.closed) {
      UsersSessions.upsert(query, update);
    }
  },
  setConnection: function (userId, connection, status) {
    if (!userId) {
      return;
    }

    logGrey('[user-presence] setConnection', userId, connection.id, status);
    var query = {
      _id: userId,
      'connections.id': connection.id
    };
    var now = new Date();
    var update = {
      $set: {
        'connections.$.status': status,
        'connections.$._updatedAt': now
      }
    };

    if (connection.metadata) {
      update.$set.metadata = connection.metadata;
    }

    var count = UsersSessions.update(query, update);

    if (count === 0) {
      return UserPresence.createConnection(userId, connection, status, connection.metadata);
    }

    if (status === 'online') {
      Meteor.users.update({
        _id: userId,
        statusDefault: 'online',
        status: {
          $ne: 'online'
        }
      }, {
        $set: {
          status: 'online'
        }
      });
    } else if (status === 'away') {
      Meteor.users.update({
        _id: userId,
        statusDefault: 'online',
        status: {
          $ne: 'away'
        }
      }, {
        $set: {
          status: 'away'
        }
      });
    }
  },
  setDefaultStatus: function (userId, status) {
    if (!userId) {
      return;
    }

    if (allowedStatus.indexOf(status) === -1) {
      return;
    }

    logYellow('[user-presence] setDefaultStatus', userId, status);
    var update = Meteor.users.update({
      _id: userId,
      statusDefault: {
        $ne: status
      }
    }, {
      $set: {
        statusDefault: status
      }
    });

    if (update > 0) {
      UserPresenceMonitor.processUser(userId, {
        statusDefault: status
      });
    }
  },
  removeConnection: function (connectionId) {
    logRed('[user-presence] removeConnection', connectionId);
    var query = {
      'connections.id': connectionId
    };
    var update = {
      $pull: {
        connections: {
          id: connectionId
        }
      }
    };
    UsersSessions.update(query, update);
  },
  start: function () {
    Meteor.onConnection(function (connection) {
      connection.onClose(function () {
        // mark connection as closed so if it drops in the middle of the process it doesn't even is created
        connection.closed = true;

        if (connection.UserPresenceUserId !== undefined && connection.UserPresenceUserId !== null) {
          UserPresence.removeConnection(connection.id);
        }
      });
    });
    process.on('exit', Meteor.bindEnvironment(function () {
      if (Package['konecty:multiple-instances-status']) {
        UserPresence.removeConnectionsByInstanceId(InstanceStatus.id());
      } else {
        UserPresence.removeAllConnections();
      }
    }));

    if (Package['accounts-base']) {
      Accounts.onLogin(function (login) {
        UserPresence.createConnection(login.user._id, login.connection);
      });
      Accounts.onLogout(function (login) {
        UserPresence.removeConnection(login.connection.id);
      });
    }

    Meteor.publish(null, function () {
      if (this.userId == null && this.connection.UserPresenceUserId !== undefined && this.connection.UserPresenceUserId !== null) {
        UserPresence.removeConnection(this.connection.id);
        delete this.connection.UserPresenceUserId;
      }

      this.ready();
    });
    UserPresenceEvents.on('setStatus', function (userId, status) {
      var user = Meteor.users.findOne(userId);
      var statusConnection = status;

      if (!user) {
        return;
      }

      if (user.statusDefault != null && status !== 'offline' && user.statusDefault !== 'online') {
        status = user.statusDefault;
      }

      var query = {
        _id: userId,
        $or: [{
          status: {
            $ne: status
          }
        }, {
          statusConnection: {
            $ne: statusConnection
          }
        }]
      };
      var update = {
        $set: {
          status: status,
          statusConnection: statusConnection
        }
      };
      const result = Meteor.users.update(query, update); // if nothing updated, do not emit anything

      if (result) {
        UserPresenceEvents.emit('setUserStatus', user, status, statusConnection);
      }
    });
    Meteor.methods({
      'UserPresence:connect': function (id, metadata) {
        check(id, Match.Maybe(String));
        check(metadata, Match.Maybe(Object));
        this.unblock();
        checkUser(id, this.userId);
        UserPresence.createConnection(id || this.userId, this.connection, 'online', metadata);
      },
      'UserPresence:away': function (id) {
        check(id, Match.Maybe(String));
        this.unblock();
        checkUser(id, this.userId);
        UserPresence.setConnection(id || this.userId, this.connection, 'away');
      },
      'UserPresence:online': function (id) {
        check(id, Match.Maybe(String));
        this.unblock();
        checkUser(id, this.userId);
        UserPresence.setConnection(id || this.userId, this.connection, 'online');
      },
      'UserPresence:setDefaultStatus': function (id, status) {
        check(id, Match.Maybe(String));
        check(status, Match.Maybe(String));
        this.unblock(); // backward compatible (receives status as first argument)

        if (arguments.length === 1) {
          UserPresence.setDefaultStatus(this.userId, id);
          return;
        }

        checkUser(id, this.userId);
        UserPresence.setDefaultStatus(id || this.userId, status);
      }
    });
  }
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"monitor.js":function(require){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/konecty_user-presence/server/monitor.js                                                         //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
/* globals UserPresenceMonitor, UsersSessions, InstanceStatus */
var EventEmitter = Npm.require('events');

UserPresenceEvents = new EventEmitter();

function monitorUsersSessions() {
  UsersSessions.find({}).observe({
    added: function (record) {
      UserPresenceMonitor.processUserSession(record, 'added');
    },
    changed: function (record) {
      UserPresenceMonitor.processUserSession(record, 'changed');
    },
    removed: function (record) {
      UserPresenceMonitor.processUserSession(record, 'removed');
    }
  });
}

function monitorDeletedServers() {
  InstanceStatus.getCollection().find({}, {
    fields: {
      _id: 1
    }
  }).observeChanges({
    removed: function (id) {
      UserPresence.removeConnectionsByInstanceId(id);
    }
  });
}

function removeLostConnections() {
  if (!Package['konecty:multiple-instances-status']) {
    return UsersSessions.remove({});
  }

  var ids = InstanceStatus.getCollection().find({}, {
    fields: {
      _id: 1
    }
  }).fetch().map(function (id) {
    return id._id;
  });
  var update = {
    $pull: {
      connections: {
        instanceId: {
          $nin: ids
        }
      }
    }
  };
  UsersSessions.update({}, update, {
    multi: true
  });
}

UserPresenceMonitor = {
  /**
   * The callback will receive the following parameters: user, status, statusConnection
   */
  onSetUserStatus: function (callback) {
    UserPresenceEvents.on('setUserStatus', callback);
  },
  // following actions/observers will run only when presence monitor turned on
  start: function () {
    monitorUsersSessions();
    removeLostConnections();

    if (Package['konecty:multiple-instances-status']) {
      monitorDeletedServers();
    }
  },
  processUserSession: function (record, action) {
    if (action === 'removed' && (record.connections == null || record.connections.length === 0)) {
      return;
    }

    if (record.connections == null || record.connections.length === 0 || action === 'removed') {
      UserPresenceMonitor.setStatus(record._id, 'offline', record.metadata);

      if (action !== 'removed') {
        UsersSessions.remove({
          _id: record._id,
          'connections.0': {
            $exists: false
          }
        });
      }

      return;
    }

    var connectionStatus = 'offline';
    record.connections.forEach(function (connection) {
      if (connection.status === 'online') {
        connectionStatus = 'online';
      } else if (connection.status === 'away' && connectionStatus === 'offline') {
        connectionStatus = 'away';
      }
    });
    UserPresenceMonitor.setStatus(record._id, connectionStatus, record.metadata);
  },
  processUser: function (id, fields) {
    if (fields.statusDefault == null) {
      return;
    }

    var userSession = UsersSessions.findOne({
      _id: id
    });

    if (userSession) {
      UserPresenceMonitor.processUserSession(userSession, 'changed');
    }
  },
  setStatus: function (id, status, metadata) {
    UserPresenceEvents.emit('setStatus', id, status, metadata);
  }
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"node_modules":{"colors":{"package.json":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// node_modules/meteor/konecty_user-presence/node_modules/colors/package.json                               //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
module.exports = {
  "name": "colors",
  "version": "1.3.2",
  "main": "lib/index.js"
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"lib":{"index.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// node_modules/meteor/konecty_user-presence/node_modules/colors/lib/index.js                               //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
module.useNode();
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/konecty:user-presence/common/common.js");
require("/node_modules/meteor/konecty:user-presence/server/server.js");
require("/node_modules/meteor/konecty:user-presence/server/monitor.js");

/* Exports */
Package._define("konecty:user-presence", {
  UserPresence: UserPresence,
  UsersSessions: UsersSessions,
  UserPresenceMonitor: UserPresenceMonitor,
  UserPresenceEvents: UserPresenceEvents
});

})();

//# sourceURL=meteor://💻app/packages/konecty_user-presence.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMva29uZWN0eTp1c2VyLXByZXNlbmNlL2NvbW1vbi9jb21tb24uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2tvbmVjdHk6dXNlci1wcmVzZW5jZS9zZXJ2ZXIvc2VydmVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9rb25lY3R5OnVzZXItcHJlc2VuY2Uvc2VydmVyL21vbml0b3IuanMiXSwibmFtZXMiOlsiVXNlcnNTZXNzaW9ucyIsIk1ldGVvciIsIkNvbGxlY3Rpb24iLCJtb2R1bGUiLCJsaW5rIiwiX2Vuc3VyZUluZGV4Iiwic3BhcnNlIiwibmFtZSIsImFsbG93ZWRTdGF0dXMiLCJsb2dFbmFibGUiLCJsb2ciLCJtc2ciLCJjb2xvciIsImNvbnNvbGUiLCJsb2dSZWQiLCJBcnJheSIsInByb3RvdHlwZSIsInNsaWNlIiwiY2FsbCIsImFyZ3VtZW50cyIsImpvaW4iLCJsb2dHcmV5IiwibG9nR3JlZW4iLCJsb2dZZWxsb3ciLCJjaGVja1VzZXIiLCJpZCIsInVzZXJJZCIsInVzZXIiLCJ1c2VycyIsImZpbmRPbmUiLCJmaWVsZHMiLCJfaWQiLCJFcnJvciIsIlVzZXJQcmVzZW5jZSIsImFjdGl2ZUxvZ3MiLCJyZW1vdmVDb25uZWN0aW9uc0J5SW5zdGFuY2VJZCIsImluc3RhbmNlSWQiLCJ1cGRhdGUiLCIkcHVsbCIsImNvbm5lY3Rpb25zIiwibXVsdGkiLCJyZW1vdmVBbGxDb25uZWN0aW9ucyIsInJlbW92ZSIsImNyZWF0ZUNvbm5lY3Rpb24iLCJjb25uZWN0aW9uIiwic3RhdHVzIiwibWV0YWRhdGEiLCJjbG9zZWQiLCJVc2VyUHJlc2VuY2VVc2VySWQiLCJxdWVyeSIsIm5vdyIsIkRhdGUiLCJ1bmRlZmluZWQiLCJQYWNrYWdlIiwiSW5zdGFuY2VTdGF0dXMiLCIkcHVzaCIsIl9jcmVhdGVkQXQiLCJfdXBkYXRlZEF0IiwiJHNldCIsInVwc2VydCIsInNldENvbm5lY3Rpb24iLCJjb3VudCIsInN0YXR1c0RlZmF1bHQiLCIkbmUiLCJzZXREZWZhdWx0U3RhdHVzIiwiaW5kZXhPZiIsIlVzZXJQcmVzZW5jZU1vbml0b3IiLCJwcm9jZXNzVXNlciIsInJlbW92ZUNvbm5lY3Rpb24iLCJjb25uZWN0aW9uSWQiLCJzdGFydCIsIm9uQ29ubmVjdGlvbiIsIm9uQ2xvc2UiLCJwcm9jZXNzIiwib24iLCJiaW5kRW52aXJvbm1lbnQiLCJBY2NvdW50cyIsIm9uTG9naW4iLCJsb2dpbiIsIm9uTG9nb3V0IiwicHVibGlzaCIsInJlYWR5IiwiVXNlclByZXNlbmNlRXZlbnRzIiwic3RhdHVzQ29ubmVjdGlvbiIsIiRvciIsInJlc3VsdCIsImVtaXQiLCJtZXRob2RzIiwiY2hlY2siLCJNYXRjaCIsIk1heWJlIiwiU3RyaW5nIiwiT2JqZWN0IiwidW5ibG9jayIsImxlbmd0aCIsIkV2ZW50RW1pdHRlciIsIk5wbSIsInJlcXVpcmUiLCJtb25pdG9yVXNlcnNTZXNzaW9ucyIsImZpbmQiLCJvYnNlcnZlIiwiYWRkZWQiLCJyZWNvcmQiLCJwcm9jZXNzVXNlclNlc3Npb24iLCJjaGFuZ2VkIiwicmVtb3ZlZCIsIm1vbml0b3JEZWxldGVkU2VydmVycyIsImdldENvbGxlY3Rpb24iLCJvYnNlcnZlQ2hhbmdlcyIsInJlbW92ZUxvc3RDb25uZWN0aW9ucyIsImlkcyIsImZldGNoIiwibWFwIiwiJG5pbiIsIm9uU2V0VXNlclN0YXR1cyIsImNhbGxiYWNrIiwiYWN0aW9uIiwic2V0U3RhdHVzIiwiJGV4aXN0cyIsImNvbm5lY3Rpb25TdGF0dXMiLCJmb3JFYWNoIiwidXNlclNlc3Npb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0FBQ0E7QUFFQUEsYUFBYSxHQUFHLElBQUlDLE1BQU0sQ0FBQ0MsVUFBWCxDQUFzQixlQUF0QixDQUFoQixDOzs7Ozs7Ozs7OztBQ0hBQyxNQUFNLENBQUNDLElBQVAsQ0FBWSxRQUFaOztBQUdBSixhQUFhLENBQUNLLFlBQWQs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QVcsRUFBRSxVQUFTMUMsRUFBVCxFQUFhSyxNQUFiLEVBQXFCO0FBQ2pDLFFBQUlBLE1BQU0sQ0FBQ2dDLGFBQVAsSUFBd0IsSUFBNUIsRUFBa0M7QUFDakM7QUFDQTs7QUFFRCxRQUFJMkQsV0FBVyxHQUFHekgsYUFBYSxDQUFDNkIsT0FBZCxDQUFzQjtBQUFDRSxTQUFHLEVBQUVOO0FBQU4sS0FBdEIsQ0FBbEI7O0FBRUEsUUFBSWdHLFdBQUosRUFBaUI7QUFDaEJ2RCx5QkFBbUIsQ0FBQ3FDLGtCQUFwQixDQUF1Q2tCLFdBQXZDLEVBQW9ELFNBQXBEO0FBQ0E7QUFDRCxHQXREb0I7QUF3RHJCSixXQUFTLEVBQUUsVUFBUzVGLEVBQVQsRUFBYW9CLE1BQWIsRUFBcUJDLFFBQXJCLEVBQStCO0FBQ3pDb0Msc0JBQWtCLENBQUNJLElBQW5CLENBQXdCLFdBQXhCLEVBQXFDN0QsRUFBckMsRUFBeUNvQixNQUF6QyxFQUFpREMsUUFBakQ7QUFDQTtBQTFEb0IsQ0FBdEIsQyIsImZpbGUiOiIvcGFja2FnZXMva29uZWN0eV91c2VyLXByZXNlbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZ2xvYmFscyBVc2Vyc1Nlc3Npb25zICovXG4vKiBleHBvcnRlZCBVc2Vyc1Nlc3Npb25zICovXG5cblVzZXJzU2Vzc2lvbnMgPSBuZXcgTWV0ZW9yLkNvbGxlY3Rpb24oJ3VzZXJzU2Vzc2lvbnMnKTtcbiIsIi8qIGdsb2JhbHMgSW5zdGFuY2VTdGF0dXMsIFVzZXJzU2Vzc2lvbnMsIFVzZXJQcmVzZW5jZU1vbml0b3IsIFVzZXJQcmVzZW5jZSAqL1xuaW1wb3J0ICdjb2xvcnMnO1xuXG5Vc2Vyc1Nlc3Npb25zLl9lbnN1cmVJbmRleCh7J2Nvbm5lY3Rpb25zLmluc3RhbmNlSWQnOiAxfSwge3NwYXJzZTogMSwgbmFtZTogJ2Nvbm5lY3Rpb25zLmluc3RhbmNlSWQnfSk7XG5Vc2Vyc1Nlc3Npb25zLl9lbnN1cmVJbmRleCh7J2Nvbm5lY3Rpb25zLmlkJzogMX0sIHtzcGFyc2U6IDEsIG5hbWU6ICdjb25uZWN0aW9ucy5pZCd9KTtcblxudmFyIGFsbG93ZWRTdGF0dXMgPSBbJ29ubGluZScsICdhd2F5JywgJ2J1c3knLCAnb2ZmbGluZSddO1xuXG52YXIgbG9nRW5hYmxlID0gZmFsc2U7XG5cbnZhciBsb2cgPSBmdW5jdGlvbihtc2csIGNvbG9yKSB7XG5cdGlmIChsb2dFbmFibGUpIHtcblx0XHRpZiAoY29sb3IpIHtcblx0XHRcdGNvbnNvbGUubG9nKG1zZ1tjb2xvcl0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLmxvZyhtc2cpO1xuXHRcdH1cblx0fVxufTtcblxudmFyIGxvZ1JlZCA9IGZ1bmN0aW9uKCkge1xuXHRsb2coQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKS5qb2luKCcgJyksICdyZWQnKTtcbn07XG52YXIgbG9nR3JleSA9IGZ1bmN0aW9uKCkge1xuXHRsb2coQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKS5qb2luKCcgJyksICdncmV5Jyk7XG59O1xudmFyIGxvZ0dyZWVuID0gZnVuY3Rpb24oKSB7XG5cdGxvZyhBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLmpvaW4oJyAnKSwgJ2dyZWVuJyk7XG59O1xudmFyIGxvZ1llbGxvdyA9IGZ1bmN0aW9uKCkge1xuXHRsb2coQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKS5qb2luKCcgJyksICd5ZWxsb3cnKTtcbn07XG5cbnZhciBjaGVja1VzZXIgPSBmdW5jdGlvbihpZCwgdXNlcklkKSB7XG5cdGlmICghaWQgfHwgIXVzZXJJZCB8fCBpZCA9PT0gdXNlcklkKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0dmFyIHVzZXIgPSBNZXRlb3IudXNlcnMuZmluZE9uZShpZCwgeyBmaWVsZHM6IHsgX2lkOiAxIH0gfSk7XG5cdGlmICh1c2VyKSB7XG5cdFx0dGhyb3cgbmV3IE1ldGVvci5FcnJvcignY2Fubm90LWNoYW5nZS1vdGhlci11c2Vycy1zdGF0dXMnKTtcblx0fVxuXG5cdHJldHVybiB0cnVlO1xufVxuXG5Vc2VyUHJlc2VuY2UgPSB7XG5cdGFjdGl2ZUxvZ3M6IGZ1bmN0aW9uKCkge1xuXHRcdGxvZ0VuYWJsZSA9IHRydWU7XG5cdH0sXG5cblx0cmVtb3ZlQ29ubmVjdGlvbnNCeUluc3RhbmNlSWQ6IGZ1bmN0aW9uKGluc3RhbmNlSWQpIHtcblx0XHRsb2dSZWQoJ1t1c2VyLXByZXNlbmNlXSByZW1vdmVDb25uZWN0aW9uc0J5SW5zdGFuY2VJZCcsIGluc3RhbmNlSWQpO1xuXHRcdHZhciB1cGRhdGUgPSB7XG5cdFx0XHQkcHVsbDoge1xuXHRcdFx0XHRjb25uZWN0aW9uczoge1xuXHRcdFx0XHRcdGluc3RhbmNlSWQ6IGluc3RhbmNlSWRcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRVc2Vyc1Nlc3Npb25zLnVwZGF0ZSh7fSwgdXBkYXRlLCB7bXVsdGk6IHRydWV9KTtcblx0fSxcblxuXHRyZW1vdmVBbGxDb25uZWN0aW9uczogZnVuY3Rpb24oKSB7XG5cdFx0bG9nUmVkKCdbdXNlci1wcmVzZW5jZV0gcmVtb3ZlQWxsQ29ubmVjdGlvbnMnKTtcblx0XHRVc2Vyc1Nlc3Npb25zLnJlbW92ZSh7fSk7XG5cdH0sXG5cblx0Y3JlYXRlQ29ubmVjdGlvbjogZnVuY3Rpb24odXNlcklkLCBjb25uZWN0aW9uLCBzdGF0dXMsIG1ldGFkYXRhKSB7XG5cdFx0Ly8gaWYgY29ubmVjdGlvbnMgaXMgaW52YWxpZCwgZG9lcyBub3QgaGF2ZSBhbiB1c2VySWQgb3IgaXMgYWxyZWFkeSBjbG9zZWQsIGRvbid0IHNhdmUgaXQgb24gZGJcblx0XHRpZiAoIXVzZXJJZCB8fCAhY29ubmVjdGlvbi5pZCB8fCBjb25uZWN0aW9uLmNsb3NlZCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNvbm5lY3Rpb24uVXNlclByZXNlbmNlVXNlcklkID0gdXNlcklkO1xuXG5cdFx0c3RhdHVzID0gc3RhdHVzIHx8ICdvbmxpbmUnO1xuXG5cdFx0bG9nR3JlZW4oJ1t1c2VyLXByZXNlbmNlXSBjcmVhdGVDb25uZWN0aW9uJywgdXNlcklkLCBjb25uZWN0aW9uLmlkLCBzdGF0dXMsIG1ldGFkYXRhKTtcblxuXHRcdHZhciBxdWVyeSA9IHtcblx0XHRcdF9pZDogdXNlcklkXG5cdFx0fTtcblxuXHRcdHZhciBub3cgPSBuZXcgRGF0ZSgpO1xuXG5cdFx0dmFyIGluc3RhbmNlSWQgPSB1bmRlZmluZWQ7XG5cdFx0aWYgKFBhY2thZ2VbJ2tvbmVjdHk6bXVsdGlwbGUtaW5zdGFuY2VzLXN0YXR1cyddKSB7XG5cdFx0XHRpbnN0YW5jZUlkID0gSW5zdGFuY2VTdGF0dXMuaWQoKTtcblx0XHR9XG5cblx0XHR2YXIgdXBkYXRlID0ge1xuXHRcdFx0JHB1c2g6IHtcblx0XHRcdFx0Y29ubmVjdGlvbnM6IHtcblx0XHRcdFx0XHRpZDogY29ubmVjdGlvbi5pZCxcblx0XHRcdFx0XHRpbnN0YW5jZUlkOiBpbnN0YW5jZUlkLFxuXHRcdFx0XHRcdHN0YXR1czogc3RhdHVzLFxuXHRcdFx0XHRcdF9jcmVhdGVkQXQ6IG5vdyxcblx0XHRcdFx0XHRfdXBkYXRlZEF0OiBub3dcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRpZiAobWV0YWRhdGEpIHtcblx0XHRcdHVwZGF0ZS4kc2V0ID0ge1xuXHRcdFx0XHRtZXRhZGF0YTogbWV0YWRhdGFcblx0XHRcdH07XG5cdFx0XHRjb25uZWN0aW9uLm1ldGFkYXRhID0gbWV0YWRhdGE7XG5cdFx0fVxuXG5cdFx0Ly8gbWFrZSBzdXJlIGNsb3NlZCBjb25uZWN0aW9ucyBhcmUgYmVpbmcgY3JlYXRlZFxuXHRcdGlmICghY29ubmVjdGlvbi5jbG9zZWQpIHtcblx0XHRcdFVzZXJzU2Vzc2lvbnMudXBzZXJ0KHF1ZXJ5LCB1cGRhdGUpO1xuXHRcdH1cblx0fSxcblxuXHRzZXRDb25uZWN0aW9uOiBmdW5jdGlvbih1c2VySWQsIGNvbm5lY3Rpb24sIHN0YXR1cykge1xuXHRcdGlmICghdXNlcklkKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0bG9nR3JleSgnW3VzZXItcHJlc2VuY2VdIHNldENvbm5lY3Rpb24nLCB1c2VySWQsIGNvbm5lY3Rpb24uaWQsIHN0YXR1cyk7XG5cblx0XHR2YXIgcXVlcnkgPSB7XG5cdFx0XHRfaWQ6IHVzZXJJZCxcblx0XHRcdCdjb25uZWN0aW9ucy5pZCc6IGNvbm5lY3Rpb24uaWRcblx0XHR9O1xuXG5cdFx0dmFyIG5vdyA9IG5ldyBEYXRlKCk7XG5cblx0XHR2YXIgdXBkYXRlID0ge1xuXHRcdFx0JHNldDoge1xuXHRcdFx0XHQnY29ubmVjdGlvbnMuJC5zdGF0dXMnOiBzdGF0dXMsXG5cdFx0XHRcdCdjb25uZWN0aW9ucy4kLl91cGRhdGVkQXQnOiBub3dcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0aWYgKGNvbm5lY3Rpb24ubWV0YWRhdGEpIHtcblx0XHRcdHVwZGF0ZS4kc2V0Lm1ldGFkYXRhID0gY29ubmVjdGlvbi5tZXRhZGF0YTtcblx0XHR9XG5cblx0XHR2YXIgY291bnQgPSBVc2Vyc1Nlc3Npb25zLnVwZGF0ZShxdWVyeSwgdXBkYXRlKTtcblxuXHRcdGlmIChjb3VudCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIFVzZXJQcmVzZW5jZS5jcmVhdGVDb25uZWN0aW9uKHVzZXJJZCwgY29ubmVjdGlvbiwgc3RhdHVzLCBjb25uZWN0aW9uLm1ldGFkYXRhKTtcblx0XHR9XG5cblx0XHRpZiAoc3RhdHVzID09PSAnb25saW5lJykge1xuXHRcdFx0TWV0ZW9yLnVzZXJzLnVwZGF0ZSh7X2lkOiB1c2VySWQsIHN0YXR1c0RlZmF1bHQ6ICdvbmxpbmUnLCBzdGF0dXM6IHskbmU6ICdvbmxpbmUnfX0sIHskc2V0OiB7c3RhdHVzOiAnb25saW5lJ319KTtcblx0XHR9IGVsc2UgaWYgKHN0YXR1cyA9PT0gJ2F3YXknKSB7XG5cdFx0XHRNZXRlb3IudXNlcnMudXBkYXRlKHtfaWQ6IHVzZXJJZCwgc3RhdHVzRGVmYXVsdDogJ29ubGluZScsIHN0YXR1czogeyRuZTogJ2F3YXknfX0sIHskc2V0OiB7c3RhdHVzOiAnYXdheSd9fSk7XG5cdFx0fVxuXHR9LFxuXG5cdHNldERlZmF1bHRTdGF0dXM6IGZ1bmN0aW9uKHVzZXJJZCwgc3RhdHVzKSB7XG5cdFx0aWYgKCF1c2VySWQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoYWxsb3dlZFN0YXR1cy5pbmRleE9mKHN0YXR1cykgPT09IC0xKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0bG9nWWVsbG93KCdbdXNlci1wcmVzZW5jZV0gc2V0RGVmYXVsdFN0YXR1cycsIHVzZXJJZCwgc3RhdHVzKTtcblxuXHRcdHZhciB1cGRhdGUgPSBNZXRlb3IudXNlcnMudXBkYXRlKHtfaWQ6IHVzZXJJZCwgc3RhdHVzRGVmYXVsdDogeyRuZTogc3RhdHVzfX0sIHskc2V0OiB7c3RhdHVzRGVmYXVsdDogc3RhdHVzfX0pO1xuXG5cdFx0aWYgKHVwZGF0ZSA+IDApIHtcblx0XHRcdFVzZXJQcmVzZW5jZU1vbml0b3IucHJvY2Vzc1VzZXIodXNlcklkLCB7IHN0YXR1c0RlZmF1bHQ6IHN0YXR1cyB9KTtcblx0XHR9XG5cdH0sXG5cblx0cmVtb3ZlQ29ubmVjdGlvbjogZnVuY3Rpb24oY29ubmVjdGlvbklkKSB7XG5cdFx0bG9nUmVkKCdbdXNlci1wcmVzZW5jZV0gcmVtb3ZlQ29ubmVjdGlvbicsIGNvbm5lY3Rpb25JZCk7XG5cblx0XHR2YXIgcXVlcnkgPSB7XG5cdFx0XHQnY29ubmVjdGlvbnMuaWQnOiBjb25uZWN0aW9uSWRcblx0XHR9O1xuXG5cdFx0dmFyIHVwZGF0ZSA9IHtcblx0XHRcdCRwdWxsOiB7XG5cdFx0XHRcdGNvbm5lY3Rpb25zOiB7XG5cdFx0XHRcdFx0aWQ6IGNvbm5lY3Rpb25JZFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdFVzZXJzU2Vzc2lvbnMudXBkYXRlKHF1ZXJ5LCB1cGRhdGUpO1xuXHR9LFxuXG5cdHN0YXJ0OiBmdW5jdGlvbigpIHtcblx0XHRNZXRlb3Iub25Db25uZWN0aW9uKGZ1bmN0aW9uKGNvbm5lY3Rpb24pIHtcblx0XHRcdGNvbm5lY3Rpb24ub25DbG9zZShmdW5jdGlvbigpIHtcblx0XHRcdFx0Ly8gbWFyayBjb25uZWN0aW9uIGFzIGNsb3NlZCBzbyBpZiBpdCBkcm9wcyBpbiB0aGUgbWlkZGxlIG9mIHRoZSBwcm9jZXNzIGl0IGRvZXNuJ3QgZXZlbiBpcyBjcmVhdGVkXG5cdFx0XHRcdGNvbm5lY3Rpb24uY2xvc2VkID0gdHJ1ZTtcblxuXHRcdFx0XHRpZiAoY29ubmVjdGlvbi5Vc2VyUHJlc2VuY2VVc2VySWQgIT09IHVuZGVmaW5lZCAmJiBjb25uZWN0aW9uLlVzZXJQcmVzZW5jZVVzZXJJZCAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdFVzZXJQcmVzZW5jZS5yZW1vdmVDb25uZWN0aW9uKGNvbm5lY3Rpb24uaWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdHByb2Nlc3Mub24oJ2V4aXQnLCBNZXRlb3IuYmluZEVudmlyb25tZW50KGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKFBhY2thZ2VbJ2tvbmVjdHk6bXVsdGlwbGUtaW5zdGFuY2VzLXN0YXR1cyddKSB7XG5cdFx0XHRcdFVzZXJQcmVzZW5jZS5yZW1vdmVDb25uZWN0aW9uc0J5SW5zdGFuY2VJZChJbnN0YW5jZVN0YXR1cy5pZCgpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFVzZXJQcmVzZW5jZS5yZW1vdmVBbGxDb25uZWN0aW9ucygpO1xuXHRcdFx0fVxuXHRcdH0pKTtcblxuXHRcdGlmIChQYWNrYWdlWydhY2NvdW50cy1iYXNlJ10pIHtcblx0XHRcdEFjY291bnRzLm9uTG9naW4oZnVuY3Rpb24obG9naW4pIHtcblx0XHRcdFx0VXNlclByZXNlbmNlLmNyZWF0ZUNvbm5lY3Rpb24obG9naW4udXNlci5faWQsIGxvZ2luLmNvbm5lY3Rpb24pO1xuXHRcdFx0fSk7XG5cblx0XHRcdEFjY291bnRzLm9uTG9nb3V0KGZ1bmN0aW9uKGxvZ2luKSB7XG5cdFx0XHRcdFVzZXJQcmVzZW5jZS5yZW1vdmVDb25uZWN0aW9uKGxvZ2luLmNvbm5lY3Rpb24uaWQpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0TWV0ZW9yLnB1Ymxpc2gobnVsbCwgZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAodGhpcy51c2VySWQgPT0gbnVsbCAmJiB0aGlzLmNvbm5lY3Rpb24uVXNlclByZXNlbmNlVXNlcklkICE9PSB1bmRlZmluZWQgJiYgdGhpcy5jb25uZWN0aW9uLlVzZXJQcmVzZW5jZVVzZXJJZCAhPT0gbnVsbCkge1xuXHRcdFx0XHRVc2VyUHJlc2VuY2UucmVtb3ZlQ29ubmVjdGlvbih0aGlzLmNvbm5lY3Rpb24uaWQpO1xuXHRcdFx0XHRkZWxldGUgdGhpcy5jb25uZWN0aW9uLlVzZXJQcmVzZW5jZVVzZXJJZDtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5yZWFkeSgpO1xuXHRcdH0pO1xuXG5cdFx0VXNlclByZXNlbmNlRXZlbnRzLm9uKCdzZXRTdGF0dXMnLCBmdW5jdGlvbih1c2VySWQsIHN0YXR1cykge1xuXHRcdFx0dmFyIHVzZXIgPSBNZXRlb3IudXNlcnMuZmluZE9uZSh1c2VySWQpO1xuXHRcdFx0dmFyIHN0YXR1c0Nvbm5lY3Rpb24gPSBzdGF0dXM7XG5cblx0XHRcdGlmICghdXNlcikge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGlmICh1c2VyLnN0YXR1c0RlZmF1bHQgIT0gbnVsbCAmJiBzdGF0dXMgIT09ICdvZmZsaW5lJyAmJiB1c2VyLnN0YXR1c0RlZmF1bHQgIT09ICdvbmxpbmUnKSB7XG5cdFx0XHRcdHN0YXR1cyA9IHVzZXIuc3RhdHVzRGVmYXVsdDtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHF1ZXJ5ID0ge1xuXHRcdFx0XHRfaWQ6IHVzZXJJZCxcblx0XHRcdFx0JG9yOiBbXG5cdFx0XHRcdFx0e3N0YXR1czogeyRuZTogc3RhdHVzfX0sXG5cdFx0XHRcdFx0e3N0YXR1c0Nvbm5lY3Rpb246IHskbmU6IHN0YXR1c0Nvbm5lY3Rpb259fVxuXHRcdFx0XHRdXG5cdFx0XHR9O1xuXG5cdFx0XHR2YXIgdXBkYXRlID0ge1xuXHRcdFx0XHQkc2V0OiB7XG5cdFx0XHRcdFx0c3RhdHVzOiBzdGF0dXMsXG5cdFx0XHRcdFx0c3RhdHVzQ29ubmVjdGlvbjogc3RhdHVzQ29ubmVjdGlvblxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHRjb25zdCByZXN1bHQgPSBNZXRlb3IudXNlcnMudXBkYXRlKHF1ZXJ5LCB1cGRhdGUpO1xuXG5cdFx0XHQvLyBpZiBub3RoaW5nIHVwZGF0ZWQsIGRvIG5vdCBlbWl0IGFueXRoaW5nXG5cdFx0XHRpZiAocmVzdWx0KSB7XG5cdFx0XHRcdFVzZXJQcmVzZW5jZUV2ZW50cy5lbWl0KCdzZXRVc2VyU3RhdHVzJywgdXNlciwgc3RhdHVzLCBzdGF0dXNDb25uZWN0aW9uKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdE1ldGVvci5tZXRob2RzKHtcblx0XHRcdCdVc2VyUHJlc2VuY2U6Y29ubmVjdCc6IGZ1bmN0aW9uKGlkLCBtZXRhZGF0YSkge1xuXHRcdFx0XHRjaGVjayhpZCwgTWF0Y2guTWF5YmUoU3RyaW5nKSk7XG5cdFx0XHRcdGNoZWNrKG1ldGFkYXRhLCBNYXRjaC5NYXliZShPYmplY3QpKTtcblx0XHRcdFx0dGhpcy51bmJsb2NrKCk7XG5cdFx0XHRcdGNoZWNrVXNlcihpZCwgdGhpcy51c2VySWQpO1xuXHRcdFx0XHRVc2VyUHJlc2VuY2UuY3JlYXRlQ29ubmVjdGlvbihpZCB8fCB0aGlzLnVzZXJJZCwgdGhpcy5jb25uZWN0aW9uLCAnb25saW5lJywgbWV0YWRhdGEpO1xuXHRcdFx0fSxcblxuXHRcdFx0J1VzZXJQcmVzZW5jZTphd2F5JzogZnVuY3Rpb24oaWQpIHtcblx0XHRcdFx0Y2hlY2soaWQsIE1hdGNoLk1heWJlKFN0cmluZykpO1xuXHRcdFx0XHR0aGlzLnVuYmxvY2soKTtcblx0XHRcdFx0Y2hlY2tVc2VyKGlkLCB0aGlzLnVzZXJJZCk7XG5cdFx0XHRcdFVzZXJQcmVzZW5jZS5zZXRDb25uZWN0aW9uKGlkIHx8IHRoaXMudXNlcklkLCB0aGlzLmNvbm5lY3Rpb24sICdhd2F5Jyk7XG5cdFx0XHR9LFxuXG5cdFx0XHQnVXNlclByZXNlbmNlOm9ubGluZSc6IGZ1bmN0aW9uKGlkKSB7XG5cdFx0XHRcdGNoZWNrKGlkLCBNYXRjaC5NYXliZShTdHJpbmcpKTtcblx0XHRcdFx0dGhpcy51bmJsb2NrKCk7XG5cdFx0XHRcdGNoZWNrVXNlcihpZCwgdGhpcy51c2VySWQpO1xuXHRcdFx0XHRVc2VyUHJlc2VuY2Uuc2V0Q29ubmVjdGlvbihpZCB8fCB0aGlzLnVzZXJJZCwgdGhpcy5jb25uZWN0aW9uLCAnb25saW5lJyk7XG5cdFx0XHR9LFxuXG5cdFx0XHQnVXNlclByZXNlbmNlOnNldERlZmF1bHRTdGF0dXMnOiBmdW5jdGlvbihpZCwgc3RhdHVzKSB7XG5cdFx0XHRcdGNoZWNrKGlkLCBNYXRjaC5NYXliZShTdHJpbmcpKTtcblx0XHRcdFx0Y2hlY2soc3RhdHVzLCBNYXRjaC5NYXliZShTdHJpbmcpKTtcblx0XHRcdFx0dGhpcy51bmJsb2NrKCk7XG5cblx0XHRcdFx0Ly8gYmFja3dhcmQgY29tcGF0aWJsZSAocmVjZWl2ZXMgc3RhdHVzIGFzIGZpcnN0IGFyZ3VtZW50KVxuXHRcdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRcdFVzZXJQcmVzZW5jZS5zZXREZWZhdWx0U3RhdHVzKHRoaXMudXNlcklkLCBpZCk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNoZWNrVXNlcihpZCwgdGhpcy51c2VySWQpO1xuXHRcdFx0XHRVc2VyUHJlc2VuY2Uuc2V0RGVmYXVsdFN0YXR1cyhpZCB8fCB0aGlzLnVzZXJJZCwgc3RhdHVzKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxufTtcbiIsIi8qIGdsb2JhbHMgVXNlclByZXNlbmNlTW9uaXRvciwgVXNlcnNTZXNzaW9ucywgSW5zdGFuY2VTdGF0dXMgKi9cbnZhciBFdmVudEVtaXR0ZXIgPSBOcG0ucmVxdWlyZSgnZXZlbnRzJyk7XG5cblVzZXJQcmVzZW5jZUV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuZnVuY3Rpb24gbW9uaXRvclVzZXJzU2Vzc2lvbnMoKSB7XG5cdFVzZXJzU2Vzc2lvbnMuZmluZCh7fSkub2JzZXJ2ZSh7XG5cdFx0YWRkZWQ6IGZ1bmN0aW9uKHJlY29yZCkge1xuXHRcdFx0VXNlclByZXNlbmNlTW9uaXRvci5wcm9jZXNzVXNlclNlc3Npb24ocmVjb3JkLCAnYWRkZWQnKTtcblx0XHR9LFxuXHRcdGNoYW5nZWQ6IGZ1bmN0aW9uKHJlY29yZCkge1xuXHRcdFx0VXNlclByZXNlbmNlTW9uaXRvci5wcm9jZXNzVXNlclNlc3Npb24ocmVjb3JkLCAnY2hhbmdlZCcpO1xuXHRcdH0sXG5cdFx0cmVtb3ZlZDogZnVuY3Rpb24ocmVjb3JkKSB7XG5cdFx0XHRVc2VyUHJlc2VuY2VNb25pdG9yLnByb2Nlc3NVc2VyU2Vzc2lvbihyZWNvcmQsICdyZW1vdmVkJyk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gbW9uaXRvckRlbGV0ZWRTZXJ2ZXJzKCkge1xuXHRJbnN0YW5jZVN0YXR1cy5nZXRDb2xsZWN0aW9uKCkuZmluZCh7fSwge2ZpZWxkczoge19pZDogMX19KS5vYnNlcnZlQ2hhbmdlcyh7XG5cdFx0cmVtb3ZlZDogZnVuY3Rpb24oaWQpIHtcblx0XHRcdFVzZXJQcmVzZW5jZS5yZW1vdmVDb25uZWN0aW9uc0J5SW5zdGFuY2VJZChpZCk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlTG9zdENvbm5lY3Rpb25zKCkge1xuXHRpZiAoIVBhY2thZ2VbJ2tvbmVjdHk6bXVsdGlwbGUtaW5zdGFuY2VzLXN0YXR1cyddKSB7XG5cdFx0cmV0dXJuIFVzZXJzU2Vzc2lvbnMucmVtb3ZlKHt9KTtcblx0fVxuXG5cdHZhciBpZHMgPSBJbnN0YW5jZVN0YXR1cy5nZXRDb2xsZWN0aW9uKCkuZmluZCh7fSwge2ZpZWxkczoge19pZDogMX19KS5mZXRjaCgpLm1hcChmdW5jdGlvbihpZCkge1xuXHRcdHJldHVybiBpZC5faWQ7XG5cdH0pO1xuXG5cdHZhciB1cGRhdGUgPSB7XG5cdFx0JHB1bGw6IHtcblx0XHRcdGNvbm5lY3Rpb25zOiB7XG5cdFx0XHRcdGluc3RhbmNlSWQ6IHtcblx0XHRcdFx0XHQkbmluOiBpZHNcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0VXNlcnNTZXNzaW9ucy51cGRhdGUoe30sIHVwZGF0ZSwge211bHRpOiB0cnVlfSk7XG59XG5cblVzZXJQcmVzZW5jZU1vbml0b3IgPSB7XG5cdC8qKlxuXHQgKiBUaGUgY2FsbGJhY2sgd2lsbCByZWNlaXZlIHRoZSBmb2xsb3dpbmcgcGFyYW1ldGVyczogdXNlciwgc3RhdHVzLCBzdGF0dXNDb25uZWN0aW9uXG5cdCAqL1xuXHRvblNldFVzZXJTdGF0dXM6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdFx0VXNlclByZXNlbmNlRXZlbnRzLm9uKCdzZXRVc2VyU3RhdHVzJywgY2FsbGJhY2spO1xuXHR9LFxuXG5cdC8vIGZvbGxvd2luZyBhY3Rpb25zL29ic2VydmVycyB3aWxsIHJ1biBvbmx5IHdoZW4gcHJlc2VuY2UgbW9uaXRvciB0dXJuZWQgb25cblx0c3RhcnQ6IGZ1bmN0aW9uKCkge1xuXHRcdG1vbml0b3JVc2Vyc1Nlc3Npb25zKCk7XG5cdFx0cmVtb3ZlTG9zdENvbm5lY3Rpb25zKCk7XG5cblx0XHRpZiAoUGFja2FnZVsna29uZWN0eTptdWx0aXBsZS1pbnN0YW5jZXMtc3RhdHVzJ10pIHtcblx0XHRcdG1vbml0b3JEZWxldGVkU2VydmVycygpO1xuXHRcdH1cblx0fSxcblxuXHRwcm9jZXNzVXNlclNlc3Npb246IGZ1bmN0aW9uKHJlY29yZCwgYWN0aW9uKSB7XG5cdFx0aWYgKGFjdGlvbiA9PT0gJ3JlbW92ZWQnICYmIChyZWNvcmQuY29ubmVjdGlvbnMgPT0gbnVsbCB8fCByZWNvcmQuY29ubmVjdGlvbnMubGVuZ3RoID09PSAwKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmIChyZWNvcmQuY29ubmVjdGlvbnMgPT0gbnVsbCB8fCByZWNvcmQuY29ubmVjdGlvbnMubGVuZ3RoID09PSAwIHx8IGFjdGlvbiA9PT0gJ3JlbW92ZWQnKSB7XG5cdFx0XHRVc2VyUHJlc2VuY2VNb25pdG9yLnNldFN0YXR1cyhyZWNvcmQuX2lkLCAnb2ZmbGluZScsIHJlY29yZC5tZXRhZGF0YSk7XG5cblx0XHRcdGlmIChhY3Rpb24gIT09ICdyZW1vdmVkJykge1xuXHRcdFx0XHRVc2Vyc1Nlc3Npb25zLnJlbW92ZSh7X2lkOiByZWNvcmQuX2lkLCAnY29ubmVjdGlvbnMuMCc6IHskZXhpc3RzOiBmYWxzZX0gfSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIGNvbm5lY3Rpb25TdGF0dXMgPSAnb2ZmbGluZSc7XG5cdFx0cmVjb3JkLmNvbm5lY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oY29ubmVjdGlvbikge1xuXHRcdFx0aWYgKGNvbm5lY3Rpb24uc3RhdHVzID09PSAnb25saW5lJykge1xuXHRcdFx0XHRjb25uZWN0aW9uU3RhdHVzID0gJ29ubGluZSc7XG5cdFx0XHR9IGVsc2UgaWYgKGNvbm5lY3Rpb24uc3RhdHVzID09PSAnYXdheScgJiYgY29ubmVjdGlvblN0YXR1cyA9PT0gJ29mZmxpbmUnKSB7XG5cdFx0XHRcdGNvbm5lY3Rpb25TdGF0dXMgPSAnYXdheSc7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRVc2VyUHJlc2VuY2VNb25pdG9yLnNldFN0YXR1cyhyZWNvcmQuX2lkLCBjb25uZWN0aW9uU3RhdHVzLCByZWNvcmQubWV0YWRhdGEpO1xuXHR9LFxuXG5cdHByb2Nlc3NVc2VyOiBmdW5jdGlvbihpZCwgZmllbGRzKSB7XG5cdFx0aWYgKGZpZWxkcy5zdGF0dXNEZWZhdWx0ID09IG51bGwpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgdXNlclNlc3Npb24gPSBVc2Vyc1Nlc3Npb25zLmZpbmRPbmUoe19pZDogaWR9KTtcblxuXHRcdGlmICh1c2VyU2Vzc2lvbikge1xuXHRcdFx0VXNlclByZXNlbmNlTW9uaXRvci5wcm9jZXNzVXNlclNlc3Npb24odXNlclNlc3Npb24sICdjaGFuZ2VkJyk7XG5cdFx0fVxuXHR9LFxuXG5cdHNldFN0YXR1czogZnVuY3Rpb24oaWQsIHN0YXR1cywgbWV0YWRhdGEpIHtcblx0XHRVc2VyUHJlc2VuY2VFdmVudHMuZW1pdCgnc2V0U3RhdHVzJywgaWQsIHN0YXR1cywgbWV0YWRhdGEpO1xuXHR9XG59O1xuIl19
