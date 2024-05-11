import { FeedbackModel } from "@/app/models/Feedback";
import { HttpStatusCode } from "axios";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { ratelimit } from "../libs/ratelimit";

export async function POST(request){
    const jsonBody = await request.json();
    const {title, description, uploads} = jsonBody;
    await mongoose.connect(process.env.MONGO_URL);
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    const data = await FeedbackModel.create({title, description, uploads, userEmail});
    return Response.json({
        status : HttpStatusCode.Created,
        id : data._id
    });
}

export async function GET(req){
    const ip  = req.ip || "127.0.0.1";

    const {success, pending, limit, reset, remaining} = await ratelimit.limit(ip);

    if(!success){
        return Response.json([
            {
                "_id": "xxxxxxxxxx",
                "title": "Oops Ratelimit!!",
                "description": "Too many requests",
                "uploads": [],
                "userEmail": "test@gmail.com",
                "votesCountCached": 0,
                "createdAt": "2024-05-05T14:53:08.780Z",
                "updatedAt": "2024-05-10T18:02:52.463Z",
                "remaining" : reset,
            }

        ]);
    }

   await mongoose.connect(process.env.MONGO_URL);
   const url = new URL(req.url);

   const sortParam = url.searchParams.get('sort');
   const loadedRows = url.searchParams.get('loadedRows');
   const search = url.searchParams.get('search');

   if(url.searchParams.get('feedbackId')){
    return Response.json(await FeedbackModel.find({_id : url.searchParams.get('feedbackId')})
                                            .populate('user'));
   }

   let sortDef = '';
   if(sortParam == 'latest'){
    sortDef = {createdAt : -1};
   }else if(sortParam == 'oldest'){
    sortDef = {createdAt : 1}
   }else{
    sortDef = {votesCountCached : -1};
   }

   let filter = null;

   if(search){
    filter = {
        $or : [
            {
                title : {$regex : '.*'+search+'.*', $options: 'i'}
            },
            {
                description : {$regex : '.*'+search+'.*', $options: 'i'}
            }
        ]
    }
   }

   
   return Response.json(await FeedbackModel.find(filter,null,
    {sort: sortDef,
    skip : loadedRows,
     limit:10}).populate('user'));
}

export async function PUT(request){
    const jsonBody = await request.json();
    const {title, description, uploads} = jsonBody;
    await mongoose.connect(process.env.MONGO_URL);
    const session = await getServerSession(authOptions);
    const url = new URL(request.url);
    const userEmail = session?.user?.email;
    if(!url.searchParams.get("feedbackId")){
        return Response.json(false);
    }

    const data = await FeedbackModel.updateOne({_id:url.searchParams.get("feedbackId")}, 
                                              {title, description, uploads, userEmail});
    return Response.json(data);
}
