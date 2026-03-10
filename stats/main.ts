import express from "express";

const app = express();
const port = 3000;

app.use(express.json());

app.post("/stats", (req) => {
  console.log("Received stats:", req.body);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});