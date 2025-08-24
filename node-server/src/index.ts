import express from "express";
import "./config/database.ts";
import path from "path";
import router from "./Routes/index.js";
import cors from "cors";

const app = express();
const __dirname = path.resolve();

const allowedOrigins = [
    "http://localhost:5173",
    "https://kisaansetu.kanhaiya.me",
    "https://kisaansetufe.vercel.app",
];

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

app.use("/", router);

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
