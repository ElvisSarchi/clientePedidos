# cliente Pedidos Contifico

#### env.js

```js
module.exports = {
  BASEURL: "XXXXXXXXXXXXXXXXXXXXXXX",
  AUTHORIZATION: "XXXXXXXXXXXXXXXXXXXXXXX",
  USER_ORACLE:"XXXXXXXXXXXXXXXXXXXXXXX",
  PASSWORD_ORACLE: "XXXXXXXXXXXXXXXXXXXXXXX",
  URL_ORACLE: "XXXXXXXXXXXXXXXXXXXXXXX",
  SIZE_OBSERVACION: "XXXXXXXXXXXXXXXXXXXXXXX",
  CRON: "XXXXXXXXXXXXXXXXXXXXXXX",
};
```

| Variable      | Descripción                                                                       |
| :------------ | :-------------------------------------------------------------------------------- |
| **BASEURL**   | URL de la Api de Contifico.                 |
| **AUTHORIZATION**   | API key otorgada por Contifico.             |
| **USER_ORACLE** | User de la base de datos de Oracle para la migración de datos.             |
| **PASSWORD_ORACLE**    | Password del usuario de la base de datos de Oracle. |
| **URL_ORACLE**    | String de conexión de la base de datos de Oracle |
| **SIZE_OBSERVACION**    | Número máximo para recortar la observación en el pedido |
| **CRON**    | String de configuración de la tarea CRON para los bucles de repetición |
