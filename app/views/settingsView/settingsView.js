var application = require("application");

const TrackingService = require("~/services/TrackingService");
const UnlockService = require("~/services/UnlockService");
const ServiceManager = require("~/services/ServiceManager");

const PermissionUtil = require("~/util/PermissionUtil");
const StorageUtil = require("~/util/StorageUtil");

var Toast = require("nativescript-toast");
var dialogs = require("ui/dialogs");

// expose native APIs
var Intent = android.content.Intent;
var Settings = android.provider.Settings;
var AppOpsManager = android.app.AppOpsManager;
var Process = android.os.Process;
var Context = android.content.Context;
var ActivityManager = android.app.ActivityManager;
var Integer = java.lang.Integer;

// global vars
var context = application.android.context.getApplicationContext();
var trackingServiceIntent = new Intent(context, com.habitlab.TrackingService.class);
var unlockServiceIntent = new Intent(context, com.habitlab.UnlockService.class);
var drawer;

exports.reset = function() {
	StorageUtil.setUp();
};

exports.enableServices = function() {
	if (!ServiceManager.isRunning(com.habitlab.TrackingService.class.getName())) {
		context.startService(trackingServiceIntent);
	}

	if (!ServiceManager.isRunning(com.habitlab.UnlockService.class.getName())) {
		context.startService(unlockServiceIntent);
	}
};

exports.disableServices = function () {
	if (ServiceManager.isRunning(com.habitlab.TrackingService.class.getName())) {
		TrackingService.stopTimer();
		context.stopService(trackingServiceIntent);
	}

	if (ServiceManager.isRunning(com.habitlab.UnlockService.class.getName())) {
		context.stopService(unlockServiceIntent);
	}
};

exports.toggleDrawer = function() {
	drawer.toggleDrawerState();
};

var AlertDialog = android.support.v7.app.AlertDialog;

exports.getRunningServices = function() {
	// console.log("Got here");
 // 	var alertDialog = new AlertDialog.Builder(application.android.context).create();
 // 	console.log("Got here 2");
	// alertDialog.setTitle("Alert");
	// alertDialog.setMessage("Alert message to be shown");
	// console.log("Got here 3");
	// alertDialog.setButton(AlertDialog.BUTTON_NEUTRAL, "OK", dialogListener);
	// console.log("Got here 4");
	// alertDialog.show();
	// ServiceManager.getRunningServices();
};


var dialogListener = new android.content.DialogInterface.OnClickListener({
    onClick: function (dialog, which) {
        dialog.dismiss();
    }
});

exports.pageLoaded = function(args) {
	drawer = args.object.getViewById("sideDrawer"); 
	if (!PermissionUtil.checkSystemOverlayPermission()) {
		PermissionUtil.launchSystemOverlayIntent();
	}

};