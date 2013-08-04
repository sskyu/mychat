
/*
 * GET users listing.
 */

// exports.list = function(req, res){
//   res.send("respond with a resource");
// };

module.exports = {
    index: function(req, res){
        res.send("index: called as GET method");
    }
    ,new: function(req, res){
        res.send("new: called as GET method");
    }
    ,create: function(req, res){
        // create: called as POST method
        if (!req.body.name) return require('./index').index(req, res);
        req.session.user = { name: req.body.name };
        res.redirect('/rooms');
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