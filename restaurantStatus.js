const functions = require("firebase-functions");
const admin = require("./firebaseAdmin");
const {DateTime} = require("luxon"); // Using Luxon for time manipulation

const db = admin.firestore();

exports.updateRestaurantStatus = functions.pubsub
    .schedule("0 * * * *") // Schedule to start evry start of the hour
    .timeZone("Asia/Beirut") // Set to Beirut time zone
    .onRun(async (context) => {
      try {
      // Get current time in Lebanon (Beirut time zone)
        const currentTime = DateTime.now().setZone("Asia/Beirut");
        const currentDay = currentTime.toFormat("cccc");
        // Current day (e.g., Monday)
        const currentHour = currentTime.hour;

        if (currentHour < 8 && currentHour >= 1) {
          console.log("Function executed outside allowed time window.");
          return null;
        }

        // Get all restaurants from Firestore
        const restaurantsSnapshot = await db.collection("restaurants").get();

        // Process each restaurant
        await Promise.all(
            restaurantsSnapshot.docs
                .map(async (restaurantDoc) => {
                  const restaurantData = restaurantDoc.data();
                  const dayTimes = restaurantData.hours[currentDay];

                  if (dayTimes && Array.isArray(dayTimes)) {
                    // Check if the restaurant is currently open
                    const isCurrentlyOpen = dayTimes.some((period) => {
                      // Parse opening and closing
                      // times for each period
                      const openingTime = DateTime.
                          fromFormat(period.openingTime,
                              "h:mm a", {zone: "Asia/Beirut"});
                      const closingTime = DateTime.
                          fromFormat(period.closingTime,
                              "h:mm a", {zone: "Asia/Beirut"});

                      // Determine if current time is
                      // within any of the open periods
                      return currentTime >= openingTime &&
              currentTime <= closingTime;
                    });

                    // Update the isClosed field in Firestore
                    await db.collection("restaurants")
                        .doc(restaurantDoc.id).update({
                          isClosed: !isCurrentlyOpen,
                        });

                    console.log(`Updated isClosed for 
              ${restaurantDoc.id}: ${!isCurrentlyOpen}`);
                  } else {
                    console.log(`No valid opening hours found for 
              ${restaurantDoc.id} on ${currentDay}`);
                  }
                }));

        return null;
      } catch (error) {
        console.error("Error updating restaurant status: ", error);
        return null;
      }
    });
