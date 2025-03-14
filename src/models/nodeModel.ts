import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IImage{
    _id:string;
    url: string;
}

interface INode extends Document{
    name:string,
    relation:string,
    gender:string,
    description:string,
    dob:string,
    images: Array<IImage>,
    mainImg:string,
    role:string,
    treeId:Types.ObjectId,
    position:{
        x:number,
        y:number,
    }
}

const NodeSchema = new Schema<INode>({
    name: { 
        type: String, 
        required: true 
    },
    relation: {
        type: String,
        required: true
    },
    gender: { 
        type: String, 
        enum: ["male", "female", "others"], 
        required: true 
    },
    description: {
        type: String,
        required: true
    },
    dob: { 
        type: String, 
        required: true 
    },
    images: [{
        _id:String,
        url:String
     }
    ],
    mainImg:{
        type:String,
        required:true,
    },
    role: {
        type: String,
        enum: ["admin", "viewer", "owner"],
        default: null
    },
    treeId: {
        type: Schema.Types.ObjectId,
        ref: 'Tree',
        required: true
    },
    position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true }
    }
});

const Node = mongoose.model<INode>("Node", NodeSchema);
export default Node;
export { INode };