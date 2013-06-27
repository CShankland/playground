/**
 * We offer a subset of the interface specified at http://www.w3.org/TR/2dcontext/#conformance-requirements
 *
 * TODO:  Complete the interface.
 */
define(function(require, exports, module) {

	var Matrix = require("./matrix");
	var mat4 = Matrix.mat4;

	var DrawingState = function() {
		this.__m = mat4.create();
	};

	DrawingState.prototype.reset = function reset() {
		this.__m.identity();
	};

	DrawingState.prototype.scale = function scale(x, y) {
		mat4.scale(this.__m, x, y, 1);
	};

	DrawingState.prototype.rotate = function rotate(angle) {
		mat4.rotate(this.__m, angle, 0, 0, 1);
	};

	var WebGLRenderer = function WebGLRenderer() {
		this.__stateStack = [];
	};

	/** State */

	/**
	 * Push state on state stack
	 */
	WebGLRenderer.prototype.save = function save() {
		this.__stateStack.push(this.__state);
		this.__state = this.__getNewState();
	};

	/**
	 * Pop state stack and restore state
	 */
	WebGLRenderer.prototype.restore = function restore() {
		if (0 === this.__stateStack.length) {
			return;
		}

		this.__recycleState(this.__state);
		this.__state = this.__stateStack.pop();
	};

	/** Transformations (default is identity) */
	
	/**
	 * @param {double} x
	 * @param {double} y
	 */
	WebGLRenderer.prototype.scale = function scale(x, y) {
		this.__state.scale(x, y);
	};

	/**
	 * @param {double} angle
	 */
	WebGLRenderer.prototype.rotate = function rotate(angle) {
		this.__state.rotate(angle);
	};

	/**
	 * @param {double} x
	 * @param {double} y
	 */
	WebGLRenderer.prototype.translate = function translate(x, y) {
		this.__state.translate2d(x, y);
	};

	/**
	 * @param {double} a
	 * @param {double} b
	 * @param {double} c
	 * @param {double} d
	 * @param {double} e
	 * @param {double} f
	 */
	WebGLRenderer.prototype.transform = function transform(a, b, c, d, e, f) {
		throw new Error("Not Implemented");
	};

	/**
	 * @param {double} a
	 * @param {double} b
	 * @param {double} c
	 * @param {double} d
	 * @param {double} e
	 * @param {double} f
	 */
	WebGLRenderer.prototype.setTransform = function setTransform(a, b, c, d, e, f) {
		throw new Error("Not Implemented");
	};

	/** Compositing */
	
	WebGLRenderer.prototype.globalAlpha = 1.0;
	WebGLRenderer.prototype.globalCompositeOperation = "source-over";

	/** Colors and styles */
	WebGLRenderer.prototype.strokeStyle = "black";
	WebGLRenderer.prototype.fillStyle = "black";

	/**
	 * @param {double} x0
	 * @param {double} y0
	 * @param {double} x1
	 * @param {double} y1
	 */
	WebGLRenderer.prototype.createLinearGradient = function createLinearGradient(x0, y0, x1, y1) {
		throw new Error("Not Implemented");
	};

	/**
	 * @param {double} x0
	 * @param {double} y0
	 * @param {double} r0
	 * @param {double} x1
	 * @param {double} y1
	 * @param {double} r1
	 */
	WebGLRenderer.prototype.createRadialGradient = function createRadialGradient(x0, y0, r0, x1, y1, r1) {
		throw new Error("Not Implemented");
	};

	/**
	 * @param {Image/Video/Canvas} image
	 * @param {String} repetition
	 */
	WebGLRenderer.prototype.createPattern = function createPattern(image, repetition) {
		throw new Error("Not Implemented");
	}

	/** Shadows */

	WebGLRenderer.prototype.shadowOffsetX = 0;
	WebGLRenderer.prototype.shadowOffsetY = 0;
	WebGLRenderer.prototype.shadowBlur = 0;
	WebGLRenderer.prototype.shadowColor = "transparent black";

	/** rects */
	
	/**
	 * @param {double} x
	 * @param {double} y
	 * @param {double} w
	 * @param {double} h
	 */
	WebGLRenderer.prototype.clearRect = function clearRect(x, y, w, h) {
		throw new Error("Not Implemented");
	};

	/**
	 * @param {double} x
	 * @param {double} y
	 * @param {double} w
	 * @param {double} h
	 */
	WebGLRenderer.prototype.fillRect = function fillRect(x, y, w, h) {
		throw new Error("Not Implemented");
	};

	/**
	 * @param {double} x
	 * @param {double} y
	 * @param {double} w
	 * @param {double} h
	 */
	WebGLRenderer.prototype.strokeRect = function strokeRect(x, y, w, h) {
		throw new Error("Not Implemented");
	};

	/** Path API */

	WebGLRenderer.prototype.beginPath = function beginPath() {
		throw new Error("Not Implemented");
	};

	WebGLRenderer.prototype.fill = function fill(path) {
		throw new Error("Not Implemented");
	};

	WebGLRenderer.prototype.stroke = function stroke(path) {
		throw new Error("Not Implemented");
	};

	WebGLRenderer.prototype.drawSystemFocusRing = function drawSystemFocusRing(path, element) {
		throw new Error("Not Implemented");
	};

	WebGLRenderer.prototype.drawCustomFocusRing = function drawCustomFocusRing(path, element) {
		throw new Error("Not Implemented");
	};

	WebGLRenderer.prototype.scrollPathIntoView = function scrollPathIntoView(path) {
		throw new Error("Not Implemented");
	};

	WebGLRenderer.prototype.clip = function clip(path) {
		throw new Error("Not Implemented");
	};

	WebGLRenderer.prototype.isPointInPath = function isPointInPath(path, x, y) {
		throw new Error("Not Implemented");
	};

	/** Text */
	
	WebGLRenderer.prototype.fillText = function fillText(text, x, y, maxWidth) {
		throw new Error("Not Implemented");
	};

	WebGLRenderer.prototype.strokeText = function strokeText(text, x, y, maxWidth) {
		throw new Error("Not Implemented");
	};

	WebGLRenderer.prototype.measureText = function measureText(text) {
		throw new Error("Not Implemented");
	};

	/** Drawing Images */

	WebGLRenderer.prototype.drawImage = function drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh) {
		throw new Error("Not Implemented");
	};

	/** Hit Regions */

	WebGLRenderer.prototype.addHitRegion = function addHitRegion(options) {
		throw new Error("Not Implemented");
	};

	WebGLRenderer.prototype.removeHitRegion = function removeHitRegion(options) {
		throw new Error("Not Implemented");
	};

	/** Pixel Manipulation */

	WebGLRenderer.prototype.createImageData = function createImageData(sw, sh) {
		throw new Error("Not Implemented");
	};

	WebGLRenderer.prototype.getImageData = function getImageData(sx, sy, sw, sh) {
		throw new Error("Not Implemented");
	};

	WebGLRenderer.prototype.putImageData = function putImageData(imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
		throw new Error("Not Implemented");
	};

	module.exports = WebGLRenderer;
});