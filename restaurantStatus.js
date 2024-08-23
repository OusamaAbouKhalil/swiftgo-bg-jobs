const functions = require("firebase-functions");
const admin = require("./firebaseAdmin");
const {DateTime} = require("luxon"); // Using Luxon for time manipulation

const db = admin.firestore();

exports.updateRestaurantStatus = functions.pubsub
    .schedule("every 5 minutes") // Schedule to run every 5 minutes
    .timeZone("Asia/Beirut") // Set to Beirut time zone
    .onRun(async (context) => {
      try {
        // Get current time in Lebanon (Beirut time zone)
        const currentTime = DateTime.now().setZone("Asia/Beirut");
        const currentDay = currentTime.toFormat("cccc");
        // Current day (e.g., Monday)

        // Get all restaurants from Firestore
        const restaurantsSnapshot = await db.collection("restaurants").get();

        await Promise.all(
            restaurantsSnapshot.docs.map(async (restaurantDoc) => {
              const restaurantData = restaurantDoc.data();

              // Retrieve opening and closing times for the current day
              const dayTimes = restaurantData.hours[currentDay];
              // Assume hours is an object with day-specific times

              if (dayTimes) {
                // Retrieve opening and closing times from the dayTimes object
                const openingTimeStr = dayTimes.openingTime;
                const closingTimeStr = dayTimes.closingTime;

                // Parse opening and closing time
                // to DateTime objects in Beirut time
                const openingTime = DateTime.fromFormat(
                    openingTimeStr,
                    "h:mm a",
                    {zone: "Asia/Beirut"},
                );
                const closingTime = DateTime.fromFormat(
                    closingTimeStr,
                    "h:mm a",
                    {zone: "Asia/Beirut"},
                );

                // Determine if the restaurant is currently open or closed
                const isCurrentlyOpen =
                    currentTime >= openingTime && currentTime <= closingTime;

                // Update the isClosed field in
                // Firestore based on the calculated status
                await db.collection("restaurants").doc(restaurantDoc.id).set({
                  isClosed: !isCurrentlyOpen,
                });

                console.log(`Updated isClosed for 
                  ${restaurantDoc.id}: ${!isCurrentlyOpen}`);
              } else {
                console.log(`No opening hours found for
                   ${restaurantDoc.id} on ${currentDay}`);
              }
            }),
        );

        return null;
      } catch (error) {
        console.error("Error updating restaurant status: ", error);
        return null;
      }
    });
