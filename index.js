require("dotenv").config();
const dboracle = require("./src/services/dboracle");
const log4js = require("log4js");
const moment = require("moment");
const wsConfitico = require("./src/services/wsConfitico");
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
} = require("./src/controllers/Pedidos");

const cron = require("cron").CronJob;

async function run() {
  //filter pedidos
  await dboracle.init();
  const data1 = await wsConfitico.fetchGet({
    path: "registro/documento/",
    fecha_inicial: moment().subtract(1, "days").format("DD/MM/YYYY"),
    //tipo: "NVE",
    tipo: "FAC",
  });
  const data2 = await wsConfitico.fetchGet({
    path: "registro/documento/",
    fecha_inicial: moment().subtract(1, "days").format("DD/MM/YYYY"),
    //tipo: "NVE",
    tipo: "NVE",
  });
  const data = [...data1, ...data2];
  //filter pedidos
  const pedidosfiltrados = await filterPedidos(data);
  if (pedidosfiltrados != null)
  for (const pedido of pedidosfiltrados) {
    pedido && (await createPedido({ pedido }));
  }

}


//const job = new cron(`0 */${process.env.MINUTOS} * * * *`, run);
const job = new cron(process.env.CRON, run);
//run();
job.start();
