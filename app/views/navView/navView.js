var frameModule = require("ui/frame");
var drawerModule = require("nativescript-telerik-ui/sidedrawer");
var drawer;

exports.goToProgress = function() {
  frameModule.topmost().navigate("views/progressView/progressView");
};

exports.goToGoals = function() {
  frameModule.topmost().navigate("views/goalsView/goalsView");
};

exports.goToInterventions = function() {
  frameModule.topmost().navigate("views/interventionsView/interventionsView");
};

exports.goToSettings = function() {
  frameModule.topmost().navigate("views/settingsView/settingsView");
};

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};

exports.pageLoaded = function(args) {
  drawer = args.object.getViewById('sideDrawer');
};

//var applicationModule = require("application");
// var context = applicationModule.android.context.getApplicationContext();
// const DateChangeService = require("~/util/DateChangeService");

// var dateChangeServiceIntent = new android.content.Intent(context, com.habitlab.DateChangeService.class);

// context.startService(dateChangeServiceIntent);
