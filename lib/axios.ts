import axiosBase from "axios";
import { baseURL } from "./common";

export const myAxios = axiosBase.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  responseType: "json",
});
