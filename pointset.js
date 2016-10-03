"use strict";
var PointSet = (function() {
    function pointSet(canvas) {
        this.canvas = canvas;
        this.clear = function() {
            this.points = [];
            this.edges = [];
        };
        this.clear();
    }
    pointSet.prototype.addPoint = function(p) {
        var points_copy = this.points.slice(0);
        points_copy.push(p);
        Points.sortPoints(points_copy);
        var i = points_copy.indexOf(p);
        for(var j = 0; j < this.edges.length; ++j) {
            var e = this.edges[j];
            if(e[0] >=i) e[0] = e[0] + 1;
            if(e[1] >=i) e[1] = e[1] + 1;
        }
        this.points.push(p);
        Points.sortPoints(this.points);
    };
    pointSet.prototype.hasEdge = function(p, q) {
        var new_edge = [p, q];
        new_edge.sort(function(a,b) { return a - b; } );
        console.log('New edge: ' + new_edge);
        var found = -1;
        for(var i = 0; i < this.edges.length; ++i) {
            var e = this.edges[i];
            console.log('Old edge: ' + e);
            if(new_edge[0] === e[0] && new_edge[1] === e[1]) {
                console.log('Found edge');
                found = i;
                break;
            }
        }
        return found;
    };
    pointSet.prototype.addEdge = function(p, q) {
        if(this.hasEdge(p,q) > -1) {
            return;
        }
        var new_edge = [p, q];
        new_edge.sort(function(a,b) { return a - b; } );
        var a = Edges.crossesEdges(new_edge, this.edges, this.points);
        if(a) {
            var e = a[0];
            var p = a[1];
            console.log('Crosses edge: ' + e);
            var p0 = this.points[e[0]];
            var p1 = this.points[e[1]];
            console.log('Between points: ', p0, ' ', p1);
            console.log('At point:     ' , p);
        } else {
            console.log('Adding edge');
            this.edges.push(new_edge);
            this.convexHull();
        }
    };
    pointSet.prototype.removePoint = function(index, noCHcheck) {
        var edges = this.edges;
        var selected_point = this.selected_point;
        var new_edges = [];
        for(var i = 0; i < edges.length; ++i) {
            var e = edges[i];
            if(e.indexOf(index) !== -1) {
                console.log('Deleting edge ' + i);
            } else if(e[0] > index || e[1] > index) {
                var e0 = e[0];
                var e1 = e[1];
                if(e0 > index) e0 = e0 - 1;
                if(e1 > index) e1 = e1 - 1;
                if(e0 < e1) {
                    new_edges.push([e0, e1]);
                }
            } else {
                new_edges.push(e);
            }
        }
        this.edges = new_edges;
        this.points.splice(index, 1);
        if(selected_point === index) {
            this.selected_point = -1;
        }
    };
    pointSet.prototype.removeEdge = function(index) {
        this.edges.splice(index, 1);
    };
    function removeDuplicates(a) {
        var keys = [];
        var ob = {};
        a.forEach(function(x) {
            if(ob[x]) {
                return;
            } else {
                keys.push(x);
                ob[x] = true;
            }
        });
        return keys;
    }
    pointSet.prototype.getNeighbours = function(p) {
        var edges = this.getAllEdges();
        var points = this.points;
        var point = points[p];
        var neighbours = [];
        console.log('Finding neighbours for: ', p);
        for(var i = 0; i < edges.length; ++i) {
            var e = edges[i];
            var ei = e.indexOf(p);
            if(ei !== -1) {
                console.log('Found: ', e);
                var q = e[(ei + 1) % 2]
                neighbours.push(q);
            }
        }
        return neighbours;
    };
    function rotateArray(arr) {
        arr.push(arr.shift());
        return arr;
    }
    pointSet.prototype.toString = function() {
        var s = '';
        var points = this.points;
        var edges = this.edges;
        this.points.forEach(function(point) {
            if(point !== points[0]) {
                s += '_';
            }
            s += '' + point.x + ',' + point.y;
        });
        s += ';';
        this.edges.forEach(function(edge) {
            if(edge !== edges[0]) {
                s += '_';
            }
            s += '' + edge[0] + ',' + edge[1];
        });
        return s;
    };
    pointSet.prototype.fromString = function(s) {
        this.clear();
        if(!s) {
            return;
        }
        if(s.indexOf('|') !== -1) {
            s = s.split('|')[0];
        }
        var parts = s.split(';');
        this.points = parts[0].split('_').map(function(s) {
            if(s) {
                console.log('Restoring: ', s);
                var xy = s.split(',');
                return {x: parseFloat(xy[0]),
                        y: parseFloat(xy[1])};
            }
        }).filter(function(point) { return point !== undefined; });
        function parseIntBaseTen(s) {
            return parseInt(s, 10);
        }
        this.edges = parts[1].split('_').map(function(s) {
            if(s) {
                console.log('Restoring: ', s);
                return s.split(',').map(parseIntBaseTen);
            }
        }).filter(function(point) { return point !== undefined; });
        var radix = 10;
    };
    pointSet.prototype.draw = function() {
        for(var i = 0; i < this.points.length; ++i) {
            var point = this.points[i];
            this.canvas.drawPoint(point.x, point.y);
        }
        for(var i = 0; i < this.edges.length; ++i) {
            var edge = this.edges[i];
            var pt1 = this.points[edge[0]];
            var pt2 = this.points[edge[1]];
            this.canvas.drawEdge(pt1, pt2);
        }
    };
    function sqrDistance(a, b) {
        return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
    }
    pointSet.prototype.nearestPoint = function(p, clickBox) {
        var threshold = Math.pow(this.canvas.pointRadius, 2) + clickBox;
        for(var i = 0; i < this.points.length; ++i) {
            var candidate = this.points[i];
            var sqrDist = sqrDistance(p, candidate);
            if(threshold > sqrDist) {
                return i;
            }
        }
        return -1;
    };
    
    return pointSet;
})();
