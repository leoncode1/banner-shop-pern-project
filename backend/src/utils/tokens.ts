import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Needed so tokens are not signed as UNDEFINED
if(!ACCESS_TOKEN_SECRET){
    throw new Error("ACCESS_TOKEN_SECRET is not defined.");
}

if(!REFRESH_TOKEN_SECRET){
    throw new Error("ACCESS_TOKEN_SECRET is not defined.");
}

export const generateAccessToken = (userId: string, role: string) => {
    return jwt.sign(
        {userId, role},
        ACCESS_TOKEN_SECRET,
        {expiresIn: "15m"}
    );
}

export const generateRefreshToken = (userId: string) => {
    return jwt.sign(
        {userId},
        REFRESH_TOKEN_SECRET,
        {expiresIn: "7d"}
    );
}

export const hashToken = (token: string) => {
    return crypto.createHash("sha256").update(token).digest("hex");
}
