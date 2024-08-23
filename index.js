
const notifications = require("./notifications");
const restaurantStatus = require("./restaurantStatus");

exports.sendNotification = notifications.sendNotification;
exports.updateRestaurantStatus = restaurantStatus.updateRestaurantStatus;
