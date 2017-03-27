// process.on('uncaughtException', function(err) {
//   console.log('Caught exception: ' + err);
// });

var express = require('express');
var app = express();
var ipfs = require('ipfs-client');

var Readable = require('stream').Readable;

app.use(express.static('public'));

app.get('/ipfs/*', function(req, res) {
  // console.log(req.originalUrl.substring(6));
  // var qm = req.originalUrl.substring(1);
  try{
    ipfs.cat(req.originalUrl.substring(6))
    .pipe(res);
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
      // console.log(JSON.parse(jsonString));
      var contentData = JSON.parse(jsonString);
      toStore = contentData.msg;

      var s = new Readable();
      s._read = function noop() {}; // redundant? see update below
      s.push(contentData.msg);
      s.push(null);
      ipfs.add(s, function(err, hash) {
          console.log(hash);
          res.send(hash);
      });
  });
})

var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log('Running on http://localhost:' + port);
});
