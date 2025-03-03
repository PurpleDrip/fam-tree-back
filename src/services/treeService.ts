import mongoose from "mongoose";

import Tree from "../models/treeModel";

export const getTreeByID = async (id: string) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.warn(`Invalid tree ID: ${id}`);
            return null; 
        }

        const tree = await Tree.findById(id);
        if (!tree) {
            console.warn(`Tree not found for ID: ${id}`);
            return null;
        }

        return tree;
    } catch (error) {
        console.error("Error retrieving tree:", error);
        return null; 
    }
};
