require("dotenv").config();
const moment = require("moment");
const { filterPedidos, createPedido } = require("./src/controllers/Pedidos");
const wsConfitico = require("./src/services/wsConfitico");
const dboracle = require("./src/services/dboracle");

async function run() {
  //filter pedidos
  await dboracle.init();
  const data = await wsConfitico.fetchGet({
    path: "registro/documento/",
    fecha_inicial: moment().subtract(1, "days").format("DD/MM/YYYY"),
    tipo: "NVE",
  });
  //filter pedidos
  const pedidosfiltrados = await filterPedidos(data);
  if (pedidosfiltrados != null)
  for (const pedido of pedidosfiltrados) {
    pedido && (await createPedido({ pedido }));
  }

}

run();
