import express from "express";
import { FusionPay } from "fusionpay";
import fetch from "node-fetch";
import dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("public"));

// 🔹 Initialisation FusionPay avec les variables du .env
const fusionPay = new FusionPay(process.env.FUSIONPAY_API_URL, {
  apiKey: process.env.FUSIONPAY_API_KEY
});

// 🔹 Créer un paiement
app.post("/create-payment", async (req, res) => {
  try {
    const { amount, nomclient, numeroSend, email, currency } = req.body;

    console.log("📥 Données reçues :", req.body);

    // Conversion automatique vers FCFA
    let amountFCFA = amount;
    if (currency !== "XOF") {
      const response = await fetch(
        `https://api.exchangerate.host/convert?from=${currency}&to=XOF&amount=${amount}`
      );
      const data = await response.json();
      amountFCFA = Math.round(data.result);
    }

    const response = await fusionPay
      .totalPrice(amountFCFA)
      .addArticle("Digital Product", amountFCFA)
      .addInfo({ orderId: "12345", customerEmail: email })
      .clientName(nomclient)
      .clientNumber(numeroSend)
      .returnUrl("http://localhost:3000/merci")
      .webhookUrl("http://localhost:3000/webhook")
      .makePayment();

    console.log("✅ Paiement initié :", response);
    res.json(response);
  } catch (error) {
    console.error("❌ Erreur paiement :", error);
    res.status(500).json({ error: "Impossible de créer le paiement" });
  }
});

// 🔹 Page de remerciement
app.get("/merci", (req, res) => {
  res.sendFile(new URL("./public/merci.html", import.meta.url).pathname);
});

// 🔹 Webhook pour notifications
app.post("/webhook", (req, res) => {
  console.log("📩 Webhook reçu :", req.body);
  res.sendStatus(200);
});

// 🔹 Vérifier statut paiement
app.get("/check-payment/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const status = await fusionPay.checkPaymentStatus(token);
    res.json(status);
  } catch (error) {
    console.error("❌ Erreur vérification :", error);
    res.status(500).json({ error: "Impossible de vérifier le paiement" });
  }
});

// 🔹 Lancer serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
