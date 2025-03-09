import { NextFunction, Request, Response } from "express";
import Tree from "../models/treeModel";
import Node, { INode } from "../models/nodeModel";

export const createNode=async (req:Request,res:Response,next:NextFunction)=>{
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
            mainImg:images[0] || "",
            role,
            treeId,
            position:JSON.parse(position)
        });

        await newNode.save();

        try{
            const newTree=await Tree.findByIdAndUpdate(treeId, { $push: { nodes: newNode._id } },{
                runValidators:true,
                new:true,
            });

            if(!newTree){
                res.status(400).json({success:false,message:"No tree with this ID found"})
                return 
            }
        }catch(e){
            res.status(400).json({success:false,message:"Error finding id and updating"})
            return
        }

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

export const getImagesForID=async(req:Request,res:Response)=>{
    const {id}=req.params;

    try{
        const node=await Node.findById(id);

        if(!node){
            res.status(400).json({message:"No node found ",success:false});
            return;
        }
        res.status(200).json({data:node.images,success:true,mainImg:node.mainImg});
        return
    }catch(err){
        res.status(400).json({message:"Server error",success:false});
        return;
    }
}