import { Request, Response } from "express";
import prisma from "../lib/prisma";

const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const createOrder = async (req: Request, res: Response) => {
    try{
        // User input passed into those fields.
        const { 
            customerEmail,
            bannerOptionId,
            addOnIds,
            notes 
        } = req.body;

        // Email validation
        if (!customerEmail || typeof customerEmail !== "string" || !isValidEmail(customerEmail)){
            return res.status(400).json({
                message: "Valid email is required."
            });
        }

        // Banner option validation
        if (!bannerOptionId || typeof bannerOptionId !== "string"){
            return res.status(400).json({
                message: "Valid bannerOptionId is required."
            });
        }

        // Searching for bannerOption in DB
        const bannerExists = await prisma.bannerOption.findUnique({
            where: {id: bannerOptionId}
        });

        // Verifying is banner exists in DB
        if(!bannerExists){
            return res.status(404).json({message: "Banner option NOT found."});
        }

        // Set validAddOns as an empty array.
        let validAddOns: {id: string}[] = [];

        // Checks to see if client added addOnIds at all
        if(addOnIds !== undefined){

            // Checks if addOnIds is an array
            if(!Array.isArray(addOnIds)){
                return res.status(400).json({message: "addOnIds must be an array."});
            }

            // Gets all add-ons whose ID is in the list.
            const foundAddOns = await prisma.addOn.findMany({
            where: {id: {in: addOnIds}}
            });

            // Compares legit IDs in the DB with the ones passed in.
            // If one is NOT legit, the request is denied.
            if(foundAddOns.length !== addOnIds.length){
                return res.status(400).json({message: "One or more add-ons are invalid."});
            }

            // IDs will be verified and connected with data in the DB.
            validAddOns = foundAddOns.map(a => ({id: a.id}));
        };

        const data: any = {
            customerEmail,
            bannerOptionId,
            notes
        };
        
        // Checks if addOns length is > 0.
        if (validAddOns.length > 0){
            data.addOns = { connect: validAddOns};
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

export const updateOrderStatus = async (req: Request, res: Response) => {
    
    try {
        const {id} = req.params;
        const {status} = req.body;

        if (!id || typeof id !== "string"){
            return res.status(400).json({message: "Order ID is required."});
        }

        if (!status || !["RECEIVED", "IN_PROGRESS", "COMPLETED", "DELIVERED", "CANCELLED"].includes(status)){
            return res.status(400).json({message: "Invalid order status."});
        }

        const updatedOrder = await prisma.order.update({
            where: {id},
            data: {status}
        });

        return res.status(200).json(updatedOrder);

    } catch(error){
        console.error(error);
        return res.status(404).json({message: "Order not found."});
    }
};

export const getOrderByEmail = async (req: Request, res: Response) => {
    console.log("REQ QUERY:", req.query);
    console.log("RAW URL:", req.originalUrl);

    try{

        const {email} = req.query;

        if (!email || typeof email !== "string"){
            return res.status(400).json({message: "Email query parameter is required."});
        }

        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!isValidEmail){
            return res.status(400).json({
                message: "Invalid email format."
            })
        }

        // findMany returns arrays.
        const orders = await prisma.order.findMany({
            where: {
                customerEmail: email
            },
            include: {
                bannerOption: true,
                addOns: true
            },
            orderBy: {
                // Newest orders first.
                createdAt: "desc"
            }
        });

        return res.status(200).json(orders);

    } catch(error){
        console.error("Get orders by emails erros:", error);
        return res.status(500).json({message: "Internal server error."});
    }
}

export const getOrderById = async (req: Request, res: Response) => {
    try{
        const {id} = req.params;

        if (!id || typeof id !== "string"){
            return res.status(400).json({message: "Invalid order ID."});
        }

        const order = await prisma.order.findUnique({
            where: {id},
            include: {
                bannerOption: true,
                addOns: true
            }
        });

        if(!order){
            return res.status(400).json({message: "Order not found."});
        }

        return res.status(200).json(order);

    } catch (error){
        console.error();
        return res.status(500).json("Internal Server error.");
    }
}