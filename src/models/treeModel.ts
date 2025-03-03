import mongoose, { Schema, Document, Types } from "mongoose";

interface ITree extends Document {
    name: string;
    type: string;
    nodes: Types.ObjectId[];  
    edges: { source: Types.ObjectId; target: Types.ObjectId }[]; 
}

const TreeSchema = new Schema<ITree>({
    name: {
        type: String,
        required: true,
        unique: true,
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
        source: { type: Schema.Types.ObjectId, ref: "Node" },
        target: { type: Schema.Types.ObjectId, ref: "Node" }
    }]
});

const Tree = mongoose.model<ITree>("Tree", TreeSchema);
export default Tree;
export { ITree };
