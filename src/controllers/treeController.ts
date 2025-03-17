import { NextFunction, Request, Response } from "express";

import Tree from "../models/treeModel";
import { getNodeByID } from "../services/nodeService";
import Node, { INode } from "../models/nodeModel";
import redis from "../config/redis";
import redisTree from "../interfaces/tree";
import { getTreeByID } from "../services/treeService";

export const getTree = async (req: Request, res: Response): Promise<void> => {
    const treeId = res.locals.cookieData.treeId;

    try {
        const tree=await getTreeByID(treeId);

        if(!tree){
            res.status(400).json({message:"No tree found",success:false})
        }

        res.status(200).json({ tree });
        return 
    } catch (err) {
        console.error("Error fetching tree:", err);
        res.status(500).json({ message: "Internal server error" });
        return 
    }
};


export const getTreeByName=async (req:Request,res:Response) : Promise <void> =>{
    const {treeName}=req.params;

    try{
        const dbTree = await Tree.findOne({treeName});

        if(!dbTree){
            res.status(400).json({success:false,message:"No tree found with this Name"});
            return;
        }

        const tree=await getTreeByID(dbTree.id);

        res.status(200).json({success:true,data:tree})
        return;

    }catch(e){
        res.status(500).json({success:false,message:"Error fetching tree"})
        return;
    }
}

