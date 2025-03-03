import mongoose from "mongoose";
import redis from "../config/redis";
import { INode } from "../models/nodeModel";
import Tree from "../models/treeModel";
import { getNodeByID } from "./nodeService";
import { TreeData } from "./treeService";

export const updateCache=async (id:string)=>{
    if(!mongoose.Types.ObjectId.isValid(id)){
        return null;
    }
    const oTree = await Tree.findById(id);
    if (!oTree) {
        console.warn(`Tree not found for ID: ${id}`);
        return null;
    }

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
}