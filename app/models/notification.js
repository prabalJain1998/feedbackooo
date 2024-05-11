const { Schema, models, model, default: mongoose } = require("mongoose");


const notificationSchema = new Schema({
    type : {type:String, required:true},
    userImage : {type : String, required:true},
    userName : {type : String, required:true},
    userEmail : {type : String, required:true},
    text : {type : String, required:true},
    status : {type : String, required : true},
    isReaded : {type : String, required : true},
    channel : {type : String, required : true}
},
 {
    timestamps:true,
});



export const NotificationModel = models?.NotificationModel || model('NotificationModel', notificationSchema);

