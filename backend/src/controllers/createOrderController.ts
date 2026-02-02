import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const createOrder = async (req: Request, res: Response) => {

    try{
        const { 
            customerEmail,
            bannerOptionId,
            addOnIds,
            notes 
        } = req.body;

        if (!customerEmail || !bannerOptionId){
            return res.status(400).json({
                message: "Email & Banner Selection are required."
            });
        }

        const data: any = {
            customerEmail,
            bannerOptionId,
            notes
        };

        if (Array.isArray(addOnIds) && addOnIds.length > 0) {
            data.addOns = {
                connect: addOnIds.map((id) => ({id}))
            };
        }

        const order = await prisma.order.create({
            data,
            include: {
                bannerOption: true,
                addOns: true
            }
        });

        return res.status(201).json(order);

    } catch(error){
        console.error(error);
        return res.status(500).json({
            message: "Failed to create order."
        });
    };
};