// REST API for chat
var client = require('redis').createClient();

module.exports = {
    index: function(req, res){
        res.send("index: called as GET method");
    }
    ,new: function(req, res){
        res.send("new: called as GET method");
    }
    ,create: function(req, res){
        if (!req.body.name) return require('./index').index(req, res);
        console.log('>> ' + req.body.name);
        console.log(req.session);
        req.session.user = { name: req.body.name };
        console.log('sess_user: ' + req.session.user);
        res.redirect('/rooms');
        // res.send("create: called as POST method");
    }
    ,show: function(req, res){
        console.log('hogehgoe');
        if (!req.session.user) return res.redirect('/');

        client.hexists('room:name', req.params.id, function(err, exist) {
            if (!exist) return res.redirect('/');
            res.render('chat', { title: 'chat room' });
        });
        // res.send("show: called as GET method");
    }
    ,edit: function(req, res){
        res.send("edit: called as GET method");
    }
    ,update: function(req, res){
        res.send("update: called as PUT method");
    }
    ,destroy: function(req, res){
        res.send("destroy: called as DELETE method");
    }
};