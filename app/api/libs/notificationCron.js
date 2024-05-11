// // notificationCron.js

// const cron = require('node-cron');

// // Define the cron job
// const task = cron.schedule('* * * * *', async () => {
//   try {
//     console.log('Running cron job...');
    
//     // // Fetch notifications with status 'error'
//     // const notifications = await Notification.find({ status: 'error' });

//     // // Perform some action for each notification
//     // notifications.forEach(async (notification) => {
//     //   // Perform action for each notification with status 'error'
//     //   console.log(`Notification with ID ${notification._id} has status 'error'`);
      
//     //   // Example action: Retry sending the notification
//     //   // Your actual action logic here...

//     //   // For example:
//     //   // notification.status = 'pending';
//     //   // await notification.save();
//     // });
    
//     // console.log('Cron job completed.');
//   } catch (error) {
//     console.error('Error running cron job:', error);
//   }
// });

// // Start the cron job
// task.start();

// // Export the cron job (optional)
// module.exports = task;
