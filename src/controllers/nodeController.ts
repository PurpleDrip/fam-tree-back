import { NextFunction, Request, Response } from "express";
import Tree from "../models/treeModel";
import Node, { INode } from "../models/nodeModel";

export const createNode=async (req:Request,res:Response,next:NextFunction)=>{
    console.log("Received Files:", req.files); 
    console.log("Received Body:", req.body);

    const {id,treeId}=res.locals.cookieData;

    try{
        const { name, relation, gender, description, dob, role, position } = req.body;
        
        const treeExists = await Tree.findById(treeId);

        if (!treeExists) {
            res.status(404).json({ success: false, message: "Tree not found" });
            return;
        }

        const images = Array.isArray(req.files) ? req.files.map(file => file.path) : [];

        const newNode = new Node({
            name,
            relation,
            gender,
            description,
            dob,
            images, 
            mainImg:images[0],
            role,
            treeId,
            position
        });

        await Tree.findByIdAndUpdate(treeId, { $push: { nodes: newNode._id } });

        return next();
    }catch(error){
        console.error("Error creating node:", error);
        res.status(500).json({ success: false, message: "Error creating node" });
        return;
    }
}

export const updatePosition=async(req:Request,res:Response,next:NextFunction):Promise<void> =>{
    const {nodeId}=req.body;
    const position=req.body.position as INode["position"];

    try{
        const node=await Node.findByIdAndUpdate(nodeId,{
            position},{
                new:true,
                runValidators:true,
            }
        );

        if(!node){
            res.status(400).json({success:false,message:"Node not found"})
            return
        }

        return next();
    }catch(e){
        res.status(500).json({success:false,message:"Error updating position"});
        return;
    }
}