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

