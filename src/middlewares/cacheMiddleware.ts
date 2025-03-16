import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken"

import { INode } from "../models/nodeModel";
import Tree from "../models/treeModel";
import redis from "../config/redis";
import { getNodeByID } from "../services/nodeService";
import { IRedisData } from "../services/redisService";

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
    const tree: IRedisData = {
        name: oTree.name,
        nodes: validNodes,
        edges: oTree.edges,
    };

        // Store in Redis cache
    await redis.setex(`session:tree:${id}`, 7 * 24 * 60 * 60, JSON.stringify(tree));

    res.status(201).json({success:true,message:"Updated cache successfully",data:tree})

    return next();
}

export const UpdateCacheAndCookie=async (req:Request,res:Response,next:NextFunction):Promise<void>=>{

    const treeId=res.locals.cookieData.treeId;
    let tree:IRedisData|null=null;

    if(!mongoose.Types.ObjectId.isValid(treeId)){
        res.status(400).json({success:false,message:"Invalid Tree ID"})
        return;
    }
    const oTree = await Tree.findById(treeId);
    if (!oTree) {
        console.warn(`Tree not found for ID: ${treeId}`);
        res.status(400).json({success:false,message:"Tree not found with this ID"})
        return;
    }

    const nodePromises = oTree.nodes.map((nodeId) => getNodeByID(nodeId.toString()));
    const nodes = await Promise.all(nodePromises);

    const validNodes = nodes.filter((node) => node !== null) as INode[];

    tree={
        name:oTree.name,
        nodes:validNodes,
        edges:oTree.edges
    }

    await redis.hset(`tree:${treeId}`, {
        name:oTree.name,
        nodes:JSON.stringify(validNodes),
        edges:JSON.stringify(oTree.edges)
    });
    await redis.expire(`tree:${treeId}`,60*5);

    const token = jwt.sign( {userId:res.locals.cookieData,treeId}, process.env.JWT_SECRET as string, { expiresIn: "1d" });

    res.cookie(TOKEN_NAME as string, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({message:"success",data:tree})

    return;
}
