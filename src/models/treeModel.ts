import mongoose, { Schema } from 'mongoose';

const TreeSchema = new Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },
    type: {
        type: String,
        default: "custom",
    },
    nodes: [{
        type: Schema.Types.ObjectId,
        ref: 'Node'
    }],
    edges: [{
        source: {
            type: Schema.Types.ObjectId,
            ref: 'Node',
        },
        target: {
            type: Schema.Types.ObjectId,
            ref: 'Node',
        }
    }]
});

export default mongoose.model('tree', TreeSchema);