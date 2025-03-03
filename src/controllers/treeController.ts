import { Request, Response } from "express";

import { getTreeByID, TreeData } from "../services/treeService";
import mongoose, { mongo } from "mongoose";

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