import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { voteModel } from "@/app/models/vote";
import { FeedbackModel } from "@/app/models/Feedback";


export async function POST(request) {
    const userSession = await getServerSession(authOptions);
    const { email: userEmail } = userSession?.user;
    const jsonBody = await request.json();
    const { feedbackId } = jsonBody;

    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();

    try {
        const existingVote = await voteModel.find({ userEmail, feedbackId }).session(mongoSession);

        if (existingVote.length > 0) {
            const res = await voteModel.findByIdAndDelete(existingVote[0]._id).session(mongoSession);
            await FeedbackModel.findByIdAndUpdate({_id: feedbackId}, {'$inc': {votesCountCached: -1}}).session(mongoSession);
            await mongoSession.commitTransaction();
            mongoSession.endSession();
            return Response.json(res);
        } else {
            const voteDoc = new voteModel({ userEmail, feedbackId });
            await voteDoc.save({ session: mongoSession });
            await FeedbackModel.findByIdAndUpdate({_id: feedbackId}, {'$inc': {votesCountCached: 1}}).session(mongoSession);
            await mongoSession.commitTransaction();
            mongoSession.endSession();
            return Response.json(voteDoc);
        }
    } catch (error) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        throw error;
    }
}


export async function GET(request) {
   await mongoose.connect(process.env.MONGO_URL);
   const url = new URL(request.url);
   if(url.searchParams.get('feedbackIds')){
    const feedbackIds = url.searchParams.get('feedbackIds').split(',');
    
    let ratelimit = false;
    feedbackIds.map((a) =>{
        if(a == 'xxxxxxxxxx'){
            ratelimit = true;
        }
    })
    
    if(ratelimit){
    return Response.json([]);
    }

    const res =await voteModel.find({feedbackId : feedbackIds});
    return Response.json(res);
   }

   return Response.json([]);
}


