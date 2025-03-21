import mongoose from "mongoose";

import Tree, { IEdge } from "../models/treeModel";
import redis from "../config/redis";
import Node, { INode } from "../models/nodeModel";
import redisTree from "../interfaces/tree";


export const getTreeByID = async (treeId: string):Promise<null|redisTree> => {
    let tree: redisTree | null = null;

    try {
        const redisTree = await redis.hgetall(`tree:${treeId}`);

        if (!redisTree || Object.keys(redisTree).length === 0) {
            const oTree = await Tree.findById(treeId);
            
            if (!oTree) {
                return null;
            }

            const nodesPromise = oTree.nodes.map((nodeId) => {
                return Node.findById(nodeId);
            });

            const nodes = await Promise.all(nodesPromise);

            tree = {
                treeId:oTree.id,
                treeName: oTree.treeName,
                nodes: nodes.filter(node => node !== null) as INode[],
                edges: oTree.edges || [],
            };

            await redis.hset(`tree:${treeId}`,{
                treeId:tree.treeId,
                treeName:tree.treeName,
                nodes:tree.nodes,
                edges:tree.edges
            })

            await redis.expire(`tree:${treeId}`,60*5);

        } else {
            tree = {
                treeId:redisTree.treeId as string || "",
                treeName: redisTree?.treeName as string || "",
                nodes:redisTree.nodes as INode[],
                edges: redisTree.edges as IEdge[]
            };
        }

        return tree; 

    } catch (error) {
        console.error("Error retrieving tree:", error);
        return null;
    }
};


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

                const nodes = redisTree.nodes as INode[];
                const edges = redisTree.edges as IEdge[];

                await Tree.findByIdAndUpdate(treeId, { $set: { edges: edges || [] } }, { session });

                if (nodes.length > 0) {
                    await Node.bulkWrite(
                        nodes
                        .filter(node => node.id && node.position) 
                        .map((node) => ({
                            updateOne: {
                                filter: { _id:  new mongoose.Types.ObjectId(node.id) },
                                update: { $set: { position: node.position } },
                            },
                        })),
                        { session }
                    );
                }

                await redis.srem('trees:modified', treeId);
                results.push({ treeId, status: 'updated' });
                console.log(`Tree ${treeId} synchronized with MongoDB`);
                await session.commitTransaction();

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
        console.log(`Sync completed in ${duration}ms, updated ${results.length} trees \n`);
    }catch(err){
        console.error("Error in updateTree:", err);

    }
}
