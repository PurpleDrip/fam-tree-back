import mongoose from "mongoose";
import redis from "../config/redis";
import { INode } from "../models/nodeModel";
import Tree from "../models/treeModel";
import { Request, Response } from "express";
import { getNodeByID } from "../services/nodeService";
import { TreeData } from "../services/treeService";

export const UpdateCache=async (req:Request,res:Response):Promise<void>=>{

    const id=res.locals.cacheData.treIid;
    if(!mongoose.Types.ObjectId.isValid(id)){
        res.status(400).json({success:false,message:"Invalid Tree ID"})
        return;
    }
    const oTree = await Tree.findById(id);
    if (!oTree) {
        console.warn(`Tree not found for ID: ${id}`);
        res.status(400).json({success:false,message:"Tree not found with this ID"})
        return;
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

    res.status(201).json({success:true,message:"Successfully Updated Cache",data:tree})
    return;

}