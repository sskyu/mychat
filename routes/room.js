// REST API for room

module.exports = {
    index: function(req, res){
        // res.send("index: called as GET method");
        if (!req.session.user) return res.redirect('/');
        res.render('room', { title: 'room list' });
    }
    ,new: function(req, res){
        res.send("new: called as GET method");
    }
    ,create: function(req, res){
        if (!req.body.roomName) return require('./index').index(req, res);
        res.send("create: called as POST method");
    }
    ,show: function(req, res){
        res.send("show: called as GET method");
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