import { Request, Response } from "express";
import prisma from "../lib/prisma"

// async allows other requests to be handled if this request is blocked
export const getAddOns = async (req: Request, res: Response) => {

    try{
        // findMany returns a Promise (NOT data immediately)
        // await for Promise to resolve, then return data
        const addOns = await prisma.addOn.findMany({ // Prisma knows to look for AddOn model
            orderBy: {price: "asc"} // ascending
        });

        // Returns status code & addOns in JSON
        res.status(200).json(addOns);

    } catch(error){
        console.error(error)
        res.status(500).json({message: "Failed to fetch add-ons."});
    }
};