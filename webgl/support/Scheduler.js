/**
 * This file defines an api for animation and computation scheduling.
 */
define(function(require, exports, module) {
	var ANIMATION_TASK_ID = 0;
	var COMPUTE_TASK_ID = 0;

	var __arrAnimationTasks = [];
	var __arrComputeTasks = [];
	var __animationFrameScheduled = false;

	// Timing / Stats data
	var frameCount = 0;
	var avgFrameTime = 0;
	var avgFPS = 0;
	var startTime = 0;

	window.getSchedulerStats = function() {
		return {
			frameCount: frameCount,
			avgFrameTime: avgFrameTime,
			avgFPS: avgFPS,
			startTime: startTime
		};
	};

	var TIMER_FN = {
		now: function() {
			var timerFn = window.performance || Date;
			var time = timerFn.now();
			startTime = time;
			TIMER_FN = timerFn;
			return time;
		}
	};

	function __scheduleAnimationFrame() {
		if (__animationFrameScheduled) {
			return;
		}

		if (0 === __arrAnimationTasks.length) {
			return;
		}

		__animationFrameScheduled = true;
		requestAnimationFrame(__animationFrame);
	};

	var tickStart = 0;
	var tickEnd = 0;

	function __animationFrame() {
		tickStart = TIMER_FN.now();
		for (var idx = 0, len = __arrAnimationTasks.length; idx < len; ++idx) {
			__arrAnimationTasks[idx]();
		}

		tickEnd = TIMER_FN.now();

		// Timing hook
		var frameTime = tickEnd - tickStart;
		var totalFrameTime = avgFrameTime * frameCount;
		++frameCount;

		avgFrameTime = (totalFrameTime + frameTime) / frameCount;
		avgFPS = frameCount / (tickStart - startTime) * 1000;

		__animationFrameScheduled = false;
		__scheduleAnimationFrame();
	};

	var Scheduler = {};

	Scheduler.addAnimationTask = function addAnimationTask(task) {
		var taskId = ANIMATION_TASK_ID++;
		__schedulerId = taskId;
		__arrAnimationTasks.push(task);

		__scheduleAnimationFrame();

		return taskId;
	};

	module.exports = Scheduler;
});