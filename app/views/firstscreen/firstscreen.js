var frameModule = require("ui/frame");

exports.goToCongrats = function() {
  frameModule.topmost().navigate("views/congrats/congrats");
}