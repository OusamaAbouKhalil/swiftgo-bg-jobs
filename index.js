
const notifications = require("./notifications");
const restaurantStatus = require("./restaurantStatus");
const customNotification = require("./customNotification");

exports.sendNotification = notifications.sendNotification;
exports.updateRestaurantStatus = restaurantStatus.updateRestaurantStatus;
exports.sendTopicNotification = customNotification.sendTopicNotification;
