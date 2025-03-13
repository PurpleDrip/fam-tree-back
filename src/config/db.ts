import mongoose from "mongoose";

const connectDB = async () => {
    const maxAttempts = 6;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            await mongoose.connect(process.env.MONGODB_URL as string);
            console.log("✅ Connected to MongoDB Atlas successfully.");
            return;
        } catch (err) {
            console.log(`❌ Connection attempt ${attempt} failed: ${err}`);

            if (attempt < maxAttempts) {
                console.log(`🔄 Retrying connection (${attempt + 1}/${maxAttempts})...`);
                await new Promise(res => setTimeout(res, 3000));
            } else {
                console.log("\n❌ Failed to connect to MongoDB after multiple attempts.\n");
                throw new Error("MongoDB connection failed.");
            }
        }
    }
};

export default connectDB;
