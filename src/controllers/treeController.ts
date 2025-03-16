import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import { addTreeToUser, getTreeByID } from "../services/treeService";
import Tree, { IEdge } from "../models/treeModel";
import { getNodeByID } from "../services/nodeService";
import Node, { INode } from "../models/nodeModel";
import { IRedisData } from "../services/redisService";
import redis from "../config/redis";

export const getTree=async (req:Request,res:Response) : Promise <void> =>{

    const userId=res.locals.cookieData.userId;
    const treeId=res.locals.cookieData.treeId;

    let tree:IRedisData|null;

    try{
        tree=await getTreeByID(treeId as string);

        if(!tree){
            res.status(400).json({success:false,message:"No tree found with this ID"});
            return;
        }

        res.status(200).json({success:true,data:tree})
        return;

    }catch(e){
        res.status(500).json({success:false,message:"Error fetching tree"})
        return;
    }
}

export const getTreeById=async (req:Request,res:Response) : Promise <void> =>{

    const {id}=req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        res.status(400).json({success:false,message:"Invalid Tree ID type"});
        return;
    }

    let tree:IRedisData|null;

    try{
        tree=await getTreeByID(id as string);

        if(!tree){
            res.status(400).json({success:false,message:"No tree found with this ID"});
            return;
        }

        res.status(200).json({success:true,data:tree})
        return;

    }catch(e){
        res.status(500).json({success:false,message:"Error fetching tree"})
        return;
    }
}

export const getTreeByName=async (req:Request,res:Response) : Promise <void> =>{
    const {treeName}=req.params;

    try{
        const dbTree = await Tree.findOne({name:treeName});

        if(!dbTree){
            res.status(400).json({success:false,message:"No tree found with this Name"});
            return;
        }

        const nodePromises = dbTree.nodes.map((nodeId) => getNodeByID(nodeId.toString()));
        const nodes = await Promise.all(nodePromises);
    
        const validNodes = nodes.filter((node) => node !== null) as INode[];
    
        // Construct tree object
        const tree: IRedisData = {
            name: dbTree.treeName,
            nodes: validNodes,
            edges: dbTree.edges,
        };

        res.status(200).json({success:true,data:tree})
        return;

    }catch(e){
        res.status(500).json({success:false,message:"Error fetching tree"})
        return;
    }
}

export const updateTree=async(): Promise<void> =>{
    const startTime = Date.now();
    console.log("Searching for trees to update...");

    try{
        const updatedTrees=await redis.smembers('trees:modified');

        const MAX_BATCH_SIZE = 40;
        const treesToProcess = updatedTrees.slice(0, MAX_BATCH_SIZE);

        if (treesToProcess.length === 0) {
            console.log("No Trees available to update.")
            return ;
        }

        const results = [];

        for(const treeId of treesToProcess){
            const session = await mongoose.startSession();
            try{
                session.startTransaction();
                const redisTree=await redis.hgetall(`tree:${treeId}`);

                if (!redisTree || !redisTree.nodes || !redisTree.edges) {
                    console.warn(`Incomplete data for tree ${treeId}`);
                    continue;
                }

                const nodes = JSON.parse(redisTree.nodes as string) as INode[];
                const edges = JSON.parse(redisTree.edges as string) as IEdge[];

                await Tree.findByIdAndUpdate(treeId,{
                    edges,
                },{session});

                const nodeUpdatePromises = nodes.map(node => 
                    Node.findByIdAndUpdate(node._id, {
                        position: node.position,
                    },{session})
                );

                await Promise.all(nodeUpdatePromises);
                await session.commitTransaction();

                await redis.srem('trees:modified', treeId);
                results.push({ treeId, status: 'updated' });
                console.log(`Tree ${treeId} synchronized with MongoDB`);
            }catch(err){
                console.error(`Error updating tree ${treeId}:`, err);
                results.push({ treeId, status: 'failed', error: (err as Error).message });
                await session.abortTransaction();
            }finally{
                session.endSession();
            }
        }

        console.log("Trees updated successfully!");
        console.log("Updated: ",results.filter(r => r.status === 'updated').length);
        console.log("Failed: ",results.filter(r => r.status === 'failed').length);
        console.log("Details: ",results)
        const duration = Date.now() - startTime;
        console.log(`Sync completed in ${duration}ms, updated ${results.length} trees`);
    }catch(err){
        console.error("Error in updateTree:", err);

    }
}