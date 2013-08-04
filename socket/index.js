var client = require('redis').createClient(),
    crypto = require('crypto'),
    async = require('async'),
    moment = require('moment');

exports.init = function(io) {
    io.sockets.on('connection', function(socket){
        socket.on('send message', function(data){
            socket.emit('reply message', data);
        });
    });

    var front = io.of('/room').on('connection', function(socket) {
        socket.on('create room', function(data, callback) {
            var room;
            async.waterfall([
                function incrementRoomId(next) {
                    client.incr('global:room:id', next);
                },
                function createRoom(roomId, next) {
                    var md5 = crypto.createHash('md5');
                    md5.update(roomId + ':' + data.roomName, 'utf8');
                    var hash = md5.digest('hex');
                    room = {
                        id    : hash,
                        name  : data.roomName,
                        number: 0
                    };
                    client.lpush('rooms', hash + ':' + room.name);
                    client.hset('room:name', hash, room.name, next);
                }
            ], function (err) {
                if (err) return console.log(err);
                front.json.emit('room created', room);
                callback(room);
            });
        });
        socket.on('get room list', function(data, callback) {
            client.lrange('rooms', 0, -1, function(err, rooms) {
                callback(rooms.map(function(room) {
                    return {
                        id    : room.slice(0, 32),
                        name  : room.slice(33),
                        number: chat.clients(room.id).length
                    };
                }));
            });
        });
    });

    var createRoomMessageKey = function(roomId) {
        return 'room:' + roomId + ':message';
    };

    var chat = io.of('/chat').on('connection', function(socket) {
        socket.on('join room', function(data, callback) {
            socket.join(data.roomId);
            front.emit('room entered', data.roomId);

            client.hget('room:name', data.roomId, function(err, roomName) {
                socket.emit('get room name', roomName);
            });

            socket.set('roomId', data.roomId, function() {
                client.lrange(createRoomMessageKey(data.roomId), 0, 9, function(err, list) {
                    if (!err) console.log(err);
                    callback(list);
                });
            });
        });

        socket.on('post message', function(data) {
            var reply = {
                name   : socket.handshake.session.user.name,
                message: data.message,
                date   : moment().format('YYYY/MM/DD'),
                time   : moment().format('HH:mm:ss')
            };
            socket.get('roomId', function(err, roomId) {
                client.lpush(createRoomMessageKey(roomId), JSON.stringify(reply), function(err) {
                    if (!err) console.log(err);
                    chat.to(roomId).json.emit('post message', reply);
                });
            });
        });

        socket.on('disconnect', function() {
            var roomId;
            async.waterfall([
                function getRoomId(next) {
                    socket.get('roomId', next);
                },
                function getRoomName(_roomId, next) {
                    roomId = _roomId;
                    if (chat.clients(_roomId).length) return next('break');
                    client.hget('room:name', _roomId, next);
                },
                function deleteRoom(roomName, next) {
                    client.hdel('room:name', roomId, function(err, result) {
                        if (err) next(err);
                    });
                    client.lrem('rooms', 1, roomId + ':' + roomName, next);
                }
            ], function(err, result) {
                if (err) {
                    front.emit('room left', roomId);
                } else {
                    front.emit('room deleted', roomId);
                }
            });
        });
    });
}