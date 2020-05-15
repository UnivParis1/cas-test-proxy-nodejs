#!/usr/bin/env nodejs

var express = require('express');
var request = require('request')

var app = express();

const port = 3000;
const cas_base = 'https://cas-test.univ-paris1.fr/cas'

//app.use(function (req, res, next) { console.log(req.headers); next(); })

app.use(express.static(__dirname + '/app'))


// proxy request
const proxyToCas = function(req, res) {
    request({ url: cas_base + req.path, qs: req.query }, function(casErr, casRes, casBody){
        if (casErr || casRes.statusCode !== 200) {
            console.log(casErr, casRes.statusCode)
            res.status(403);
        }
        res.send(casBody)
    });
}

app.get('/proxy', proxyToCas);
app.get('/proxyValidate', proxyToCas);
app.get('/serviceValidate', proxyToCas);

let pgts = {}

app.get('/pgts', function (_req, res) {
    res.json(pgts)
})

app.get('/pgtCallback', function(req, res) {
    if (req.query.pgtIou) {
        console.log("pgtCallback called with params:", req.query);
        pgts[req.query.pgtIou] = req.query.pgtId;
    } else {
        console.log("pgtCallback called with no parameters to first check url.", req.query);
    }
    res.send("");
});


app.listen(port);
console.log('Started on port ' + port);
