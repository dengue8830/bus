var createtable_transporte_sql ='CREATE TABLE IF NOT EXISTS transportes (id_transporte INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT, id_detalle INTEGER, tipo TEXT)';
var createtable_lineas_transporte_sql ='CREATE TABLE IF NOT EXISTS lineas_transporte (id_linea_transporte INTEGER PRIMARY KEY AUTOINCREMENT, id_transporte INTEGER, nombre TEXT, recorrido TEXT, paradas TEXT)';
//var createtable_recorridos_lineas_transporte_sql ='CREATE TABLE IF NOT EXISTS recorridos_lineas_transportes (id_recorrido_linea_transporte INTEGER PRIMARY KEY AUTOINCREMENT, id_linea_transporte INTEGER, nombre TEXT)';

var insert_transporte_sql = 'INSERT OR REPLACE INTO transportes (id_transporte, nombre, id_detalle, tipo) VALUES (1, "Urbano", null, "Colectivo")';
var insert_lineas_1_sql = 'INSERT OR REPLACE INTO lineas_transporte (id_linea_transporte, id_transporte, nombre) VALUES (1, 1, "14-A")';
var insert_lineas_2_sql = 'INSERT OR REPLACE INTO lineas_transporte (id_linea_transporte, id_transporte, nombre) VALUES (2, 1, "12-B")';
//-24.204385,-65.287545   mi casa
//-24.205755,-65.281344   la puya puya

function connection_createTables(callbackOk, callbackError) {
	ejecutar(createtable_transporte_sql);
	ejecutar(createtable_lineas_transporte_sql);
	ejecutar(insert_transporte_sql);
	ejecutar(insert_lineas_1_sql);
	ejecutar(insert_lineas_2_sql);
}

function ejecutar(sql, callBackOk, callBackError){
  //if(!callBackOk)
	db.transaction(function(tx) {
        tx.executeSql(sql,
          [], callBackOk, callBackError);
    });
}

function connection_cargarBD(callBackOk, callBackError){
  ejecutar('select 1 from transportes', callBackOk, callBackError);
}

function connection_error(tx, error){
        alert(error.message);
}