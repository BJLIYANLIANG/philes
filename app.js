process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});

var express = require('express');
var app = express();
var ipfs = require('ipfs-client');

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

var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log('Running on http://localhost:' + port);
});
