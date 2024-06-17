import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log(`Mongodb connected`)
    } catch (err) {
        console.log(err)
    }
}
