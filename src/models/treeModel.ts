import mongoose, { Schema, Document, Types } from "mongoose";

interface ITree extends Document {
    treeName:string,
    password:string,
    adminPassword:string,
    owner:string;
    type: string;
    nodes: Types.ObjectId[];  
    edges: Array<IEdge>; 
}

export interface IEdge {
    id:string,
    source:Types.ObjectId,
    target:Types.ObjectId
}

const TreeSchema = new Schema<ITree>({
    treeName: {
        type: String,
        required: true,
        unique: true,
    },
    adminPassword:{
        type:String,
        required:true,
    },
    password: { 
        type: String, 
        required:true,
    },
    owner:{
        type:String,
        ref:"User",
        required:true,
    },
    type: {
        type: String,
        default: "custom",
    },
    nodes: [{
        type: Schema.Types.ObjectId,
        ref: "Node"
    }],
    edges: [{
        id: {type:String, required:true},
        source: { type: Schema.Types.ObjectId, ref: "Node" },
        target: { type: Schema.Types.ObjectId, ref: "Node" }
    }]
});

const Tree = mongoose.model<ITree>("Tree", TreeSchema);
export default Tree;
export { ITree };
