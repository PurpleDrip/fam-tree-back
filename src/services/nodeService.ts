import mongoose from "mongoose";
import Node, { INode } from "../models/nodeModel"

export const getNodeByID=async (id:string):Promise<INode | null>=>{
    try{
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.warn(`Invalid tree ID: ${id}`);
            return null; 
        }
        const node=await Node.findById(id) ;

        if(!node){
            return null;
        }
        return node;
    }catch(e){
        return null;
    }
}