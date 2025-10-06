import express from "express";
import fetch from "node-fetch";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// setup dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// security
app.use(helmet());
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 60 * 1000, max: 30 }));

// serve frontend
app.use(express.static(path.join(__dirname, "public")));

// proxy endpoint
app.get("/proxy", async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send("No URL provided");

  try {
    const response = await fetch(target, { redirect: "follow" });
    const body = await response.text();
    res.send(body);
  } catch (err) {
    res.status(500).send("Proxy error: " + err.message);
  }
});

// health check
app.get("/health", (req, res) => res.send("OK"));

app.listen(PORT, () => console.log(`Ardion Proxy running on port ${PORT}`));
