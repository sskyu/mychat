
/**
 * Module dependencies.
 */

var express = require('express')
  , resource = require('express-resource')
  , partials = require('express-partials')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , RedisStore = require('connect-redis')(express)
  , redisStore = new RedisStore({ db: 1 });

var app = express();

// all environments
app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.set('secretKey', 'hogehogefugafuga');
    app.set('cookieSessionKey', 'sid');
    app.use(partials());
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser(app.get('secretKey')));
    app.use(express.session({
        key: app.get('cookieSessionKey'),
        store: redisStore,
        cookie: { maxAge: 7 * 24 * 3600 }
    }));
    app.use(app.router);
    app.use(require('stylus').middleware(__dirname + '/public'));
    app.use(express.static(path.join(__dirname, 'public')));

    // development only
    if ('development' == app.get('env')) {
        app.use(express.errorHandler());
    }
});

app.get('/', routes.index);
app.post('/logout', routes.logout);
// app.get('/users', user.list);
app.resource('users', require('./routes/user'));
app.resource('rooms', require('./routes/room'), { id: 'id' });
app.resource('chat', require('./routes/chat'), { id: 'id' });

var http = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// Socket.IO
var io = require('socket.io').listen(http, {
    'sotre'        : new require('socket.io').RedisStore,
    'log level'    : 1,
    'authorization': function(handshakeData, next){
        var cookie = handshakeData.headers.cookie;
        if (!cookie) return next('Cookie not found.', false);
        cookie = require('cookie').parse(decodeURIComponent(handshakeData.headers.cookie));
        cookie = require('express/node_modules/connect').utils.parseSignedCookies(cookie, app.get('secretKey'));
        var sessionId = cookie[app.get('cookieSessionKey')];
        redisStore.load(sessionId, function(err, session){
            if (err) return next(err.message, false);
            handshakeData.session = session;
            next(null, true);
        });
    }
});

require('./socket').init(io);
