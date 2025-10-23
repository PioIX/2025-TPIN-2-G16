//Sección MySQL del código
const mySql = require("mysql2/promise");

/**
* Objeto con la configuración de la base de datos MySQL a utilizar.
*/
const SQL_CONFIGURATION_DATA =
{
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    port: 3306,
    charset: 'UTF8_GENERAL_CI'
}

/**
* Realiza una query a la base de datos MySQL indicada en el archivo "mysql.js".
* @param {String} queryString Query que se desea realizar. Textual como se utilizaría en el MySQL Workbench.
* @returns Respuesta de la base de datos. Suele ser un vector de objetos.
*/
exports.realizarQuery = async function (queryString)
{
    let returnObject;
    let connection;
    try
    {
        connection = await mySql.createConnection(SQL_CONFIGURATION_DATA);
        returnObject = await connection.execute(queryString);
    }
    catch(err)
    {
        console.log("Error en la query MySQL:", err);
        return null; // Retornar null en caso de error
    }
    finally
    {
        if(connection && connection.end) connection.end();
    }
    
    // Verificar que returnObject existe antes de acceder al índice 0
    return returnObject ? returnObject[0] : null;
}

MYSQL_HOST=localhost
MYSQL_USERNAME=tu_usuario
MYSQL_PASSWORD=tu_contraseña
MYSQL_DB=nombre_de_tu_base_de_datos