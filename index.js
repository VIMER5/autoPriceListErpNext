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

app.get("/getPrice", async (req, res) => {
  try {
    const erpData = await $erpApi.post("method/frappe.client.get_list", {
      doctype: "Price List",
      fields: ["name"],
      filters: [
        ["selling", "=", "1"],
        ["name", "!=", "Стандартный Продажа"],
      ],
    });

    res.status(200).json(erpData.data.message);
  } catch (err) {
    console.log(err);
  }
});

app.post("/addAllBrands", async (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.brand || !data.PriceList || !data.currency)
      return res.status(400).json("где: brand, PriceList, currency?");
    const items = await allItemsInBrands(data.brand);
    const checkExisting = await checkExistingPrices(items, data.PriceList);
    let doc = [];
    items.forEach((item) => {
      const key = `${item}_${data.PriceList}`;
      if (!checkExisting.has(key)) {
        doc.push({
          doctype: "Item Price",
          price_list: data.PriceList,
          item_code: item,
          price_list_rate: data.currency,
          selling: 1,
        });
      }
    });
    const results = [];
    for (const item of doc) {
      // results.push(`Add: '${item.item_code}' в ${item.price_list} по ${item.price_list_rate}₽`);
      try {
        const result = await $erpApi.post("method/frappe.client.insert", {
          doc: item,
        });
        results.push(`Add: '${result.item_code}' в ${result.price_list} по ${result.price_list_rate}₽`);
      } catch (error) {
        console.log(error);
      }
    }
    res.status(200).json(results.length > 0 ? results : "ок");
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

async function checkExistingPrices(item, priceList) {
  const existingPrices = await $erpApi.post("method/frappe.client.get_list", {
    doctype: "Item Price",
    filters: [
      ["item_code", "in", item],
      ["price_list", "=", priceList],
    ],
    fields: ["item_code", "price_list_rate"],
  });
  console.log(existingPrices.data.message);
  const existingMap = new Map();
  existingPrices.data.message.forEach((price) => {
    const key = `${price.item_code}_${priceList}`;
    existingMap.set(key, true);
  });

  return existingMap;
}

async function allItemsInBrands(brand) {
  const allItems = await $erpApi.post(`method/frappe.client.get_list`, {
    doctype: "Item",
    fields: ["name"],
    filters: [["brand", "=", brand]],
    order_by: "name",
    limit_page_length: 100000,
  });
  return allItems.data.message.map((i) => i.name);
}
