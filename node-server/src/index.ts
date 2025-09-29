import express from "express";
import path from "path";
import router from "./Routes/index.js";
import cors from "cors";
import fs from "fs";
import { errorHandler } from "./middleware/errorHandler.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const __dirname = path.resolve();

const allowedOrigins = ["http://localhost:8000", "http://rxscan.kanhaiya.me"];

interface CorsCallback {
    (err: Error | null, allow?: boolean): void;
}

interface CorsOptions {
    origin: (origin: string | undefined, callback: CorsCallback) => void;
    methods: string[];
    credentials: boolean;
}

const corsOptions: CorsOptions = {
    origin: function (origin: string | undefined, callback: CorsCallback) {
        // Allow mobile apps, Postman, curl (no Origin header)
        if (!origin) return callback(null, true);

        // Allow only these origins for browsers
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Otherwise, block
        return callback(
            new Error(
                "The CORS policy does not allow access from this origin."
            ),
            false
        );
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory for OCR/Translation files
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Health check endpoint for OCR/Translation services
app.get("/api/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
    });
});

app.use("/", router);

// Error handling middleware (should be last)
app.use(errorHandler);

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
