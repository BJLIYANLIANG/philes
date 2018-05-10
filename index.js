'use strict'

const host = {
  // hostname: 'localhost',
  // port: 3000
  hostname: 'philes.co',
  port: 443
}

const IPFS = require('ipfs')
const Y = require('yjs')
// require('y-ipfs-connector')(Y)
require('y-websockets-client')(Y)
require('y-memory')(Y)
require('y-array')(Y)
require('y-text')(Y)

function repo () {
  return 'ipfs/philes'
}

const ipfs = new IPFS({
  repo: repo(),
  EXPERIMENTAL: {
    pubsub: true
  }
})

var loadHash = window.location.pathname.slice(1);
if (loadHash == ""){
  loadHash = Math.random()
  window.history.pushState(null, "Philes", loadHash);
}
var hashContent = "";

Y({
  db: {
    name: 'memory'
  },
  connector: {
    name: 'websockets-client',
    room: loadHash
  },
  sourceDir: '/bower_components',
  share: {
    textarea: 'Text'
  }
}).then((y) => {
  window.yTextarea = y
  y.share.textarea.bind(document.getElementById('source'))
  // window.yTextarea.share.textarea.delete(0, window.yTextarea.share.textarea.length)
  window.yTextarea.share.textarea.insert(0, hashContent)
})

ipfs.once('ready', () => ipfs.id((err, info) => {
  if (err) { throw err }

  console.log('IPFS node ready with address ' + info.id)

  if (loadHash !== ""){
    display(loadHash);
  }

  setInterval(function(){
    ipfs.swarm.peers(function (err, peerInfos) {
      if (err) {
        document.getElementById('hash').innerText = 'IPFS daemon not running.';
      }
      document.getElementById('hash').innerText = "Peers: " + peerInfos.length;
    })
  }, 3000);

}))

function download(url, cb) {
  var data = "";
  var request = require("https").get(url, function(res) {

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

  // var postData = {
  //   'msg' : document.getElementById('source').value
  // };
  var postData = {
    'msg' : window.yTextarea.share.textarea.toString()
  };


  var https = require("https")
  var options = {
    hostname: host.hostname,
    port: host.port,
    // hostname: 'philes.co',
    // port: 80,
    path: '/upload',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(postData))
    }
  };

  var req = https.request(options, (res) => {
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
  console.log("Saving to IPFS");
  // var toStore = document.getElementById('source').value
  var toStore = window.yTextarea.share.textarea.toString()
  ipfs.files.add(new Buffer(toStore), function (err, res) {
    if (err || !res) {
      return console.error('ipfs add error', err, res)
    }

    res.forEach(function (file) {
      console.log("file", file);
      if (file && file.hash) {
        console.log('successfully saved locally', file.hash);
        window.history.pushState(null, "Philes", file.hash);
        upload(null, function(data){
          console.log('successfully saved on cluster', data);
          window.history.pushState(null, "Philes", data);
        });
        // window.history.pushState(null, "Philes", file.hash);
      }
    })
  })
}

function display (hash) {
  console.log("Retrieving", hash);
  document.getElementById('source').innerText = "Retrieving " + hash

  ipfs.files.get(hash, function (err, res) {
    console.log("res", res);
    if (err || !res) {
      download('/ipfs/' + hash, function(data){
        document.getElementById('source').innerText = data
        window.history.pushState(null, "Philes", hash);
        hashContent = data;
        // window.yTextarea.share.textarea.delete(0, window.yTextarea.share.textarea.length)
        // window.yTextarea.share.textarea.insert(0, data)
      })
    } else {
      document.getElementById('source').innerText = res[0].content.toString('utf8')
      window.history.pushState(null, "Philes", hash);
      hashContent = res[0].content.toString('utf8');
      // window.yTextarea.share.textarea.delete(0, window.yTextarea.share.textarea.length)
      // window.yTextarea.share.textarea.insert(0, res[0].content.toString('utf8'))
    }
  })
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('store').onclick = store
})
