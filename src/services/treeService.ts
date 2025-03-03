import mongoose from "mongoose";
import Tree, { ITree } from "../models/treeModel";
import redis from "../config/redis";
import { getNodeByID } from "./nodeService";
import { INode } from "../models/nodeModel";
import User, { IUser } from "../models/userModel";

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
        const oTree = await Tree.findById(id);
        if (!oTree) {
            console.warn(`Tree not found for ID: ${id}`);
            return null;
        }

        // Fetch all nodes in parallel using Promise.all
        const nodePromises = oTree.nodes.map((nodeId) => getNodeByID(nodeId.toString()));
        const nodes = await Promise.all(nodePromises);

        // Filter out any null/undefined nodes
        const validNodes = nodes.filter((node) => node !== null) as INode[];

        // Construct tree object
        const tree: TreeData = {
            treeName: oTree.name,
            nodes: validNodes,
            edges: oTree.edges,
        };

        // Store in Redis cache
        await redis.setex(`session:tree:${id}`, 7 * 24 * 60 * 60, JSON.stringify(tree));

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
