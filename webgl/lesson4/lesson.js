define(function(require, exports, module) {
	var Scheduler = require("support/Scheduler");
	var mat4 = require("support/matrix");

	var pyramidVertexPositionBuffer;
	var pyramidVertices = [
		// Front face
		 0.0,  1.0,  0.0,
		-1.0, -1.0,  1.0,
		 1.0, -1.0,  1.0,

		 // "Left" side face
		 0.0,  1.0,  0.0,
		-1.0, -1.0,  1.0,
		 0.0, -1.0, -1.0,

		// "Right" side face
		 0.0,  1.0,  0.0,
		 0.0, -1.0, -1.0,
		 1.0, -1.0,  1.0,

		// "Bottom" face
		 1.0, -1.0,  1.0,
		-1.0, -1.0,  1.0,
		 0.0, -1.0, -1.0
	];

	var pyramidVertexColorBuffer;
	var pyramidColors = [
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,

		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		1.0, 0.0, 1.0, 1.0,

		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 1.0, 1.0,
		0.0, 0.0, 1.0, 1.0,

		0.0, 0.0, 1.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		1.0, 0.0, 1.0, 1.0
	];

	var cubeVertexPositionBuffer;
	var cubeVertices = [
		// Front face
      	-1.0, -1.0,  1.0,
       	 1.0, -1.0,  1.0,
       	 1.0,  1.0,  1.0,
      	-1.0,  1.0,  1.0,

      	// Back face
      	-1.0, -1.0, -1.0,
      	-1.0,  1.0, -1.0,
       	 1.0,  1.0, -1.0,
       	 1.0, -1.0, -1.0,

      	// Top face
      	-1.0,  1.0, -1.0,
      	-1.0,  1.0,  1.0,
       	 1.0,  1.0,  1.0,
       	 1.0,  1.0, -1.0,

		// Bottom face
		-1.0, -1.0, -1.0,
		 1.0, -1.0, -1.0,
		 1.0, -1.0,  1.0,
		-1.0, -1.0,  1.0,

		// Right face
		 1.0, -1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0,  1.0,  1.0,
		 1.0, -1.0,  1.0,

		// Left face
		-1.0, -1.0, -1.0,
		-1.0, -1.0,  1.0,
		-1.0,  1.0,  1.0,
		-1.0,  1.0, -1.0
	];

	var cubeVertexColorBuffer;
	var faceColors = [
		[1.0, 0.5, 0.5, 1.0],
		[0.5, 1.0, 0.5, 1.0],
		[0.5, 0.5, 1.0, 1.0],
		[1.0, 1.0, 0.5, 1.0],
		[1.0, 0.5, 1.0, 1.0],
		[0.5, 1.0, 1.0, 1.0]
	];
	var cubeColors = [];
	for (var color in faceColors) {
		for (var idx = 0; idx < 4; ++idx) {
			cubeColors = cubeColors.concat(faceColors[color]);
		}
	}

	var gl;
	var mvMatrix = mat4.create();
	var pMatrix = mat4.create();
	var rPyramid = 0;
	var rCube = 0;
	var shaderProgram;
	var mvMatrixStack = [];

	function mvPushMatrix() {
		var copy = mat4.clone(mvMatrix);
		mvMatrixStack.push(copy);
	}

	function mvPopMatrix() {
		if (0 === mvMatrixStack.length) {
			throw "Invalid popMatrix";
		}

		mvMatrix = mvMatrixStack.pop();
	}

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
		pyramidVertexPositionBuffer = gl.createBuffer();

		gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pyramidVertices), gl.STATIC_DRAW);
		pyramidVertexPositionBuffer.itemSize = 3;
		pyramidVertexPositionBuffer.numItems = 12;

		pyramidVertexColorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pyramidColors), gl.STATIC_DRAW);
		pyramidVertexColorBuffer.itemSize = 4;
		pyramidVertexColorBuffer.numItems = 12;

		cubeVertexPositionBuffer = gl.createBuffer();

		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);
		cubeVertexPositionBuffer.itemSize = 3;
		cubeVertexPositionBuffer.numItems = 24;

		cubeVertexColorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeColors), gl.STATIC_DRAW);
		cubeVertexColorBuffer.itemSize = 4;
		cubeVertexColorBuffer.numItems = 24;
	}

	function drawScene() {
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, -1.5, 0.0, -7.0);

		mvPushMatrix();
		mat4.rotate(mvMatrix, rPyramid, 1, 1, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, pyramidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, pyramidVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

		setMatrixUniforms();
		gl.drawArrays(gl.TRIANGLES, 0, pyramidVertexPositionBuffer.numItems);

		mvPopMatrix();

		mat4.translate(mvMatrix, 3.0, 0.0, 0.0);
		
		mvPushMatrix();
		mat4.rotate(mvMatrix, rCube, 1, 1, 1);

		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

		setMatrixUniforms();
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, cubeVertexPositionBuffer.numItems);
		mvPopMatrix();
	}

	var lastTime = 0;
	function animate() {
		var now = Date.now();
		if (0 === lastTime) {
			lastTime = now;
			return;
		}

		var dt = now - lastTime;
		rPyramid += (Math.PI / 2) * dt * 0.001;
		rCube -= (75 * Math.PI / 180) * dt * 0.001;

		lastTime = now;
	}

	function setMatrixUniforms() {
		//console.log("Setting perspective matrix: \n" + pMatrix);
		gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);

		//console.log("Setting modelview matrix: \n" + mvMatrix);
		gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
	}

	function webGLStart() {
		var canvas = document.getElementById("canvas");
		initGL(canvas);
		initShaders();
		initBuffers();

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);

		Scheduler.addAnimationTask(function() {
			drawScene();
			animate();
		});
	};

	module.exports = webGLStart;
});
