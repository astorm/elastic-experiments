if('true' === process.env['ELASTIC_INSTRUMENTED']) {
  var apm = require('elastic-apm-node').start({
    serviceName: 'autocannon test service',
    serverUrl: 'http://localhost:8200',
  })
}

const fs = require('fs')
const express = require('express')
const app = express()

const port = 3000

const fileResults = __dirname + '/results/app.log';
if(fs.existsSync(fileResults)) {
  console.log(`File from previous run exists, bailing: ${fileResults}`)
  process.exit(1)
}

const logStream = fs.createWriteStream(fileResults, {flags:'a'});
function log(string) {
  logStream.write(string)
  logStream.write("\n")
}

app.get('/hello', (req, res) => {
  log((new Date).getTime() + ': handling request')
  res.send('Hello World!!')
})

const server = app.listen(3000,function(){
  console.log(`Example app listening at http://localhost:${server.address().port}`)
})
