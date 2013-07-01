define(function(require, exports, module) {
	var ARRAY_TYPE = (typeof Float32Array === "undefined" ? Array : Float32Array);

	var EPSILON = 1e-6;
	var EPSILON_SQ = 1e-12;

	var api = {};

	var mat4 = {};
	mat4.create = function createMat4() {
		var mat = new ARRAY_TYPE(16);
		mat.toString = function() {
			return mat4.toString(this);
		};

		mat[ 0] = 1; mat[ 1] = 0; mat[ 2] = 0; mat[ 3] = 0;
		mat[ 4] = 0; mat[ 5] = 1; mat[ 6] = 0; mat[ 7] = 0;
		mat[ 8] = 0; mat[ 9] = 0; mat[10] = 1; mat[11] = 0;
		mat[12] = 0; mat[13] = 0; mat[14] = 0; mat[15] = 1;
		return mat;
	};

	mat4.clone = function cloneMat4(m) {
		var mat = new ARRAY_TYPE(16);
		mat[ 0] = m[ 0]; mat[ 1] = m[ 1]; mat[ 2] = m[ 2]; mat[ 3] = m[ 3];
		mat[ 4] = m[ 4]; mat[ 5] = m[ 5]; mat[ 6] = m[ 6]; mat[ 7] = m[ 7];
		mat[ 8] = m[ 8]; mat[ 9] = m[ 9]; mat[10] = m[10]; mat[11] = m[11];
		mat[12] = m[12]; mat[13] = m[13]; mat[14] = m[14]; mat[15] = m[15];
		return mat;
	};

	mat4.copy = function copyMat4(a, b) {
		b[ 0] = a[ 0]; b[ 1] = a[ 1]; b[ 2] = a[ 2]; b[ 3] = a[ 3];
		b[ 4] = a[ 4]; b[ 5] = a[ 5]; b[ 6] = a[ 6]; b[ 7] = a[ 7];
		b[ 8] = a[ 8]; b[ 9] = a[ 9]; b[10] = a[10]; b[11] = a[11];
		b[12] = a[12]; b[13] = a[13]; b[14] = a[14]; b[15] = a[15];

		return b;
	};

	mat4.identity = function identityMat4(mat) {
		mat[ 0] = 1; mat[ 4] = 0; mat[ 8] = 0; mat[12] = 0;
		mat[ 1] = 0; mat[ 5] = 1; mat[ 9] = 0; mat[13] = 0;
		mat[ 2] = 0; mat[ 6] = 0; mat[10] = 1; mat[14] = 0;
		mat[ 3] = 0; mat[ 7] = 0; mat[11] = 0; mat[15] = 1;
		return mat;
	};

	mat4.scale = function scaleMat4(mat, x, y, z) {
		mat[0] = mat[0] * x;
		mat[5] = mat[5] * y;
		mat[10] = mat[10] * z;
		return mat;
	};

	mat4.rotate = function rotate(mat, angle, ax, ay, az) {
		var lenSq = ax * ax + ay * ay + az * az;
		if (lenSq <= EPSILON_SQ) return mat;

		var len = Math.sqrt(lenSq);
		var normFactor = 1 / len;

		ax *= normFactor;
		ay *= normFactor;
		az *= normFactor;

		var cosTheta = Math.cos(angle);
		var oneMinusCosTheta = 1 - cosTheta;
		
		var sinTheta = Math.sin(angle);

		// Elements of the rotation matrix
		var r00 = cosTheta + ax * ax * oneMinusCosTheta;
		var r01 = ax * ay * oneMinusCosTheta - az * sinTheta;
		var r02 = ax * az * oneMinusCosTheta + ay * sinTheta;
		var r10 = ay * ax * oneMinusCosTheta + az * sinTheta;
		var r11 = cosTheta + ay * ay * oneMinusCosTheta;
		var r12 = ay * az * oneMinusCosTheta - ax * sinTheta;
		var r20 = ax * az * oneMinusCosTheta - ay * sinTheta;;
		var r21 = ay * az * oneMinusCosTheta + ax * sinTheta;;
		var r22 = cosTheta + az * az * oneMinusCosTheta;

		// Now do the multiplication
		var m00 = mat[ 0], m01 = mat[ 4], m02 = mat[ 8], m03 = mat[12],
			m10 = mat[ 1], m11 = mat[ 5], m12 = mat[ 9], m13 = mat[13],
			m20 = mat[ 2], m21 = mat[ 6], m22 = mat[10], m23 = mat[14],
			m30 = mat[ 3], m31 = mat[ 7], m32 = mat[11], m33 = mat[15];

		mat[ 0] = m00 * r00 + m01 * r10 + m02 * r20;
		mat[ 4] = m00 * r01 + m01 * r11 + m02 * r21;
		mat[ 8] = m00 * r02 + m01 * r12 + m02 * r22;
		mat[12] = m03;

		mat[ 1] = m10 * r00 + m11 * r10 + m12 * r20;
		mat[ 5] = m10 * r01 + m11 * r11 + m12 * r21;
		mat[ 9] = m10 * r02 + m11 * r12 + m12 * r22;
		mat[13] = m13;

		mat[ 2] = m20 * r00 + m21 * r10 + m22 * r20;
		mat[ 6] = m20 * r01 + m21 * r11 + m22 * r21;
		mat[10] = m20 * r02 + m21 * r12 + m22 * r22;
		mat[14] = m23;

		mat[ 3] = m30 * r00 + m31 * r10 + m32 * r20;
		mat[ 7] = m30 * r01 + m31 * r11 + m32 * r21;
		mat[11] = m30 * r02 + m31 * r12 + m32 * r22;
		mat[15] = m33;

		return mat;
	};

	mat4.translate = function translate(mat, dx, dy, dz) {
		mat[12] += dx;
		mat[13] += dy;
		mat[14] += dz;
		return mat;
	};

	mat4.perspective = function perspective(mat, fovy, aspect, near, far) {
		var f = 1.0 / Math.tan(0.5 * fovy);
		var nf = 1.0 / (near - far);

		mat[ 0] = f / aspect; mat[ 4] = 0; mat[ 8] = 0;                 mat[12] =  0;
		mat[ 1] = 0;          mat[ 5] = f; mat[ 9] = 0;                 mat[13] =  0;
		mat[ 2] = 0;          mat[ 6] = 0; mat[10] = (far + near) * nf; mat[14] = 2 * far * near * nf;
		mat[ 3] = 0;          mat[ 7] = 0; mat[11] = -1;                mat[15] =  0;

		return mat;
	};

	mat4.toString = function toString(mat) {
		var str = "";
		str += [mat[ 0], mat[ 4], mat[ 8], mat[ 12]].join(", ") + "\n";
		str += [mat[ 1], mat[ 5], mat[ 9], mat[ 13]].join(", ") + "\n";
		str += [mat[ 2], mat[ 6], mat[10], mat[ 14]].join(", ") + "\n";
		str += [mat[ 3], mat[ 7], mat[11], mat[ 15]].join(", ");

		return str;
	};

	module.exports = mat4;
});