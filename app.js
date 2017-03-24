process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});

// var ipfs = require('ipfs-client');
var express = require('express');
var app = express();

app.use(express.static('public'));

app.get('*', function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
})

// app.get('*', function(req, res) {
//   // console.log(req.originalUrl);
//   // var qm = req.originalUrl.substring(1);
//   try{
//     var stream = ipfs.cat(req.originalUrl.substring(1));
//     stream.pipe(res);
//   } catch(e) {
//     res.sendStatus(403);
//   }
// });

var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log('Running on http://localhost:' + port);
});
