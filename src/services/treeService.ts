import mongoose from "mongoose";

import Tree from "../models/treeModel";
import redis from "../config/redis";
import User, { IUser } from "../models/userModel";
import { GenerteAndUpdateCache, IRedisData} from "./redisService";


export const getTreeByID = async (treeId: string):Promise<null|IRedisData> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(treeId)) {
            console.warn(`Invalid tree ID: ${treeId}`);
            return null;
        }

        const cachedData = await redis.hgetall(`tree:${treeId}`);
        
        if (cachedData  && Object.keys(cachedData).length > 0) {
            console.log("Cache Hit!");
            return {
                name: cachedData.name as string,
                nodes: JSON.parse(cachedData.nodes as string),
                edges: JSON.parse(cachedData.edges as string)
              };
        }else{
        console.log("Cache Miss! Fetching from DB...");
        const tree=await GenerteAndUpdateCache(treeId);

        return tree;
        }
    } catch (error) {
        console.error("Error retrieving tree:", error);
        return null;
    }
};

export const addTreeToUser = async (userId:string, treeId:string, treeName:string):Promise <IUser|null> => {
    try {
        const user=await User.findByIdAndUpdate(userId, { treeId, treeName }, { new: true, runValidators: true });
        return user
    } catch (error) {
        return null;
    }
}

export const getTreeName=async (treeId :string): Promise<null|string> =>{
    if(!treeId) return null;

    try{
    const tree=await Tree.findById(treeId,{name:1});
    const treeName = tree ? tree.name : null;

    return treeName;
    }catch(err){
        return null;
    }
}
