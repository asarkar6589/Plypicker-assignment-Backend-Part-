import { NextFunction, Request, Response } from "express";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user?.role === "Admin") {
        next();
    }
    else {
        return res.status(401).json({
            success: false,
            message: "You are not an admin"
        })
    }
}