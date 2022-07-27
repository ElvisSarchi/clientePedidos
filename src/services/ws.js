const axios = require("axios");
require("dotenv").config();
const log4js = require("log4js");
const logger = log4js.getLogger();
const axiosInstance = axios.create({
  baseURL: process.env.BASEURL,
  /* other custom settings */
});

exports.getPedidos = async function () {
  try {
    console.log(`start`);
    console.log(process.env.RUC);
    const { data } = await axiosInstance.post("/order/ordersbyCompany", {
      ruc: process.env.RUC,
    });
    //console.log(data);
    const {
      data: { ordersIds, ordersById, detailsByHeadId },
    } = data;
    return { ordersIds, ordersById, detailsByHeadId };
  } catch (error) {
    //console.log(error);
    logger.error(error);
    return null;
  }
};

exports.getPedidoDetalle = async function (pedido) {
  try {
    const { data } = await axiosInstance.get(
      `/index.php/webservice/detallepedido/${pedido}`
    );
    return data;
  } catch (error) {
    // console.log(error);
    logger.error(error);
    return null;
  }
};

exports.getCliente = async function (cliente, companyId) {
  try {
    //console.log(cliente);
    const {
      data: { data },
    } =
      cliente &&
      (await axiosInstance.post(`/persons/getPersonByIdAndCompany`, {
        companyId,
        clientId: cliente,
      }));
    return data;
  } catch (error) {
    logger.error(error);
    return null;
  }
};

exports.getArticulo = async function ({ id }) {
  try {
    const { data } = await axiosInstance.post(
      `/products-services/getProductsServicesbyID`,
      { id }
    );
    if (data === undefined || data.length === 0) return null;
    return data;
  } catch (error) {
    logger.error(error);
    return null;
  }
};
