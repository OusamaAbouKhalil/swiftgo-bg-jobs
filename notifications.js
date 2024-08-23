const functions = require("firebase-functions");
const admin = require("./firebaseAdmin");

exports.sendNotification = functions.https.onCall(async (data, context) => {
  const {token, title, body} = data;

  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: token,
    android: {
      notification: {
        sound: "default",
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
        },
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
    return {success: true};
  } catch (error) {
    console.error("Error sending message:", error);
    return {success: false, error: error.message};
  }
});
