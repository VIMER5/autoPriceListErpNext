import axios from "axios";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const $erpAPI = axios.create({
  baseURL: `${process.env.DomenErp}/api/`,
  headers: {
    Authorization: `token ${process.env.PublicKey}:${process.env.SecretKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default $erpAPI;
