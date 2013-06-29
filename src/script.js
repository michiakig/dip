var fs = require('fs')
var libxmljs = require("libxmljs");

/** test for membership in a list via === */
function member(x, xs) {
    return xs.some(function(y) { return x === y; });
}

fs.readFile('files/Diplomacy_fromWikibooks.svg', 'utf8', function (err,data) {
    if(err) {
        return console.log(err);
    }

    var xml = libxmljs.parseXmlString(data);
    var gs = xml.childNodes().filter(function(elem) {
        return elem.name() === 'g';
    });

    var points = {};
    for(var g = 0; g < gs.length; g++) {
        var title = gs[g].attr('title').value();
        var poly = gs[g].childNodes().filter(function(elem) {
            return elem.name() === 'polygon';
        });
        if(poly.length < 1) {
            continue;
        }

        var ps = poly[0].attr('points').value().split(/\s|\t/);
        for(var p = 0; p < ps.length; p++) {
            points[ps[p]] = points[ps[p]] || [];
            points[ps[p]].push(title);
        }
    }
    // points now maps from string of form "x,y" to list of spaces bordering that point
    // for instance: {"253,418":["Tuscany","Venice"],...}

    var graph = {};
    for (p in points) {
        // p is "x,y"
        // points[p] is ["province1","province2",...]
        points[p].forEach(function(n1) {
            points[p].forEach(function(n2) {
                graph[n1] = graph[n1] || [];
                // don't add itself to its list of neighbors, don't double up
                if(n1 !== n2 && !member(n2, graph[n1])) {
                    graph[n1].push(n2);
                }
            });
        });
    }
    return console.log(JSON.stringify(graph));
//    return console.log(JSON.stringify(points));
});
