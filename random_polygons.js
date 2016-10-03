"use strict";
(function() {
    // configuration
    var clickBox = 60;

    var pointSets = [new PointSet(new Canvas(document.getElementById('c')))];

    var output = document.getElementById('output');

    function saveState() {
        var state = null;
        var title = null;
        var url = document.location.toString().split('?')[0];
        url += '?' + pointSets[0].toString() + '|' + pointSets[1].toString();
        history.pushState(state, title, url);
    }

    var add = null;
    function getRadioValue() {
        add = document.querySelector('input[name="add_group"]:checked').value;
        console.log('Radio value: ' + add);
    }
    getRadioValue();

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }
    function addPoint(p, pointSet) {
        var clicked_point = pointSet.nearestPoint(p, clickBox);
        console.log('Clicked point: ' + clicked_point);
        if(clicked_point > -1) {
            console.log('deleting point');
            pointSet.removePoint(clicked_point);
        } else {
            console.log('adding point');
            pointSet.addPoint(p);
        }
    }

    var inputNodeList = document.querySelectorAll('input');
    for(var i = 0; i < inputNodeList.length; ++i) {
        var e = inputNodeList[i];
        e.addEventListener('click', function(evt) {
            pointSets.forEach(function(pointSet) {
                pointSet.draw();
            });
        });
    }

    function resize() {
        pointSets.forEach(function(pointSet) {
            pointSet.canvas.c.width = window.innerWidth;
            pointSet.draw();
        });
    }

    function onLoad() {
        // restore state
        var url = decodeURI(document.location.toString());
        if(url.indexOf('?') !== -1) {
            var state = url.split('?')[1];
            console.log('Reloading from state: ' + state);
            var states = state.split('|');
            pointSets[0].fromString(states[0]);
            pointSets[1].fromString(states[1]);
        }

        var useCapture = false;
        window.addEventListener('resize', resize, useCapture);
        resize();

        document.getElementById('clear').addEventListener('click', function(evt) {
            if(window.confirm('Are you sure you want to clear the points?')) {
                pointSets.forEach(function(pointSet) {
                    pointSet.clear();
                    pointSet.draw();
                });
            }
        });
        pointSets.forEach(function(pointSet) {
            var start = null;
            pointSet.canvas.addEventListener('mousedown', function(evt) {
                start = getMousePos(pointSet.canvas, evt);
            });
            pointSet.canvas.addEventListener('click', function(evt) {
                pointSets.forEach(function(pointSet) { pointSet.draw(); });
                getRadioValue();
                var p = getMousePos(pointSet.canvas, evt);
                console.log('click at (' + p.x + ',' + p.y + ')');
                if(add === 'add_points') {
                    addPoint(p, pointSet);
                } else {
                    console.error('Invalid add_group value');
                }
                start = null;
                pointSet.draw();
            });
        });
    }
    
    (function setupOnLoad() {
        var fn = function() {};
        
        if(typeof window.onload === 'function') {
            fn = window.onload;
        }
        
        window.onload = function() {
            onLoad();
            fn();
        }
    })();
})();
