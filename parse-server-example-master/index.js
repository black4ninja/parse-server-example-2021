// Example express application adding the parse-server module to expose Parse
// compatible API routes.

const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const ParseDashboard = require('parse-dashboard')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const path = require('path');
const args = process.argv || [];

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;
databaseUri = "mongodb://meeplab:4BPNSdISUd5u1K29@cluster0-shard-00-00-pxvyx.mongodb.net:27017,cluster0-shard-00-01-pxvyx.mongodb.net:27017,cluster0-shard-00-02-pxvyx.mongodb.net:27017/ParseApp2021DEV?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin"

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}else{
  console.log(databaseUri)
}

var APP_ID = "myAppId"
var MASTER_KEY = ""
var SERVER_URL = "http://localhost:1337/parse"

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: __dirname + '/cloud/main.js',
  appId: APP_ID,
  masterKey: MASTER_KEY, //Add your master key here. Keep it secret!
  serverURL: SERVER_URL,
  appName: "ParseApp2021"
})
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var dashboard = new ParseDashboard({
    "apps": [{
        "serverURL": SERVER_URL,
        "appId": APP_ID,
        "masterKey": MASTER_KEY,
        "appName": "ParseApp2021"
    }],
    "users": [{
        "user": "demo",
        "pass": "demo"
    }]
}, { allowInsecureHTTP: true })

const app = express();
app.use(methodOverride())
app.use(bodyParser.json())
app.use(bodyParser.json({ type: 'application/*+json' }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))
app.use(bodyParser.text({ type: 'text/html' }))

app.use('/parse', api)
app.use('/dashboard', dashboard)

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
const mountPath = process.env.PARSE_MOUNT || '/parse';

// Parse Server plays nicely with the rest of your web routes
app.get('/', function (req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

const port = 1337;
const httpServer = require('http').createServer(app);
httpServer.listen(port, function () {
  console.log('parse-server-example running on port ' + port + '.');

  Parse._initialize(APP_ID, "", MASTER_KEY)
  Parse.serverURL = SERVER_URL

  const GameScore = Parse.Object.extend("GameScore");
  const gameScore = new GameScore();

  gameScore.set("score", 1337);
  gameScore.set("playerName", "Sean Plott");
  gameScore.set("cheatMode", false);

  gameScore.save()
  .then((gameScore) => {
    // Execute any logic that should take place after the object is saved.
    console.log('New object created with objectId: ' + gameScore.id);
  }, (error) => {
    // Execute any logic that should take place if the save fails.
    // error is a Parse.Error with an error code and message.
    console.log('Failed to create new object, with error code: ' + error.message);
  });
});

module.exports = app