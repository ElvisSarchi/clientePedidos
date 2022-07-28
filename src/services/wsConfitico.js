const axios = require("axios");
require("dotenv").config();
const log4js = require("log4js");
const logger = log4js.getLogger();
const axiosInstance = axios.create({
  baseURL: process.env.BASEURL,
  headers: {
    "Content-Type": "application/json",
    "AUTHORIZATION": process.env.AUTHORIZATION,
  },
});

exports.fetchGet = async function ({ path, ...params }) {
  try {
    console.log(`start`);
    const { data } = await axiosInstance.get(path, {
      params: {
        ...params,
      },
    });

    return data;
  } catch (error) {

    logger.error(error);
    return error;
  }
};
