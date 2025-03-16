import mongoose from "mongoose";

import redis from "../config/redis";
import { INode } from "../models/nodeModel";
import Tree, { IEdge } from "../models/treeModel";
import { getNodeByID } from "./nodeService";

export interface IRedisData{
    name:string,
    nodes:Array<INode>,
    edges:Array<IEdge>
}


export const GenerteAndUpdateCache=async (treeId:string):Promise<null|IRedisData> =>{
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
        name:tree.treeName,
        nodes:JSON.stringify(validNodes),
        edges:JSON.stringify(tree.edges)
    });

    await redis.expire(`tree:${treeId}`,60*5);

    return {
        name:tree.treeName,
        nodes:validNodes,
        edges:tree.edges
    };
}