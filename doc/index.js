var urlControlador = "http://www.brelzin.com.br/ws/estados.php";


$(document).ready(function() {
	
	//Topo da página
	var ssEstados =  new SimpleSearch({
//		url: urlControlador, // "/CAD/arquivosExemplo/controlador/consultarCmUf.php",
		response: function( pagina, termo ){
			return  pesquisaOffline( pagina, termo );
		},
		query: "#inputNome",
		queryId: "#inputValorId",
		field: "ds_nome",
//		fieldId: "id",
//		fieldRecords: "obj.registros",
	});
	

	//Comum
	var ssBuscaBasico =  new SimpleSearch({
//		url: urlControlador, // "/CAD/arquivosExemplo/controlador/consultarCmUf.php",
		response: function( pagina, termo ){
			return  pesquisaOffline( pagina, termo );
		},
		query: "#busca0",
		queryId: "#buscaValor0",
		field: "ds_nome",
// 		fieldId: "id",
// 		fieldRecords: "obj.registros",
	});
		
	//Enviando parametros
	var ssBuscaEnviandoParametros =  new SimpleSearch({
//		url: urlControlador, // "/CAD/arquivosExemplo/controlador/consultarCmUf.php",
		response: function( pagina, termo ){
			return  pesquisaOffline( pagina, termo );
		},
		query: "#busca01",
		queryId: "#buscaValor01",
		field: "ds_nome",
// 		fieldId: "id",
// 		fieldRecords: "obj.registros",
		data: function(){ return {
			filtro: "palavraFiltrada"
		} },
	});
		
	//Mínimo 3 caracteres
	var ssBuscaMinimoParametros =  new SimpleSearch({
//		url: urlControlador, // "/CAD/arquivosExemplo/controlador/consultarCmUf.php",
		response: function( pagina, termo ){
			return  pesquisaOffline( pagina, termo );
		},
		query: "#busca02",
		queryId: "#buscaValor02",
		field: "ds_nome",
// 		fieldId: "id",
// 		fieldRecords: "obj.registros",
		minLength: 3,
	});
	
	//Com temporizador
	var ssBuscaComTemporizador =  new SimpleSearch({
//		url: urlControlador, // "/CAD/arquivosExemplo/controlador/consultarCmUf.php",
		response: function( pagina, termo ){
			return  pesquisaOffline( pagina, termo );
		},
		query: "#busca021",
		queryId: "#buscaValor021",
		field: "ds_nome",
// 		fieldId: "id",
// 		fieldRecords: "obj.registros",
		delayAutoSearch: 1200,
	});
	
	//Com complemento
	var ssBuscaComComplemento =  new SimpleSearch({
//		url: urlControlador, // "/CAD/arquivosExemplo/controlador/consultarCmUf.php",
		response: function( pagina, termo ){
			return  pesquisaOffline( pagina, termo );
		},
		query: "#busca022",
		queryId: "#buscaValor022",
		field: "ds_nome",
// 		fieldId: "id",
// 		fieldRecords: "obj.registros",
		templateComplement: "Sigla #ds_sigla#",
	});
	
	//Usando template
	var ssBuscaComTemplate =  new SimpleSearch({
//		url: urlControlador, // "/CAD/arquivosExemplo/controlador/consultarCmUf.php",
		response: function( pagina, termo ){
			return  pesquisaOffline( pagina, termo );
		},
		query: "#busca03",
		queryId: "#buscaValor03",
		field: "ds_nome",
// 		fieldId: "id",
// 		fieldRecords: "obj.registros",
		templateField: "#ds_sigla# - #ds_nome#",
	});
	
	//Callbacks
	var ssBuscaComCallback =  new SimpleSearch({
//		url: urlControlador, // "/CAD/arquivosExemplo/controlador/consultarCmUf.php",
		response: function( pagina, termo ){
			return  pesquisaOffline( pagina, termo );
		},
		query: "#busca04",
		queryId: "#buscaValor04",
		field: "ds_nome",
// 		fieldId: "id",
// 		fieldRecords: "obj.registros",
		onselect: function( row ){ $("#buscaValor04").val(row.id + " " + row.ds_nome); },
		onreset: function( row ){ $("#buscaValor04").val(""); },
		onsuccess: function( response ){ if (response.status == 'erro') throw Error("Deu erro na resposta do servidor!"); return true; }
	});

	//Inicializado
	var ssBuscaInicializado =  new SimpleSearch({
//		url: urlControlador, // "/CAD/arquivosExemplo/controlador/consultarCmUf.php",
		response: function( pagina, termo ){
			return  pesquisaOffline( pagina, termo );
		},
		query: "#busca05",
		queryId: "#buscaValor05",
		field: "ds_nome",
// 		fieldId: "id",
// 		fieldRecords: "obj.registros",			
		defaultValue: [11, "Minas Gerais"],
	});
// 	ssBuscaInicializado.select(11, "Minas Gerais");

	//Bloqueado
	var ssBuscaBloqueado =  new SimpleSearch({
//		url: urlControlador, // "/CAD/arquivosExemplo/controlador/consultarCmUf.php",
		response: function( pagina, termo ){
			return  pesquisaOffline( pagina, termo );
		},
		query: "#busca06",
		queryId: "#buscaValor06",
		field: "ds_nome",
// 		fieldId: "id",
// 		fieldRecords: "obj.registros",
		defaultValue: [26, "São Paulo"],
	});
// 	ssBuscaBloqueado.select(26, "São Paulo");
	ssBuscaBloqueado.disabled();
// 	ssBuscaBloqueado.enabled();

	//Com container de itens
	var ssBuscaComItens =  new SimpleSearch({
//		url: urlControlador, // "/CAD/arquivosExemplo/controlador/consultarCmUf.php",
		response: function( pagina, termo ){
			return  pesquisaOffline( pagina, termo );
		},
		query: "#busca07",
		field: "ds_nome",
// 		fieldId: "id",
// 		fieldRecords: "obj.registros",
		inputNames: "estadosSelecionados[]",
	});

	//Com container de itens iniciado
	var ssBuscaComItensIniciado =  new SimpleSearch({
		url: urlControlador,
		query: "#busca08",
		field: "ds_nome",
// 		fieldId: "id",
// 		fieldRecords: "obj.registros",
		inputNames: "estadosSelecionados[]",
		defaultValue: [[19, "Rio de Janeiro"], [8, "Espírito Santo"]],
	});
// 	ssBuscaComItensIniciado.select(19, "Rio de Janeiro");
// 	ssBuscaComItensIniciado.select(8, "Espírito Santo");

	//Com container de itens e complemento e iniciado
	var ssBuscaComItensComplementoIniciado =  new SimpleSearch({
//		url: urlControlador, // "/CAD/arquivosExemplo/controlador/consultarCmUf.php",
		response: function( pagina, termo ){
			return  pesquisaOffline( pagina, termo );
		},
		query: "#busca075",
		field: "ds_nome",
// 		fieldId: "id",
// 		fieldRecords: "obj.registros",
		inputNames: "estadosSelecionados[]",
		defaultValue: [[19, "Rio de Janeiro", "Rio de Janeiro - RJ"], [8, "Espírito Santo", "Espírito Santo - ES"]],
		templateComplement: "#ds_nome# - #ds_sigla#",
	});


	//##############################################

	//Usando tabelas
	var ssBuscaComTabelas =  new SimpleSearch({
//		url: urlControlador, // "/CAD/arquivosExemplo/controlador/consultarCmUf.php",
		response: function( pagina, termo ){
			return  pesquisaOffline( pagina, termo );
		},
		query: "#busca10",
		queryId: "#buscaValor10",
		field: "ds_nome",
// 		fieldId: "id",
// 		fieldRecords: "obj.registros",		
		tableTitles: ["Sigla", "Nome"],
		tableFields: ["ds_sigla", "ds_nome"],
	});

	//Usando tabelas com paginação
	var ssBuscaTabelasComPaginacao =  new SimpleSearch({
//		url: urlControlador, // "/CAD/arquivosExemplo/controlador/consultarCmUf.php",
		response: function( pagina, termo ){
			return  pesquisaOffline( pagina, termo );
		},
		query: "#busca11",		
		queryId: "#buscaValor11",	
		field: "ds_nome",
// 		fieldId: "id",
// 		fieldRecords: "obj.registros",
		fieldPages: "obj.navegacao.paginas",
		tableTitles: ["Sigla", "Nome"],
		tableFields: ["ds_sigla", "ds_nome"],
		queryForm: "#busca11",
	});

	//Usando tabelas externas
	var ssBuscaComTabelasExterna =  new SimpleSearch({
//		url: urlControlador, // "/CAD/arquivosExemplo/controlador/consultarCmUf.php",
		response: function( pagina, termo ){
			return  pesquisaOffline( pagina, termo );
		},
		query: "#busca12",
		queryId: "#buscaValor12",
		field: "ds_nome",
// 		fieldId: "id",
// 		fieldRecords: "obj.registros",
		fieldPages: "obj.navegacao.paginas",
		tableTitles: ["Sigla", "Nome"],
		tableFields: ["ds_sigla", "ds_nome"],
		queryContent: "#externo12",
		queryForm: "#busca12",
		tableShowSelect: true, //Para exibir ícone de selecionar
		tableKeepOpen: true, //Para manter aberto ao perder o foco
	});

	//Usando tabelas externas com formulário
	var ssBuscaComTabelasExternaComFormulario =  new SimpleSearch({
//		url: urlControlador, // "/CAD/arquivosExemplo/controlador/consultarCmUf.php",
		response: function( pagina, termo ){
			return  pesquisaOffline( pagina, termo );
		},
		queryButton: "#btnBusca13",
		queryId: "#buscaValor13",
		field: "ds_nome",
// 		fieldId: "id",
// 		fieldRecords: "obj.registros",
		fieldPages: "obj.navegacao.paginas",
		tableTitles: ["Sigla", "Nome"],
		tableFields: ["ds_sigla", "ds_nome"],
		queryForm: "#busca13",
	});

	//Usando tabelas externas com formulário e callback
	var ssBuscaComTabelasExternaComFormularioCallback =  new SimpleSearch({
//		url: urlControlador, // "/CAD/arquivosExemplo/controlador/consultarCmUf.php",
		response: function( pagina, termo ){
			return  pesquisaOffline( pagina, termo );
		},
		queryButton: "#btnBusca14",
		field: "ds_nome",
// 		fieldId: "id",
// 		fieldRecords: "obj.registros",
		fieldPages: "obj.navegacao.paginas",
		tableTitles: ["Sigla", "Nome"],
		tableFields: ["ds_sigla", "ds_nome"],
		queryForm: "#busca14",
		onselect: function( row ){ $("#buscaValor14").val(row.id + " " + row.ds_nome); },
		onreset: function( row ){ $("#buscaValor14").val(""); },		
	});



	//---------------------------------------------------------
	var limparSs = function(){
		ssBuscaBasico.reset();
		ssBuscaEnviandoParametros.reset();
		ssBuscaMinimoParametros.reset();
		ssBuscaComTemporizador.reset();
		ssBuscaComComplemento.reset();
		ssBuscaComTemplate.reset();
		ssBuscaComCallback.reset();
		ssBuscaInicializado.reset();
		ssBuscaBloqueado.reset();
		ssBuscaComItens.reset();
		ssBuscaComItensComplementoIniciado.reset();
		ssBuscaComItensIniciado.reset();
		ssBuscaComTabelas.reset();
		ssBuscaTabelasComPaginacao.reset();
		ssBuscaComTabelasExterna.reset();
		ssBuscaComTabelasExternaComFormulario.reset();
		ssBuscaComTabelasExternaComFormularioCallback.reset();
		
		$( ".item-exemplo .act-view-source-div" ).hide(500);
	}
	
	$("#bt_reset").click( limparSs );
	
	$( document ).on( "click", function( event ) {
		if($(event.target).hasClass("act-view-source-btn")){
			$( event.target ).closest( ".item-exemplo" ).find(".act-view-source-div").toggle(500);
		}
		
	});

}); 
