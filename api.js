var request = require('request');
var rest = require('rest-sugar');
var sugar = require('mongoose-sugar');

var Library = require('./schemas').Library;


module.exports = function(app) {
    var root = '/v1/jsdelivr';

    app.get(root + '/libraries/:name/:version', function(req, res) {
        var version = req.params.version;

        sugar.getOne(Library, {
            name: req.params.name
        }, function(err, library) {
            if(err) {
                return res.send(404);
            }

            var d = library.assets.filter(function(asset) {
                return asset.version === version;
            })[0];

            if(d && d.files) {
                return res.json(d.files);
            }

            return res.send(404);
        });
    });

    app.get(root + '/libraries/:name', function(req, res) {
        sugar.getOne(Library, {
            name: req.params.name
        }, function(err, library) {
            if(err) {
                return res.send(404);
            }

            res.json([library]);
        });
    });

    var api = rest(app, root, {
        libraries: Library
    }, sugar);

    api.pre(function() {
        api.use(rest.only('GET'));
    });

    app.get('/packages.php', function(req, res) {
        request.get({
            url: 'http://www.jsdelivr.com/packages.php',
            pool: {
                maxSockets: 100
            }
        }).pipe(res);
    });
};
