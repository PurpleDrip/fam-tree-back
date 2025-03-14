import { NextFunction, Request, Response } from "express";
import cloudinary from "cloudinary";
import Tree from "../models/treeModel";
import Node, { INode } from "../models/nodeModel";
import { Types } from "mongoose";

export const createNode=async (req:Request,res:Response,next:NextFunction)=>{
    const {id,treeId}=res.locals.cookieData;

    try{
        const { name, relation, gender, description, dob, role, position } = req.body;
        
        const treeExists = await Tree.findById(treeId);

        if (!treeExists) {
            res.status(404).json({ success: false, message: "Tree not found" });
            return;
        }

        const images = Array.isArray(req.files) ? req.files.map(file => ({
            _id: file.filename,
            url: file.path,
        })) : [];

        const newNode = new Node({
            name,
            relation,
            gender,
            description,
            dob,
            images, 
            mainImg:images.length > 0 ? images[0].url : "",
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
        console.log(error)
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

export const deleteNode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.body;
    const treeId = res.locals.cookieData.treeId;

    try {
        const node = await Node.findByIdAndDelete(id, { runValidators: true, new: true });
        if (!node) {
            res.status(400).json({ message: "No node found with this ID", success: false });
            return;
        }

        for (const img of node.images) {
            await cloudinary.v2.uploader.destroy(img._id);
        }
    } catch (err) {
        res.status(400).json({ message: "Error deleting node", success: false });
        return;
    }

    try{
        await Tree.findByIdAndUpdate(treeId,{
            $pull:{nodes:new Types.ObjectId(id)}
        })
    }catch(err){
        res.status(400).json({ message: "Error deleting node from tree", success: false });
        return ;
    }

    try {
        await Tree.findByIdAndUpdate(treeId, {
            $pull: { edges: { $or: [{ source: new Types.ObjectId(id) }, { target: new Types.ObjectId(id) }] } }
        }, {
            runValidators: true,
            new: true
        });
    } catch (err) {
        res.status(400).json({ message: "Error removing edges from tree", success: false });
        return;
    }

    next();
};


export const addImages=async (req:Request,res:Response,next:NextFunction):Promise<void> =>{
    if (!req.files || !Array.isArray(req.files)) {
        res.status(400).json({ message: "No images uploaded", success: false });
        return 
    }

    const images = Array.isArray(req.files) ? req.files.map(file => ({
        _id: file.filename,
        url: file.path,
    })) : [];

    try{
        await Node.findByIdAndUpdate(req.body.nodeId,
            { $push: { images: { $each: images } } },
            { new: true, runValidators: true }
        )
    }catch(err){
        res.status(500).json({"message":"Error uploading images to node",success:false})
        return;
    }
    next();
}