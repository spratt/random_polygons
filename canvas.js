"use strict";
var Canvas = (function() {
    function canvas(c) {
        this.pointRadius = 5;
        this.c = c;
        this.context = this.c.getContext('2d');
    }
    canvas.prototype.drawPoint = function(x, y, color) {
        if(!color) {
            color = 'black';
        }
        this.context.beginPath();
        this.context.arc(x, y, this.pointRadius, 0, 2 * Math.PI, false);
        this.context.fillStyle = color;
        this.context.fill();
    };
    canvas.prototype.drawEdge = function(pt1, pt2, color) {
        if(!color) {
            color = 'black';
        }
        this.context.beginPath();
        this.context.moveTo(pt1.x, pt1.y);
        this.context.lineTo(pt2.x, pt2.y);
        this.context.lineWidth = 1;
        this.context.strokeStyle = color;
        this.context.stroke();
    };
    canvas.prototype.drawText = function(text, x, y, color) {
        if(!color) {
            color = 'black';
        }
        this.context.fillStyle = color;
        this.context.font = "24px sans-serif";
        this.context.fillText(text, x, y);
    };
    canvas.prototype.clear = function() {
        var context = this.context;
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    };
    canvas.prototype.addEventListener = function(s, fn) {
        return this.c.addEventListener(s, fn);
    };
    canvas.prototype.getBoundingClientRect = function() {
        return this.c.getBoundingClientRect();
    }

    return canvas;
})();
