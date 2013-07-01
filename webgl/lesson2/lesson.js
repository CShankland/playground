define(function(require, exports, module) {
	var mat4 = require("support/matrix");

	var triangleVertexPositionBuffer;
	var triangleVertices = [
		 0.0,  1.0, 0.0,
		-1.0, -1.0, 0.0,
		 1.0, -1.0, 0.0
	];

	var triangleVertexColorBuffer;
	var triangleColors = [
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0
	];

	var squareVertexPositionBuffer;
	var squareVertices = [
		 1.0,  1.0, 0.0,
		-1.0,  1.0, 0.0,
		 1.0, -1.0, 0.0,
		-1.0, -1.0, 0.0
	];

	var squareVertexColorBuffer;
	var squareColors = [];
	for (var idx = 0; idx < 4; ++idx) {
		squareColors = squareColors.concat([0.5, 0.5, 1.0, 1.0]);
	}

	var gl;
	var mvMatrix = mat4.create();
	var pMatrix = mat4.create();

	function initGL(canvas) {
		try {
			gl = canvas.getContext("experimental-webgl");
			gl.viewportWidth = canvas.width;
			gl.viewportHeight = canvas.height;
		} catch (e) {

		}

		if (! gl) {
			alert("Could not initialize WebGL.");
		}
	}

	var shaderProgram;

	function initShaders() {
		var fragmentShader = getShader(gl, "shader-fs");
		var vertexShader = getShader(gl, "shader-vs");

		shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);

		if (! gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			alert("Could not initialize shaders");
		}

		gl.useProgram(shaderProgram);

		shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
		gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

		shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
		gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

		shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
		shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	}

	function getShader(gl, id) {
		var shaderScript = document.getElementById(id);
		if (! shaderScript) {
			return null;
		}

		var str = "";
		var k = shaderScript.firstChild;
		while (k) {
			if (3 === k.nodeType) {
				str += k.textContent;
			}

			k = k.nextSibling;
		}

		var shader;
		if (shaderScript.type === "x-shader/x-fragment") {
			shader = gl.createShader(gl.FRAGMENT_SHADER);
		} else if (shaderScript.type === "x-shader/x-vertex") {
			shader = gl.createShader(gl.VERTEX_SHADER);
		} else {
			return null;
		}

		gl.shaderSource(shader, str);
		gl.compileShader(shader);

		if (! gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(shader));
			return null;
		}

		return shader;
	}

	function initBuffers() {
		triangleVertexPositionBuffer = gl.createBuffer();

		gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
		triangleVertexPositionBuffer.itemSize = 3;
		triangleVertexPositionBuffer.numItems = 3;

		triangleVertexColorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleColors), gl.STATIC_DRAW);
		triangleVertexColorBuffer.itemSize = 4;
		triangleVertexColorBuffer.numItems = 3;

		squareVertexPositionBuffer = gl.createBuffer();

		gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squareVertices), gl.STATIC_DRAW);
		squareVertexPositionBuffer.itemSize = 3;
		squareVertexPositionBuffer.numItems = 4;

		squareVertexColorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squareColors), gl.STATIC_DRAW);
		squareVertexColorBuffer.itemSize = 4;
		squareVertexColorBuffer.numItems = 4;
	}

	function drawScene() {
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, -1.5, 0.0, -7.0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

		setMatrixUniforms();
		gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);

		mat4.translate(mvMatrix, 3.0, 0.0, 0.0);
		gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

		setMatrixUniforms();
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
	}

	function setMatrixUniforms() {
		console.log("Setting perspective matrix: \n" + pMatrix);
		gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);

		console.log("Setting modelview matrix: \n" + mvMatrix);
		gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
	}

	function webGLStart() {
		var canvas = document.getElementById("canvas");
		initGL(canvas);
		initShaders();
		initBuffers();

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);

		drawScene();
	};

	module.exports = webGLStart;
});
