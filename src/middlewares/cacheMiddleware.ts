import { Request, Response } from "express"
import Tree from "../models/treeModel";
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
            const oldRedisTreeParsed = {
                treeName: oldRedisTree.treeName,
                nodes: JSON.parse(oldRedisTree.nodes as string) || [],
                edges: JSON.parse(oldRedisTree.edges as string) || []
            };

            const nodePositions = oldRedisTreeParsed.nodes.reduce((map :Record<string, { x: number, y: number }>, node:INode) => {
                map[node.id] = node.position;
                return map;
            }, {} as Record<string, { x: number, y: number }>);

            const nodesPromise = oTree.nodes.map(nodeId => Node.findById(nodeId));
            const nodes = await Promise.all(nodesPromise);

            const dbData: redisTree = {
                treeName: oTree.treeName,
                nodes: nodes.filter(node => node !== null) as INode[],
                edges: oTree.edges,
            };

            const newRedisTree = {
                treeName: oTree.treeName,
                nodes: JSON.stringify(dbData.nodes.map(node => {
                    if (nodePositions[node.id]) {
                        return {
                            ...node.toObject(),
                            position: nodePositions[node.id]  
                        };
                    }
                    return node.toObject();
                })),
                edges: JSON.stringify(oldRedisTreeParsed.edges),
            };

            await redis.hset(`tree:${treeId}`, newRedisTree);
            await redis.expire(`tree:${treeId}`, 60 * 5);  

            return;
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error updating the cache with DB" });
        return;
    }
};