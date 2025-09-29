// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import multer from "multer";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error("Error:", err);

    // Handle Multer errors
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            res.status(400).json({
                success: false,
                error: "File size exceeds 16MB limit",
            });
            return;
        }

        res.status(400).json({
            success: false,
            error: `Upload error: ${err.message}`,
        });
        return;
    }

    // Handle custom errors
    if (err.message) {
        res.status(err.status || 500).json({
            success: false,
            error: err.message,
        });
        return;
    }

    // Default error
    res.status(500).json({
        success: false,
        error: "Internal server error",
    });
};
