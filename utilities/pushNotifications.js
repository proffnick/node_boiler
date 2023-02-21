const { Expo } =  require('expo-server-sdk');

const pushNotification = async (expoNotificationTokens = [], message, data = {}, title = "New Pickup Request") => {
    let expo = new Expo();

    // create the message
    let messages = [];
    for (let pushToken of expoNotificationTokens) {
        // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
      
        // Check that all your push tokens appear to be valid Expo push tokens
        if (!Expo.isExpoPushToken(pushToken)) {
          console.error(`Push token ${pushToken} is not a valid Expo push token`);
          continue;
        }
      
        // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
        messages.push({
          to: pushToken,
          sound: 'default',
          title: title,
          body: message,
          data: { ...data, "_displayInForeground": true },
          channelId: "psa-default"
        })
      }


    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];

    (async () => {
        // Send the chunks to the Expo push notification service. There are
        // different strategies you could use. A simple one is to send one chunk at a
        // time, which nicely spreads the load out over time:
        for (let chunk of chunks) {
            try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
            // NOTE: If a ticket contains an error code in ticket.details.error, you
            // must handle it appropriately. The error codes are listed in the Expo
            // documentation:
            // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
            } catch (error) {
            console.error(error);
            }
        }
    })();


    // create a function to handle receipts of your notification
    // collect recipt IDs
    let receiptIds = [];
    for (let ticket of tickets) {
        // NOTE: Not all tickets have IDs; for example, tickets for notifications
        // that could not be enqueued will have error information and no receipt ID.
        if (ticket.id) {
            receiptIds.push(ticket.id);
        }
    }

    let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
    console.log(receiptIdChunks);
    // uncomment to handle receipts
    /*
    (async () => {
    // Like sending notifications, there are different strategies you could use
    // to retrieve batches of receipts from the Expo service.
    for (let chunk of receiptIdChunks) {
        try {
        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        console.log(receipts);

        // The receipts specify whether Apple or Google successfully received the
        // notification and information about an error, if one occurred.
        for (let receiptId in receipts) {
            let { status, message, details } = receipts[receiptId];
            if (status === 'ok') {
            continue;
            } else if (status === 'error') {
            console.error(
                `There was an error sending a notification: ${message}`
            );
            if (details && details.error) {
                // The error codes are listed in the Expo documentation:
                // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                // You must handle the errors appropriately.
                console.error(`The error code is ${details.error}`);
            }
            }
        }
        } catch (error) {
        console.error(error);
        }
    }
    })(); */

    return true;

}


module.exports = pushNotification;