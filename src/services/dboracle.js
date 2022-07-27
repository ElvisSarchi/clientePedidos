const oracledb = require("oracledb");
const log4js = require("log4js");
const logger = log4js.getLogger();

exports.init = async function () {
  try {
    await oracledb.createPool({
      user: process.env.USER_ORACLE,
      password: process.env.PASSWORD_ORACLE,
      connectString: process.env.URL_ORACLE,
    });
    console.log("Connection pool started: " + process.env.USER_ORACLE);
  } catch (err) {
    //console.error("init() error: " + err.message);
    logger.error("init() error: " + err.message);
  }
};

exports.busqueda = async function (sql) {
  let cn;
  try {
    cn = await oracledb.getConnection();
    //sess.coneccion = cn;
    const result = await cn.execute(sql, [], { autoCommit: true });
    var elementos = new Array();
    for (var i in result.rows) {
      var obj = new Object();
      for (var j in result.metaData) {
        obj[result.metaData[j].name] = result.rows[i][j];
      }
      elementos.push(obj);
    }
    if (elementos.length > 0) {
      return elementos;
    } else {
      return null;
    }
  } catch (err) {
    logger.error(err);
    return null;
  } finally {
    if (cn) {
      try {
        await cn.close();
      } catch (err) {
        //console.error(err);
        logger.error(err);
      }
    }
  }
};

exports.ejecutarSQL = async function (sql, binds) {
  let cn;
  try {
    cn = await oracledb.getConnection();

    const result = await cn.execute(sql, binds, { autoCommit: true });

    return result;
  } catch (err) {
    logger.error(err);
    return err.message;
  } finally {
    if (cn) {
      try {
        await cn.close();
      } catch (err) {
        logger.error(err);
      }
    }
  }
};
