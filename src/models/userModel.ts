import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
    mode:{
        type:String,
        required:true,
        enum:["google","default","facebook"]
    },
    email:{
        type:String,
    },
    username: { 
        type: String, 
        required: true,
        unique: true
    },
    gender: { 
        type: String, 
        enum: ["male", "female", "others"], 
        required: true 
    },
    dob: { 
        type: String, 
        required: true 
    },
    password: { 
        type: String, 
    },
    treeId: { 
        type: Schema.Types.ObjectId,
        ref: 'Tree',
    },
    treeName:{
        type:String,
    }
});

export default mongoose.model('user', UserSchema);