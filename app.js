// process.on('uncaughtException', function(err) {
//   console.log('Caught exception: ' + err);
// });

var express = require('express');
var app = express();

var IPFS = require('ipfs-api');
var ipfsapi = IPFS({host: '127.0.0.1', port: '5001', protocol: 'http'})

var Readable = require('stream').Readable;

app.use(express.static('public'));

app.get('/ipfs/*', function(req, res) {
  if(req.originalUrl.substring(6) != ""){
    // Check if hash is directory
    ipfsapi.ls(req.originalUrl.substring(6), {buffer: true}, function (err, result) {
      if (err) {
        // res.send(err);
        // throw err;
        return;
        // res.redirect('/web/' + req.originalUrl.substring(6));
      };
      // check if directory > 0
      var links = result.Objects[0].Links.length;
      if(links == 0){
        // Not a directory
        ipfsapi.cat(req.originalUrl.substring(6), {buffer: true}, function (err, result2) {
          if (err) {
            res.send(err);
            throw err;
          };
          // var html = '<html><body><table width="100%"><tr><td bgcolor="#00000" align="center"><span style="color:white;"><a style="color: #fff" href="/' + req.originalUrl.substring(6) + '">edit</span></td></tr></table>' + result2.toString().replace(/(\r\n|\n|\r)/gm,"<br>") + '</body></html>';
          // var html = '<table width="100%"><tr><td bgcolor="#00000" align="center"><span style="color:white;"><a style="color: #fff" href="/' + req.originalUrl.substring(6) + '">edit</span></td></tr></table>' + result2.toString().replace(/(\r\n|\n|\r)/gm,"<br>");
          var html = '<table width="100%"><tr><td bgcolor="#00000" align="center"><span style="color:white;"><a style="color: #fff" href="/' + req.originalUrl.substring(6) + '">edit</span></td></tr></table>' + result2.toString();
          res.send(html);
          // res.send(result2.toString());
        });
      } else {
        // Hash is directory. List file links.
        var html = ''
        for (x=0; x<links; x++) {
          html = html + '<a href="/ipfs/' + result.Objects[0].Links[x].Hash + '">' + result.Objects[0].Links[x].Name + '</a><br/>'
        }
        res.send(html);
      }
    });
  } else {
    res.redirect('/');
  }
});

app.get('/web/*', function(req, res) {
  try{
    ipfsapi.util.addFromURL(req.originalUrl.substring(5), function (err, result) {
      res.redirect('/ipfs/' + result[0].hash);
    })
  } catch(e) {
    res.sendStatus(e);
  }
});

app.get('*', function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
})

app.post('/upload', function (req, res) {
  var jsonString = '';

  req.on('data', function (data) {
      jsonString += data;
  });

  req.on('end', function () {
      var contentData = JSON.parse(jsonString);
      toStore = contentData.msg;

      var s = new Readable();
      s._read = function noop() {}; // redundant? see update below
      s.push(contentData.msg);
      s.push(null);
      ipfsapi.add(s, function (err, result) {
        if (err) {
          res.send(err);
          throw err;
        };
        res.send(result[0].hash);
      });

  });
})

var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log('Running on http://localhost:' + port);
});
