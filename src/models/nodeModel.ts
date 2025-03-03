import mongoose, { Document, Schema, Types } from 'mongoose';

interface INode extends Document{
    name:string,
    realtion:string,
    gender:string,
    description:string,
    dob:string,
    images:Array<string>,
    mainImg:string,
    role:string,
    treeId:Types.ObjectId,
    position:{
        x:number,
        y:number,
    }
}

const NodeSchema = new Schema({
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
        type: Date, 
        required: true 
    },
    images: [{type: String }
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

export default mongoose.model('node', NodeSchema);