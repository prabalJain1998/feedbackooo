import { NotificationModel } from "@/app/models/notification";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request){
    const jsonBody = await request.json();
    const {notificationIds} = jsonBody;

    const res = await NotificationModel.updateMany(
        { _id: { $in: notificationIds } }, 
       { $set: { isReaded: "READED" } } // Update operation
    );

    return Response.json(res);
}


export async function GET(){
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    return Response.json(await NotificationModel.find({channel : email, isReaded : "NOT_READED"}));
}