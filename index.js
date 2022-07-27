require("dotenv").config();
const ws = require("./src/services/ws");
const dboracle = require("./src/services/dboracle");
const log4js = require("log4js");

log4js.configure({
  appenders: {
    logger: { type: "file", filename: "logger.log" },
    console: { type: "stdout", layout: { type: "colored" } },
  },
  categories: { default: { appenders: ["logger", "console"], level: "all" } },
});
const {
  filterPedidos,
  createPedido,
  createDetallePedido,
  createOrderDetail,
} = require("./src/controllers/Pedidos");

const cron = require("cron").CronJob;

const run = async function () {
  await dboracle.init();

  const { ordersIds, ordersById, detailsByHeadId } = await ws.getPedidos();
  //console.log(ordersIds);
  //filtar los pedidos que ya estan insertados.
  const pedidosfiltrados = await filterPedidos({ ordersIds, ordersById });
  //console.log(pedidosfiltrados);
  if (pedidosfiltrados != null)
    for (const pedido of pedidosfiltrados) {
      pedido && (await createPedido({ pedido, ordersById, detailsByHeadId }));
    }
  //AÑADIR DETALLE DEL PEDIDO
  await createOrderDetail({
    pedidos: pedidosfiltrados,
    ordersById,
    detailsByHeadId,
  });
  //const newPedidos = await addDetallePedido(pedidos);
  //console.log(JSON.stringify(newPedidos, null, 4));
};

//const job = new cron(`0 */${process.env.MINUTOS} * * * *`, run);
const job = new cron(process.env.CRON, run);
//run();
job.start();
