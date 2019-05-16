/*!
 * Versão 1.0a
 * Última alteração: 13/08/2018 
 * https://brunorelima.github.io/simple-search/
 */

//"use strict";
if (SimpleSearch) console.warn("Atenção, o SimpleSearch foi iniciado mais de uma vez e poderá ocorrer bugs.");
var SimpleSearch =
 class SimpleSearch{
	
	static _getIdentificador(){
		if (this.identificador == null){
			this.identificador = 1;			
		}
		else {
			this.identificador++;			
		}
		return this.identificador;
	}
	
	 constructor(options){
		 if (options.debug) console.log( "SimpleSearch START ", options );
		
		//Valida se o componente já foi iniciado antes
		if (options.query && $(options.query).parent().parent().hasClass("simple-search")){
			console.warn( "Atenção: Foi recriado um componente SimpleSearch utilizando a mesma query '" + options.query + "' que foi utilizada anteriormente. " );
			
			this.query = options.query;			
			this.destroy();
		}
		 
	  	var defaults = {
		  		method: "GET",
		  		fieldId: "id",
		  		fieldRecords: "obj.registros",
		  		fieldSizePages: "obj.propriedades.qtdPaginasTotal",
//		  		fieldPages: "obj.navegacao.paginas",
		  		delaySearch: 200,
		  		whenBlurClear: true,
		    	onsuccess: function(response){
					if (response && response.status && (response.status == 'erro' || response.status == 'warning')){
						console.error("O servidor respondeu com status de erro.");
						if (this.debug) console.log(response);						
						this.onerror(response);
						return false;
					}
					return true;
				},
				onerror: function(response){
					$(this.queryContent).html( "<p class='text-danger'><strong> Erro na resposta do servidor para o simpleSearch [code 10] </strong></p>" );
//					if (response && response.msg) alert(response.msg);
				},
	  	};
	  	
	  	var propriedades = $.extend( {}, defaults, options );
	  	
	  	
		this.paginaAtual = 0;
		this.indexAtual = -1;
		this.arrayRegistros = [];		
		this.logNomeClasse = "[SimpleSearch]";
		
		this.ultimoParametroPesquisado = "";
		this.ultimaPalavraPesquisada = "-1";
		this.isDesbloqueado = true;
		this.isBlocked = false;
		

	    		
		// Validações
		var msgPadrao = "Não foi possível inicializar o SimpleSearch. ";
		
		if (propriedades.query == null && propriedades.queryButton == null) {
			console.trace();
	  		throw Error("Informe o nome do 'query' ou do 'queryButton'. " + this.logNomeClasse);
	  	} 		
 		if (propriedades.field == undefined && propriedades.tableFields == undefined && propriedades.templateField == undefined){
 			console.trace();
 			throw Error(msgPadrao + "Informe o nome da 'field'. ");
 		}
 		if (propriedades.fieldRecords == undefined){
 			console.trace();
 			throw Error(msgPadrao + "Informe o 'fieldRecords'. ");
 		}
 		if (propriedades.url == undefined && propriedades.response == undefined){
 			console.trace();
 			throw Error(msgPadrao + "Informe a 'url' ou 'response'. ");
 		}
 		if ((!propriedades.queryId || $(propriedades.queryId).length == 0) && !propriedades.inputNames && propriedades.onselect == undefined ) {
 			console.trace();
 			console.error("Propriedade 'queryId' não encontrada. Confira a passagem deste parametro. " + this.logNomeClasse);
 			return;
 		}
 
 		this.query = propriedades.query;
		this.url = propriedades.url; 
		this.method = propriedades.method || method;
		this.fieldSizePages = propriedades.fieldSizePages || fieldSizePages;
		this.field = propriedades.field;
		this.fieldId = propriedades.fieldId || fieldId;
		this.queryId = propriedades.queryId || null;
		this.templateField = propriedades.templateField;
		this.fieldRecords = propriedades.fieldRecords;
		this.inputNames = propriedades.inputNames;
		this.minLength = propriedades.minLength || 0;
		this.defaultValue = propriedades.defaultValue;
		this.defaultEmptyMsg = propriedades.defaultEmptyMsg;
		this.tableTitles = propriedades.tableTitles;
		this.tableFields = propriedades.tableFields;
		this.tableFieldsTooltips = propriedades.tableFieldsTooltips;
		this.queryContent = propriedades.queryContent;
		this.queryContentExterno = (propriedades.queryContent) ? true : false;
		this.queryButton = propriedades.queryButton;
		this.queryForm = propriedades.queryForm;
		this.fieldPages = propriedades.fieldPages;
		this.paramSearch = propriedades.paramSearch || $( this.query ).attr("name") || "busca";
		this.delayAutoSearch = propriedades.delayAutoSearch || -1;
		this.delaySearch = propriedades.delaySearch;
		this.autoIniciarStarted = false;
		this.templateComplement = propriedades.templateComplement;
		this.tableShowSelect = propriedades.tableShowSelect;
		this.tableKeepOpen = (propriedades.tableKeepOpen == true);
		this.debug = (propriedades.debug == true);
		this.whenBlurClear = (propriedades.whenBlurClear == true);
		this.response = propriedades.response;
		this.tableLastColumn = propriedades.tableLastColumn;
		this.tableShowClose = propriedades.tableShowClose;
		this.whenSelectKeepOpen = propriedades.whenSelectKeepOpen;
		this.whenEnableReset = propriedades.whenEnableReset || true;
		this.whenNullSetEmpty = propriedades.whenNullSetEmpty || false;
		this.disableSelectRow = propriedades.disableSelectRow || false;
		this.data = propriedades.data || function(){ return ""; };
		this.onselect = propriedades.onselect || function(){};
		this.onreset = propriedades.onreset || function(){};
		this.onsuccess = propriedades.onsuccess || function( response ){ return true; };
		this.oncomplete = propriedades.oncomplete || function(){ };
		this.onerror = propriedades.onerror || function( response ){ };
		this.onremoveselecteditem = propriedades.onremoveselecteditem || function( itemId ){ };
		this.responseChange = propriedades.responseChange || function( response ){ return response; };
		
		this.containerAutoComplete = "#containerSimpleSearch" + SimpleSearch._getIdentificador();
		this.classResultadoPesquisa = "simpleSearchResult";
		this.classDestinoConteudo = "containerResult";
		this.classItensSelecionados = "containerItensSelecionados";
		this.classComplemento = "complemento";
		this.classLinhaSelecionada = "simpleSearchLinhaSelecionada";
		
		this._logDebug( "container " + this.containerAutoComplete );
		
		if (this.disableSelectRow != true){
			this.classLinhaSelecionada = (propriedades.tableFields) ? "info" : "active";			
		}

		if (this.query){
			
			//Se necessário adiciona alguns elementos ao seletor
			//Hack para funcionar em versões sem Bootstrap
			$(this.query).addClass("form-control");
			$(this.query).width("");	
			
			// Adiciona elementos adicionais		
			$(this.query).wrap( "<div id='" + this.containerAutoComplete.substring(1) + "' class='simple-search'></div>" )
			$(this.query).wrap( "<div class='input-group'></div>" )
			$(this.query).after("<span class='input-group-addon btn '>  <span class='glyphicon glyphicon-search text-primary'></span> </span> ");
			
			if (this.templateComplement){
				$(this.query).after("<div class='" + this.classComplemento + " form-control' style='display: none; height: auto; resize: none;' readonly ></div>");
			}
			
			$(this.containerAutoComplete).append("<div class='" + this.classDestinoConteudo + "'></div>");
			
			if (this.inputNames){
				$(this.containerAutoComplete).append("<div class='" + this.classItensSelecionados + "'></div>");
			}			
			
			// Manipula eventos e propriedades
			$(this.query).attr("autocomplete", "off");    		
			$(this.query).keydown( this._acaoPressKey.bind(this) );		
	
	    	// Retira item selecionado ao clicar na caixa de seleção
	    	$(this.query).click($.proxy(function () {
	    		$(this.resultadoPesquisa + " ." + this.classLinhaSelecionada).removeClass(this.classLinhaSelecionada);
	    	},this));
	    	
		}
		else if (this.queryButton && !this.queryContent  ){
			$(this.queryButton).keydown( this._acaoPressKey.bind(this) );
			
			// Adiciona elementos adicionais	
			$(this.queryButton).parent().parent().wrap( "<div id='" + this.containerAutoComplete.substring(1) + "'></div>" )
			$(this.queryButton).parent().parent().after( "<div class='" + this.classDestinoConteudo + "'></div>" )
		}
		
		
		//Atualizadno parametros
		this.resultadoPesquisa 	= (this.queryContent) ? this.queryContent : this.containerAutoComplete + " ." + this.classResultadoPesquisa;
		this.queryContent 	= (this.queryContent) ? this.queryContent : this.containerAutoComplete + " ." + this.classDestinoConteudo;
		this.destinoItensSelecionados = this.containerAutoComplete + " ." + this.classItensSelecionados;
		
		if (this.inputNames && this.inputNames.indexOf("[]") == -1){
			if (this.debug) console.log("O paramêtro 'inputNames' não estava no formato de vetor, foi adicionado '[]' no final do nome para fazer a conversão.");
			this.inputNames += "[]";
		}
		
    	
		this._adicionaEventos();	
		this._adicionaValorPadrao();
		
		this._logDebug( "function constructor() - END" );
	 }
	 
	_set(query, value){
		if ( typeof query === 'string' || query instanceof String ) {
			query = document.querySelector( query ); 
		}		
		if (query) {
			query.value = value;			
		}
	}
	 
	 _logDebug( msg ){
		 if (this.debug) {
			 if (!this._prefixoDebug){
				 this._prefixoDebug = "SimpleSearch:" + (this.query || this.queryButton || "???") + " | ";
			 }
			 
			 console.log( this._prefixoDebug + msg );
		 }
	 }
	 
	 _adicionaValorPadrao(){
		 if (this.defaultValue){
			 //Se não for array
			if (this.defaultValue[0] && !Array.isArray(this.defaultValue[0]) && this.defaultValue[1] && !Array.isArray(this.defaultValue[1]) ){
				var complemento = (this.defaultValue[2]) ? this.defaultValue[2] : ""; 
				this.select(this.defaultValue[0], this.defaultValue[1], complemento);
			}
			else if (Array.isArray(this.defaultValue)){
				this.defaultValue.forEach(function(item){
					if (item[0] && item[1]){
						var complemento = (item[2]) ? item[2] : "";
						this.select(item[0], item[1], complemento);
					};
				}, this);
			}
		}
	 }
	 
	 _adicionaEventos(){
		 this._logDebug( "function _adicionaEventos()" );
		 
		 if (this.query){
		 
			// Limpa caixa ao perder foco
			$(document).click($.proxy(function (event) {
				if ($(this.queryContent).html() != "") {
					if(
							!$(event.target).hasClass("clk-btn-next") &&
							!$(event.target).hasClass("clk-btn-prev") &&
							!$(event.target).attr("data-pagina") &&
							$(event.target).closest(this.containerAutoComplete).length == 0
						) {
			        	if (this.tableKeepOpen != true){
			        		this._limparConteudo();
			        	}			        	
			        }
			    }
				//Limpando o valor caso digitar algo e perder o foco sem nem pesquisar
				else if ( this.isDesbloqueado && this.whenBlurClear && $(this.query).val() && !$(this.resultadoPesquisa).html()) {
                    this._limparConteudo();
                }
			},this));
			
			// Se clicar no botão de pesquisa executa ação
			$(this.query).parent().find(".input-group-addon").click($.proxy(function () {
				this._acaoBotaoPesquisarOuDesbloquear();
			},this));
			
			var destinoTargetDoubleClick = (this.templateComplement) ? this.containerAutoComplete + " ." + this.classComplemento : this.query;
			
	    	// Adiciona eventos
	    	$(destinoTargetDoubleClick).dblclick($.proxy(function () {
	    		this._desbloquear( true );
	    		this._setComplemento( "" );
	    		
	    		$(this.query).show();
				$(this.containerAutoComplete + " ." + this.classComplemento ).hide();
				$(this.query).focus();
	    	},this)); 	

	    	$(this.query).parent().find(".glyphicon").parent().addClass("btn");
	    	
		 }
		 
		 else if (this.queryButton){
			// Se clicar no botão de pesquisa executa ação
			$(this.queryButton).click($.proxy(function () {
				if (this.isDesbloqueado){
					this._pesquisar(1);    				
				}
			},this));			 
		 }
		 
		 if (this.queryForm){
			 if ($(this.queryForm).find(".search-on-enter") != null){
				 $(this.queryForm).find(".search-on-enter").attr("autocomplete", "off");				 
				 $(this.queryForm).find(".search-on-enter").keydown( this._acaoPressKey.bind(this) );
			 }
		 }
		 
	 }
	 
	 _removeEventos(){
		 this._logDebug( "function _removeEventos()" );
		 
		 if (this.query){
			 $(this.query).unbind( "dblclick" );
			 $(this.query).parent().find(".input-group-addon").unbind( "click" );
			 $(this.query).parent().find(".glyphicon").unbind( "click" );
			 $(this.query).parent().find(".glyphicon").parent().removeClass("btn");		 
		 }
		 else if (this.queryButton){
			 $(this.queryButton).unbind( "click" );
		 }
	 }
	
	 
	_desbloquear( setFocus ){
		 this.isDesbloqueado = true;
		 $(this.query).removeAttr( "readonly");
		 $(this.query).parent().find(".glyphicon").removeClass("glyphicon-remove").addClass("glyphicon-search");
			
			if (setFocus == true){
//				$(this.query).focus();
				$(this.query).select();				
			}
			
			if (this.queryId) {
				$(this.queryId).val("");
			}
	};
	 
	_acaoBotaoPesquisarOuDesbloquear(){
		if (this.isDesbloqueado){
			this._pesquisar(1); 
		}
		else {
			this._desbloquear( true );
			this._setComplemento( "" );
			
			$(this.query).show();
			$(this.containerAutoComplete + " ." + this.classComplemento ).hide();
			
			if (this.whenEnableReset == true){
				this.reset();
			}
		}		 
	}
	

	_pesquisar( pagina ){
		this._logDebug( "function _pesquisar(" + pagina + ") - START" );
		
		//Se tiver iniciado um temporizador, cancela ele pra poder iniciar outro
		if (this.idTimeoutAutoSearch){
			clearTimeout(this.idTimeoutAutoSearch);
			this.autoIniciarStarted = false;
		}
		
		//Fazendo controle para não deixar fazer várias pesquisas em mínimo intervalo de tempo
		if (!this.idTimeoutSearch){
			this.idTimeoutSearch = window.setTimeout($.proxy(function () {
				clearTimeout(this.idTimeoutSearch);
				this.idTimeoutSearch = null;
			},this), this.delaySearch);
		}
		else {
			if (this.debug) console.log("Pesquisa cancelada. O intervalo da última pesquisa foi muito pequeno.");
			return;
		}
		
		if (this.query && $(this.query).attr( "readonly") == "readonly" || this.isDesbloqueado == false ){
			this.autoIniciarStarted = false;
			return;
		}
		
		if (this.query && $(this.query).val().length < this.minLength){
			if (this.debug) console.log("Para pesquisar precisa digitar pelo menos " + this.minLength + " caracteres.");			
			var msg = "<p><strong>Para pesquisar precisa digitar pelo menos " + this.minLength + " caracteres. </strong></p>";
			$(this.queryContent).html(msg);
			
			this.autoIniciarStarted = false;
			return;
		}
		
		pagina = pagina || 1;
		
		var params = "pagina=" + pagina;
		params += (this.query) ? "&" + this.paramSearch + "=" + $(this.query).val() : "";
		params += (this.queryForm) ? "&" + $(this.queryForm).serialize() : "";
		// Adiciona parametros adicionais se tiver
		var paramData = (this.data && typeof this.data === "function") ? this.data() : this.data;
		params += ((paramData && paramData != "") ? "&" + jQuery.param(paramData) : "");
		
		/*
		//Verifica se esta repetindo a busca
		if (this.ultimoParametroPesquisado == params && $(this.queryContent).html() != ""){
			if (this.debug) console.log("Repetiu a busca: " + params);
			this.autoIniciarStarted = false;
			return;
		}
		*/
		
		this.ultimaPalavraPesquisada = $(this.query).val();
		
		
		this.ultimoParametroPesquisado = params;
		this.paginaAtual = (pagina != undefined) ? pagina : this.paginaAtual;
		
		if (this.response){
			this._trataRepostaServidor( this.response( pagina, $(this.query).val() ) );
		}
		else {
			if (this.ajax){
				this.ajax.abort();
			}
			
			this.ajax = $.ajax({
				url: this.url,
				data: params,
				dataType: "json",
				method: this.method,
				context: this,
				success: function( response ) {
					this._trataRepostaServidor( response );
				  },
				  error: function(error){				  
					  if (error.readyState != 0){
						  console.error(error);					  
					  }				  
					  
					  $(this.queryContent).html( "<p class='text-danger'><strong> Erro na resposta do servidor para o simpleSearch [code 20] </strong></p>" );
					  this.onerror( error );
				  },
				  beforeSend: function(){
					  var msg = " <div class='progress' role='progressbar' style='height: 10px;'> <div class='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='100' aria-valuemin='0' aria-valuemax='100' style='width: 100%' >";
					  msg += "<span class='sr-only glyphicon glyphicon-hourglass text-primary'><small><strong>Carregando... </strong></small></span>  </div> </div>";
					  $(this.queryContent).html(msg);				  
				  },
				  complete: function(){				 
					 this.autoIniciarStarted = false;
					 
					 var conteudo = $(this.queryContent).html();
					 if (conteudo && conteudo.indexOf("progressbar") > 0){
						 $(this.queryContent).html("");
					 }
				  }
			});
		}
		
		this._logDebug( "function _pesquisar(" + pagina + ") - END" );
	};
	
	_trataRepostaServidor( response ){
		response = this.responseChange(response);
		
		var continuarExecutando = this.onsuccess( response );
		if ( continuarExecutando ){
		
			try{			
				var obj = (this.fieldRecords != "") ? eval("response." + this.fieldRecords) : response;
			}catch(err){
				if (this.debug) console.log(err);
				if (this.debug) console.log(response);

				$(this.queryContent).html( "<p class='text-danger'><strong> Erro na resposta do servidor para o simpleSearch [code 30] </strong></p>" );
				this.onerror( response );
				throw Error("Parâmetro configurado para 'fieldRecords' incorreto. Confira a resposta do servidor. [fieldRecords:" + this.fieldRecords + "]");
			}
			
			if (typeof obj == "undefined"){
				console.error("Objeto de registros retornados pelo sistema indefinido. Confira se o argumento de 'fieldRecords' está configurado correto ou retornou algum erro do servidor. " + this.logNomeClasse);
				this.onerror( response );
				return;
			}
			
			this.arrayRegistros = (this.fieldRecords && obj) ? obj : response.obj;
			
			if ((!this.field && !this.tableFields && !this.templateField) || (!this.templateField && !this.tableFields && this.arrayRegistros[0] && this.arrayRegistros[0][this.field] == undefined)){
				console.error("Valor da 'field' do item está indefinido, confira se o parametro passado está correto. " + this.logNomeClasse);
			}
			if (this.fieldId && this.arrayRegistros[0] && this.arrayRegistros[0][this.fieldId] == undefined){
				console.error("Valor da 'fieldId' do item está indefinido, confira se o parametro passado está correto. " + this.logNomeClasse);
			}
			
			
			if (this.arrayRegistros != null && this.arrayRegistros.length > 0){
				var htmlSaida = "";
				
				if (this.tableKeepOpen == true){
					htmlSaida += "<div> ";
					
					if (this.tableShowClose){
						htmlSaida += "  <div class='text-danger pull-right acao-fechar' aria-hidden='true' title='Fechar tabela' role='button'> <h6> <span class='glyphicon glyphicon-remove text-danger'></span> Fechar </h6> </div> ";
					}
				}
				
				if (!this.tableFields){
				
    				htmlSaida += "<ul class='list-group " + this.classResultadoPesquisa + "' style='margin-bottom: 0;'>";
    				
    				var valor = "";
    				this.arrayRegistros.forEach(function(item, index){

    					//Complemento pra verificar se tem que desativar a linha ou não
    					var complementoLinha = (this.inputNames && ($(this.destinoItensSelecionados + " input[value='" + item[this.fieldId] + "']").length != 0)) ? "disabled" : "";
						valor = (this.templateField) ? this._atualizaValoresTemplate(item, this.templateField) : item[this.field];
						valor = (!valor && this.whenNullSetEmpty) ? "" : valor;

						//Verifica se tem templateComplement para exibir em duas linhas ou não
						valor = (this.templateComplement) ? "<strong>" + valor + "</strong> <br/>" + "<small>" + this._atualizaValoresTemplate(item, this.templateComplement) + "</small>" : valor;
						
    					htmlSaida += "<li class='list-group-item linhaSs " + complementoLinha + "' role='button' >" + valor + " </li>"; 
    				}, this);
    				htmlSaida += "</ul>";	    				
    				
				}
				else {
					htmlSaida += "<div class='table-responsive simple-search'>"; 
					htmlSaida += "<table class='table table-bordered table-striped table-hover " + this.classResultadoPesquisa + "' style='margin-bottom: 0;'>";
					
					//Percorrendo header
					if (this.tableTitles){
						htmlSaida += "<tr>";
						
						if (this.tableShowSelect){
							htmlSaida += "<td width='42px'> </td>";
						}
						
						this.tableTitles.forEach(function(titulo, index){
							htmlSaida += "<th> " + titulo + " </th>";
						});
						
						if (this.tableLastColumn){
							htmlSaida += "<th></th>";
						}
						
						htmlSaida += "</tr>";    						
					}
					
					var complementoCss = (this.disableSelectRow != true) ? "role='button'" : "";
					
					//Percorrendo registros    						
					this.arrayRegistros.forEach(function(registro, index){
					htmlSaida += "<tr class='linhaSs' " + complementoCss + ">"; //tabindex='0'
						
						if (this.tableShowSelect){
							htmlSaida += "<td class='text-center'> <span class='glyphicon glyphicon-ok'></span>  </td>";
						}
						
						var valor = "";
						var tooltip = "";
						this.tableFields.forEach(function(col, index){
							valor = (col.indexOf(" ") >= 0 ) ? this._atualizaValoresTemplate(registro, col) : registro[col]; //Adicionando suporte a template
							valor = (!valor && this.whenNullSetEmpty) ? "" : valor;
							
							tooltip = (this.tableFieldsTooltips && this.tableFieldsTooltips[index]) ? this.tableFieldsTooltips[index] : "";
							if (tooltip != ""){								
								tooltip = (tooltip.indexOf(" ") >= 0 ) ? this._atualizaValoresTemplate(registro, tooltip) : this._atualizaValoresTemplate(registro, "#"+tooltip+"#"); //Adicionando suporte a template
								tooltip = " title='" + tooltip + "'";								
							}
							htmlSaida += "<td" + tooltip + ">" + valor + "</td>";							
						}, this);
						
						if (this.tableLastColumn){
							if (this.tableLastColumn ==='function' || this.tableLastColumn instanceof Function){
								htmlSaida += "<td> " + this._atualizaValoresTemplate(registro, this.tableLastColumn()) + " </td>";
							}
//							if (typeof this.tableLastColumn === 'string' || this.tableLastColumn instanceof String){
							else {
								htmlSaida += "<td> " + this._atualizaValoresTemplate(registro, this.tableLastColumn) + " </td>";								
							}
						}
						
						htmlSaida += "</tr>";
					}, this);
						
					htmlSaida += "</table>";
					htmlSaida += "</div>";
					
				}
				
				
				// Controle das paginas
//				var qtdPaginasTotal = (isNaN(this.fieldSizePages)) ? eval("response." + this.fieldSizePages) || -1 : this.fieldSizePages;
				var qtdPaginasTotal = -1;
				if (!isNaN(this.fieldSizePages)){
					qtdPaginasTotal = this.fieldSizePages;
				}
				else {
					try{
						var aux = eval("response." + this.fieldSizePages) || -1;
						qtdPaginasTotal = aux;
					}catch(error){
						console.warn("Erro ao tentar pegar o valor de fieldSizePages. ", error);
					}
				}
				
				var complementoBotaoAnterior = (this.paginaAtual == 1) ? "disabled" : "";
				var complementoBotaoProximo = (this.paginaAtual == qtdPaginasTotal) ? "disabled" : "";
				
				
				// Adiciona paginação
				if (qtdPaginasTotal && qtdPaginasTotal > 1 ){
					this.paginaAtual = (this.paginaAtual > (qtdPaginasTotal + 1)) ? (qtdPaginasTotal + 1) : this.paginaAtual;
					
					var dadosPaginacao = null;
					
					try{
						dadosPaginacao = (this.fieldPages) ? eval("response." + this.fieldPages) : null;
					}catch(error){
						console.warn("Erro ao usar o parâmetro 'fieldPages': " + this.fieldPages);
					}
					
					if (dadosPaginacao){
						htmlSaida += "<div class='text-center simple-search'> <div class='btn-group' role='group'> ";
						htmlSaida += " <ul class='pagination'> ";
    					
    					if (dadosPaginacao){
    						dadosPaginacao.forEach(function(item, index){
    							var linhaTemplate = "  <li class='#active#' data-pagina='#pagina#' ><a href='javascript:void(0)' data-pagina='#pagina#'>#legenda#</a></li> ";
    							htmlSaida += this._atualizaValoresTemplate(item, linhaTemplate);
    						}, this);
    					}
    					
    					htmlSaida += " </ul>  ";    					
    					htmlSaida += "</div></div>";
					}
					else {
    					htmlSaida += "<div class='btn-group btn-group-justified' role='group'>";    				
    					htmlSaida += "<div class='btn-group' role='group'> <button type='button' class='btn btn-primary clk-btn-prev' " + complementoBotaoAnterior + "> Anterior </button>  </div>";
    					htmlSaida += "<div class='btn-group' role='group'> <button type='button' class='btn btn-primary clk-btn-next' " + complementoBotaoProximo + "> Próxima </button>  </div>";    					
    					htmlSaida += "</div>";    						
					}
					
				} 
				
				if (this.queryContentExterno){
					htmlSaida += "</div> ";
				}
				
				$(this.queryContent).html(htmlSaida);
				
				if (this.tableKeepOpen == true){
					$(this.queryContent).undelegate(".acao-fechar", "click");
    				$(this.queryContent).delegate(".acao-fechar", "click", this._limparConteudo.bind(this));	    					
				}
				
				if (this.disableSelectRow != true){
					$(this.queryContent).undelegate(".linhaSs", "click");				
					$(this.queryContent).delegate(".linhaSs:not(.disabled)", "click", this._acaoClickMouse.bind(this));
				}
				
				$(this.resultadoPesquisa).undelegate(".linhaSs", "mouseover");
				$(this.resultadoPesquisa).delegate(".linhaSs", "mouseover", this._acaoMouseOver.bind(this));

				$(this.queryContent).undelegate(".clk-btn-prev", "click");
				$(this.queryContent).delegate(".clk-btn-prev", "click", this._voltaPagina.bind(this));
				
				$(this.queryContent).undelegate(".clk-btn-next", "click");
				$(this.queryContent).delegate(".clk-btn-next", "click", this._proximaPagina.bind(this));
				
				$(this.queryContent).undelegate(".pagination li", "click");				
				$(this.queryContent).delegate(".pagination li", "click", $.proxy(function (event) {
					var indexPaginacao = $(this.queryContent + " .pagination li").index( $(event.currentTarget) );
					if (indexPaginacao >= 0){
						var domPaginaPaginacao = $(this.queryContent + " .pagination li")[indexPaginacao];
						var paginaPaginacao = $(domPaginaPaginacao).data("pagina");
						this._pesquisar(paginaPaginacao);
					}
		    	},this));    				
				
			}
			else {
				this.setMessage( this.defaultEmptyMsg );
				this.paginaAtual = ( this.paginaAtual - 1);
			}
			$(this.query).focus();
		}
		else {
			this._logDebug( "function _trataRepostaServidor - Quase FIM : continuarExecutando = false" );
		}
		this.oncomplete( response );
		
	}
	
	_atualizaValoresTemplate(row, templateField){
		$.each(row, function(campo, valor) {
			var __token = "#" + campo + "#";
            var __er = new RegExp(__token, "ig");
            templateField = templateField.replace(__er, valor == null ? '' : valor);
		});
		
		//Limpando os templates não encontrados
		var fimCorte = "";
		var inicioCorte = templateField.indexOf("#");
		var count = (templateField.match(/#/g) || []).length;
		
		while(inicioCorte >= 0 && count >= 2){
			fimCorte = templateField.indexOf("#", inicioCorte+1);
			if (fimCorte > 0) {
				templateField = templateField.substring(0, inicioCorte) +  templateField.substring(fimCorte+1);				
			}
			
			//Preparando para continuação do laço
			inicioCorte = templateField.indexOf("#");
			count = (templateField.match(/#/g) || []).length;
		}
		
		return templateField;
	}
	
	_selecionaLinha( row ){
		if (!row){
			return;
		}
		
		if (!this.whenSelectKeepOpen){
			this._limparConteudo();
		}
		
		var complemento = (this.templateComplement) ? this._atualizaValoresTemplate(row, this.templateComplement) : "";
		this.select( row[this.fieldId], row[this.field], complemento, true, row );		
		this.onselect( row );
		
	};
	
	_setComplemento( complemento ){
		if (this.templateComplement){
			$(this.containerAutoComplete + " ." + this.classComplemento ).html( complemento );
			
			$(this.query).hide();
			$(this.containerAutoComplete + " ." + this.classComplemento ).show();
		}
	}
	
	_geraComplementoElemento( complemento ){
		return (this.inputNames && complemento) ? "<div class='form-control' readonly style='height: auto; font-size: 0.85em;'> " + complemento + " </div>" : "";
	}
	
	_acaoClickMouse(event){
		this.indexAtual = $(this.resultadoPesquisa + " .linhaSs").index( $(event.currentTarget) );
		
		if (!$(this.resultadoPesquisa + " .linhaSs").eq(this.indexAtual).hasClass("disabled") && $(this.resultadoPesquisa + " .linhaSs").eq(this.indexAtual).attr("role") == "button"){
			$(this.resultadoPesquisa + " .linhaSs").eq(this.indexAtual).addClass("disabled");
			this._selecionaLinha( this.arrayRegistros[this.indexAtual] );			
		}
		else {
			this.focus();			
		}		
	};

	_acaoClickMouseRemoverItem(event){
		//Apenas insere evento se tiver desbloqueado
		if ( this.isBlocked == false ){
			$(event.currentTarget).parent().parent().remove();
			this.onremoveselecteditem( $(event.currentTarget).parent().parent().find("input[type='hidden']").val() );
		}
	};	

	_acaoMouseOver(event){
		$(this.resultadoPesquisa + " ." + this.classLinhaSelecionada).removeClass(this.classLinhaSelecionada);
		if (!$(event.currentTarget).hasClass("disabled")){
			$(event.currentTarget).addClass(this.classLinhaSelecionada);			
		}
	};
	
	_acaoPressKey(event){
		// Se estiver bloqueado não realiza nenhuma ação
		if ($(this.query).attr( "readonly" )){ 
			return;    			
		}
		
		switch (event.keyCode) {
			case 13: // Tecla ENTER
				this.indexAtual = $(this.resultadoPesquisa + " .linhaSs").index( $(this.resultadoPesquisa + " ." + this.classLinhaSelecionada) );
				if (this.indexAtual >= 0){
					if (!$(this.resultadoPesquisa + " .linhaSs").eq(this.indexAtual).hasClass("disabled")){
						$(this.resultadoPesquisa + " .linhaSs").eq(this.indexAtual).addClass("disabled");
						this._selecionaLinha( this.arrayRegistros[this.indexAtual] );			
					}
					
					event.preventDefault();
				}
				else {
					this._pesquisar(1);
					event.preventDefault();
				}
				break;

			case 27: // Tecla Esc
				this._limparConteudo();
				break;
				
			case 9: // Tecla TAB
				//Limpando o valor caso digitar algo e perder o foco
				if (this.tableKeepOpen != true && this.isDesbloqueado && this.whenBlurClear && $(this.query).val() ){
					this._limparConteudo();
				}
				break;
				
			case 37: // Tecla para pra esquerda
				this._voltaPagina();
				break;
				
			case 39: // Tecla para pra direita
				this._proximaPagina();
				break;
				
			case 40: // Tecla para baixo				
				this.indexAtual = $(this.resultadoPesquisa + " .linhaSs:not(.disabled)").index( $(this.resultadoPesquisa + " ." + this.classLinhaSelecionada) );
				this.indexAtual++; 
            	
            	$(this.resultadoPesquisa + " ." + this.classLinhaSelecionada).removeClass(this.classLinhaSelecionada);
            	$(this.resultadoPesquisa + " .linhaSs:not(.disabled):eq(" + this.indexAtual + ")").addClass(this.classLinhaSelecionada);
            	event.preventDefault();
				break;
				
			case 38: // Tecla para cima
            	this.indexAtual = $(this.resultadoPesquisa + " .linhaSs:not(.disabled)").index( $(this.resultadoPesquisa + " ." + this.classLinhaSelecionada) );            	
            	this.indexAtual--; 
            	
            	$(this.resultadoPesquisa + " ." + this.classLinhaSelecionada).removeClass(this.classLinhaSelecionada);
            	$(this.resultadoPesquisa + " .linhaSs:not(.disabled):eq(" + this.indexAtual + ")").addClass(this.classLinhaSelecionada);
            	event.preventDefault();
				break;
				
			case 33: // Tecla PAGE UP
				this._voltaPagina();
				event.preventDefault();
				break;
				
			case 34: // Tecla PAGE DOWN
				this._proximaPagina();
				event.preventDefault();
				break;
				
			case 16: break; // Tecla SHIFT
			case 17: break; // Tecla CTRL
			case 18: break; // Tecla ALT
			case 20: break; // Tecla CAPS LOCK
			case 32: break; // Tecla SPACE
			case 36: break; // Tecla HOME
			case 35: break; // Tecla END
			case 144: break; // Tecla NUM LOCK
				
			default:
				$(this.resultadoPesquisa + " ." + this.classLinhaSelecionada).removeClass(this.classLinhaSelecionada);
				
				if (this.delayAutoSearch != -1){
					
					//Se tiver iniciado um temporizador, cancela ele pra poder iniciar outro
					if (this.idTimeoutAutoSearch){
						clearTimeout(this.idTimeoutAutoSearch);
						this.autoIniciarStarted = false;
					}
					
					//Coloca um delay para fazer a busca 
					if (this.autoIniciarStarted == false){
						this.autoIniciarStarted = true;
						this.idTimeoutAutoSearch = window.setTimeout($.proxy(function () {
							this._pesquisar(1);
						},this), this.delayAutoSearch);
					}
				}			
				break;
		}		
            
	};
	
	_proximaPagina(){
		if ( 
				(this.ultimaPalavraPesquisada != "-1" && this.ultimaPalavraPesquisada != $(this.query).val()) ||
				(this.ultimaPalavraPesquisada == "" && $(this.query).val() == "" &&  $(this.queryContent).html() == "" )				
			){
			this.paginaAtual = 0;
		}
		
		if ( (
				this.ultimaPalavraPesquisada == $(this.query).val() &&
				$(this.queryContent).html() != ""
			  ) &&				
				( 
				(($(".clk-btn-next").length == 0) || 
				 ($(".clk-btn-next[disabled]").length > 0)) 
				 && 				 						 
				 (($(".pagination").length == 0) || 
				($(".pagination li:last-child.active").length > 0))  				 						 
				)				 
			){
			if (this.debug) console.log("Pesquisa cancelada por usar mesmo termo pesquisado.");
			return;
		}
		
		this._pesquisar(this.paginaAtual+1);
	};
	
	_voltaPagina(){
		if ( (this.ultimaPalavraPesquisada == $(this.query).val()) &&
				( 
				(($(".clk-btn-prev").length == 0) || 
				 ($(".clk-btn-prev[disabled]").length > 0)) 
				 && 				 						 
				 (($(".pagination").length == 0) || 
				($(".pagination li:first-child.active").length > 0))  				 						 
				)				 
			){
			if (this.debug) console.log("Pesquisa cancelada por usar mesmo termo pesquisado.");
			return;
		}
		
		this._pesquisar( (this.paginaAtual > 1) ? this.paginaAtual-1 : 1 );
	};
	
	_limparConteudo(){		
		this._logDebug( "function _limparConteudo() - START" );
		
		var queryContent = document.querySelector( this.queryContent );
		if (queryContent) queryContent.innerHTML = "";
		
		this.ultimoParametroPesquisado = "";
		this.ultimaPalavraPesquisada = "-1";
		this.paginaAtual = 0;
		
		if (this.whenBlurClear && this.queryId && !$(this.queryId).val()){
			this._set(this.query, "");
			this._set(this.queryId, "");
		}
		
		this._logDebug( "function _limparConteudo() - END" );
	};
	
	reset(){
		this._logDebug( "function reset() - START" );
		
		if (!this.isBlocked){
			$(this.query).val( "" );
			$(this.destinoItensSelecionados).html("");
			this._setComplemento( "" );
			this._limparConteudo();
			this._desbloquear( false );
			
			$(this.query).show();
			$(this.containerAutoComplete + " ." + this.classComplemento ).hide();
		}
		
//		this._adicionaValorPadrao();
		
		this._logDebug( "function onreset() - START" );
		this.onreset();		
		this._logDebug( "function onreset() - END" );
		this._logDebug( "function reset() - END" );
	};
	
	/**
	 * Retira o componente SimpleSearch do elemento
	 */
	destroy(){
		this._logDebug( "function destroy()" );
		
		var input = $( this.query );
		var idSimpleSearch = $( this.query ).parent().parent();
		
		$( this.query ).parent().parent().after( input );
		$( idSimpleSearch ).remove();
		
		$( this.query ).removeClass("form-control");
		$( this.query ).removeAttr("autocomplete");
	}
	
	select( id, descricao, complemento, setFocus, row ){
		this._logDebug( "function select() - START" );
		
		var descricao = (this.templateField && row) ? this._atualizaValoresTemplate(row, this.templateField) : descricao;
		//Verifica se vai usar o modo que adiciona vários itens num container, ou se pode selecionar apenas um item no próprio seletor
		if (!this.inputNames){
			$(this.query).val( descricao );
			$(this.query).attr( "readonly", "readonly" );
			$(this.query).parent().find(".glyphicon").removeClass("glyphicon-search").addClass("glyphicon-remove");
			
			if (this.queryId){
				$(this.queryId).val( (id) ? id : "" );    			
			}
			
			if (this.query){
				this.isDesbloqueado = false;				
			}
			
			if (complemento){
				this._setComplemento( "<strong>" + descricao + "</strong><br>" + complemento );
			}
		}
		
		//Adiciona na lista de itens selecionados
		else if (this.inputNames && ($(this.destinoItensSelecionados + " input[value='" + id + "']").length == 0)){
			var linha = "<div> <div class='input-group input-group-sm'> ";
			
			if (!this.templateComplement){
				linha += "<input type='hidden' name='" + this.inputNames + "' value='" + id + "' />";				
				linha += "<input class='form-control' name='_" + this.inputNames + "' value='" + descricao + "' readonly />";				
			}
			else {
				linha += "<input type='hidden' name='" + this.inputNames + "' value='" + id + "' />";
				linha += "<input type='hidden' name='_" + this.inputNames + "' value='" + descricao + "' />";
				linha += "<div class='form-control' style='height: auto; resize: none;' readonly > <strong>" + descricao + "</strong><br>" + complemento + "</div>";
			}
			
			linha += "<span class='input-group-addon btn itemSs'>  <span class='glyphicon glyphicon-remove text-primary'></span> </span> ";
			linha += " </div> </div>";
			$(this.destinoItensSelecionados).append(linha);
			
			
			if (setFocus == true){
				$(this.query).focus();
			}
			
			$(this.destinoItensSelecionados).undelegate(".itemSs", "click");				
			$(this.destinoItensSelecionados).delegate(".itemSs", "click", this._acaoClickMouseRemoverItem.bind(this));
		}
		
		this._logDebug( "function select() - END" );
	};
	
	disabled(){
		this._logDebug( "function disabled()" );
		
		this.isBlocked = true;
		
		if (this.query){
			$(this.query).attr( "readonly", "readonly" );
			$(this.query).parent().find(".glyphicon").removeClass("glyphicon-search").removeClass("glyphicon-remove").addClass("glyphicon-lock");			
		}
		else if (this.queryButton){
			$(this.queryButton).attr( "disabled", "disabled" );
		}
		
		//Se for no formato multi itens, desabilita os itens selecionados, para NÃO permitir remover os itens
		if (this.inputNames){
			$( this. getContainer() ).find(".itemSs").attr( "disabled", "disabled" );
		}
		
		this._removeEventos();
	};
	
	enabled(){
		this._logDebug( "function enabled()" );
		
		this.isBlocked = false;
		this._adicionaEventos();
		
		if (this.query){
			if (this.isDesbloqueado){
				$(this.query).removeAttr( "readonly");
				$(this.query).parent().find(".glyphicon").removeClass("glyphicon-lock").addClass("glyphicon-search").removeClass("glyphicon-remove");
				
				//Se for no formato multi itens, habilita os itens selecionados, para PERMITIR remover os itens
				if (this.inputNames){
					$( this. getContainer() ).find(".itemSs").removeAttr( "disabled" );
				}
			}
			else {
				$(this.query).parent().find(".glyphicon").removeClass("glyphicon-lock").removeClass("glyphicon-search").addClass("glyphicon-remove");
			}			
		}
		else if (this.queryButton){
			$(this.queryButton).removeAttr( "disabled");
		}
	};
	
	focus(){
		this._logDebug( "function focus()" );
		$(this.query).focus();
	};
	
	search( pagina ){
		this._logDebug( "function search()" );
		this._pesquisar( pagina );
	};
  
	getContainer(){
		return this.containerAutoComplete;
	};

	disableRowByIndex( index ){
		var container = (this.queryContent) ? this.queryContent : this.getContainer(); 
		$( container + " .linhaSs").eq(index).removeAttr("role");
		$( container + " .linhaSs").eq(index).find(".glyphicon-ok").hide();
		$( container + " .linhaSs").eq(index).addClass("disabled");
	};

	setMessage( customMsg ){
		var msgEmptyResults = (customMsg) ?  customMsg : "Nenhum resultado encontrado para o termo informado.";
		$(this.queryContent).html( "<p style='margin-top: 2px;'><strong> "+msgEmptyResults+" </strong></p>" );
	};

};