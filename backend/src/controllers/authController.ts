import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { generateAccessToken, generateRefreshToken, hashToken } from "../utils/tokens";

const JWT_SECRET = process.env.JWT_SECRET as string;
// Ensure REFRESH_TOKEN_SECRET is defined.
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

if(!REFRESH_SECRET){
    throw new Error("REFRESH_TOKEN_SECRET not defined.");
}

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

        const accessToken = generateAccessToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id);

        const refreshTokenHash = hashToken(refreshToken);

        await prisma.refreshToken.create({
            data: {
                tokenHash: refreshTokenHash,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false, //true in prod.
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true, 
            secure: false, // true in prod.
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.json({message: "Login successful"});

    }catch(error){
        console.error("Login error:", error);
        return res.status(500).json({message:"Internal server error."});
    }
};

// If access token is expired, refreshToken is used to issue new one.
export const refresh = async(req: Request, res: Response) => {

    // refreshToken is read from cookie.
    const token = req.cookies.refreshToken;

    //If missing, return 401.
    if(!token){
        return res.status(401).json({message: "No refresh token."});
    }

    try{
        // Checks if signature is valid, NOT expired, & signed with secret
        const decoded = jwt.verify(token, REFRESH_SECRET);

        if(
            typeof decoded !== "object" || 
            decoded === null || 
            !("userId" in decoded)
        ){
            return res.status(403).json({message: "Invalid refresh token."});
        }

        const userId = decoded.userId as string;

        // Hash the refreshToken that was passed in
        const hashed = hashToken(token);

        // Check is hashed token exists in DB
        const storedToken = await prisma.refreshToken.findFirst({
            where: {tokenHash: hashed}
        });

        // If passed in hashed refresh token is not found,
        // return 403.
        if (!storedToken){
            return res.status(403).json({message: "Invalid refresh token."});
        }

        // Delete existing refresh token using id of storedToken.
        // Existing refresh token CANNOT be reused again.
        await prisma.refreshToken.delete({
            where: {id: storedToken.id}
        });

        // Safer to use the object to generate accessToken
        // Use userId to find User in DB
        const user = await prisma.user.findUnique({
            where: {id: userId}
        })

        if (!user){
            return res.status(403).json({message: "User no longer exists."});
        }

        // Fresh tokens are reissued.
        // user.id is safer than using decoded.userId
        const newAccessToken = generateAccessToken(user.id, user.role);
        const newRefreshToken = generateRefreshToken(user.id);

        // Hash new refresh token.
        const newHashed = hashToken(newRefreshToken);

        // Store it in DB
        await prisma.refreshToken.create({
            data: {
                tokenHash: newHashed,
                userId: decoded.userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });

        // Browser overwrites old cookie
        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: false, // Not for prod.
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        });

        // Browser overwrites old cookie
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({message: "Token refreshed."});

    } catch(error){
        return res.status(403).json({message: "Invalid refresh token."});
    }
};

export const logout = async (req: Request, res: Response) => {
    try{
        const token = req.cookies.refreshToken;

        if (token){
            const hashed = hashToken(token);

            await prisma.refreshToken.deleteMany({
                where: {tokenHash: hashed}
            });
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        return res.json({message: "Logged out."});
    }catch{
        return res.status(500).json({message:"Logout failed."});
    }
};