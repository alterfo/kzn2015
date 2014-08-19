var fs = require('fs'),
    app = require('connect')(),
    http = require('http').Server(app),
    url = require("url"),
    logger = require("morgan"),
    static = require("serve-static"),
    urlrouter = require('urlrouter'),
    request = require('request'),
    bodyParser = require('body-parser'),
    render = require('connect-render'),
    logger = require('morgan'),
    io = require('socket.io')(http);


var Instagram = require('instagram-node-lib');

var secrets = require('./secret.json');

var pub = __dirname + '/public',
    view = __dirname + '/views';


var lowres_dir = pub + '/lowres/',
    thumbs_dir = pub + '/thumbs/',
    standardres_dir = pub + '/standard/';

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(static(pub));
app.use(static(view));
app.use(render({
    root: __dirname,
    layout: "index.html",
    cache: false
}));


/* Instagram configure block */

Instagram.set('client_id', secrets.client_id);
Instagram.set('client_secret', secrets.client_secret);

Instagram.set('callback_url', 'http://188.226.251.175:8080/newimg');
Instagram.set('redirect_uri', 'http://188.226.251.175:8080');

Instagram.set('maxSockets', 10);

Instagram.tags.unsubscribe_all({});


Instagram.subscriptions.subscribe({
    object: 'tag',
    object_id: 'kazan2015',
    aspect: 'media',
    callback_url: 'http://188.226.251.175:8080/newimg',
    type: 'subscription',
    id: '#'
});


var files = fs.readdirSync(thumbs_dir);
if (files !== []) {
    if (files[0] == '.DS_Store') {
        files.splice(0, 1);
    }



}

io.on('connection', function(socket) {

	socket.emit('firstShow', {data: files});


            Instagram.tags.recent({
                name: 'kazan2015',
                complete: function(data) {
					
                    var newimages = data.filter(function(img) {
                        return files.indexOf(img.id + '.jpg') === -1;
                    });
                    
                    files = files.concat(newimages);

                    newimages.forEach(function(img) {
                        var newfilename = img.id + '.jpg';

                        
	                        
                        
                        	var filestream = fs.createWriteStream(thumbs_dir + newfilename);
                            var standard_file = fs.createWriteStream(standardres_dir + newfilename);

							request(img.images.thumbnail.url).on('end', function() {
                          	  socket.emit('newimage', {
                          	      url: newfilename
								});
							}).pipe(filestream);

                            request(img.images.standard_resolution.url).pipe(standard_file);
                            
					
                    });
                }

            });

    });


// Delete subscriptions
// curl -X DELETE 'https://api.instagram.com/v1/subscriptions?client_secret=0228c6f4ae794489e19168510a963d&object=all&client_id=e76f034966b84a51b901ce398a5b8cc7'
// check subscriptions
// curl https://api.instagram.com/v1/subscriptions?client_secret=0228c6f4ae7944898ae19168510a963d&client_id=e76f034966b84a51b901ce398a5b8cc7   

app.use(urlrouter(function(app) {

    app.get("/", function(req, res) {
        res.render('index.html');
    });

    app.get('/newimg', function(req, res) {
        var handshake = Instagram.subscriptions.handshake(req, res);
    });

    app.post("/newimg", function(req, res) {
        var data = req.body[0];
        

	       var url = 'https://api.instagram.com/v1/tags/' + data.object_id + '/media/recent?client_id=' + secrets.client_id;
	       request(url, function(err, res, body) { 
	  			   	var img = JSON.parse(body).data[0];
		       		var newfilename = img.id + '.jpg';

		       		if (files.indexOf(newfilename) === -1) {
		       			files.push(newfilename);
	                    var filestream = fs.createWriteStream(thumbs_dir + newfilename);
                        var standard_file = fs.createWriteStream(standardres_dir + newfilename);

	                    request(img.images.thumbnail.url).on('end', function() {
	                        console.log('newfilename', newfilename);
	                        io.sockets.emit('newimage', {
	                            url: newfilename
	                        });
	                    }).pipe(filestream);

                        request(img.images.standard_resolution.url).pipe(standard_file);
		       		}
		       		
		       });


		

    });

    app.get('/unsubscribe', function(req, res) {
        var result = Instagram.tags.unsubscribe_all({});
        if (result === false) {
            res.end('Unsubscribed');
        }


    });
}));
http.listen(8080);
console.log("Listening on 8080");