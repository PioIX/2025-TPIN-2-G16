//Sección MySQL del código
const mySql = require("mysql2/promise");

/**
* Objeto con la configuración de la base de datos MySQL a utilizar.
*/
const SQL_CONFIGURATION_DATA = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USERNAME || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DB || 'tu_base_de_datos',
  port: 3306,
  charset: 'UTF8_GENERAL_CI'
}

/**
* Realiza una query a la base de datos MySQL indicada en el archivo "mysql.js".
* @param {String} queryString Query que se desea realizar. Textual como se utilizaría en el MySQL Workbench.
* @param {Array} params Parámetros para la query preparada (opcional)
* @returns Respuesta de la base de datos. Suele ser un vector de objetos, o null si hay error.
*/
exports.realizarQuery = async function (queryString, params = []) {
  let returnObject;
  let connection;
  
  try {
    console.log("Intentando conectar a la base de datos...");
    connection = await mySql.createConnection(SQL_CONFIGURATION_DATA);
    console.log("Conexión exitosa");
    
    console.log("Ejecutando query:", queryString);
    console.log("Con parámetros:", params);
    
    // Ejecutar la query con parámetros preparados
    returnObject = await connection.execute(queryString, params);
    
    console.log("Query ejecutada exitosamente");
  } catch(err) {
    console.error("❌ Error en realizarQuery:");
    console.error("Query:", queryString);
    console.error("Params:", params);
    console.error("Error completo:", err);
    console.error("Stack trace:", err.stack);
    
    // Retornar null en caso de error
    return null;
  } finally {
    // Cerrar la conexión si existe
    if (connection && connection.end) {
      try {
        await connection.end();
        console.log("Conexión cerrada");
      } catch (closeErr) {
        console.error("Error al cerrar conexión:", closeErr);
      }
    }
  }
  
  // Verificar que returnObject existe antes de acceder a su índice
  if (!returnObject) {
    console.error("returnObject es null o undefined");
    return null;
  }
  
  // returnObject[0] contiene las filas, returnObject[1] contiene los metadatos
  return returnObject[0];
}