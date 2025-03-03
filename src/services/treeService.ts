import mongoose from "mongoose";
import { ITree } from "../models/treeModel";
import redis from "../config/redis";
import { INode } from "../models/nodeModel";
import User, { IUser } from "../models/userModel";
import { GenerteAndUpdateCache} from "./redisService";

export interface TreeData {
    treeName: string;
    nodes: INode[];
    edges: ITree["edges"];
}

export const getTreeByID = async (id: string): Promise<TreeData | null> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.warn(`Invalid tree ID: ${id}`);
            return null;
        }

        // Check Redis cache first
        const cachedData = await redis.get(`session:tree:${id}`);
        if (cachedData) {
            console.log("Cache Hit!");
            return JSON.parse(cachedData as string);
        }

        console.log("Cache Miss! Fetching from DB...");
        const tree=GenerteAndUpdateCache(id);

        return tree;
        
    } catch (error) {
        console.error("Error retrieving tree:", error);
        return null;
    }
};

export const addTree = async (userId:string, treeId:string, treeName:string):Promise <IUser|null> => {
    try {
        const user=await User.findByIdAndUpdate(userId, { treeId, treeName }, { new: true, runValidators: true });
        return user
    } catch (error) {
        return null;
    }
}
