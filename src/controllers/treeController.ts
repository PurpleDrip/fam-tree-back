import { Request, Response } from "express";

import { addTree, getTreeByID, TreeData } from "../services/treeService";
import mongoose from "mongoose";
import Tree from "../models/treeModel";
import { updateCache } from "../services/redisService";

export const getTree=async (req:Request,res:Response) : Promise <void> =>{

    const id=res.locals.cookieData.id;
    const treeId=res.locals.cookieData.treeId;

    let tree:TreeData|null;

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

    let tree:TreeData|null;

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

export const createTree=async(req:Request,res:Response): Promise<void> =>{

    const id=res.locals.cookieData.id;

    const { treeName, type, nodes, edges } = req.body;

    try{
        const existingTree = await Tree.findOne({ name: treeName });

        if (existingTree) {
            res.status(400).json({ success: false, message: "Tree with this name already exists." });
            return;
        }

        const newTree = new Tree({
            name:treeName,
            type: type || "custom",
            nodes: nodes || [],
            edges: edges || []
        });

        const user=await addTree(id,newTree.id,newTree.name);

        if(!user){
            res.status(500).json({success:false,message:"Error updating user db"});
            return;
        }

        const tree= await updateCache(newTree.id);

        await newTree.save();

        res.status(201).json({ success: true, tree: newTree });
        return;
    }catch (error) {
        console.error("Error creating tree:", error);
        res.status(500).json({ success: false, message: "Error creating tree" });
    }

}