const oracledb = require("../../services/dboracle");
const { getCliente } = require("../../services/ws");
const log4js = require("log4js");
const logger = log4js.getLogger();

exports.buscarCliente = async function (codigo) {
  const sql = `SELECT * FROM VEN_MAECLIENTE WHERE CLI_CODIGO='${codigo}'`;
  const data = await oracledb.busqueda(sql);
  return data;
};

exports.createClient = async function ({ persona }) {
  try {
    const clientaxu = await oracledb.busqueda(
      `SELECT * FROM VEN_MAECLIENTE WHERE ROWNUM=1`
    );
    const sql = `INSERT INTO VEN_MAECLIENTE (CLI_CODIGO, GRU_CODIGO, VEN_CODIGO, CLI_NOMBREC, 
    CLI_NOMBRE, CLI_TIPOIDE, CLI_RUCIDE, CLI_DIRECCION1, CLI_TELEFONO1, CLI_CORREO, CLI_CONTACTO, 
    CLI_FECING, CLI_LIMCREDIT, CLI_DIACREDIT, CLI_DESCUENTO, CLI_IVA, CLI_CONTRIBUYENTE, CON_CODIGO1, 
    CON_CODIGO2, CLI_ZONA, CLI_OBSERVACION, NOM_CODIGO ,  DEP_CODIGO ,  CLI_TIPO,  CLI_PROVINCIA,
    CIU_CODIGO, TCR_CODIGO, CLI_TRFIVA, CLI_TRFRETENCION, CBR_CODIGO, CLI_ESTADO, ENCFFA_CODIGO, CLI_LINNEG,
    CLI_PORCEDESCUENTO, CLI_VALORRECARGO, CLI_PORCERECARGO, CEN_CODIGO, CLI_LOCAL, CLI_FECHANACIMIENTO, CLI_SEXO,
    CLI_CARGO, CLI_DIACHPOS, CLI_UNIFICA, CLI_EXCLUYE, CLI_DESCUENTOLIM, CON_CODIGO3, COM_CODIGO ,
    BANCLI_CODIGO , CLI_NROCUENTA) VALUES(:CLI_CODIGO,:GRU_CODIGO,:VEN_CODIGO,:CLI_NOMBREC,
    :CLI_NOMBRE,:CLI_TIPOIDE,:CLI_RUCIDE,:CLI_DIRECCION1,:CLI_TELEFONO1,:CLI_CORREO,:CLI_CONTACTO,
    :CLI_FECING,:CLI_LIMCREDIT,:CLI_DIACREDIT,:CLI_DESCUENTO,:CLI_IVA,:CLI_CONTRIBUYENTE,:CON_CODIGO1,
    :CON_CODIGO2,:CLI_ZONA,:CLI_OBSERVACION,:NOM_CODIGO,:DEP_CODIGO,:CLI_TIPO,:CLI_PROVINCIA,
    :CIU_CODIGO,:TCR_CODIGO,:CLI_TRFIVA,:CLI_TRFRETENCION,:CBR_CODIGO,:CLI_ESTADO,:ENCFFA_CODIGO,:CLI_LINNEG,
    :CLI_PORCEDESCUENTO,:CLI_VALORRECARGO,:CLI_PORCERECARGO,:CEN_CODIGO,:CLI_LOCAL,:CLI_FECHANACIMIENTO,
    :CLI_SEXO,:CLI_CARGO,:CLI_DIACHPOS,:CLI_UNIFICA,:CLI_EXCLUYE,:CLI_DESCUENTOLIM,:CON_CODIGO3,:COM_CODIGO,
    :BANCLI_CODIGO,:CLI_NROCUENTA)`;

    const binds = [
      persona.ruc ?? persona.cedula,
      persona.categoria_nombre ?? clientaxu[0].GRU_CODIGO,
      persona.vendedor ?? clientaxu[0].VEN_CODIGO,
      persona.razon_social.slice(0, 199),
      persona.nombre_comercial.slice(0, 199),
      getCodeidentificaicon(persona.ruc ?? persona.cedula),
      persona.ruc ?? persona.cedula,
      persona?.direccion?.slice(0, 99),
      persona.telefonos.slice(0, 14),
      persona.email,
      null, //client.CLI_CONTACTO,
      new Date(),
      clientaxu[0].CLI_LIMCREDIT,
      clientaxu[0].CLI_DIACREDIT,
      0, //client.CLI_PORCEDESCUENTO,
      clientaxu[0].CLI_IVA,
      clientaxu[0].CLI_CONTRIBUYENTE,
      clientaxu[0].CON_CODIGO1,
      clientaxu[0].CON_CODIGO2,
      clientaxu[0].CLI_ZONA,
      persona.id ?? `Creado desde el Web Services`,
      clientaxu[0].NOM_CODIGO,
      clientaxu[0].DEP_CODIGO,
      clientaxu[0].CLI_TIPO,
      clientaxu[0].CLI_PROVINCIA,
      clientaxu[0].CIU_CODIGO,
      clientaxu[0].TCR_CODIGO,
      clientaxu[0].CLI_TRFIVA,
      clientaxu[0].CLI_TRFRETENCION,
      clientaxu[0].CBR_CODIGO,
      clientaxu[0].CLI_ESTADO,
      clientaxu[0].ENCFFA_CODIGO,
      clientaxu[0].CLI_LINNEG,
      clientaxu[0].CLI_PORCEDESCUENTO,
      clientaxu[0].CLI_VALORRECARGO,
      clientaxu[0].CLI_PORCERECARGO,
      clientaxu[0].CEN_CODIGO,
      clientaxu[0].CLI_LOCAL,
      clientaxu[0].CLI_FECHANACIMIENTO,
      clientaxu[0].CLI_SEXO,
      clientaxu[0].CLI_CARGO,
      clientaxu[0].CLI_DIACHPOS,
      clientaxu[0].CLI_UNIFICA,
      clientaxu[0].CLI_EXCLUYE,
      clientaxu[0].CLI_DESCUENTOLIM,
      clientaxu[0].CON_CODIGO3,
      clientaxu[0].COM_CODIGO,
      clientaxu[0].BANCLI_CODIGO,
      clientaxu[0].CLI_NROCUENTA,
    ];
    // console.log(binds);
    //insertar en la base de datos

    const resp = await oracledb.ejecutarSQL(sql, binds);
    //console.log(resp);
    logger.info(
      `Cliente creado con codigo: ${client.identification} y ID: ${client._id}`
    );
    return true;
  } catch (error) {
    //console.log(error);
    logger.error(error);
    return false;
  }
};

const getTelefono = function (texto) {
  const telefono = texto?.length > 9 ? texto.trim().split("/")[0] : texto;
  return telefono.slice(0, 14);
};

const getCodeidentificaicon = function (idetificacion) {
  const code =
    idetificacion.length >= 13 ? 1 : idetificacion.length === 10 ? 2 : 3;
  return code;
};
