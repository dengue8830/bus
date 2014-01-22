var recorrido = [];
var paradas = [];
var linea;
var mapTraza;

function controller_traza_cargarMapaTraza(){
	console.log('iniciando traza');
	initializeTraza();
	$('#selectLineas').children().remove();

	db.transaction(function(tx) {
        tx.executeSql('select * from lineas_transporte',
          [], function(tx, result){
          	var dataset = result.rows;
          	for (var i = 0; i < dataset.length; i++) {
          		var item = dataset.item(i);
          		$('#selectLineas').append('<option value="'+item.id_linea_transporte+'">'+item.nombre+'</option>')
          	};
          }, connection_error);
    });
}

function initializeTraza() {

  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        //console.log(position.coords.latitude+', '+position.coords.longitude);
        //Estableciendo opciones
        var posicionActual = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);
        var mapOptions = {
            zoom: 15,
            center: posicionActual,
            mapTypeId: google.maps.MapTypeId.ONROAD
        };

        //Dibujando mapa
        mapTraza = new google.maps.Map(document.getElementById('mapTraza'), mapOptions);

        placeMarker(posicionActual, mapTraza);
        //Dibujando linea de recorrido
        /*google.maps.event.addListener(mapTraza, 'click', function(e) {
          
          recorrido.push(new google.maps.LatLng(e.latLng.lat(), e.latLng.lng()));
          linea = new google.maps.Polyline({
            path: recorrido,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
          });

          linea.setMap(mapTraza);
        });*/

    }, function() {
      alert('Error: El servicio de geolocalización no funciona.');
    },
    { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true});
  } else {
    // Browser doesn't support Geolocation
    alert('Error: Tu navegador no soporta geolocalización.');
  }
}

function controller_traza_guardar(){
	if(!recorrido || !paradas){
		alert('no se ha creado ningun recorrido o parada');
		return false;
	}

	if(!$('#selectLineas').val()){
		alert('no se ha seleccionado ninguna linea');
		return false;	
	}

	console.log('guardando recorrido para la linea: '+$('#selectLineas').val());
	var recorridoStr = '';
	var idLinea = $('#selectLineas').val();

	for (var i = 0; i < recorrido.length; i++) {
		//console.log(recorrido[i].lat()+','+recorrido[i].lng());

		if(i == recorrido.length-1){
			recorridoStr += recorrido[i].lat()+','+recorrido[i].lng();
			break;
		}

		recorridoStr += recorrido[i].lat()+','+recorrido[i].lng()+';';
	};

	var paradasStr = '';

	for (var i = 0; i < paradas.length; i++) {
		//console.log(paradas[i].lat()+','+paradas[i].lng());
//console.log(paradas[i].getPosition);
		if(i == paradas.length-1){
			paradasStr += paradas[i].position.lat()+','+paradas[i].position.lng();
			break;
		}

		paradasStr += paradas[i].position.lat()+','+paradas[i].position.lng()+';';
	};

	db.transaction(function(tx) {
        tx.executeSql('UPDATE lineas_transporte SET recorrido = ?, paradas = ? where id_linea_transporte = ?',
          [recorridoStr, paradasStr, idLinea], function(tx, result){
          	alert('guardado recorrido con exito! para la linea: '+$('#selectLineas').val());
          }, connection_error);
    });
}

function controller_traza_cargar(){
	if(linea)
		linea.setMap(null);
	
  if(paradas.length != 0){
    for (var i = 0; i < paradas.length; i++) {
      paradas[i].setMap(null);
    }
    paradas = [];
  }

	recorrido = [];
	var idLinea = $('#selectLineas').val();
	db.transaction(function(tx) {
        tx.executeSql('select * from lineas_transporte where id_linea_transporte = ?',
          [idLinea], function(tx, result){
          	var dataset = result.rows;

          	for (var i = 0; i < dataset.length; i++) {
          		var item = dataset.item(i);

              //Recorrido
          		if(item.recorrido){
                var recorridoSplit = item.recorrido.split(';');
                for (var i = 0; i < recorridoSplit.length; i++) {
                  var puntoSplit = recorridoSplit[i].split(',');
                  recorrido.push(new google.maps.LatLng(Number(puntoSplit[0]), Number(puntoSplit[1])));
                };
                linea = new google.maps.Polyline({
                    path: recorrido,
                    geodesic: true,
                    strokeColor: '#FF0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                });

                linea.setMap(mapTraza);

              }

          		//Paradas
          		if(item.paradas){
                var paradasSplit = item.paradas.split(';');

                for (var i = 0; i < paradasSplit.length; i++) {
                  var paradaSplit = paradasSplit[i].split(',');
                  var paradaLtLn = new google.maps.LatLng(Number(paradaSplit[0]), Number(paradaSplit[1]));
                  //paradas.push(new google.maps.LatLng(Number(paradaSplit[0]), Number(paradaSplit[1])));
                  paradas.push(placeMarker(paradaLtLn, mapTraza));
                }
                console.log(paradas);
              }
          	};
          }, connection_error);
    });
}

function controller_traza_trazarRecorrido(){
	google.maps.event.clearListeners(mapTraza, 'click');
	google.maps.event.addListener(mapTraza, 'click', function(e) {
          
          recorrido.push(new google.maps.LatLng(e.latLng.lat(), e.latLng.lng()));
          linea = new google.maps.Polyline({
            path: recorrido,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
          });

          linea.setMap(mapTraza);
        });
}

function controller_traza_trazarParada(){
	google.maps.event.clearListeners(mapTraza, 'click');
	google.maps.event.addListener(mapTraza, 'click', function(e) {
          var posicionSeleccionada = new google.maps.LatLng(e.latLng.lat(), e.latLng.lng());
          paradas.push(placeMarker(posicionSeleccionada, mapTraza));

        });
}