var frame = require('ui/frame')
var fancyAlert = require("nativescript-fancyalert");
var PermissionUtil = require("~/util/PermissionUtil");
var page;


exports.pageLoaded = function(args) {
	page = args.object;
	fancyAlert.TNSFancyAlert.showSuccess("One more to go!", "Awesome, just one last permission to authorize.", "Let's do it")
}


//When the user taps the 'give permission' button - If the user hasn't already given permission, open settings
exports.giveAccessibilityPermission = function(args) {
  	if (!PermissionUtil.checkAccessibilityPermission()) {
   		PermissionUtil.launchAccessibilityServiceIntent();
 	} else {
    	fancyAlert.TNSFancyAlert.showInfo("Good job!", "You've already authorized HabitLab.", "Sweet!");
    	frame.topmost().navigate('views/goalView/goalView');
	}
}