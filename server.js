

import express from "express";
import { FusionPay } from "fusionpay";
import fetch from "node-fetch"; // pour convertir via API si besoin

const app = express();
app.use(express.json());
app.use(express.static("public"));

// 🔹 Initialisation FusionPay
const fusionPay = new FusionPay("https://www.pay.moneyfusion.net/robe-moulante-_1755585276611/", {
  apiKey: "moneyfusion_v1_689f4c065aabd59af50a12df_8F0A2F5306FF3BDE74E4231E706AF286178971545864A0B5E088725F1865418F"
});

// Taux de conversion pour exemple (tu peux remplacer par une API en temps réel)
const conversionRates = {
  EUR: 655.957,   // 1 EUR = 655.957 FCFA
  USD: 620,       // 1 USD = 620 FCFA
  RON: 130,       // 1 RON = 130 FCFA
  FCFA: 1
};

// 🔹 Créer un paiement
app.post("/create-payment", async (req, res) => {
  try {
    const { amount, currency, nomclient, numeroSend, email } = req.body;

    // Convertir en FCFA
    const amountFCFA = Math.round(amount * (conversionRates[currency] || 1));

    const response = await fusionPay
      .totalPrice(amountFCFA)
      .addArticle("Sac", 100)
      .addArticle("Veste", 100)
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
  res.sendFile(new URL("/public/merci.html", import.meta.url).pathname);
});

// 🔹 Webhook
app.post("/webhook", (req, res) => {
  console.log("📩 Webhook reçu :", req.body);
  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("🚀 Serveur lancé sur http://localhost:3000");
});
