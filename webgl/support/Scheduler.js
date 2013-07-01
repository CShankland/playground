/**
 * This file defines an api for animation and computation scheduling.
 */
define(function(require, exports, module) {
	var ANIMATION_TASK_ID = 0;
	var COMPUTE_TASK_ID = 0;

	var __arrAnimationTasks = [];
	var __arrComputeTasks = [];
	var __animationFrameScheduled = false;

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
		tickStart = Date.now();
		for (var idx = 0, len = __arrAnimationTasks.length; idx < len; ++idx) {
			__arrAnimationTasks[idx]();
		}

		tickEnd = Date.now();

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