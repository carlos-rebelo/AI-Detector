const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post("/detect", async (req, res) => {
  try {
    const response = await axios.post("https://api.sapling.ai/api/v1/aidetect", {
      ...req.body,
      key: process.env.SAPLING_API_KEY
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Detection failed", details: err.message });
  }
});

app.post("/summarize", async (req, res) => {
  try {
    const response = await axios.post("https://api.sapling.ai/api/v1/summarize", {
      ...req.body,
      key: process.env.SAPLING_API_KEY
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Summarization failed", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
