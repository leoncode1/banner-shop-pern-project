import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bannerOptionRoutes from "./routes/bannerOptionRoutes";
import addOnsRoutes from "./routes/addOnsRoutes";

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// health check
app.get("/health", (req, res) => {
    res.status(200).json({status: "ok"});
});

app.use("/api/banner-options", bannerOptionRoutes);
app.use("/api/add-ons", addOnsRoutes);


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}.`);
});