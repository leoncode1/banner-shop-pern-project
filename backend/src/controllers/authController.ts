import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET){
    throw new Error("JWT_SECRET not set in environment variable.");
}

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const register = async (req: Request, res: Response) => {
    try{

        const {email, password} = req.body;

        if (!email || !password){
            return res.status(400).json({message: "Email and Password are required."});
        }

        if(!isValidEmail){
            return res.status(400).json({message: "Invalid email format."});
        }

        if(password.length < 8){
            return res.status(400).json({message: "Password MUST be longer than 8 characters."});
        }

        const existingUser = await prisma.user.findUnique({
            where: {email}
        });

        if(existingUser){
            return res.status(409).json({message: "User already exists."});
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword
            }
        });

        return res.status(200).json({message: "User registered successfully."});

    } catch(error){
        console.error("Register error", error);
        return res.status(500).json({message: "Internal server error."});
    }
}

export const login = async (req: Request, res: Response) => {
    try{

        const {email, password} = req.body;

        if (!email || !password) {
            return res.json(400).json({message: "Email and password are required."});
        }

        const user = await prisma.user.findUnique({
            where: {email}
        });

        if(!user){
            return res.status(401).json({message:"Invalid credentials."});
        }

        const passwordValid = await bcrypt.compare(password, user.password);

        if(!passwordValid){
            return res.status(401).json({message: "Invalid credentials."});
        }

        // Create JWT
        const token = jwt.sign({
            userId: user.id, 
            role: user.role
        },
        JWT_SECRET,
        {expiresIn: "15m"}
        );

        return res.status(200).json({token});

    }catch(error){
        console.error("Login error:", error);
        return res.status(500).json({message:"Internal server error."});
    }
};