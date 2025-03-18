import { INode } from "../models/nodeModel";
import { IEdge } from "../models/treeModel";

export default interface redisTree {
    treeId:string,
    treeName:string,
    nodes:Array<INode>,
    edges:Array<IEdge>,
}