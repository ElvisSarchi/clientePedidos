const oracledb = require("../../services/dboracle");
const { getArticulo } = require("../../services/ws");
const moment = require("moment");
const log4js = require("log4js");
const wsConfitico = require("../../services/wsConfitico");

const logger = log4js.getLogger();

const createArticulo = async function ({ code }) {
  try {
    const articulo = await wsConfitico.fetchGet({
      path: `producto/${code}`,
    });
    //console.log(articulo);
    //verificar si existe el grupo caso contraro se inserta
    //await verificarGrupo(articulo.GRUP_CODIGO, articulo.GRUP_NOMBRE);

    const [articuloAux] = await oracledb.busqueda(
      `SELECT * FROM INV_MAEARTICULO WHERE ROWNUM=1`
    );

    const sql = `INSERT INTO INV_MAEARTICULO (ART_CODIGO,COM_CODIGO,ART_NOMBRE,ART_NOMBREC,
        GRUP_CODIGO,GRUP_CODIGOP,ART_TRIBUTAIVA,ART_TRIBUTAICE,
        ART_FECHAING,ART_LABORATORIO,ART_UBICACION,ART_MULTIUNIDAD,
        ART_UNIDADVENTA,ART_UNIDADCOSTEO,ART_CADUCA,ART_CODIGOALT1,
        ART_CODIGOALT2,ART_CODIGOALT3,ART_CODIGOALT4,ART_LARGO,
        ART_ALTURA,ART_ANCHO,ART_PESO,ART_COMPUESTO,CON_CODIGOACT,CON_CODIGOGAS,CON_CODIGOING,
        CON_CODIGOORD1,CON_CODIGOORD2,ART_OBSERVACION,ART_CODIGOICE,
        ART_MARCA,ART_MODELO,ART_SERIE,ART_VOLUMEN,PRESENTACION_CODIGO,ART_FACTOR,ART_FORMAVTA,
        ART_DESCUENTO,ART_SERIALFLAG,ART_DIASGARANTIA,ART_VALORICE,ART_ACTIVO,
        ART_COSTOHISTORICO,CEN_CODIGO,CON_CODIGODSCTO,CON_CODIGOING2,
        CON_CODIGODSCTO2,ART_ACTIVARSERIAL,ART_ACTIVARDIM,ART_ACTIVARNUMEROTEL,ART_FORMSRIVTAS,
        ART_FORMSRICOM,ART_PORDISES1,ART_PORDISES2,ART_CAMPANIA,ART_CAMTIPO,
        ART_CANTMAX,ART_CANTMIN,ART_BASENOOBJIVA,ART_SUBSIDIO,CON_CODIGOPRODPROC,
        ART_PRODUCTOPROD,ART_TIPO,ART_UNIPORCAJA,ART_CODSRIICE,ART_DENSIDAD,ART_CANTIDAD_UND,
        ART_TIPOCATEGORIA,ART_COMENTARIO
        ) VALUES
        (:ART_CODIGO,:COM_CODIGO,:ART_NOMBRE,:ART_NOMBREC,:GRUP_CODIGO
        ,:GRUP_CODIGOP,:ART_TRIBUTAIVA,:ART_TRIBUTAICE,:ART_FECHAING
        ,:ART_LABORATORIO,:ART_UBICACION,:ART_MULTIUNIDAD,:ART_UNIDADVENTA
        ,:ART_UNIDADCOSTEO,:ART_CADUCA,:ART_CODIGOALT1,:ART_CODIGOALT2
        ,:ART_CODIGOALT3,:ART_CODIGOALT4,:ART_LARGO,:ART_ALTURA
        ,:ART_ANCHO,:ART_PESO,:ART_COMPUESTO,:CON_CODIGOACT,:CON_CODIGOGAS
        ,:CON_CODIGOING,:CON_CODIGOORD1,:CON_CODIGOORD2,:ART_OBSERVACION
        ,:ART_CODIGOICE,:ART_MARCA,:ART_MODELO,:ART_SERIE
        ,:ART_VOLUMEN,:PRESENTACION_CODIGO,:ART_FACTOR,:ART_FORMAVTA
        ,:ART_DESCUENTO,:ART_SERIALFLAG,:ART_DIASGARANTIA,:ART_VALORICE,:ART_ACTIVO
        ,:ART_COSTOHISTORICO,:CEN_CODIGO,:CON_CODIGODSCTO,:CON_CODIGOING2
        ,:CON_CODIGODSCTO2,:ART_ACTIVARSERIAL,:ART_ACTIVARDIM,:ART_ACTIVARNUMEROTEL
        ,:ART_FORMSRIVTAS,:ART_FORMSRICOM,:ART_PORDISES1,:ART_PORDISES2,:ART_CAMPANIA
        ,:ART_CAMTIPO,:ART_CANTMAX,:ART_CANTMIN,:ART_BASENOOBJIVA,:ART_SUBSIDIO
        ,:CON_CODIGOPRODPROC,:ART_PRODUCTOPROD,:ART_TIPO,:ART_UNIPORCAJA
        ,:ART_CODSRIICE,:ART_DENSIDAD,:ART_CANTIDAD_UND,:ART_TIPOCATEGORIA,:ART_COMENTARIO)`;

    const binds = [
      articulo.codigo, //ART_CODIGO,
      articuloAux.COM_CODIGO, //COM_CODIGO,
      articulo.nombre.slice(0, 99), //ART_NOMBRE,
      articulo.nombre.slice(0, 24), //ART_NOMBREC,
      articuloAux.GRUP_CODIGO, //GRUP_CODIGO,
      null, //GRUP_CODIGOP,
      articulo.porcentaje_iva === 0 ? `N` : `S`, //articulo.ART_TRIBUTAIVA, //ART_TRIBUTAIVA,
      `N`, //"N", //ART_TRIBUTAICE,
      moment().format(`DD/MM/YYYY`), //ART_FECHAING,
      null, //ART_LABORATORIO,
      null, //ART_UBICACION,
      articuloAux.ART_MULTIUNIDAD, //ART_MULTIUNIDAD,
      articuloAux.ART_UNIDADVENTA, //ART_UNIDADVENTA,
      articuloAux.ART_UNIDADCOSTEO, //ART_UNIDADCOSTEO,
      articuloAux.ART_CADUCA, //ART_CADUCA
      articulo.id, //ART_CODIGOALT1,
      null, //ART_CODIGOALT2,
      null, //ART_CODIGOALT3,
      null, //ART_CODIGOALT4,
      null, //ART_LARGO,
      null, //ART_ALTURA,
      null, //ART_ANCHO,
      null, //ART_PESO,
      "N", //ART_COMPUESTO,
      articuloAux.CON_CODIGOACT, //CON_CODIGOACT,
      articuloAux.CON_CODIGOGAS, //CON_CODIGOGAS
      articuloAux.CON_CODIGOING, //CON_CODIGOING,
      null, //CON_CODIGOORD1,
      null, //CON_CODIGOORD2,
      `Creado Desde el WEB SERVICES`, //ART_OBSERVACION,
      null, //ART_CODIGOICE,
      null, //ART_MARCA,
      null, //ART_MODELO,
      null, //ART_SERIE,
      null, //ART_VOLUMEN,
      null, //PRESENTACION_CODIGO,
      null, //ART_FACTOR,
      null, //ART_FORMAVTA,
      null, //ART_DESCUENTO,
      articuloAux.ART_SERIALFLAG, //ART_SERIALFLAG,
      null, //ART_DIASGARANTIA,
      null, //ART_VALORICE,
      `S`, //ART_ACTIVO,
      null, //ART_COSTOHISTORICO,
      null, //CEN_CODIGO,
      articuloAux.CON_CODIGODSCTO, //CON_CODIGODSCTO,
      articuloAux.CON_CODIGOING2, //CON_CODIGOING2
      articuloAux.CON_CODIGODSCTO2, //CON_CODIGODSCTO2,
      `N`, //ART_ACTIVARSERIAL,
      `N`, //ART_ACTIVARDIM,
      `N`, // ART_ACTIVARNUMEROTEL,
      null, //ART_FORMSRIVTAS,
      null, //ART_FORMSRICOM,
      null, //ART_PORDISES1,
      null, //ART_PORDISES2,
      null, //ART_CAMPANIA,
      null, //ART_CAMTIPO,
      null, //ART_CANTMAX,
      null, //ART_CANTMIN,
      `N`, //ART_BASENOOBJIVA,
      null, //ART_SUBSIDIO,
      null, //CON_CODIGOPRODPROC,
      null, //ART_PRODUCTOPROD,
      null, //ART_TIPO,
      null, //ART_UNIPORCAJA,
      null, //ART_CODSRIICE,
      null, //ART_DENSIDAD,
      null, //ART_CANTIDAD_UND,
      null, //ART_TIPOCATEGORIA,
      null, //ART_COMENTARIO,
    ];
    //console.log(binds);
    //insertar en la base de datos

    const resp = await oracledb.ejecutarSQL(sql, binds);
    logger.info(`Articulo insertado con codigo: ${articulo.codigo}`);
    // console.log(resp);
    return articulo.codigo;
  } catch (error) {
    //console.log(error);
    logger.error(error);
    return false;
  }
};

const verificarGrupo = async function (GRUP_CODIGO, GRUP_NOMBRE) {
  try {
    const verificar = await oracledb.busqueda(
      `SELECT GRUP_CODIGO FROM INV_MAEGRUPO WHERE GRUP_CODIGO='${GRUP_CODIGO}'`
    );
    if (verificar === null) {
      //si no existe en la base se crea uno nuevo
      const sql = `INSERT INTO INV_MAEGRUPO(GRUP_CODIGO,GRUP_NOMBRE) VALUES(:GRUP_CODIGO,:GRUP_NOMBRE)`;
      const binds = [GRUP_CODIGO, GRUP_NOMBRE];
      await oracledb.ejecutarSQL(sql, binds);
    }
  } catch (error) {
    //onsole.error(error);
    logger.error(error);
    return;
  }
};

const createService = async function (codigo) {
  try {
    const articulows = await getArticulo(codigo);

    if (articulows === null) {
      return;
    }

    const [servicio] = articulows;
    //console.log(client);
    if (servicio === undefined) return;

    const [servicioAux] = await oracledb.busqueda(
      `SELECT * FROM VEN_MAESERVICIO WHERE ROWNUM=1`
    );

    const sql = `INSERT INTO VEN_MAESERVICIO(SER_CODIGO,COM_CODIGO,SER_DESCRIPCION,CON_CODIGO,SER_PRECIO
        ,SER_TRIBUTAIVA, SER_FORMSRIVTAS,SER_BASENOOBJIVA) 
        VALUES (:SER_CODIGO,:COM_CODIGO,:SER_DESCRIPCION,:CON_CODIGO,:SER_PRECIO
        ,:SER_TRIBUTAIVA,:SER_FORMSRIVTAS,:SER_BASENOOBJIVA)`;
    const binds = [
      servicio.ART_CODIGO, //SER_CODIGO,
      servicioAux.COM_CODIGO,
      servicio.ART_NOMBRE.slice(0, 79), //SER_DESCRIPCION,
      servicioAux.CON_CODIGO,
      servicio.ARTPRE_PRECIO, //SER_PRECIO,
      servicio.ART_TRIBUTAIVA, //SER_TRIBUTAIVA,
      null, //SER_FORMSRIVTAS,
      null, //SER_BASENOOBJIVA,
    ];

    const resp = await oracledb.ejecutarSQL(sql, binds);
    logger.info(`Servicio Creado con codigo: ${servicio.ART_CODIGO}`);
    return true;
  } catch (error) {
    //console.error(error);
    logger.error(error);
    return false;
  }
};

exports.createArticulo = createArticulo;
exports.createService = createService;
