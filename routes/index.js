
/*
 * GET home page.
 */

exports.index = function(req, res) {
    res.render('index', {
        title: 'マイチャット'
    });
};

exports.logout = function(req, res) {
    req.session.destroy(function(err) {
        if (err) console.log(err);
        res.redirect('/');
    });
};