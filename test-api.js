import axios from "axios";

// 🔹 Test de l'URL de base MoneyFusion
const apiUrl = "https://www.pay.moneyfusion.net/robe-moulante-_1755585276611/"; // ou l'URL que tu pensais utiliser

(async () => {
  try {
    // On teste un GET simple sur la racine
    const res = await axios.get(apiUrl);
    console.log("✅ Réponse reçue :", res.data);
  } catch (err) {
    if (err.response) {
      console.log("❌ Erreur HTTP :", err.response.status);
      console.log("Contenu de la réponse :", err.response.data);
    } else {
      console.error("Erreur inconnue :", err.message);
    }
  }
})();
