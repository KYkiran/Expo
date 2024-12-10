const express = require("express");
const axios = require("axios");
const cors = require("cors");
const env=require('dotenv');

env.config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const VIRUS_TOTAL_API_KEY = process.env.VT_API_KEY; 

app.post("/check-url", async (req, res) => {
  const { url } = req.body;
  
  try {
    const response = await axios.get(`https://www.virustotal.com/vtapi/v2/url/report`, {
      params: {
        apikey: VIRUS_TOTAL_API_KEY,
        resource: url,
      },
    });

    const data = response.data;

    // Format the results for frontend
    const result = {
      scan_date: data.scan_date,
      positives: data.positives,
      total: data.total,
      status: data.positives > 0 ? "This site may be dangerous!" : "This site appears safe.",
      cleanVendors: [],
      unratedVendors: [],
      permalink: data.permalink,
    };

    // Check for clean vendors and unrated vendors
    Object.keys(data.scans).forEach((vendor) => {
      if (data.scans[vendor].detected) {
        if (data.scans[vendor].result === "clean site") {
          result.cleanVendors.push(vendor);
        }
      } else if (data.scans[vendor].result === "unrated site") {
        result.unratedVendors.push(vendor);
      }
    });

    res.json(result);
  } catch (error) {
    console.error("Error with VirusTotal API:", error);
    res.status(500).send("Error checking URL");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
