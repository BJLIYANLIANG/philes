process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});

var express = require('express');
var app = express();

app.use(express.static('public'));

app.get('*', function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
})

var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log('Running on http://localhost:' + port);
});
