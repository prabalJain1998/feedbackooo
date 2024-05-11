import { PutObjectCommand, S3Client} from '@aws-sdk/client-s3'
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { HttpStatusCode } from 'axios';
import { ratelimitForS3 } from '../libs/ratelimit';


export async function POST(req){
    const ip = req.ip || '127.0.0.1';

    const session = getServerSession(authOptions);

    if(!session){
        return Response.json([]);
    }

    const {success, pending, limit, reset, remaining} = await ratelimitForS3.limit(session?.user?.email+"_s3Cap");

    if(!success){
        return Response.json(['']);
    }

    const myS3Client = new S3Client(
        {
            region : process.env.REGION,
            credentials : {
                accessKeyId :process.env.S3_ACCESS_KEY,
                secretAccessKey : process.env.S3_SECRET_ACCESS_KEY
            }
        }
    )
    const formData = await req.formData();
    const links = [];
    let count =0;
    for(const fileInfo of formData){
        count++;
        const file = fileInfo[1];
        if (file.size > process.env.MAX_S3_FILE_SIZE) {
            return Response.json([]);
        }
    }

    if(count > 3){
        return Response.json([]);
    }

    for(const fileInfo of formData){
        const file = fileInfo[1];
        const name = Date.now().toString()+file.name
        const chunks = []
        for await (const chunk of file.stream()){
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        await myS3Client.send(new PutObjectCommand(
            {
                Bucket : process.env.FEEDBACK_ASSET_BUCKET,
                Key : name,
                ACL : 'public-read',
                Body : buffer,
                ContentType : file.type
            }   
        ));
        links.push(`https://${process.env.FEEDBACK_ASSET_BUCKET}.s3.amazonaws.com/${name}`);
    }

    return Response.json(links);
}

