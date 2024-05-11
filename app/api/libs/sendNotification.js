const Pusher = require("pusher");

export const send = ({eventType, message, channel}) =>{
  
    const pusher = new Pusher({
        appId:process.env.PUSHER_APP_ID,
        key: process.env.PUSHER_KEY,
        secret: process.env.PUSHER_SECRET,
        cluster: process.env.PUSHER_CLUSTER,
        useTLS: true
    });

    pusher.trigger(channel, eventType, 
    {
        message:message
    });
}