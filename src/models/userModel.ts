import mongoose, { Schema, Types } from 'mongoose';

interface IUser extends Document{
    adminPassword:string,
    password:string,
    treeName:string,
    treeId:Types.ObjectId
}

const UserSchema = new Schema<IUser>({
    adminPassword:{
        type:String,
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