import { NextFunction, Request, Response } from "express";
import Tree from "../models/treeModel";
import Node from "../models/nodeModel";

export const createNode=async (req:Request,res:Response,next:NextFunction)=>{
    console.log("Received Files:", req.files); 
    console.log("Received Body:", req.body);

    const id=res.locals.cookieData.id;
    const treeId=res.locals.cookieData.treeId;

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

        res.locals.cacheData.treeId=treeId;
        return next();
    }catch(error){
        console.error("Error creating node:", error);
        res.status(500).json({ success: false, message: "Error creating node" });
        return;
    }
}