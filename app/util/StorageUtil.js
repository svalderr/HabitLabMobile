var appSettings = require("application-settings");
var ID = require('~/interventions/InterventionData');

var Calendar = java.util.Calendar;
var System = java.lang.System;

var DAY_IN_MS = 86400000;
var MIN_IN_MS = 60000;

/************************************
 *             HELPERS              *
 ************************************/

var daysSinceEpoch = function() {
  var offset = new Date().getTimezoneOffset();
  var now = Date.now() - (offset * MIN_IN_MS);
  return Math.floor(now / DAY_IN_MS);
};

var index = function() {
  return daysSinceEpoch() % 28;
};

var PkgStat = function() {
  return {visits: 0, time: 0};
};

var PkgGoal = function() {
  return {minutes: 15};
};

var PhStat = function() {
  return {glances: 0, unlocks: 0, totalTime: 0, time: 0};
};

var PhGoal = function() {
  return {glances: 75, unlocks: 50, minutes: 120};
};

var randBW = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

var FakePkgStat = function() {
  return {
    visits: randBW(10, 40), 
    time: randBW(10, 45)
  };
};

var FakePkgGoal = function() {
  return {minutes: 15};
};

var FakePhStat = function() {
  var numGlances = randBW(50, 120);
  var list = JSON.parse(appSettings.getString('selectedPackages'));
  var total = 0;
  list.forEach(function(item) {
    total += exports.getAppTime(item);
  });

  return {
    glances: numGlances, 
    unlocks: randBW(numGlances, numGlances*2), 
    totalTime: randBW(total, total + 90), 
    time: total
  };
};

var FakePhGoal = function() {
  return {
    glances: 75, 
    unlocks: 50, 
    minutes: 120
  };
};

/* helper: createPackageData
 * -------------------------
 * Updates storage to include data for newly added packages.
 */
var createPackageData = function(packageName) {
  appSettings.setString(packageName, JSON.stringify({
      goals: PkgGoal(), 
      stats: Array(28).fill(PkgStat()),
      enabled: Array(ID.interventionDetails.length).fill(true)
    }));
};

/* helper: createPhoneData
 * -----------------------
 * Updates storage to include data for general phone.
 */
var createPhoneData = function() {
  appSettings.setString('phone', JSON.stringify({
      goals: PhGoal(), 
      stats: Array(28).fill(PhStat()),
      enabled: Array(ID.interventionDetails.length).fill(true)
    }));
};

var createFakePackageData = function(packageName) {
  var stats = []
  for (var i = 0; i < 28; i++) {
    stats.push(FakePkgStat());
  }
  appSettings.setString(packageName, JSON.stringify({
      goals: FakePkgGoal(), 
      stats: stats,
      enabled: Array(ID.interventionDetails.length).fill(true)
    }));
};

var createFakePhoneData = function() {
  appSettings.setString('phone', JSON.stringify({
      goals: FakePhGoal(), 
      stats: Array(28).fill(FakePhStat()),
      enabled: Array(ID.interventionDetails.length).fill(true)
    }));
};

var startOfDay = function() {
  var startOfTarget = Calendar.getInstance();
  startOfTarget.set(Calendar.HOUR_OF_DAY, 0);
  startOfTarget.set(Calendar.MINUTE, 0);
  startOfTarget.set(Calendar.SECOND, 0);
  startOfTarget.set(Calendar.MILLISECOND, 0);
  return startOfTarget.getTimeInMillis();
};

var ActiveHours = function() {
  return {
    start: {h: 0, m: 0},
    end: {h: 0, m: 0},
    days: Array(7).fill(true)
  };
};


/************************************
 *           SETTING UP             *
 ************************************/

exports.eraseData = function() {
  appSettings.clear();
};

exports.setSetUp = function() {
  appSettings.setBoolean('setup', true);
};

/* export: setUp
 * -------------
 * Clears storage and resets everything to defaults.
 */
exports.setUpDB = function() {
  var preset = require("~/util/UsageInformationUtil").getInstalledPresets();

  appSettings.setString('selectedPackages', JSON.stringify(preset));
  appSettings.setNumber('lastDateActive', startOfDay());
  appSettings.setString('activeHours', JSON.stringify(ActiveHours()));

  preset.forEach(function (item) {
    createPackageData(item);
  });
  createPhoneData();
  appSettings.setString('enabled', JSON.stringify(Array(ID.interventionDetails.length).fill(true)));
};

exports.setUpFakeDB = function() {
  var preset = require("~/util/UsageInformationUtil").getInstalledPresets();
  appSettings.setString('selectedPackages', JSON.stringify(preset));
  appSettings.setBoolean('setup', true);
  appSettings.setString('activeHours', JSON.stringify(ActiveHours()));

  preset.forEach(function (item) {
    createFakePackageData(item);
  });
  createFakePhoneData();
  appSettings.setString('enabled', JSON.stringify(Array(ID.interventionDetails.length).fill(true)));
}

exports.setOnboarded = function() {
  appSettings.setBoolean('onboarded', true);
};

/* export: isSetUp
 * ---------------
 * Checks if the user has been onboarded yet.
 */
exports.isSetUp = function() {
  return appSettings.getBoolean('setup');
};

exports.isOnboarded = function() {
  return appSettings.getBoolean('onboarded');
};

exports.setName = function(newName) {
  appSettings.setString('name', newName);
};

exports.getName = function() {
  return appSettings.getString('name');
};


/************************************
 *           MANAGEMENT             *
 ************************************/


/* export: getSelectedPackages
 * ---------------------------
 * Returns array of package names (strings) that are currently 'blacklisted'.
 */
exports.getSelectedPackages = function() {
  return JSON.parse(appSettings.getString('selectedPackages'));
};

/* export: addPackage
 * ------------------
 * Adds the specified package to storage (with default goals, no data).
 */
exports.addPackage = function(packageName) {
  var list = JSON.parse(appSettings.getString('selectedPackages'));
  if (!list.includes(packageName)) {
    list.push(packageName);
    createPackageData(packageName);
    appSettings.setString('selectedPackages', JSON.stringify(list));
  }
};

/* export: removePackage
 * ---------------------
 * Removes the specified package.
 */
exports.removePackage = function(packageName) {
  var list = JSON.parse(appSettings.getString('selectedPackages')).filter(function (item) {
    return item !== packageName;
  });
  appSettings.remove(packageName);
  appSettings.setString('selectedPackages', JSON.stringify(list));
};

/* export: togglePackage
 * ---------------------
 * If the specified package is currently blacklisted, removes it from the list.
 * If the package is currently not blacklisted, adds it.
 */
exports.togglePackage = function(packageName) {
  var removed = false;
  var list = JSON.parse(appSettings.getString('selectedPackages')).filter(function (item) {
    if (item === packageName) {
      appSettings.remove(packageName);
      removed = true;
    }
    return item !== packageName;
  });

  if (!removed) {
    createPackageData(packageName);
    list.push(packageName);
  }

  appSettings.setString('selectedPackages', JSON.stringify(list));
  return !removed;
};

/* export: isPackageSelected
 * -------------------------
 * Checks if the given package name is blacklisted.
 */
exports.isPackageSelected = function(packageName) {
  return JSON.parse(appSettings.getString('selectedPackages')).includes(packageName);
};


/************************************
 *          DATA AND STATS          *
 ************************************/


/* helper: arrangeData
 * -------------------
 * Depending on the index passed in gives the user, the desired data. If it is with flag ALL, 
 * arranges the data so it is from least recent to most recent (for graphs, etc.).
 */
var arrangeData = function(dataArr) {
  var i = index();
  return dataArr.splice(i+1, dataArr.length).concat(dataArr.splice(0, i+1));
};

/* export: getVisits
 * -----------------
 * Gets number of visits to the specified packageName.
 */
exports.getVisits = function(packageName) {
  return JSON.parse(appSettings.getString(packageName)).stats[index()]['visits']; 
};

/* export: visited
 * ---------------
 * Adds one to the visits for today.
 */
exports.visited = function(packageName) {
  var appInfo = JSON.parse(appSettings.getString(packageName));
  appInfo['stats'][index()]['visits']++;
  appSettings.setString(packageName, JSON.stringify(appInfo));
};

/* export: decrementVisits
 * -----------------------
 * Minuses one to the visits for today.
 */
exports.decrementVisits = function(packageName) {
  var appInfo = JSON.parse(appSettings.getString(packageName));
  if (appInfo['stats'][index()]['visits']) {
    appInfo['stats'][index()]['visits']--;
  }
  appSettings.setString(packageName, JSON.stringify(appInfo));
};

/* export: getUnlocks
 * ------------------
 * Gets number of unlocks on the given day. Returns as
 * either a number or an array of numbers (with today as the last index).
 */
exports.getUnlocks = function() {
  return JSON.parse(appSettings.getString('phone')).stats[index()]['unlocks']; 
};

/* export: unlocked
 * ----------------
 * Adds one to the unlocks for today.
 */
exports.unlocked = function() {
  var phoneInfo = JSON.parse(appSettings.getString('phone'));
  phoneInfo['stats'][index()]['unlocks']++;
  appSettings.setString('phone', JSON.stringify(phoneInfo));
};

/* export: getGlances
 * ------------------
 * Gets number of glances on the given day. Returns as
 * either a number or an array of numbers (with today as the last index).
 */
exports.getGlances = function() {
  return JSON.parse(appSettings.getString('phone')).stats[index()]['glances']; 
};

/* export: glanced
 * ---------------
 * Adds one to the glances for today. Also erases any old data that needs to be overridden
 */
exports.glanced = function() {
  var phoneInfo = JSON.parse(appSettings.getString('phone'));
  phoneInfo['stats'][index()]['glances']++;
  appSettings.setString('phone', JSON.stringify(phoneInfo));
};

/* export: updateAppTime
 * ---------------------
 * Called when an app has been visited to update the time spent on that app for the 
 * day (time is in minutes).
 */
exports.updateAppTime = function(packageName, time) {

  var i = index();
  var appInfo = JSON.parse(appSettings.getString(packageName));
  var phoneInfo = JSON.parse(appSettings.getString('phone'));
  time = Math.round(time / MIN_IN_MS);
  appInfo['stats'][i]['time'] += time;
  phoneInfo['stats'][i]['time'] += time;
  appSettings.setString(packageName, JSON.stringify(appInfo));
  appSettings.setString('phone', JSON.stringify(phoneInfo));
};

/* export: getAppTime
 * ------------------
 * Returns time on the app so far today (in minutes).
 */
exports.getAppTime = function(packageName) {
  return JSON.parse(appSettings.getString(packageName)).stats[index()]['time'];
};

/* export: getTargetTime
 * ---------------------
 * Returns total time on target apps so far today (in minutes).
 */
exports.getTargetTime = function() {
  return JSON.parse(appSettings.getString('phone')).stats[index()]['time'];
};

/* export: updateTotalTime
 * -----------------------
 * Called when the phone has been used. Updates the total time for the day (time is in minutes).
 */
exports.updateTotalTime = function(time) {  
  var phoneInfo = JSON.parse(appSettings.getString('phone'));
  phoneInfo['stats'][index()]['totalTime'] += Math.round(time / MIN_IN_MS);
  appSettings.setString('phone', JSON.stringify(phoneInfo));
};

/* export: getTotalTime
 * --------------------
 * Returns total time on phone so far today (in minutes).
 */
exports.getTotalTime = function() {
  return JSON.parse(appSettings.getString('phone')).stats[index()]['totalTime'];
};

exports.midnightReset = function() {
  var today = index();
  appSettings.setNumber('lastDateActive', startOfDay());

  var phoneInfo = JSON.parse(appSettings.getString('phone'));
  phoneInfo.stats[today] = PhStat();
  appSettings.setString('phone', JSON.stringify(phoneInfo));

  var list = JSON.parse(appSettings.getString('selectedPackages'));
  list.forEach(function (packageName) {
    var appInfo = JSON.parse(appSettings.getString(packageName));
    appInfo.stats[today] = PkgStat();
    appSettings.setString(packageName, JSON.stringify(appInfo));
  });
};

/************************************
 *           INTERVENTIONS          *
 ************************************/

 exports.getInterventionsForApp = function(pkg) {
  return JSON.parse(appSettings.getString(pkg)).enabled;
 };

/* export: enableForAll
 * --------------------
 * Completely enables the given intervention (by id).
 */
exports.enableForAll = function(id) {
  // enable overall
  var enabled = JSON.parse(appSettings.getString('enabled'));
  enabled[id] = true;
  appSettings.setString('enabled', JSON.stringify(enabled));

  if (ID.interventionDetails[id].target === 'phone') {
    return;
  }

  // go through and set individual toggles
  var pkgs = JSON.parse(appSettings.getString('selectedPackages'));
  pkgs.forEach(function (item) {
    var appInfo = JSON.parse(appSettings.getString(item));
    if (!appInfo.enabled[id]) {
      appInfo.enabled[id] = true;
      appSettings.setString(item, JSON.stringify(appInfo));
    }
  });
};

/* export: disableForAll
 * ---------------------
 * Completely disables the given intervention (by id).
 */
exports.disableForAll = function(id) {
  // disable overall
  var enabled = JSON.parse(appSettings.getString('enabled'));
  enabled[id] = false;
  appSettings.setString('enabled', JSON.stringify(enabled));

  if (ID.interventionDetails[id].target === 'phone') {
    return;
  }

  // go through and set individual toggles
  var pkgs = JSON.parse(appSettings.getString('selectedPackages'));
  pkgs.forEach(function (item) {
    var appInfo = JSON.parse(appSettings.getString(item));
    if (appInfo.enabled[id]) {
      appInfo.enabled[id] = false;
      appSettings.setString(item, JSON.stringify(appInfo));
    }
  });
};

/* export: toggleForAll
 * --------------------
 * Completely disables/enables the given intervention (by id).
 */
exports.toggleForAll = function(id) {
  // toggle overall
  var enabled = JSON.parse(appSettings.getString('enabled'));
  enabled[id] = !enabled[id];
  appSettings.setString('enabled', JSON.stringify(enabled));

  if (ID.interventionDetails[id].target === 'phone') {
    return;
  }

  // go through and set individual toggles
  var pkgs = JSON.parse(appSettings.getString('selectedPackages'));
  pkgs.forEach(function (item) {
    var appInfo = JSON.parse(appSettings.getString(item));
    if (appInfo.enabled[id] && !enabled[id] || !appInfo.enabled[id] && enabled[id]) {
      appInfo.enabled[id] = enabled[id];
      appSettings.setString(item, JSON.stringify(appInfo));
    }
  });
};

/* export: enable
 * ---------------
 * Enables the given intervention for a specific package (by id).
 */
exports.enableForApp = function(id, packageName) {
  // enable individually
  var appInfo = JSON.parse(appSettings.getString(packageName));
  appInfo.enabled[id] = true;
  appSettings.setString(packageName, JSON.stringify(appInfo));

  // make sure enabled is true overall
  var enabled = JSON.parse(appSettings.getString('enabled'));
  if (!enabled[id]) {
    enabled[id] = true;
    appSettings.setString('enabled', JSON.stringify(enabled));
  }
};

/* export: disable
 * ----------------
 * Disables the given intervention for a specific package (by id).
 */
exports.disableForApp = function(id, packageName) {
  // disable individually
  var appInfo = JSON.parse(appSettings.getString(packageName));
  if (appInfo.enabled[id]) {
    appInfo.enabled[id] = false;
    appSettings.setString(packageName, JSON.stringify(appInfo));

    // check if overall disable is necessary
    var pkgs = JSON.parse(appSettings.getString('selectedPackages'));
    var mustDisable = true;
    for (var item in pkgs) {
      if (item === packageName) {
        continue;
      }

      appInfo = JSON.parse(appSettings.getString(item));
      if (enabled[id]) {
        mustDisable = false;
        break;
      }
    }

    if (mustDisable) {
      var enabled = JSON.parse(appSettings.getString('enabled'));
      enabled[id] = false;
      appSettings.setString('enabled', JSON.stringify(enabled));
    } 
  }
};

/* export: toggle
 * ----------------
 * Toggles the given intervention for a specific package (by id).
 */
exports.toggleForApp = function(id, packageName) {
  var appInfo = JSON.parse(appSettings.getString(packageName));
  appInfo.enabled[id] = !appInfo.enabled[id];
  appSettings.setString(packageName, JSON.stringify(appInfo));

  // if intervention just enabled for app
  if (appInfo.enabled[id]) {
    // make sure enabled is true overall
    var enabled1 = JSON.parse(appSettings.getString('enabled'));
    if (!enabled1[id]) {
      enabled1[id] = true;
      appSettings.setString('enabled', JSON.stringify(enabled1));
    }
  } else { // intervention just disabled for app
    // check if overall disable is necessary
    var pkgs = JSON.parse(appSettings.getString('selectedPackages'));
    var foundEnabled = false;
    pkgs.forEach(function (item) {
      if (item === packageName || foundEnabled) {
        return;
      }
      var currInfo = JSON.parse(appSettings.getString(item));
      foundEnabled = currInfo.enabled[id];
    });

    if (!foundEnabled) {
      var enabled2 = JSON.parse(appSettings.getString('enabled'));
      enabled2[id] = false;
      appSettings.setString('enabled', JSON.stringify(enabled2));
    } 
  }
};

/* export: isEnabledForApp
 * -----------------------
 * Returns whether the given intervention is enabled for package specific interventions.
 */
exports.isEnabledForApp = function(id, packageName) {
  return JSON.parse(appSettings.getString(packageName)).enabled[id];
};

/* export: isEnabledForAll
 * -----------------------
 * Returns whether the given intervention is enabled generally.
 */
exports.isEnabledForAll = function(id) {
  return JSON.parse(appSettings.getString('enabled'))[id];
};

var withinActiveHours = function() {
  var hours = JSON.parse(appSettings.getString('activeHours'));

  if (!hours.days[Date.now().getDay()]) {
    return false;
  }

  var start = hours.start;
  var end = hours.end;

  if (start.h === end.h && start.m === end.m) {
    return true;
  }

  var now = new Date();
  var h = now.getHours();
  var m = now.getMinutes();

  // first check if end < start (wraps through a midnight)
  if (start.h > end.h || (start.h === end.h && start.m > end.m)) {
    if (!(h > start.h || h === start.h && m >= start.m || h < end.h || h === end.h && m < end.m)) return false;
  } else { // then check normal
    if (h < start.h || h === start.h && m < start.m || h > end.h || h === end.h && m >= end.m) return false;
  }

  return true;
};

/* export: canIntervene
 * --------------------
 * Returns whether the given intervention is should run.
 */
exports.canIntervene = function(id, packageName) {
  if (!withinActiveHours()) {
    return false;
  }

  if (ID.interventionDetails[id].target === 'phone') {
    return JSON.parse(appSettings.getString('enabled'))[id];;
  } else  { // target === 'app'
    var specified = ID.interventionDetails[id].apps;
    return (!specified || specified.includes(packageName)) && JSON.parse(appSettings.getString(packageName)).enabled[id];
  }
};

exports.setActiveDays = function(days) {
  var hours = JSON.parse(appSettings.getString('activeHours'));
  hours.days = days;
  appSettings.setString('activeHours', JSON.stringify(hours));
}

exports.setActiveHours = function(activeHours) {
  appSettings.setString('activeHours', JSON.stringify(activeHours));
};

exports.getActiveHours = function() {
  return JSON.parse(appSettings.getString('activeHours'));
};

/*****************************
 *           GOALS           *
 *****************************/

/* export: chagneAppGoal
 * ---------------------
 * Used to update the goals for specific apps. Give the package name, the new goal amount
 * (e.g. 20 if the new goal is 20 minutes), and the type of goal that is being set (can be 
 * only minutes for now).
 */
exports.changeAppGoal = function(packageName, newGoal, type) {
  if (PkgGoal()[type] === undefined) {
    return;
  }
  var appInfo = JSON.parse(appSettings.getString(packageName));
  appInfo.goals[type] = newGoal;
  appSettings.setString(packageName, JSON.stringify(appInfo));
};

/* export: changePhoneGoal
 * -----------------------
 * Used to update the goals for phone usage. Give the new goal amount
 * (e.g. 20 if the new goal is 20 minutes), and the type of goal that is being set (can be 
 * only minutes, glances, or unlocks for now).
 */
exports.changePhoneGoal = function(newGoal, type) {
  if (!PhGoal()[type]) {
    return;
  }
  var phoneInfo = JSON.parse(appSettings.getString('phone'));
  phoneInfo.goals[type] = newGoal;
  appSettings.setString('phone', JSON.stringify(phoneInfo));
};

/* export: getPhoneGoals
 * -----------------------
 * Returns all the types and values of goals for the phone.
 */
exports.getPhoneGoals = function() {
  return JSON.parse(appSettings.getString('phone')).goals;
};

/* export: getAppGoals
 * -------------------
 * Returns all the types and values of goals for the specific app.
 */
exports.getAppGoals = function(packageName) {
  return JSON.parse(appSettings.getString(packageName)).goals;
};

/* export: getGlanceGoal
 * ---------------------
 * Returns the glance goal.
 */
exports.getGlanceGoal = function() {
  return JSON.parse(appSettings.getString('phone')).goals.glances;
};

/* export: getUnlockGoal
 * ---------------------
 * Returns the unlock goal.
 */
exports.getUnlockGoal = function() {
  return JSON.parse(appSettings.getString('phone')).goals.unlocks;
};

/* export: getUsageGoal
 * --------------------
 * Returns the usage goal.
 */
exports.getUsageGoal = function() {
  return JSON.parse(appSettings.getString('phone')).goals.minutes;
};

/* export: getMinutesGoal
 * ----------------------
 * Returns the minutes goal for the specific app.
 */
exports.getMinutesGoal = function(packageName) {
  return JSON.parse(appSettings.getString(packageName)).goals.minutes;
};

exports.getProgressViewInfo = function() {
  var retObj = {}
  retObj.phoneStats = arrangeData(JSON.parse(appSettings.getString('phone')).stats);
  
  var list = JSON.parse(appSettings.getString('selectedPackages'));
  retObj.appStats = [];
  list.forEach(function (item) {
    var appStat = arrangeData(JSON.parse(appSettings.getString(item)).stats);
    appStat.packageName = item;
    retObj.appStats.push(appStat);
  });
  return retObj;
};

//To be used for app detail view -- returns an appStats object when passed a package name
exports.getAppStats = function(packageName) {
  var obj = JSON.parse(appSettings.getString(packageName));
  var arr = arrangeData(obj.stats);
  arr.goals = obj.goals;
  return arr;
};

exports.getErrorQueue = function() {
  var queue = appSettings.getString('errorQueue');
  return queue && JSON.parse(queue) || [];
}

exports.addError = function(error) {
  var queue = appSettings.getString('errorQueue');
  queue = queue && JSON.parse(queue) || [];
  queue.push(error);
  appSettings.setString('errorQueue', JSON.stringify(queue));
}

exports.clearErrorQueue = function() {
  appSettings.setString('errorQueue', JSON.stringify([]));
}

