import mongoose from "mongoose";
import { status, success, alert } from "../utils/logger";

const connectDB = async () => {
    const maxAttempts = 6;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            await mongoose.connect(process.env.MONGODB_URL as string);
            success("✅ Connected to MongoDB Atlas successfully.");
            return;
        } catch (err) {
            alert(`❌ Connection attempt ${attempt} failed: ${err}`);

            if (attempt < maxAttempts) {
                status(`🔄 Retrying connection (${attempt + 1}/${maxAttempts})...`);
                await new Promise(res => setTimeout(res, 3000));
            } else {
                alert("\n❌ Failed to connect to MongoDB after multiple attempts.\n");
                throw new Error("MongoDB connection failed.");
            }
        }
    }
};

export default connectDB;
