require("dotenv").config();
const moment = require("moment");
const wsConfitico = require("./src/services/wsConfitico");

async function run() {
  //filter pedidos
  const data = await wsConfitico.fetchGet({
    path: "registro/documento/",
    fecha_inicial: moment().subtract(1, "days").format("DD/MM/YYYY"),
    tipo: "FAC",
  });
  //filter pedidos
 // const pedidosfiltrados = await filterPedidos(data);

}


run();
