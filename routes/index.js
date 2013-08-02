
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', {
  	title: 'Express'
  });
};

exports.user = function(req, res){
	console.log('hogehgoe');
	require('./user');
}