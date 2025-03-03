import mongoose from "mongoose";

import Tree, { ITree } from "../models/treeModel";
import redis from "../config/redis";

interface TreeData {
    treeName:string,
    nodes:ITree["nodes"],
    edges:ITree["edges"]
}

export const getTreeByID = async (id: string): Promise<TreeData|null> => {
    let tree={} as TreeData|null;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.warn(`Invalid tree ID: ${id}`);
            return null; 
        }
    

        const data=await redis.get(`session:tree:${id}`);

        if(!data){
            const oTree = await Tree.findById(id);
            if (!oTree) {
                console.warn(`Tree not found for ID: ${id}`);
                return null;
            }
            
            tree={
                treeName:oTree.name ,
                nodes:oTree.nodes ,
                edges:oTree.edges ,
            }

            redis.setex(`session:tree:${id}`, 7 * 24 * 60 * 60, JSON.stringify(tree)); 
        }

        return tree;
    } catch (error) {
        console.error("Error retrieving tree:", error);
        return null; 
    }
};
