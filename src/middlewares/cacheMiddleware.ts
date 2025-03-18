import { Request, Response } from "express"
import Tree, { IEdge } from "../models/treeModel";
import redis from "../config/redis";
import Node, { INode } from "../models/nodeModel";
import redisTree from "../interfaces/tree";


export const updateCache = async (req: Request, res: Response): Promise<void> => {
    const { treeId } = res.locals.cookieData;

    try {
        const oTree = await Tree.findById(treeId);

        if (!oTree) {
            res.status(404).json({ message: "No tree found" });
            return;
        }

        const oldRedisTree = await redis.hgetall(`tree:${treeId}`);

        if (!oldRedisTree || Object.keys(oldRedisTree).length === 0) {
            return;
        } else {
            const tree : redisTree={
                treeId:oldRedisTree.treeId as string,
                treeName:oldRedisTree.treeName as string,
                nodes:oldRedisTree.nodes as INode[],
                edges:oldRedisTree.edges as IEdge[]
            }
            const nodePositions = tree.nodes.reduce((map :Record<string, { x: number, y: number }>, node:INode) => {
                map[node.id] = node.position;
                return map;
            }, {} as Record<string, { x: number, y: number }>);

            const nodesPromise = oTree.nodes.map(nodeId => Node.findById(nodeId));
            const nodes = await Promise.all(nodesPromise);

            const dbData: redisTree = {
                treeId:oTree.id,
                treeName: oTree.treeName,
                nodes: nodes.filter(node => node !== null) as INode[],
                edges: oTree.edges,
            };

            const newRedisTree = {
                treeId:oTree.treeName,
                treeName: oTree.treeName,
                nodes: dbData.nodes.map(node => {
                    if (nodePositions[node.id]) {
                        return {
                            ...node.toObject(),
                            position: nodePositions[node.id]  
                        };
                    }
                    return node.toObject();
                }),
                edges: tree.edges,
            };

            await redis.hset(`tree:${treeId}`, newRedisTree);
            await redis.expire(`tree:${treeId}`, 60 * 5);  

            res.status(200).json({data:newRedisTree})
            return;
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error updating the cache with DB" });
        return;
    }
};