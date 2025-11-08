import express from "express";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import { prismaClient } from "./src/config/database.js";

const app = express();

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("running");
});

const PORT = 8000;

const SECRET = "@98sdfDs%$sdjsksdjhsjdhjshdjshdjshiey3930429";
const GROUP_LINK = "https://wa.link/jnjeew";

app.post("/submit", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const participan = await prismaClient.participant.create({
      data: { name, email, phone },
    });

    /* ======================== */
    /* create JWT */
    /* 1 hours */
    /* ======================== */
    const token = jwt.sign({ id: participan.id }, SECRET, { expiresIn: "20s" });

    await prismaClient.participant.update({
      where: { id: participan.id },
      data: { token },
    });

    const joinLink = `http://localhost:3000/join/${token}`;
    res.json({ success: true, message: "Pendaftaran berhasil!", joinLink });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});


// Endpoint join group
app.get("/join/:token", async (req, res) => {
  const { token } = req.params;

  try {
    // Verify token
    const decoded = jwt.verify(token, SECRET);

    // Cross-check token ada di DB (opsional, lebih aman)
    const participant = await prismaClient.participant.findUnique({
      where: { id: decoded.id }
    });

    if (!participant || participant.token !== token) {
      return res.status(401).send("Link tidak valid.");
    }

    // Kalau valid → redirect ke WhatsApp group
    return res.redirect(GROUP_LINK);
  } catch (err) {
    return res.status(401).send("Link tidak valid atau sudah expired.");
  }
});

app.listen(PORT, () => {
  console.log(`running in server in port ${PORT}`);
});
