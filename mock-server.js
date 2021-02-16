//
//
// A very simple mock apm-server. I was probably missing some simpler way
// to get this info.
//
// It will listen on the default 8200 port, respond 200 to any request with a
// `{}` body, and will log (in Bunyan format) the HTTP request and response.
// Importantly that log will include the *request body*, which is useful to
// see what the APM Agent is sending to the server.
//
// Usage:
//      npm install -g bunyan  # doesn't have to be installed globally
//      node mockapmserver.js | bunyan
//

const http = require('http');
const url = require('url');
const zlib = require('zlib');

const bunyan = require('bunyan');

const log = bunyan.createLogger({
    name: 'mockapmserver',
    serializers: {
        err: bunyan.stdSerializers.err,
        req: function (req) {
            if (!req || !req.connection)
                return req;
            return {
                method: req.method,
                // Accept `req.originalUrl` for expressjs usage.
                // https://expressjs.com/en/api.html#req.originalUrl
                url: req.originalUrl || req.url,
                headers: req.headers,
                remoteAddress: req.connection.remoteAddress,
                remotePort: req.connection.remotePort,
                body: req.body
            };
        },
        res: function (res) {
            if (!res || !res.statusCode) {
                return res;
            }
            return {
                statusCode: res.statusCode,
                header: res._header,
                body: res._data
            }
        }
    },
    level: 'debug',
    stream: process.stdout
});

const server = http.createServer(function (req, res) {
    var parsedUrl = url.parse(req.url);

    var instream = req;
    if (req.headers['content-encoding'] === 'gzip') {
        instream = req.pipe(zlib.createGunzip())
    } else {
        instream.setEncoding('utf8');
    }

    let body = '';
    instream.on('data', (chunk) => {
        body += chunk;
    });
    instream.on('end', function () {
        req.body = body;

        var resBody = '{}'
        // Uncomment the following to return response for central config:
        if (parsedUrl.pathname === '/config/v1/agents') {
          if (false) {
            resBody = '{"log_level": "info"}'
          } else {
            resBody = '{"ok":false,"message":"The requested resource is currently unavailable."}\n'
            res.writeHead(503)
          }
        }

        res._data = resBody; // for audit logging
        res.end(resBody);
        log.info({req, res}, 'request')

        // Uncomment to dump some info on `span.context.db.statement`, if any.
        // body.split('\n').forEach(function (line) {
        //     if (!line.startsWith('{')) {
        //         return;
        //     }
        //     try {
        //         line = JSON.parse(line)
        //     } catch (parseErr) {
        //         return;
        //     }
        //     var statement = line.span && line.span.context && line.span.context.db && line.span.context.db.statement;
        //     if (statement) {
        //         console.log('XXX db.statement: %d chars\n\t%s', statement.length, statement)
        //     }
        // });
    });
})

let PORT = 8200; // default APM server port
//PORT = 8201;
server.listen(PORT, function () {
    log.info('listening', server.address())
    while(true) {
      // creates a situation where APM server appears to timeout
      // connection attempts
    }
})
