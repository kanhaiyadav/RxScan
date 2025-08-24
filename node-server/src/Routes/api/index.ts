import { Router } from "express";
const router = Router();
import prescriptionRouter from "./prescription.js";

router.get("/", (req, res) => {
    res.send("Welcome to API Home Page");
});
router.use('/prescription', prescriptionRouter);

export default router;