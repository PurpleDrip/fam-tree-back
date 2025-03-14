import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { getTreeByID } from "../services/treeService";
import redis from "../config/redis";
import { ITree } from "../models/treeModel";
import { INode } from "../models/nodeModel";

export const CheckForCookies = async (req: Request, res: Response): Promise<void> => {

    const {id,treeId}=res.locals.cookieData;

    let data={}as {
        treeName:string,
        nodes:Array<INode>,
        edges:ITree["edges"],
    } | null;

    if(treeId){
    try {
        data = await redis.get(`session:tree:${treeId}`);

        if (!data) { // Cache Miss
            console.log("\nCache Miss! Fetching from DB...\n");

            let nodes :Array<INode> = [];
            let edges :ITree['edges']= [];
            let treeName :string= "";

            if (treeId) {
                try {
                    const tree = await getTreeByID(treeId); // Fetch from DB
                    if (!tree) {
                        res.status(404).json({ message: "No tree found" });
                        return;
                    }
                    nodes = tree.nodes || [];
                    edges = tree.edges || [];
                    treeName = tree.treeName || "";
                } catch (e) {
                    res.status(500).json({ message: "Error fetching tree" });
                    return;
                }
            }

            data = { treeName, nodes, edges };

            // Store in Redis
            await redis.setex(`session:tree:${treeId}`, 7 * 24 * 60 * 60, JSON.stringify(data));
        } else {
            console.log("\nCache Hit! Refreshing TTL...\n");
            await redis.setex(`session:tree:${treeId}`, 7 * 24 * 60 * 60, JSON.stringify(data)); // Reset TTL
        }
    }catch(err){
        res.status(500).json({ message: "Server error", error: (err as Error).message });
    }
    }
    
    try{

        // Renew JWT with both userId and treeId
        const newToken = jwt.sign({ userId: id, treeId }, process.env.JWT_SECRET as string, { expiresIn: "7d" });

        // Set Cookie
        res.cookie(process.env.TOKEN_NAME as string, newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ message: "Success", data });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: (err as Error).message });
    }
};

