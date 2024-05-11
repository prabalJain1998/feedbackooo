import { CommentModel } from "@/app/models/Comment";
import { HttpStatusCode } from "axios";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NotificationModel } from "@/app/models/notification";
import { NOTIFICATION, NOTIFICATION_STATUS, NOT_READED } from "@/app/utils/constants";
import { send } from "../libs/sendNotification";
import { FeedbackModel } from "@/app/models/Feedback";

export async function POST(request){
    const jsonBody = await request.json();
    const {feedbackId, comment, uploads} = jsonBody;
    await mongoose.connect(process.env.MONGO_URL);
    const session =await getServerSession(authOptions);
    if(!session){
        return Response.json({
            status : HttpStatusCode.BadRequest,
        })
    }

    const userEmail = session?.user?.email;
    const userName = session?.user?.name;
    const userImage = session?.user?.image;

    const data = await CommentModel.create({feedbackId, comment, uploads, userEmail, userName, userImage});
    const feedbackItem =await FeedbackModel.findOne({_id : feedbackId});

    if(userEmail != feedbackItem?.userEmail){
    
    const notificationText = `${userName} commented ${comment} on your feedback`;
    const notificationData = await NotificationModel.create({
        type : NOTIFICATION.NEW_COMMENT,
        userImage,
        userName,
        userEmail,
        text : notificationText,
        status : NOTIFICATION_STATUS.PENDING,
        isReaded : NOT_READED,
        channel : feedbackItem?.userEmail || "DEAD"
    })
    try{
    // Code to send notification 
    
    send({eventType : NOTIFICATION.NEW_COMMENT, 
        message : {
        notificationId : notificationData._id,
        type : NOTIFICATION.NEW_COMMENT,
        userImage,
        userName,
        userEmail,
        text : notificationText
       },
       channel : feedbackItem?.userEmail || "DEAD"
    });
      
    await NotificationModel.updateOne({_id : notificationData?._id}, {status : NOTIFICATION_STATUS.DELIVERED});
    
    }catch(err){
        console.log(err);
        await NotificationModel.updateOne({_id : notificationData?._id}, {status : NOTIFICATION_STATUS.ERROR});
    }
    }
    

    return Response.json({
        status : HttpStatusCode.Created,
        id : data._id
    });
}

export async function GET(request) {
    await mongoose.connect(process.env.MONGO_URL);

    const url = new URL(request.url);
    if(url.searchParams.get('feedbackId')){
     const feedbackId = url.searchParams.get('feedbackId')
     const res = await CommentModel
                       .find({feedbackId})
                       .populate('user');
     return Response.json(res);
    }

    
    return Response.json(await CommentModel.find());
 }
 

 export async function PUT(request){
    await mongoose.connect(process.env.MONGO_URL);
    const jsonBody = await request.json();
    const {feedbackId, comment} = jsonBody;
    
    const url = new URL(request.url);

    if(!url.searchParams.get('commentId')){
        return Response.json(false);
    }

    const session =await getServerSession(authOptions);
    if(!session){
        return Response.json({
            status : HttpStatusCode.BadRequest,
        })
    }

    const userEmail = session?.user?.email;
    const userName = session?.user?.name;
    const userImage = session?.user?.image;

    const newData = await CommentModel.updateOne({_id:url.searchParams.get('commentId'), feedbackId:feedbackId, userEmail:userEmail}, {comment, userEmail, userName, userImage});
    return Response.json(newData);
 }