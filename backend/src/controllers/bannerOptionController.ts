import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getBannerOptions = async(req: Request, res: Response) => {

    try{
        const bannerOptions = await prisma.bannerOption.findMany({
            orderBy: {basePrice: "asc"}
        });

        res.status(200).json(bannerOptions);
    } catch(error){
        console.error(error);
        res.status(500).json({message: "Failed to fetch banner options."});
    };
};