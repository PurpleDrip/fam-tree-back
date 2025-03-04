import mongoose from "mongoose";
import redis from "../config/redis";
import jwt from "jsonwebtoken"

import { INode } from "../models/nodeModel";
import Tree from "../models/treeModel";
import { NextFunction, Request, Response } from "express";
import { getNodeByID } from "../services/nodeService";
import { TreeData } from "../services/treeService";

const TOKEN_NAME=process.env.TOKEN_NAME;

export const UpdateCache=async (req:Request,res:Response,next:NextFunction):Promise<void>=>{

    const id=res.locals.cookieData.treeId;

    if(!mongoose.Types.ObjectId.isValid(id)){
        res.status(400).json({success:false,message:"Invalid Tree ID"})
        return;
    }
    const oTree = await Tree.findById(id);
    if (!oTree) {
        console.warn(`Tree not found for ID: ${id}`);
        res.status(400).json({success:false,message:"Tree not found with this ID"})
        return;
    }

    const nodePromises = oTree.nodes.map((nodeId) => getNodeByID(nodeId.toString()));
    const nodes = await Promise.all(nodePromises);

        // Filter out any null/undefined nodes
    const validNodes = nodes.filter((node) => node !== null) as INode[];

        // Construct tree object
    const tree: TreeData = {
        treeName: oTree.name,
        nodes: validNodes,
        edges: oTree.edges,
    };

        // Store in Redis cache
    await redis.setex(`session:tree:${id}`, 7 * 24 * 60 * 60, JSON.stringify(tree));

    res.locals.tree=tree;

    return next();
}

export const UpdateCacheAndCookie=async (req:Request,res:Response,next:NextFunction):Promise<void>=>{

    const id=res.locals.cookieData.treeId;

    if(!mongoose.Types.ObjectId.isValid(id)){
        res.status(400).json({success:false,message:"Invalid Tree ID"})
        return;
    }
    const oTree = await Tree.findById(id);
    if (!oTree) {
        console.warn(`Tree not found for ID: ${id}`);
        res.status(400).json({success:false,message:"Tree not found with this ID"})
        return;
    }

    const nodePromises = oTree.nodes.map((nodeId) => getNodeByID(nodeId.toString()));
    const nodes = await Promise.all(nodePromises);

        // Filter out any null/undefined nodes
    const validNodes = nodes.filter((node) => node !== null) as INode[];

        // Construct tree object
    const tree: TreeData = {
        treeName: oTree.name,
        nodes: validNodes,
        edges: oTree.edges,
    };

        // Store in Redis cache
    await redis.setex(`session:tree:${id}`, 7 * 24 * 60 * 60, JSON.stringify(tree));

    const token = jwt.sign( {userId:res.locals.cookieData,treeId:id}, process.env.JWT_SECRET as string, { expiresIn: "7d" });

    res.cookie(TOKEN_NAME as string, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({message:"success",data:res.locals.tree})

    return;
}
