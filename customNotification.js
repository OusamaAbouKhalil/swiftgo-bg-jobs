const functions = require("firebase-functions");
const admin = require("./firebaseAdmin");

exports.sendTopicNotification =
 functions.https.onCall(async (data, context) => {
   // Validate input
   const title = data.title;
   const message = data.message;
   const topic = "allUsers"; // or any other topic name you use

   if (!title || !message) {
     throw new functions.https
         .HttpsError("invalid-argument",
             " \"title\" and \"message\".");
   }

   // Notification payload
   const payload = {
     notification: {
       title: title,
       body: message,
       // You can add additional fields here if needed
     },
     // This is used to target a topic
     topic: topic,
   };

   try {
     // Send the notification
     const response = await admin.messaging().send(payload);
     console.log("Notification sent successfully:", response);
     return {success: true, response: response};
   } catch (error) {
     console.error("Error sending notification:", error);
     throw new functions.https.HttpsError("internal",
         "Notification not sent", error);
   }
 });
