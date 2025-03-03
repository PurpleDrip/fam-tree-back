import mongoose, { Schema, Types } from 'mongoose';

interface IUser extends Document{
    mode:string,
    email:string,
    username:string,
    gender:string,
    dob:string,
    password:string,
    treeName:string,
    treeId:Types.ObjectId
}

const UserSchema = new Schema<IUser>({
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

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
export { IUser };