/*!
 * Versão 1.0a
 * Última alteração: 16/02/2017 
 * https://brunorelima.github.io/simple-search/
 */

"use strict";

var SimpleSearch =
 class SimpleSearch{
	
	static getIdentificador(){
		if (this.identificador == null){
			this.identificador = 1;			
		}
		else {
			this.identificador++;			
		}
		return this.identificador;
	}
	
	 constructor(options){
		 
	  	var defaults = {
		  		method: "GET",
		  		fieldId: "id",
		  		fieldRecords: "obj.registros",
		  		fieldSizePages: "obj.propriedades.qtdPaginasTotal",
//		  		fieldPages: "obj.navegacao.paginas",
		  		delaySearch: 200,
		    	onsuccess: function(response){
					if (response && response.status && response.status == 'erro'){
						if (this.debug) console.error("Deu erro na resposta do servidor.");
						if (this.debug) console.log(response);
						alert(response.msg);
						return false;
					}
					return true;
				},
	  	};
	  	
	  	var propriedades = $.extend( {}, defaults, options );
	  	
	  	
		this.paginaAtual = 0;
		this.indexAtual = -1;
		this.arrayRegistros = [];
		this.classeLinhaSelecionada = (propriedades.tableFields) ? "info" : "active";
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
		this.tableTitles = propriedades.tableTitles;
		this.tableFields = propriedades.tableFields;
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
		
		this.data = propriedades.data || function(){ return ""; };
		this.onselect = propriedades.onselect || function(){};
		this.onreset = propriedades.onreset || function(){};
		this.onsuccess = propriedades.onsuccess || function( response ){ return true; };
		
		
		this.classResultadoPesquisa = "simpleSearchResult";
		this.classDestinoConteudo = "containerResult";
		this.classItensSelecionados = "containerItensSelecionados";
		this.classComplemento = "complemento";
		this.containerAutoComplete = "#containerPesquisa" + SimpleSearch.getIdentificador();

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
	    		$(this.resultadoPesquisa + " ." + this.classeLinhaSelecionada).removeClass(this.classeLinhaSelecionada);
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
		}		 
	}
	

	_pesquisar( pagina ){
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
			var msg = "<p> <small> <span class='glyphicon glyphicon-alert text-warning'></span> ";
			msg += "<strong> Para pesquisar precisa digitar pelo menos " + this.minLength + " caracteres. </strong> </small> </p>";
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
		
		//Verifica se esta repetindo a busca
		if (this.ultimoParametroPesquisado == params && $(this.queryContent).html() != ""){
			if (this.debug) console.log("Repetiu a busca: " + params);
			this.autoIniciarStarted = false;
			return;
		}
		
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
					  
					  var msg = "<p> <small> <span class='glyphicon glyphicon-exclamation-sign text-danger'></span> ";
					  msg += "<strong>Erro na consulta do simpleSearch </strong> </small> </p>";
					  $(this.queryContent).html(msg);				  
				  },
				  beforeSend: function(){
					  var msg = " <div class='progress' role='progressbar' style='height: 10px;'> <div class='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='100' aria-valuemin='0' aria-valuemax='100' style='width: 100%' >";
					  msg += "<span class='sr-only glyphicon glyphicon-hourglass text-primary'><small><strong>Carregando... </strong></small></span>  </div> </div>";
					  $(this.queryContent).html(msg);				  
				  },
				  complete: function(){				 
					 this.autoIniciarStarted = false;
					 
					 var conteudo = $(this.queryContent).html();
					 if (conteudo.indexOf("progressbar") > 0){
						 $(this.queryContent).html("");
					 }
				  }
			});
		}
	};
	
	_trataRepostaServidor( response ){
		
		var continuarExecutando = this.onsuccess( response );
		if ( continuarExecutando ){
		
			try{			
				var obj = (this.fieldRecords != "") ? eval("response." + this.fieldRecords) : response;
			}catch(err){
				if (this.debug) console.log(err);
				if (this.debug) console.log(response);
				throw Error("Parâmetro configurado para 'fieldRecords' incorreto. Confira a resposta do servidor.");
			}
			
			if (obj == undefined){
				console.error("Objeto de registros indefinido. Confira se o argumento de 'fieldRecords' está correto. " + this.logNomeClasse);
				return;
			}
			
			this.arrayRegistros = (this.fieldRecords && obj) ? obj : response.obj;
			
			if ((!this.field && !this.tableFields) || (!this.tableFields && this.arrayRegistros[0] && this.arrayRegistros[0][this.field] == undefined)){
				console.error("Valor da 'field' do item está indefinido, confira se o parametro passado está correto. " + this.logNomeClasse);
			}
			if (this.arrayRegistros[0] && this.arrayRegistros[0][this.fieldId] == undefined){
				console.error("Valor da 'fieldId' do item está indefinido, confira se o parametro passado está correto. " + this.logNomeClasse);
			}
			
			
			if (this.arrayRegistros != null && this.arrayRegistros.length > 0){
				var htmlSaida = "";
				
				if (this.tableKeepOpen == true){
					htmlSaida += "<div> ";
					
					if (this.tableShowClose){
						htmlSaida += "  <div class='text-danger pull-right acao-fechar' aria-hidden='true' title='Fechar tabela' style='cursor: pointer;'> <h6> <span class='glyphicon glyphicon-remove text-danger'></span> Fechar </h6> </div> ";
					}
				}
				
				if (!this.tableFields){
				
    				htmlSaida += "<ul class='list-group " + this.classResultadoPesquisa + "' style='margin-bottom: 0;'>";
    				this.arrayRegistros.forEach(function(item, index){

    					//Complemento pra verificar se tem que desativar a linha ou não
    					var complementoLinha = (this.inputNames && ($(this.destinoItensSelecionados + " input[value='" + item[this.fieldId] + "']").length != 0)) ? "disabled" : "";    					
    					htmlSaida += "<li class='list-group-item linhaSs " + complementoLinha + "' style='cursor: pointer;'>";
    					
    					if (this.templateField){
    						htmlSaida += this._atualizaValoresTemplate(item, this.templateField);
    					}
    					else {	    						
    						htmlSaida += item[this.field];
    					}
    					
    					htmlSaida += " </li>";
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
						
					//Percorrendo registros    						
					this.arrayRegistros.forEach(function(registro, index){
					htmlSaida += "<tr class='linhaSs' style='cursor:pointer'>"; //tabindex='0'
						
						if (this.tableShowSelect){
							htmlSaida += "<td class='text-center'> <span class='glyphicon glyphicon-ok'></span>  </td>";
						}
						
						this.tableFields.forEach(function(col, index){
							htmlSaida += "<td> " + registro[col] + " </td>";    								
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
						htmlSaida += "<div class='btn-group' role='group'> <div class='text-center'> ";
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
				
				$(this.queryContent).undelegate(".linhaSs", "click");				
				$(this.queryContent).delegate(".linhaSs", "click", this._acaoClickMouse.bind(this));
				
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
				var msg = "<small><p style='margin-top: 2px;'> <span class='glyphicon glyphicon-info-sign text-primary'></span> ";
				msg += "<strong>Nenhum resultado encontrado para o termo informado. </strong></p></small>";
				$(this.queryContent).html( msg );
				this.paginaAtual = ( this.paginaAtual - 1);
			}
			$(this.query).focus();
		}
		else {
			if (this.debug) console.log("continuarExecutando = false");
		}
		
	}
	
	_atualizaValoresTemplate(row, templateField){
		$.each(row, function(campo, valor) {
			var __token = "#" + campo + "#";
            var __er = new RegExp(__token, "ig");
            templateField = templateField.replace(__er, valor == null ? '' : valor);
		});
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
		this.select( row[this.fieldId], row[this.field], complemento, true );		
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
		
		if (!$(this.resultadoPesquisa + " .linhaSs").eq(this.indexAtual).hasClass("disabled")){
			$(this.resultadoPesquisa + " .linhaSs").eq(this.indexAtual).addClass("disabled");
			this._selecionaLinha( this.arrayRegistros[this.indexAtual] );			
		}
		else {
			this.focus();			
		}		
	};

	_acaoClickMouseRemoverItem(event){
		$(event.currentTarget).parent().parent().remove();
	};	

	_acaoMouseOver(event){
		$(this.resultadoPesquisa + " ." + this.classeLinhaSelecionada).removeClass(this.classeLinhaSelecionada);
    	$(event.currentTarget).addClass(this.classeLinhaSelecionada);
	};
	
	_acaoPressKey(event){
		// Se estiver bloqueado não realiza nenhuma ação
		if ($(this.query).attr( "readonly" )){ 
			return;    			
		}
		
		switch (event.keyCode) {
			case 13: // Tecla ENTER
				this.indexAtual = $(this.resultadoPesquisa + " .linhaSs").index( $(this.resultadoPesquisa + " ." + this.classeLinhaSelecionada) );
				if (this.indexAtual >= 0){
					this._selecionaLinha( this.arrayRegistros[this.indexAtual] );
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
				if (this.tableKeepOpen != true){
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
				this.indexAtual = $(this.resultadoPesquisa + " .linhaSs").index( $(this.resultadoPesquisa + " ." + this.classeLinhaSelecionada) );
				this.indexAtual++; 
            	
            	$(this.resultadoPesquisa + " ." + this.classeLinhaSelecionada).removeClass(this.classeLinhaSelecionada);
            	$(this.resultadoPesquisa + " .linhaSs:eq(" + this.indexAtual + ")").addClass(this.classeLinhaSelecionada);
            	event.preventDefault();
				break;
				
			case 38: // Tecla para cima
            	this.indexAtual = $(this.resultadoPesquisa + " .linhaSs").index( $(this.resultadoPesquisa + " ." + this.classeLinhaSelecionada) );            	
            	this.indexAtual--; 
            	
            	$(this.resultadoPesquisa + " ." + this.classeLinhaSelecionada).removeClass(this.classeLinhaSelecionada);
            	$(this.resultadoPesquisa + " .linhaSs:eq(" + this.indexAtual + ")").addClass(this.classeLinhaSelecionada);
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
				$(this.resultadoPesquisa + " ." + this.classeLinhaSelecionada).removeClass(this.classeLinhaSelecionada);
				
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
		$(this.queryContent).html("");
		this.ultimoParametroPesquisado = "";
		this.ultimaPalavraPesquisada = "-1";
		this.paginaAtual = 0;
		
		if (this.whenBlurClear){
			$(this.query).val("");
		}		
	};
	
	reset(){
		if (!this.isBlocked){
			$(this.query).val( "" );
			$(this.destinoItensSelecionados).html("");
			this._setComplemento( "" );
			this._limparConteudo();
			this._desbloquear( false );
			
			$(this.query).show();
			$(this.containerAutoComplete + " ." + this.classComplemento ).hide();
		}
		
		this._adicionaValorPadrao();
		this.onreset();		
	};
	
	select( id, descricao, complemento, setFocus ){
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
		
	};
	
	disabled(){
		this.isBlocked = true;
		
		if (this.query){
			$(this.query).attr( "readonly", "readonly" );
			$(this.query).parent().find(".glyphicon").removeClass("glyphicon-search").removeClass("glyphicon-remove").addClass("glyphicon-lock");			
		}
		else if (this.queryButton){
			$(this.queryButton).attr( "disabled", "disabled" );
		}
		
		this._removeEventos();
	};
	
	enabled(){
		this.isBlocked = false;
		this._adicionaEventos();
		
		if (this.query){
			if (this.isDesbloqueado){
				$(this.query).removeAttr( "readonly");
				$(this.query).parent().find(".glyphicon").removeClass("glyphicon-lock").addClass("glyphicon-search").removeClass("glyphicon-remove");
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
		$(this.query).focus();
	};
  
};
