import express from "express";
import dotenv from "dotenv";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

dotenv.config();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("backend is running");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});