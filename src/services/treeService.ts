import mongoose from "mongoose";

import Tree, { IEdge } from "../models/treeModel";
import redis from "../config/redis";
import { GenerteAndUpdateCache, IRedisData} from "./redisService";
import Node, { INode } from "../models/nodeModel";


export const getTreeByID = async (treeId: string):Promise<null|IRedisData> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(treeId)) {
            console.warn(`Invalid tree ID: ${treeId}`);
            return null;
        }

        const cachedData = await redis.hgetall(`tree:${treeId}`);
        
        if (cachedData  && Object.keys(cachedData).length > 0) {
            console.log("Cache Hit!");
            return {
                name: cachedData.name as string,
                nodes: JSON.parse(cachedData.nodes as string),
                edges: JSON.parse(cachedData.edges as string)
              };
        }else{
        console.log("Cache Miss! Fetching from DB...");
        const tree=await GenerteAndUpdateCache(treeId);

        return tree;
        }
    } catch (error) {
        console.error("Error retrieving tree:", error);
        return null;
    }
};

// export const addTreeToUser = async (userId:string, treeId:string, treeName:string):Promise <IUser|null> => {
//     try {
//         const user=await User.findByIdAndUpdate(userId, { treeId, treeName }, { new: true, runValidators: true });
//         return user
//     } catch (error) {
//         return null;
//     }
// }

// export const getTreeName=async (treeId :string): Promise<null|string> =>{
//     if(!treeId) return null;

//     try{
//     const tree=await Tree.findById(treeId,{name:1});
//     const treeName = tree ? tree.name : null;

//     return treeName;
//     }catch(err){
//         return null;
//     }
// }

export const updateTree=async(): Promise<void> =>{
    const startTime = Date.now();
    console.log("Searching for trees to update...");

    try{
        const updatedTrees=await redis.smembers('trees:modified');

        const MAX_BATCH_SIZE = 40;
        const treesToProcess = updatedTrees.slice(0, MAX_BATCH_SIZE);

        if (treesToProcess.length === 0) {
            console.log("No Trees available to update.")
            return ;
        }

        const results = [];

        for(const treeId of treesToProcess){
            const session = await mongoose.startSession();
            try{
                session.startTransaction();
                const redisTree=await redis.hgetall(`tree:${treeId}`);

                if (!redisTree || !redisTree.nodes || !redisTree.edges) {
                    console.warn(`Incomplete data for tree ${treeId}`);
                    continue;
                }

                const nodes = JSON.parse(redisTree.nodes as string) as INode[];
                const edges = JSON.parse(redisTree.edges as string) as IEdge[];

                await Tree.findByIdAndUpdate(treeId,{
                    edges,
                },{session});

                const nodeUpdatePromises = nodes.map(node => 
                    Node.findByIdAndUpdate(node._id, {
                        position: node.position,
                    },{session})
                );

                await Promise.all(nodeUpdatePromises);
                await session.commitTransaction();

                await redis.srem('trees:modified', treeId);
                results.push({ treeId, status: 'updated' });
                console.log(`Tree ${treeId} synchronized with MongoDB`);
            }catch(err){
                console.error(`Error updating tree ${treeId}:`, err);
                results.push({ treeId, status: 'failed', error: (err as Error).message });
                await session.abortTransaction();
            }finally{
                session.endSession();
            }
        }

        console.log("Trees updated successfully!");
        console.log("Updated: ",results.filter(r => r.status === 'updated').length);
        console.log("Failed: ",results.filter(r => r.status === 'failed').length);
        console.log("Details: ",results)
        const duration = Date.now() - startTime;
        console.log(`Sync completed in ${duration}ms, updated ${results.length} trees`);
    }catch(err){
        console.error("Error in updateTree:", err);

    }
}
