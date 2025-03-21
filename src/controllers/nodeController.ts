import { NextFunction, Request, Response } from "express";
import cloudinary from "cloudinary";
import Tree from "../models/treeModel";
import { Types } from "mongoose";
import Node from "../models/nodeModel";

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
            type:"custom",
            data:{
                name,
                relation,
                gender,
                description,
                dob,
                images,
                mainImg:images.length > 0 ? images[0].url : "",
            },
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

        next();
        return;
    }catch(error){
        console.log(error)
        res.status(500).json({ success: false, message: "Error creating node" });
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
        res.status(200).json({data:node})
        return;
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

        const imgPromise=node.data.images.map(img=>cloudinary.v2.uploader.destroy(img._id));
        await Promise.all(imgPromise)

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
    return;
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
            { $push: { "data.images": { $each: images } } },
            { runValidators: true }
        )
    }catch(err){
        res.status(500).json({"message":"Error uploading images to node",success:false})
        return;
    }
    next();
    return;
}

export const changeDP=async (req:Request,res:Response,next:NextFunction):Promise<void> =>{
    const {nodeId,url}=req.body;

    try{
        await Node.findByIdAndUpdate(nodeId,
            { $set: { "data.mainImg": url } }, 
            { runValidators: true, new: true }
        )

        next();
        return;
    }catch(err){
        res.status(400).json({message:"Couldn't update DP for this nodeID"});
        return;
    }
}

export const deleteImgById=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    const {nodeId,imgId}=req.body;

    try{
        await Node.findByIdAndUpdate(nodeId,
            { $pull: { "data.images": { _id: imgId } } }
        )

        await cloudinary.v2.uploader.destroy(imgId);
        
    }catch(err){
        console.log(err)
        res.status(500).json({message:"Error deleting image by ID", success:false});
        return;
    }
    next();
    return;
}

export const editNode=async(req:Request,res:Response,next:NextFunction):Promise<void> =>{
    const {nodeId,name,relation,gender,dob,description}=req.body;

    console.log(req.body)

    try {
        const updatedNode=await Node.findByIdAndUpdate(
            nodeId,
            {
                $set: {
                    "data.name": name,
                    "data.relation": relation,
                    "data.gender": gender,
                    "data.dob": dob,
                    "data.description": description,
                },
            },
            { new: true, runValidators: true }
        );

        if (!updatedNode) {
            res.status(404).json({ message: "Node not found", success: false });
            return ;
        }

        return next();
    } catch (error) {
        console.error("Error updating node:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
}


