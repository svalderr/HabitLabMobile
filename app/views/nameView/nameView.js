var application = require("application");
var StorageUtil = require("~/util/StorageUtil");
var PermissionUtil = require("~/util/PermissionUtil");
var frameModule = require("ui/frame");
var fancyAlert = require('nativescript-fancyalert');
var page;
var nameField;

exports.pageLoaded = function(args) {
	page = args.object;
	nameField = page.getViewById("name");
	nameField.text = StorageUtil.getName() || "";

  // start permission-checking service
  if (!permissionServiceIsRunning()) {
  	var trackingServiceIntent = new android.content.Intent(application.android.context, com.habitlab.PermissionCheckerService.class); 
  	application.android.context.startService(trackingServiceIntent)
  }

  if (StorageUtil.isTutorialComplete()) {
    frameModule.topmost().navigate('views/progressView/progressView');
  } else if (StorageUtil.isOnboardingComplete()) {
    frameModule.topmost().navigate('views/goalsView/goalsView');
  } else if (PermissionUtil.checkAccessibilityPermission()) {
    frameModule.topmost().navigate('views/goalsView/goalsView');
    StorageUtil.setOnboardingComplete();
  } else if (PermissionUtil.checkSystemOverlayPermission()) {
    frameModule.topmost().navigate('views/accessibilityPermissionView/accessibilityPermissionView');
  }

  StorageUtil.setUpDB();
}

//Only lets the user continue past the first slide if a name is entered 
// else, a dialog appears
exports.checkNameNextPage = function(args) {
	var name = nameField.text;
	if (name === "") {
	  fancyAlert.TNSFancyAlert.showError("Not so fast!", "Please enter your name to continue", "OK");
	} else {
		StorageUtil.setName(name.trim());
		frameModule.topmost().navigate('views/watchlistOnboardingView/watchlistOnboardingView');
	}	
};

var permissionServiceIsRunning = function () {
    var manager = application.android.context.getSystemService(android.content.Context.ACTIVITY_SERVICE);
    var services = manager.getRunningServices(java.lang.Integer.MAX_VALUE);
    for (var i = 0; i < services.size(); i++) {
        var service = services.get(i);
        if (service.service.getClassName() === com.habitlab.PermissionCheckerService.class.getName()) {
            return true;
        }
    }
    return false;
};