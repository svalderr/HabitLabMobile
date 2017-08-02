var application = require("application");
var NotificationCompat = android.support.v4.app.NotificationCompat
var Context = android.content.Context;
var notificationColor = [34, 0.81, 1];

var PendingIntent = android.app.PendingIntent;
var Intent = android.content.Intent;
var context = application.android.context.getApplicationContext();

exports.sendNotification = function(context, title, msg, id) {
	var notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE);
    var notificationBuilder = new NotificationCompat.Builder(context);

    var icon_id = context.getResources().getIdentifier("ic_habitlab_white", "drawable", context.getPackageName());
    notificationBuilder.setDefaults(NotificationCompat.DEFAULT_ALL);

    var notificationIntent = context.getPackageManager().getLaunchIntentForPackage("org.nativescript.HabitLabMobile");
    notificationBuilder.setContentIntent(PendingIntent.getActivity(context, 14, notificationIntent, Intent.FLAG_ACTIVITY_NEW_TASK));
    
    notificationBuilder.setSmallIcon(icon_id);
    notificationBuilder.setContentTitle(title)
    notificationBuilder.setContentText(msg);
    notificationBuilder.setColor(android.graphics.Color.HSVToColor(notificationColor));
    notificationBuilder.setPriority(NotificationCompat.PRIORITY_MAX);
    notificationManager.notify(id, notificationBuilder.build());
};     