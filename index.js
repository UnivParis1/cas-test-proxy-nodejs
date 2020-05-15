var express = require('express');
var request = require('request')

var app = express();

const cas_base = 'https://cas-test.univ-paris1.fr/cas'

//app.use(function (req, res, next) { console.log(req.headers); next(); })

app.use(express.static(__dirname + '/app'))


// proxy request
const proxyToCas = function(req, res) {
    console.log(req.path)
    request({ url: cas_base + req.path, qs: req.query }, function(casErr, casRes, casBody){
        if (casErr || casRes.statusCode !== 200) {
            console.log(casErr, casRes.statusCode)
            res.status(403);
        }
        res.send(casBody)
    });
}

app.get('/serviceValidate', proxyToCas);
app.get('/proxy', proxyToCas);
app.get('/proxyValidate', proxyToCas);

let pgts = {}

app.get('/pgts', function (_req, res) {
    res.json(pgts)
})

app.get('/pgtCallback', function(req, res) {
    console.log("got pgt:", req.query);
    pgts[req.query.pgtIou] = req.query.pgtId;
    res.send("");
});

app.listen(3000);

