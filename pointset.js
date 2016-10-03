"use strict";
var PointSet = (function() {
    function pointSet(canvas) {
        this.canvas = canvas;
        this.n = NaN;
        this.clear = function() {
            this.points = [];
            this.edges = [];
        };
        this.clear();
    }
    pointSet.prototype.setN = function(n) {
        this.n = n;
        var width = this.canvas.c.width - (6 * this.canvas.pointRadius);
        this.gapX = width / (n - 1);
        var height = this.canvas.c.height - (2 * this.canvas.pointRadius);
        this.gapY = height / (n - 1);
        this.clear();
    };
    pointSet.prototype.normalizeX = function(x) {
        return this.canvas.pointRadius + Math.round(x / this.gapX) * this.gapX;
    };
    pointSet.prototype.normalizeY = function(y) {
        return this.canvas.pointRadius + Math.round(y / this.gapY) * this.gapY;
    };
    pointSet.prototype.normalizeCoordinates = function(p) {
        return {x:this.normalizeX(p.x),
                y:this.normalizeY(p.y)};
    };
    pointSet.prototype.addPoint = function(p) {
        if(this.points.length >= this.n) {
            console.log('Too many points');
            return;
        }
        var points_copy = this.points.slice(0);
        var normalized_p = this.normalizeCoordinates(p);
        for(var i = 0; i < this.points.length; ++i) {
            var old_pt = this.points[i];
            if(normalized_p.x === old_pt.x &&
               normalized_p.y === old_pt.y) {
                console.log('Point exists');
                return;
            }
        }
        points_copy.push(normalized_p);
        Points.sortPoints(points_copy);
        var i = points_copy.indexOf(normalized_p);
        for(var j = 0; j < this.edges.length; ++j) {
            var e = this.edges[j];
            if(e[0] >=i) e[0] = e[0] + 1;
            if(e[1] >=i) e[1] = e[1] + 1;
        }
        console.log('Adding point ', normalized_p);
        this.points.push(normalized_p);
        Points.sortPoints(this.points);
    };
    pointSet.prototype.hasEdge = function(p, q) {
        var new_edge = [p, q];
        new_edge.sort(function(a,b) { return a - b; } );
        var found = -1;
        for(var i = 0; i < this.edges.length; ++i) {
            var e = this.edges[i];
            if(new_edge[0] === e[0] && new_edge[1] === e[1]) {
                found = i;
                break;
            }
        }
        return found;
    };
    pointSet.prototype.addEdge = function(p, q) {
        var new_edge = [p, q];
        new_edge.sort(function(a,b) { return a - b; } );
        console.log('Trying to add edge ', new_edge);
        if(this.hasEdge(p,q) > -1) {
            console.log('Edge exists!');
            return false;
        }
        var a = Edges.crossesEdges(new_edge, this.edges, this.points);
        if(a) {
            var e = a[0];
            var p = a[1];
            console.log('Crosses edge: ', e);
            var p0 = this.points[e[0]];
            var p1 = this.points[e[1]];
            return false;
        } else {
            this.edges.push(new_edge);
            return true;
        }
    };
    pointSet.prototype.removePoint = function(index) {
        var edges = this.edges;
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
        var edges = this.edges;
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
        var ps = this;
        this.clear();
        if(!s) {
            return;
        }
        if(s.indexOf('|') !== -1) {
            s = s.split('|')[0];
        }
        var parts = s.split(';');
        parts[0].split('_').map(function(s) {
            if(s) {
                var xy = s.split(',');
                return {x: parseFloat(xy[0]),
                        y: parseFloat(xy[1])};
            }
        }).filter(function(point) {
            return point !== undefined;
        }).forEach(function(point) {
            ps.addPoint(point);
        });
        function parseIntBaseTen(s) {
            var radix = 10;
            return parseInt(s, radix);
        }
        parts[1].split('_').map(function(s) {
            if(s) {
                return s.split(',').map(parseIntBaseTen);
            }
        }).filter(function(edge) {
            return edge !== undefined;
        }).forEach(function(edge) {
            ps.addEdge(edge[0], edge[1]);
        });
    };
    pointSet.prototype.draw = function() {
        this.canvas.clear();
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
    // Returns a random integer between min (included) and max (excluded)
    // Using Math.round() will give you a non-uniform distribution!
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
    pointSet.prototype.generateRandomPoints = function() {
        while(this.points.length < this.n) {
            this.addPoint({x: getRandomInt(0, this.n) * this.gapX,
                           y: getRandomInt(0, this.n) * this.gapY});
        }
    };
    function shuffle(array) {
        let counter = array.length;

        // While there are elements in the array
        while (counter > 0) {
            // Pick a random index
            let index = Math.floor(Math.random() * counter);

            // Decrease counter by 1
            counter--;

            // And swap the last element with it
            let temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }

        return array;
    }
    pointSet.prototype.generateRandomPolygonA = function() {
        if(this.points.length < this.n) {
            this.generateRandomPoints();
        }
        var done = false;
        var tries = 0;
        var max_tries = this.n * this.n;
        outer: while(!done && tries < max_tries) {
            console.log('Starting Polygon Generation!');
            done = true;
            ++tries;
            this.edges = [];
            var indices = [];
            for(var i = 0; i < this.points.length; ++i) {
                indices.push(i);
            }
            shuffle(indices);
            console.log('Generating polygon: ', indices);
            for(var i = 1; i < indices.length; ++i) {
                var pt1 = indices[i-1];
                var pt2 = indices[i];
                if(!this.addEdge(pt1, pt2)) {
                    done = false;
                    continue outer;
                }
            }
            if(!this.addEdge(indices[indices.length - 1], indices[0])) {
                done = false;
                continue outer;
            }
        }
        if(!done) {
            this.edges = [];
            console.log('Failed after ', tries, ' tries!');
        } else {
            console.log('Succeeded after ', tries, ' tries!');
        }
    };
    pointSet.prototype.generateRandomPolygonB = function() {
        if(this.points.length < this.n) {
            this.generateRandomPoints();
        }
    };
    
    return pointSet;
})();
