const oracledb = require("../../services/dboracle");
const log4js = require("log4js");

const logger = log4js.getLogger();

const { getPedidoDetalle } = require("../../services/ws");
const { createArticulo, createService } = require("../Articulos");
const { buscarCliente, createClient } = require("../Clientes");

const buscarPedidos = async function () {
  const sql =
    "SELECT ENCPED_NUMERO,ENCPED_OBSERVACION, ENCPED_REFERENCIA FROM VEN_ENCPED";
  try {
    const data = await oracledb.busqueda(sql);
    return data;
  } catch (error) {
    logger.error(error);
    return null;
  }
};
const getPedidosNoDet = async function () {
  const sql = `SELECT ENCPED_NUMERO, ENCPED_REFERENCIA FROM VEN_ENCPED WHERE ENCPED_NUMERO NOT IN (SELECT ENCPED_NUMERO FROM VEN_DETPED)`;
  try {
    const data = await oracledb.busqueda(sql);
    return data;
  } catch (error) {
    logger.error(error);
    return null;
  }
};

exports.filterPedidos = async function (data) {
  try {
    let numero = await getMaxNumPedido();
    //console.log(numero);
    numero++;
    const pedidosoracle = await buscarPedidos();
    const nextPedidos = data.map((p) => {
      const aux = pedidosoracle.find((po) => po.ENCPED_REFERENCIA === p.id)
        ? false
        : { ...p, num: numero++ };
      return aux;
    });
    return nextPedidos;
  } catch (error) {
    logger.error(error);
    return null;
  }
};

const createPedido = async function ({ pedido, ordersById, detailsByHeadId }) {
  //verificar que el cliente este creado
  //insertar el encabezado del pedido
  //verificar el detalle del pedido que el articulo este insertado
  //insertar el detalle del pedido
  //console.log(ordersById[pedido.id].clientIdentification);
  const cliente = await buscarCliente(
    ordersById[pedido.id].clientIdentification
  );
  //console.log(cliente);
  //si es null se crea un nuevo cliente
  if (cliente == null) {
    await createClient(
      ordersById[pedido.id].clientId,
      ordersById[pedido.id].companyId
    );
  }
  await insertEncPedido(pedido, ordersById);
  //insertar el encabezado del pedido
};
const createDetallePedido = async function ({
  pedido,
  ordersById,
  detailsByHeadId,
}) {
  //bsucar los pedidos que tengan encabezado pero no tengan detalle insertado.
  const listaPedidos = await getPedidosNoDet();
  //console.log(listaPedidos);

  if (listaPedidos === null) return;
  for (const pedido of listaPedidos) {
    const { ENCPED_NUMERO, ENCPED_REFERENCIA } = pedido;
    await addDetPed(ENCPED_NUMERO, ENCPED_REFERENCIA);
  }
};
const createOrderDetail = async function ({
  pedidos,
  ordersById,
  detailsByHeadId,
}) {
  //1. verificar si el codigo del producto esta creado caso contrario crearlo
  //2. insertar el detalle del pedido
  for (const p of pedidos) {
    if (p === false) continue;
    const { ids, ...detail } = detailsByHeadId[p.id];
    let linea = 1;
    for (const id of ids) {
      //se busca el articulo si no existe se lo crea
      await findArticulo({
        code: detail[id].productServiceCode,
        id: detail[id].productServiceId,
      });
      //crear el detalle del pedidos
      await insertarDetallePedido({ detalle: detail[id], num: p.num, linea });
      linea++;
    }
  }
};
const findArticulo = async function ({ code, id }) {
  const sqlbusqueda = `select ART_CODIGO from inv_maearticulo where ART_CODIGO='${code}'`;
  try {
    const verificar = await oracledb.busqueda(sqlbusqueda);
    console.log(verificar);
    if (verificar === null) {
      await createArticulo({ id });
    }
    return true;
  } catch (error) {
    return false;
  }
};
const getMaxNumPedido = async function () {
  const sql = `SELECT MAX(TO_NUMBER(SUBSTR(ENCPED_NUMERO,3,LENGTH(ENCPED_NUMERO)-2),'999999999999999')) AS NUM FROM VEN_ENCPED`;
  const [{ NUM }] = await oracledb.busqueda(sql);
  //const numstring = "PE" + (NUM + 1).toString().padStart(11, "0");
  // console.log(numstring);
  return NUM;
};
const addDetPed = async function (ENCPED_NUMERO, ENCPED_REFERENCIA) {
  //obtener la informacion del detalle
  const detalle = await getPedidoDetalle(ENCPED_REFERENCIA);
  //console.log(detalle);
  //verificar si el codigo del articulo ya esta insertado
  for (const det of detalle) {
    const { DETPED_CODIGO } = det;
    const sqlbusqueda = `SELECT SER_CODIGO FROM VEN_MAESERVICIO WHERE SER_CODIGO='${DETPED_CODIGO}'`;
    const verificar = await oracledb.busqueda(sqlbusqueda);
    if (verificar === null) {
      //se crea un articulo
      //await createArticulo(DETPED_CODIGO);
      //SE CREA EL SERVICIO
      await createService(DETPED_CODIGO);
    }
    //insertar el detalle del pedido
    //await insertarDetallePedido(det, ENCPED_NUMERO);
  }
};

const insertEncPedido = async function (pedido, ordersById) {
  try {
    //traer la informacion del primer vendedor
    const vendedoraux = await oracledb.busqueda(
      `SELECT VEN_CODIGO FROM VEN_MAEVENDEDOR WHERE ROWNUM=1`
    );
    //treaer la informacion de la priemra bodega
    const bodegaaux = await oracledb.busqueda(
      `SELECT BOD_CODIGO FROM INV_MAEBODEGA WHERE ROWNUM=1`
    );
    const orderAux = await oracledb.busqueda(
      `SELECT * FROM ven_encped WHERE ROWNUM=1`
    );
    const order = ordersById[pedido.id];
    const ENCPED_NUMERO = "PE" + pedido.num.toString().padStart(11, "0");

    const sql = `INSERT INTO VEN_ENCPED (ENCPED_numero, COM_codigo, CLI_codigo, VEN_codigo,
        ENCPED_fechaemision,ENCPED_fechaentrega, ENCPED_iva, ENCPED_estado,
        ENCPED_orden, ENCPED_lista, ENCPED_observacion, ENCPED_total,
        ENCPED_totalneto, ENCPED_valordes, ENCPED_porcedes, ENCPED_valoriva, ENCPED_porceiva,
        ENCPED_valorice,ENCPED_porceice, ENCPED_baseiva, ENCPED_baseice, ENCPED_basecero, ENCPED_grupo,
        ENCPED_referencia,ENCPED_fechavalidez,BOD_codigo,ENCPED_tipo, ENCPED_tipodscto,ENCPED_refcli, USUIDENTIFICACION)
       VALUES(:ENCPED_NUMERO,:COM_CODIGO,:CLI_CODIGO,:VEN_CODIGO,:ENCPED_FECHAEMISION
    ,:ENCPED_FECHAENTREGA,:ENCPED_IVA,:ENCPED_ESTADO
    ,:ENCPED_ORDEN,:ENCPED_LISTA,:ENCPED_OBSERVACION,:ENCPED_TOTAL
    ,:ENCPED_TOTALNETO,:ENCPED_VALORDES,:ENCPED_PORCEDES,:ENCPED_VALORIVA
    ,:ENCPED_PORCEIVA,:ENCPED_VALORICE,:ENCPED_PORCEICE,:ENCPED_BASEIVA
    ,:ENCPED_BASEICE,:ENCPED_BASECERO,:ENCPED_GRUPO,:ENCPED_REFERENCIA
    ,:ENCPED_FECHAVALIDEZ,:BOD_CODIGO,:ENCPED_TIPO,:ENCPED_TIPODSCTO,:ENCPED_REFCLI,:USUIDENTIFICACION)`;

    const binds = [
      ENCPED_NUMERO, //ENCPED_numero,
      "01", //COM_codigo,
      order.clientIdentification, //CLI_codigo,
      vendedoraux[0].VEN_CODIGO, //VEN_codigo,
      new Date(order.emissionDate), //ENCPED_fechaemision,
      new Date(order.deliveryDate), //ENCPED_fechaentrega,
      1, //pedido.ENCPED_IVA, //ENCPED_iva,
      "P", //pedido.ENCPED_ESTADO, //ENCPED_estado,
      null, //ENCPED_orden,
      orderAux[0].ENCPED_LISTA ?? "A", //pedido.ENCPED_LISTA, //ENCPED_lista,
      order.observation.slice(0, process.env.SIZE_OBSERVACION ?? 99), //ENCPED_observacion,
      Number(order.total), //ENCPED_total,
      Number(order.subTotalWithoutTaxes + order.totalDiscount), //ENCPED_totalneto,
      Number(order.totalDiscount), //ENCPED_valordes,
      getPorDescuento({
        totalNeto: order.subTotalWithoutTaxes + order.totalDiscount,
        totalDescuento: order.totalDiscount,
      }), //Number(pedido.ENCPED_PORCEDES), // ENCPED_porcedes,
      Number(order.subTotalIva), //ENCPED_valoriva,
      orderAux[0].ENCPED_PORCEIVA, //Number(pedido.ENCPED_PORCEIVA), //ENCPED_porceiva,
      Number(order.iceValue), //ENCPED_valorice,
      orderAux[0].ENCPED_PORCEICE, //Number(pedido.ENCPED_PORCEICE), //ENCPED_porceice,
      Number(order.subTotalIva), //ENCPED_baseiva,
      0, //Number(pedido.ENCPED_BASEICE), //ENCPED_baseice,
      Number(order.subTotalZeroIva), //ENCPED_basecero,
      null, //ENCPED_grupo,
      `${order.serie}-${order.sequential}`, //order._id, //ENCPED_referencia,
      getfechaexpiracion(), //ENCPED_fechavalidez,
      bodegaaux[0].BOD_CODIGO, //BOD_codigo,
      null, //ENCPED_tipo,
      null, //ENCPED_tipodscto,
      null, //ENCPED_refcli,
      "admin", //USUIDENTIFICACION
    ];
    //console.log(binds);
    const resp = await oracledb.ejecutarSQL(sql, binds);
    logger.info(
      `Encabezado insertado con el codigo: ${ENCPED_NUMERO} y referencia: ${order._id}`
    );
    // console.log(resp);
    //insertar el detalle del pedido
  } catch (error) {
    //console.log(error);
    logger.error(error);
    return false;
  }
};
const getPorDescuento = function ({ totalNeto = 0, totalDescuento = 0 }) {
  let porcentajeDescuento = 0;
  try {
    porcentajeDescuento = (totalDescuento * 100) / totalNeto;
    return Number(porcentajeDescuento);
  } catch (error) {
    return 0;
  }
};
const getfechaexpiracion = function () {
  const d = new Date();

  const year = d.getFullYear();
  var month = d.getMonth();
  var day = d.getDate();
  var c = new Date(year + 5, month, day);
  return c;
};

const insertarDetallePedido = async function ({ detalle, num, linea }) {
  try {
    const bodegaaux = await oracledb.busqueda(
      `SELECT BOD_CODIGO FROM INV_MAEBODEGA WHERE ROWNUM=1`
    );
    const detalleaux = await oracledb.busqueda(
      `SELECT * FROM ven_detped WHERE ROWNUM=1`
    );
    const ENCPED_NUMERO = "PE" + num.toString().padStart(11, "0");
    const sql = `INSERT INTO VEN_DETPED(ENCPED_NUMERO, COM_CODIGO, DETPED_LINEA, DETPED_TIPODET, DETPED_CODIGO,
            DETPED_DESCRIPCION, DETPED_TRIBIVA, DETPED_TRIBICE, DETPED_UNIDAD, DETPED_CANTIDAD,
            DETPED_DESPACHO, DETPED_PRECIO, DETPED_DESCUENTO, DETPED_TOTAL,DETPED_IVA, DETPED_ICE,
            DETPED_LISTA, DETPED_BASEIVA, DETPED_BASEICE,DETPED_BASECERO, DETPED_PORCEICE,DETPED_ORDEN, DETPED_NUMBLO,
            BOD_CODIGO,DETPED_CODALTERNO,DETPED_PROMOCION,MAEPROVTA_CODIGO,
            DETPED_CANTIDADUND,DETPED_LOTE,DETPED_CARACTERISTICAS) 
             VALUES(:ENCPED_NUMERO,:COM_CODIGO,:DETPED_LINEA,:DETPED_TIPODET,:DETPED_CODIGO
            ,:DETPED_DESCRIPCION,:DETPED_TRIBIVA,:DETPED_TRIBICE,:DETPED_UNIDAD
            ,:DETPED_CANTIDAD,:DETPED_DESPACHO,:DETPED_PRECIO,:DETPED_DESCUENTO
            ,:DETPED_TOTAL,:DETPED_IVA,:DETPED_ICE,:DETPED_LISTA,:DETPED_BASEIVA
            ,:DETPED_BASEICE,:DETPED_BASECERO,:DETPED_PORCEICE,:DETPED_ORDEN
            ,:DETPED_NUMBLO,:BOD_CODIGO,:DETPED_CODALTERNO,:DETPED_PROMOCION
            ,:MAEPROVTA_CODIGO,:DETPED_CANTIDADUND,:DETPED_LOTE
            ,:DETPED_CARACTERISTICAS)`;

    const BASEIVA =
      detalle.ivaRate === 0 ? 0 : (detalle.ivaValue / detalle.ivaRate) * 100;

    const BASEICE =
      detalle.iceRate === 0 ? 0 : (detalle.iceValue / detalle.iceRate) * 100;
    const binds = [
      ENCPED_NUMERO, //ENCPED_NUMERO
      `01`, //COM_CODIGO,
      linea, //detalle.DETPED_LINEA, //DETPED_LINEA
      `A`, //detalle.DETPED_TIPODET, //DETPED_TIPODET
      detalle.productServiceCode,
      detalle.productServiceDescription.slice(0, 79),
      detalle.ivaValue === 0 ? `N` : `S`, //detalle.DETPED_TRIBIVA,
      detalle.iceValue === 0 ? `N` : `S`, //detalle.DETPED_TRIBICE,
      detalleaux ? detalleaux[0].DETPED_UNIDAD : `UND.`, //detalle.DETPED_UNIDAD,
      Number(detalle.quantity),
      Number(0), //despacho
      Number(detalle.unitPrice),
      Number((detalle.discount * 100) / (detalle.unitPrice * detalle.quantity)), //descuento
      Number(detalle.totalValue),
      Number(detalle.ivaValue ?? 0),
      Number(detalle.iceValue ?? 0),
      detalleaux ? detalleaux[0].DETPED_LISTA : `A`, //detalle.DETPED_LISTA,
      BASEIVA, //Number(detalle.ivaValue), baseIVA
      BASEICE, //Number(detalle.DETPED_BASEICE),
      detalle.totalValue - BASEIVA - BASEICE, //Number(detalle.DETPED_BASECERO),
      Number(detalle.iceRate),
      0, //DETPED_ORDEN,
      0, //DETPED_NUMBLO,
      bodegaaux[0].BOD_CODIGO,
      null, //DETPED_CODALTERNO,
      null, //DETPED_PROMOCION,
      null, //MAEPROVTA_CODIGO,
      0, //DETPED_CANTIDADUND,
      null, //DETPED_LOTE,
      null, //DETPED_CARACTERISTICAS,
    ];
    //console.log(binds);
    const resp = await oracledb.ejecutarSQL(sql, binds);
    logger.info(
      `Detalle insertado con el codigo: ${ENCPED_NUMERO} y linea: ${linea}`
    );
    // console.log(resp);
  } catch (error) {
    //console.log(error);
    logger.error(error);
    return;
  }
};

exports.buscarPedidos = buscarPedidos;
exports.createPedido = createPedido;
exports.getMaxNumPedido = getMaxNumPedido;
exports.createDetallePedido = createDetallePedido;
exports.createOrderDetail = createOrderDetail;
