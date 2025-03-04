import { NextFunction, Request, Response } from "express";

import { addTree, getTreeByID, TreeData } from "../services/treeService";
import mongoose from "mongoose";
import Tree, { IEdge } from "../models/treeModel";

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

export const getTreeByName=async (req:Request,res:Response) : Promise <void> =>{

    const {treeName}=req.params;

    let tree:TreeData|null;

    try{
        tree=await Tree.findOne({name:treeName});

        if(!tree){
            res.status(400).json({success:false,message:"No tree found with this Name"});
            return;
        }

        res.status(200).json({success:true,data:tree})
        return;

    }catch(e){
        res.status(500).json({success:false,message:"Error fetching tree"})
        return;
    }
}

export const createTree=async(req:Request,res:Response,next:NextFunction): Promise<void> =>{

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

        await newTree.save();
        return next();
    }catch (error) {
        console.error("Error creating tree:", error);
        res.status(500).json({ success: false, message: "Error creating tree" });
    }

}

export const addEdge=async(req:Request,res:Response,next:NextFunction): Promise<void> =>{
    const treeId=res.locals.cookieData?.treeId;
    const edge=req.body as IEdge;

    try{
        const tree=await Tree.findByIdAndUpdate(treeId,{
            $push:{edges:edge}},{
            new:true,
            runValidators:true,
        });

        if(!tree){
            res.status(400).json({success:false,message:"Tree not found"})
            return
        }

        return next();
    }catch(e){
        res.status(500).json({success:false,message:"Error adding edge"});
        return;
    }
}

export const updateEdge=async(req:Request,res:Response,next:NextFunction):Promise<void> =>{
    const treeId=res.locals.cookieData?.treeId;

    const edges=req.body as Array<IEdge>;

    try{
        const tree=await Tree.findByIdAndUpdate(treeId,{
            edges},{
                new:true,
                runValidators:true,
            }
        );

        if(!tree){
            res.status(400).json({success:false,message:"Tree not found"})
            return
        }

        return next();
    }catch(e){
        res.status(500).json({success:false,message:"Error updating edge"});
        return;
    }
}