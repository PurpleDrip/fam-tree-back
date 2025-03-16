import mongoose from "mongoose";

import redis from "../config/redis";
import { INode } from "../models/nodeModel";
import Tree from "../models/treeModel";
import { getNodeByID } from "./nodeService";

export const GenerteAndUpdateCache=async (treeId:string)=>{
    if(!mongoose.Types.ObjectId.isValid(treeId)){
        return null;
    }
    const tree = await Tree.findById(treeId);
    if (!tree) {
        console.warn(`Tree not found for ID: ${treeId}`);
        return null;
    }

    const nodePromises = tree.nodes.map((nodeId) => getNodeByID(nodeId.toString()));
    const nodes = await Promise.all(nodePromises);

    const validNodes = nodes.filter((node) => node !== null) as INode[];

    await redis.hset(`tree:${treeId}`,{
        name:tree.name,
        nodes:JSON.stringify(validNodes),
        edges:JSON.stringify(tree.edges)
    });

    await redis.expire(`tree:${treeId}`,60*5);

    return {
        name:tree.name,
        nodes:validNodes,
        edges:tree.edges
    };
}