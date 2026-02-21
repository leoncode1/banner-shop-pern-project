import { Request, Response } from "express";
import prisma from "../lib/prisma";
import crypto from "crypto";

const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const createOrder = async (req: Request, res: Response) => {
    try{
        // User input passed into those fields.
        const { 
            bannerOptionId,
            addOnIds,
            notes,
            guestEmail 
        } = req.body;

        const data: any = {
            bannerOptionId,
            notes
        };

        if (req.user){
            data.userId = req.user.userId;
        }
        else{
            if(!guestEmail){
                return res.status(400).json({
                    message: "Email is REQUIRED for Guest Checkout."
                });
            }

            if(!isValidEmail(guestEmail)){
                return res.status(400).json({
                    message: "Invalid email format."
                });
            }

            const existingUser = await prisma.user.findUnique({
                where: {
                    email: guestEmail
                }
            });

            if (existingUser){
                return res.status(409).json({
                    message: "An account exists with this email. Please log in."
                });
            }

            // Create lookup token
            const lookupToken = crypto.randomBytes(16).toString("hex");
        
            data.guestEmail = guestEmail;
            // Add lookup token to data
            data.guestLookupToken = lookupToken;
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

export const getMyOrders = async (req: Request, res: Response) => {
    try{

        if(!req.user){
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const orders = await prisma.order.findMany({
            where: {
                userId: req.user.userId
            },
            include: {
                bannerOption: true,
                addOns: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return res.status(200).json(orders);

    }catch(error){
        return res.status(500).json({
            message: "Failed to fetch orders."
        });
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

export const guestOrderLookup = async(req: Request, res: Response) => {

    try{

        const {orderNumber, token} = req.query;

        const parsedOrderNumber = Number(orderNumber);

        if(!parsedOrderNumber || isNaN(parsedOrderNumber)){
            return res.status(400).json({message: "Valid orderNumber is required."});
        }

        if(!token || typeof token !== "string"){
            return res.status(400).json({message: "Lookup token is required."});
        }

        const order = await prisma.order.findUnique({
        where: { orderNumber: parsedOrderNumber },
        include: {
            bannerOption: true,
            addOns: true
        }
        });

        if (!order || order.guestLookupToken !== token) {
        return res.status(403).json({
            message: "Invalid tracking link."
        });
        }

        return res.status(200).json(order);

    } catch(error){
        return res.status(500).json({
        message: "Failed to lookup order."
        });
    }
}

export const getAllOrdersAdmin = async(req: Request, res: Response) => {

    try{
        const { 
            page = "1",
            limit = "10",
            status,
            sort = "desc"
        } = req.query;

        // Ensure page & limit are numbers
        const parsedPage = Number(page);
        const parsedLimit = Number(limit);

        // Page validation
        if (isNaN(parsedPage) || parsedPage < 1) {
            return res.status(400).json({ message: "Invalid page number." });
        }

        // Limit validation
        if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
            return res.status(400).json({ message: "Invalid limit value." });
        }

        const skip = (parsedPage - 1) * parsedLimit;

        const whereClause: any = {};

        if(status && typeof status == "string"){
            whereClause.status = status;
        }

        const orders = await prisma.order.findMany({
            where: whereClause,
            skip,
            take: parsedLimit,
            orderBy: {
                createdAt: sort === "asc" ? "asc" : "desc"
            },
            include: {
                bannerOption: true,
                addOns: true,
                user: true
            }
        });

        const totalOrders = await prisma.order.count({
            where: whereClause
        });

        return res.status(200).json({
            currentPage: parsedPage,
            totalPage: Math.ceil(totalOrders / parsedLimit),
            totalOrders,
            orders
        });
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            message: "Failed to fetch orders for Admin."
        });
    }
}