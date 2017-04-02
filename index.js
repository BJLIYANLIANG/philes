'use strict'

var IPFS = require('ipfs-api');
// var ipfs = IPFS({host: '138.197.122.108', port: '5001', protocol: 'http'});
var ipfs = IPFS({host: '127.0.0.1', port: '5001', protocol: 'http'})

function download(url, cb) {
  var data = "";
  var request = require("http").get(url, function(res) {

    res.on('data', function(chunk) {
      data += chunk;
    });

    res.on('end', function() {
      cb(data);
    })
  });

  request.on('error', function(e) {
    console.log("Got error: " + e.message);
  });
}

function upload(url, cb) {

  var postData = {
    'msg' : document.getElementById('source').value
  };

  var http = require("http")
  var options = {
    // hostname: 'localhost',
    // port: 3000,
    hostname: 'philes.co',
    port: 80,
    path: '/upload',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(postData))
    }
  };

  var req = http.request(options, (res) => {
    var data = "";
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      data += chunk;
    });
    res.on('end', function() {
      cb(data);
    });
  });

  req.on('error', function(e) {
    console.log('problem with request:', e);
  });

  // write data to request body
  req.write(JSON.stringify(postData));
  req.end();
}

function store () {
  var toStore = document.getElementById('source').value
  ipfs.add(new Buffer(toStore), function (err, res) {
    if (err || !res) {

      upload(null, function(data){
        console.log('successfully saved', data);
        window.history.pushState(null, "Philes", data);
      });

      return;
    }

    res.forEach(function (file) {
      if (file && file.hash) {
        console.log('successfully saved', file.hash);
        window.history.pushState(null, "Philes", file.hash);
      }
    })
  })
}

function display (hash) {
  // buffer: true results in the returned result being a buffer rather than a stream
  ipfs.cat(hash, {buffer: true}, function (err, res) {
    if (err || !res) {
      // window.location.replace('http://localhost:3000/ipfs/' + hash);
      download('http://localhost:3000/ipfs/' + hash, function(data){
        // console.log(data);
        document.getElementById('source').innerText = data
        window.history.pushState(null, "Philes", hash);
      });
      return console.error('ipfs cat error', err, res)
    }

    // document.getElementById('hash').innerText = hash
    document.getElementById('source').innerText = res.toString()
    window.history.pushState(null, "Philes", hash);
  })
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('store').onclick = store
})

if (window.location.pathname.slice(1) !== ""){
  display(window.location.pathname.slice(1));
}

setInterval(function(){
  ipfs.swarm.peers(function (err, peerInfos) {
    if (err) {
      document.getElementById('hash').innerText = 'IPFS daemon not running.';
    }
    document.getElementById('hash').innerText = "Peers: " + peerInfos.length;
  })
}, 3000);
