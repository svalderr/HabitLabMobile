var applicationModule = require("application");
var StorageUtil = require('~/util/StorageUtil');
var Toast = require("nativescript-toast");

var view = 'onboardingView';
if (StorageUtil.isSetUp()) {
  // view = 'navView';
  view = 'settingsView';
}
applicationModule.start({ moduleName: "views/" + view + "/" + view});
applicationModule.setCssFileName("app.css");