import { Request, Response } from "express";

import { getTreeByID } from "../services/treeService";
import { IRedisData } from "../services/redisService";

export const CheckForCookies = async (req: Request, res: Response): Promise<void> => {

    const {userId,treeId}=res.locals.cookieData;

    let data:IRedisData|null=null;

    try{
        data=await getTreeByID(treeId as string);

        if(!data){
            res.status(404).json({ 
                message: "Tree not found",
                authenticated: true,
                hasTree: false
              });
            return 
        }
        res.status(400).json({message:"JWT detected",success:true,data});
    }catch(err){
        console.error("Error in session verification:", err);
        res.status(500).json({ 
          authenticated: false,
          message: "Error verifying session",
          success:false
        });
        return;
    }
};

