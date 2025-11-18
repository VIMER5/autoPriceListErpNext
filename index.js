import express from "express";
import $erpApi from "./axios/erpAPI.js";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config({ path: ".env" });

await isValidENV();
const app = express();
app.use(express.json());
app.use(cors(["*"]));

app.get("/getBrands", async (req, res) => {
  try {
    const test = await $erpApi.post("method/frappe.client.get_list", {
      doctype: "Brand",
      fields: ["name"],
    });

    res.status(200).json(test.data.message);
  } catch (err) {
    console.log(err);
  }
});

app.listen(3000, () => {
  console.log("🚀 Сервер запущен на http://localhost:3000");
});

async function isValidENV() {
  let errorEnv = [];
  if (!process.env.SecretKey || !process.env.PublicKey) errorEnv.push("Нет ключей в env");
  if (!process.env.DomenErp) errorEnv.push("Укажи домен ERP в env");

  if (errorEnv.length != 0) {
    for (let item of errorEnv) {
      console.log(item);
    }
    process.exit();
  }
}
