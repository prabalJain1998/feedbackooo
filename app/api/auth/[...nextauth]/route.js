import NextAuth from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "@/app/libs/mongoClient";


export const authOptions = {
  secret : process.env.AUTH_SECRET,
  providers: [
    GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  adapter : MongoDBAdapter(clientPromise),
}

export const handler = NextAuth(authOptions)
export {handler as GET, handler as POST}