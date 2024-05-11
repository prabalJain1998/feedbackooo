import OpenAI from 'openai';

export async function GET(request){
    
    const url = new URL(request.url);
    
    const initialPrompt = "you are a master of providing maximum of 2 lines or 400 characters output provide an output for : "
    if(url.searchParams?.get("message")){

       
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

   const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: initialPrompt+url.searchParams?.get("message")}],
    model: 'gpt-3.5-turbo',
    });
    return new Response(JSON.stringify({chatCompletion}), { status: 200 });
    }
   
    return new Response(JSON.stringify({}), { status: 200 });
}