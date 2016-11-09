function pesquisaOffline(pagina, termo) {
	return {
		status : "ok",
		obj : {
			registros : _geraRegistros(pagina, termo),
			propriedades : _geraPropriedades(pagina, termo),
			navegacao : _geraNavegacao(pagina, termo)
		}
	};
}

function _getTodosRegistros(){
	return [
		{				"id": 1,				"ds_sigla": "AC",				"ds_nome": "Acre"			},
		{				"id": 2,				"ds_sigla": "AL",				"ds_nome": "Alagoas"			},
		{				"id": 3,				"ds_sigla": "AM",				"ds_nome": "Amazonas"			},
		{				"id": 4,				"ds_sigla": "AP",				"ds_nome": "Amapá"			},
		{				"id": 5,				"ds_sigla": "BA",				"ds_nome": "Bahia"			},
		{				"id": 6,				"ds_sigla": "CE",				"ds_nome": "Ceará"			},
		{				"id": 7,				"ds_sigla": "DF",				"ds_nome": "Distrito Federal"			},
		{				"id": 8,				"ds_sigla": "ES",				"ds_nome": "Espírito Santo"			},
		{				"id": 9,				"ds_sigla": "GO",				"ds_nome": "Goiás"			},
		{				"id": 10,				"ds_sigla": "MA",				"ds_nome": "Maranhão"			},
		{				"id": 11,				"ds_sigla": "MG",				"ds_nome": "Minas Gerais"			},
		{				"id": 12,				"ds_sigla": "MS",				"ds_nome": "Mato Grosso do Sul"			},
		{				"id": 13,				"ds_sigla": "MT",				"ds_nome": "Mato Grosso"			},
		{				"id": 14,				"ds_sigla": "PA",				"ds_nome": "Pará"			},
		{				"id": 15,				"ds_sigla": "PB",				"ds_nome": "Paraíba"			},
		{				"id": 16,				"ds_sigla": "PE",				"ds_nome": "Pernambuco"			},
		{				"id": 17,				"ds_sigla": "PI",				"ds_nome": "Piauí"			},
		{				"id": 18,				"ds_sigla": "PR",				"ds_nome": "Paraná"			},
		{				"id": 19,				"ds_sigla": "RJ",				"ds_nome": "Rio de Janeiro"			},
		{				"id": 20,				"ds_sigla": "RN",				"ds_nome": "Rio Grande do Norte"			},
		{				"id": 21,				"ds_sigla": "RO",				"ds_nome": "Rondônia"			},
		{				"id": 22,				"ds_sigla": "RR",				"ds_nome": "Roraima"			},
		{				"id": 23,				"ds_sigla": "RS",				"ds_nome": "Rio Grande do Sul"			},
		{				"id": 24,				"ds_sigla": "SC",				"ds_nome": "Santa Catarina"			},
		{				"id": 25,				"ds_sigla": "SE",				"ds_nome": "Sergipe"			},
		{				"id": 26,				"ds_sigla": "SP",				"ds_nome": "São Paulo"			},
		{				"id": 27,				"ds_sigla": "TO",				"ds_nome": "Tocantins"			}
	];
}

function _geraRegistros(pagina, termo){
	var todosRegistros = _getTodosRegistros();
	
	if (!termo || termo == ""){
		if (pagina == 1) return todosRegistros.slice(0, 10);
		if (pagina == 2) return todosRegistros.slice(10, 20);
		if (pagina == 3) return todosRegistros.slice(20);
	}
	
	var filtrado = _pesquisa(termo);
	if (filtrado.length > 10){
		if (pagina == 1) return filtrado.slice(0, 10);
		if (pagina == 2) return filtrado.slice(10, 20);
		if (pagina == 3) return filtrado.slice(20);
	}
	return filtrado;
}

function _pesquisa(termo){
	var registros = _getTodosRegistros();
	
	if (termo){
		var filtrado = [];
		
	    for (var i=0; i < registros.length; i++) {
	        if (registros[i].ds_nome.toLowerCase().indexOf(termo.toLowerCase()) >= 0 ) {
	        	filtrado.push( registros[i] );
	        }
	    }
	    return filtrado;	    
	}
	return registros;    
}

function _geraPropriedades(pagina, termo){
	var registros = _pesquisa(termo);
	
	var total = 0;
	if (registros){
		total = Math.round(registros.length / 10);
	}
	
	var ret = [];
	ret["qtdPaginasTotal"] = total;
	return ret;
	
}

function _geraNavegacao(pagina, termo){
	var propriedades = _geraPropriedades(pagina, termo);
	var qtdPaginas = propriedades["qtdPaginasTotal"];
	
	var paginas = [];
	
	if (qtdPaginas > 0){
		for(var i = 1; i <= qtdPaginas; i++ ){
			paginas.push( { "pagina" : i, "legenda" : i, "active" : (pagina == i ? "active" : "") } );
		}
	}
	
	var ret = [];
	ret["paginas"] = paginas;
	return ret;
}

