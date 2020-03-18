/*!
 * Versão 1.0a
 * Última alteração: 14/02/2020
 * https://brunorelima.github.io/simple-search/
 */

//"use strict";
if (SimpleSearch) console.warn("Atenção, o SimpleSearch foi iniciado mais de uma vez e poderá ocorrer bugs.");
var SimpleSearch =
 class SimpleSearch{

	static _getIdentificador(){
		this.identificador = (this.identificador == null) ? 1 : this.identificador + 1;
		return this.identificador;
	}

	constructor(options){
		this._debug = (options.debug == true);
		Object.defineProperty(this, "_debug", { configurable: false, writable: false }); //Não deixa alterar o valor da propriedade

		//Define constantes de configuração
		this._cfg = {};
		this._cfg._nomeClasse = "SimpleSearch";
		this._cfg._logNomeClasse = "[" + this._cfg._nomeClasse + "]";
		this._cfg._id = SimpleSearch._getIdentificador();
		this._cfg._prefixoDebug = this._cfg._nomeClasse + this._cfg._id + ":" + (options.query || options.queryButton || "???") + " | ";
		Object.freeze(this._cfg);
		this._logDebug( this._cfg._nomeClasse + " START ", options );

		//Definindo valores iniciais variaveis
		this._var = {};
		this._var._paginaAtual = 0;
		this._var._indexAtual = -1;
		this._var._arrayRegistros = [];
		this._var._ultimoParametroPesquisado = "";
		this._var._ultimaPalavraPesquisada = "-1";
		this._var._isDesbloqueado = true;
		this._var._isBlocked = false;
		this._var._autoIniciarStarted = false;

		//Define propriedades usadas caso precise destruir o objeto para recria-lo
		this._prop = {};
		this._prop._query = options.query;

		//Mesclando propriedades padrões e definidas
		var defaults = (options.defaults) ? options.defaults : this._getConfigDefault();
		var propriedades = $.extend( {}, defaults, options );

		//Valida se o componente já foi iniciado antes
		if (options.query && $(options.query).parent().parent().hasClass("simple-search")){
			console.warn( "Atenção: Foi recriado um componente utilizando a mesma query '" + options.query + "' que foi utilizada anteriormente. " + this._cfg._logNomeClasse );
			this.destroy();
		}

		try{
			// Validações de configurações obrigatórias
			if (propriedades.query == null && propriedades.queryButton == null) {
				throw Error("Informe o nome do 'query' ou do 'queryButton'. ");
			}
			if (propriedades.field == undefined && propriedades.tableFields == undefined && propriedades.templateField == undefined){
				throw Error("Informe o nome da 'field'. ");
			}
			if (propriedades.url == undefined && propriedades.response == undefined){
				throw Error("Informe a 'url' ou 'response'. ");
			}
		}catch(error){
			this.destroy();
			throw Error("Não foi possível inicializar o componente. " + this._cfg._logNomeClasse + " " + error.message);
		}

		//Definindo o restante das propriedades
		this._prop._url = propriedades.url;
		this._prop._method = propriedades.method || "GET";
		this._prop._fieldSizePages = propriedades.fieldSizePages;
		this._prop._field = propriedades.field;
		this._prop._fieldId = propriedades.fieldId;
		this._prop._queryId = propriedades.queryId;
		this._prop._templateField = propriedades.templateField;
		this._prop._fieldRecords = propriedades.fieldRecords;
		this._prop._inputNames = propriedades.inputNames;
		this._prop._minLength = propriedades.minLength || 0;
		this._prop._defaults = propriedades.defaults;
		this._prop._defaultValue = propriedades.defaultValue;
		this._prop._defaultEmptyMsg = propriedades.defaultEmptyMsg;
		this._prop._tableTitles = propriedades.tableTitles;
		this._prop._tableFields = propriedades.tableFields;
		this._prop._tableFieldsTooltips = propriedades.tableFieldsTooltips;
		this._prop._queryContent = propriedades.queryContent;
		this._prop._queryContentExterno = (propriedades.queryContent) ? true : false;
		this._prop._queryButton = propriedades.queryButton;
		this._prop._queryForm = propriedades.queryForm;
		this._prop._fieldPages = propriedades.fieldPages;
		this._prop._paramSearch = propriedades.paramSearch || $( this._prop._query ).attr("name") || "busca";
		this._prop._delayAutoSearch = propriedades.delayAutoSearch || -1;
		this._prop._delaySearch = propriedades.delaySearch || 200;
		this._prop._templateComplement = propriedades.templateComplement;
		this._prop._tableShowSelect = propriedades.tableShowSelect;
		this._prop._tableKeepOpen = (propriedades.tableKeepOpen == true);
		this._prop._whenBlurClear = (propriedades.whenBlurClear == true);
		this._prop._response = propriedades.response;
		this._prop._tableLastColumn = propriedades.tableLastColumn;
		this._prop._tableShowClose = propriedades.tableShowClose;
		this._prop._whenSelectKeepOpen = propriedades.whenSelectKeepOpen;
		this._prop._whenEnableReset = propriedades.whenEnableReset || true;
		this._prop._whenNullSetEmpty = propriedades.whenNullSetEmpty || false;
		this._prop._disableSelectRow = propriedades.disableSelectRow || false;
		this._prop._data = propriedades.data || function(){ return ""; };
		this._prop._onselect = propriedades.onselect || function(){};
		this._prop._onreset = propriedades.onreset || function(){};
		this._prop._onsuccess = propriedades.onsuccess || function( response ){ return true; };
		this._prop._oncomplete = propriedades.oncomplete || function(){ };
		this._prop._onerror = propriedades.onerror || function( response ){ };
		this._prop._onremoveselecteditem = propriedades.onremoveselecteditem || function( itemId ){ };
		this._prop._responseChange = propriedades.responseChange || function( response ){ return response; };

		this._comp = {};
		this._comp._containerAutoComplete = "#containerSimpleSearch" + this._cfg._id;
		this._comp._classResultadoPesquisa = "simpleSearchResult";
		this._comp._classDestinoConteudo = "containerResult";
		this._comp._classItensSelecionados = "containerItensSelecionados";
		this._comp._classComplemento = "complemento";
		this._comp._classLinhaSelecionada = "simpleSearchLinhaSelecionada";

		this._logDebug( "container " + this._comp._containerAutoComplete );

		if (this._prop._disableSelectRow != true){
			this._comp._classLinhaSelecionada = (propriedades.tableFields) ? "info" : "active";
		}

		if (this._prop._query){

			//Se necessário adiciona alguns elementos ao seletor
			//Hack para funcionar em versões sem Bootstrap
			$(this._prop._query).addClass("form-control");
			$(this._prop._query).width("");

			// Adiciona elementos adicionais
			$(this._prop._query).wrap( "<div id='" + this._comp._containerAutoComplete.substring(1) + "' class='simple-search'></div>" )
			$(this._prop._query).wrap( "<div class='input-group'></div>" )
			$(this._prop._query).after("<span class='input-group-addon btn '>  <span class='glyphicon glyphicon-search text-primary'></span> </span> ");

			if (this._prop._templateComplement){
				$(this._prop._query).after("<div class='" + this._comp._classComplemento + " form-control' style='display: none; height: auto; resize: none;' readonly ></div>");
			}

			$(this._comp._containerAutoComplete).append("<div class='" + this._comp._classDestinoConteudo + "'></div>");

			if (this._prop._inputNames){
				$(this._comp._containerAutoComplete).append("<div class='" + this._comp._classItensSelecionados + "'></div>");
			}

			// Manipula eventos e propriedades
			$(this._prop._query).attr("autocomplete", "off");
			$(this._prop._query).keydown( this._acaoPressKey.bind(this) );

	    	// Retira item selecionado ao clicar na caixa de seleção
	    	$(this._prop._query).click($.proxy(function () {
	    		$(this._comp._resultadoPesquisa + " ." + this._comp._classLinhaSelecionada).removeClass(this._comp._classLinhaSelecionada);
	    	},this));

		}
		else if (this._prop._queryButton && !this._prop._queryContent  ){
			$(this._prop._queryButton).keydown( this._acaoPressKey.bind(this) );

			// Adiciona elementos adicionais
			$(this._prop._queryButton).parent().parent().wrap( "<div id='" + this._comp._containerAutoComplete.substring(1) + "'></div>" )
			$(this._prop._queryButton).parent().parent().after( "<div class='" + this._comp._classDestinoConteudo + "'></div>" )
		}


		//Atualizando parametros
		this._prop._queryContent 		= (this._prop._queryContent) ? this._prop._queryContent : this._comp._containerAutoComplete + " ." + this._comp._classDestinoConteudo;
		this._comp._resultadoPesquisa 	= (this._prop._queryContent) ? this._prop._queryContent : this._comp._containerAutoComplete + " ." + this._comp._classResultadoPesquisa;
		this._comp._destinoItensSelecionados = this._comp._containerAutoComplete + " ." + this._comp._classItensSelecionados;

		if (this._prop._inputNames && this._prop._inputNames.indexOf("[]") == -1){
			this._logDebug("O paramêtro 'inputNames' não estava no formato de vetor, foi adicionado '[]' no final do nome para fazer a conversão.");
			this._prop._inputNames += "[]";
		}


		this._adicionaEventos();
		this._adicionaValorPadrao();

		Object.freeze(this._prop);
		Object.freeze(this._comp);
		Object.freeze(this);

		this._logDebug( "function constructor() - END" );
	 }

	 _getConfigDefault(){
		return {
			fieldId: "id",
			fieldRecords: "obj.registros",
			fieldSizePages: "obj.propriedades.qtdPaginasTotal",
//	  		fieldPages: "obj.navegacao.paginas",
			whenBlurClear: true,
		  onsuccess: response =>{
			  if (response && response.status && (response.status == 'erro' || response.status == 'warning')){
				  console.error("O servidor respondeu com status de erro.");
				  this._logDebug(response);
				  this._prop._onerror(response);
				  return false;
			  }
			  return true;
		  },
		  onerror: (err)=>{
			  $(this._prop._queryContent).html( "<p class='text-danger'><strong> Erro na resposta do servidor para o simpleSearch [code 10] </strong></p>" );
			  console.warn(this._cfg._logNomeClasse + " [onerror]", err);
		  },
		};
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
		 if (this._debug) {
			 console.log( this._cfg._prefixoDebug + msg );
		 }
	 }

	 _adicionaValorPadrao(){
		 if (this._prop._defaultValue){
			 //Se não for array
			if (this._prop._defaultValue[0] && !Array.isArray(this._prop._defaultValue[0]) && this._prop._defaultValue[1] && !Array.isArray(this._prop._defaultValue[1]) ){
				var complemento = (this._prop._defaultValue[2]) ? this._prop._defaultValue[2] : "";
				this.select(this._prop._defaultValue[0], this._prop._defaultValue[1], complemento);
			}
			else if (Array.isArray(this._prop._defaultValue)){
				this._prop._defaultValue.forEach(function(item){
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

		 if (this._prop._query){

			// Limpa caixa ao perder foco
			$(document).click($.proxy(function (event) {
				if ($(this._prop._queryContent).html() != "") {
					if(
							!$(event.target).hasClass("clk-btn-next") &&
							!$(event.target).hasClass("clk-btn-prev") &&
							!$(event.target).attr("data-pagina") &&
							$(event.target).closest(this._comp._containerAutoComplete).length == 0
						) {
			        	if (this._prop._tableKeepOpen != true){
			        		this._limparConteudo();
			        	}
			        }
			    }
				//Limpando o valor caso digitar algo e perder o foco sem nem pesquisar
				else if ( this._var._isDesbloqueado && this._prop._whenBlurClear && $(this._prop._query).val() && !$(this._comp._resultadoPesquisa).html()) {
                    this._limparConteudo();
                }
			},this));

			// Se clicar no botão de pesquisa executa ação
			$(this._prop._query).parent().find(".input-group-addon").click($.proxy(function () {
				this._acaoBotaoPesquisarOuDesbloquear();
			},this));

			var destinoTargetDoubleClick = (this._prop._templateComplement) ? this._comp._containerAutoComplete + " ." + this._comp._classComplemento : this._prop._query;

	    	// Adiciona eventos
	    	$(destinoTargetDoubleClick).dblclick($.proxy(function () {
	    		this._desbloquear( true );
	    		this._setComplemento( "" );

	    		$(this._prop._query).show();
				$(this._comp._containerAutoComplete + " ." + this._comp._classComplemento ).hide();
				$(this._prop._query).focus();
	    	},this));

	    	$(this._prop._query).parent().find(".glyphicon").parent().addClass("btn");

		 }

		 else if (this._prop._queryButton){
			// Se clicar no botão de pesquisa executa ação
			$(this._prop._queryButton).click($.proxy(function () {
				if (this._var._isDesbloqueado){
					this._pesquisar(1);
				}
			},this));
		 }

		 if (this._prop._queryForm){
			 if ($(this._prop._queryForm).find(".search-on-enter") != null){
				 $(this._prop._queryForm).find(".search-on-enter").attr("autocomplete", "off");
				 $(this._prop._queryForm).find(".search-on-enter").keydown( this._acaoPressKey.bind(this) );
			 }
		 }

	 }

	 _removeEventos(){
		 this._logDebug( "function _removeEventos()" );

		 if (this._prop._query){
			 $(this._prop._query).unbind( "dblclick" );
			 $(this._prop._query).parent().find(".input-group-addon").unbind( "click" );
			 $(this._prop._query).parent().find(".glyphicon").unbind( "click" );
			 $(this._prop._query).parent().find(".glyphicon").parent().removeClass("btn");
		 }
		 else if (this._prop._queryButton){
			 $(this._prop._queryButton).unbind( "click" );
		 }
	 }


	_desbloquear( setFocus ){
		 this._var._isDesbloqueado = true;
		 $(this._prop._query).removeAttr( "readonly");
		 $(this._prop._query).parent().find(".glyphicon").removeClass("glyphicon-remove").addClass("glyphicon-search");

			if (setFocus == true){
//				$(this._prop._query).focus();
				$(this._prop._query).select();
			}

			if (this._prop._queryId) {
				$(this._prop._queryId).val("");
			}
	};

	_acaoBotaoPesquisarOuDesbloquear(){
		if (this._var._isDesbloqueado){
			this._pesquisar(1);
		}
		else {
			this._desbloquear( true );
			this._setComplemento( "" );

			$(this._prop._query).show();
			$(this._comp._containerAutoComplete + " ." + this._comp._classComplemento ).hide();

			if (this._prop._whenEnableReset == true){
				this.reset();
			}
		}
	}


	_pesquisar( pagina ){
		this._logDebug( "function _pesquisar(" + pagina + ") - START" );

		//Se tiver iniciado um temporizador, cancela ele pra poder iniciar outro
		if (this._var._idTimeoutAutoSearch){
			clearTimeout(this._var._idTimeoutAutoSearch);
			this._var._autoIniciarStarted = false;
		}

		//Fazendo controle para não deixar fazer várias pesquisas em mínimo intervalo de tempo
		if (!this._var._idTimeoutSearch){
			this._var._idTimeoutSearch = window.setTimeout($.proxy(function () {
				clearTimeout(this._var._idTimeoutSearch);
				this._var._idTimeoutSearch = null;
			},this), this._prop._delaySearch);
		}
		else {
			this._logDebug("Pesquisa cancelada. O intervalo da última pesquisa foi muito pequeno.");
			return;
		}

		if (this._prop._query && $(this._prop._query).attr( "readonly") == "readonly" || this._var._isDesbloqueado == false ){
			this._var._autoIniciarStarted = false;
			return;
		}

		if (this._prop._query && $(this._prop._query).val().length < this._prop._minLength){
			this._logDebug("Para pesquisar precisa digitar pelo menos " + this._prop._minLength + " caracteres.");
			var msg = "<p><strong>Para pesquisar precisa digitar pelo menos " + this._prop._minLength + " caracteres. </strong></p>";
			$(this._prop._queryContent).html(msg);

			this._var._autoIniciarStarted = false;
			return;
		}

		pagina = pagina || 1;

		var params = "pagina=" + pagina;
		params += (this._prop._query) ? "&" + this._prop._paramSearch + "=" + $(this._prop._query).val() : "";
		params += (this._prop._queryForm) ? "&" + $(this._prop._queryForm).serialize() : "";
		// Adiciona parametros adicionais se tiver
		var paramData = (this._prop._data && typeof this._prop._data === "function") ? this._prop._data() : this._prop._data;
		params += ((paramData && paramData != "") ? "&" + jQuery.param(paramData) : "");

		/*
		//Verifica se esta repetindo a busca
		if (this._var._ultimoParametroPesquisado == params && $(this._prop._queryContent).html() != ""){
			this._logDebug("Repetiu a busca: " + params);
			this._var._autoIniciarStarted = false;
			return;
		}
		*/

		this._var._ultimaPalavraPesquisada = $(this._prop._query).val();


		this._var._ultimoParametroPesquisado = params;
		this._var._paginaAtual = (pagina != undefined) ? pagina : this._var._paginaAtual;

		if (this._prop._response){
			this._trataRepostaServidor( this._prop._response( pagina, $(this._prop._query).val() ) );
		}
		else {
			if (this._var._ajax){
				this._var._ajax.abort();
			}

			this._var._ajax = $.ajax({
				url: this._prop._url,
				data: params,
				dataType: "json",
				method: this._prop._method,
				context: this,
				success: function( response ) {
					this._trataRepostaServidor( response );
				  },
				  error: function(error){
					  if (error.readyState != 0){
						  console.error(error);
					  }

					  $(this._prop._queryContent).html( "<p class='text-danger'><strong> Erro na resposta do servidor para o simpleSearch [code 20] </strong></p>" );
					  this._prop._onerror( error );
				  },
				  beforeSend: function(){
					  var msg = " <div class='progress' role='progressbar' style='height: 10px;'> <div class='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='100' aria-valuemin='0' aria-valuemax='100' style='width: 100%' >";
					  msg += "<span class='sr-only glyphicon glyphicon-hourglass text-primary'><small><strong>Carregando... </strong></small></span>  </div> </div>";
					  $(this._prop._queryContent).html(msg);
				  },
				  complete: function(){
					 this._var._autoIniciarStarted = false;

					 var conteudo = $(this._prop._queryContent).html();
					 if (conteudo && conteudo.indexOf("progressbar") > 0){
						 $(this._prop._queryContent).html("");
					 }
					 this._var._ajax = null;
				  }
			});
		}

		this._logDebug( "function _pesquisar(" + pagina + ") - END" );
	};

	_trataRepostaServidor( response ){
		response = this._prop._responseChange(response);

		var continuarExecutando = this._prop._onsuccess( response );
		if ( continuarExecutando ){

			try{
				var obj = (this._prop._fieldRecords) ? eval("response." + this._prop._fieldRecords) : response;
			}catch(err){
				this._logDebug(err);
				this._logDebug(response);

				$(this._prop._queryContent).html( "<p class='text-danger'><strong> Erro na resposta do servidor para o simpleSearch [code 30] </strong></p>" );
				this._prop._onerror( response );
				throw Error("Parâmetro configurado para 'fieldRecords' incorreto. Confira a resposta do servidor. [fieldRecords:" + this._prop._fieldRecords + "]");
			}

			if (typeof obj == "undefined"){
				console.error("Objeto de registros retornados pelo sistema indefinido. Confira se o argumento de 'fieldRecords' está configurado correto ou retornou algum erro do servidor. " + this._cfg._logNomeClasse);
				this._prop._onerror( response );
				return;
			}

			this._var._arrayRegistros = (this._prop._fieldRecords && obj) ? obj : response.obj;

			if ((!this._prop._field && !this._prop._tableFields && !this._prop._templateField) || (!this._prop._templateField && !this._prop._tableFields && this._var._arrayRegistros[0] && this._var._arrayRegistros[0][this._prop._field] == undefined)){
				console.error("Valor da 'field' do item está indefinido, confira se o parametro passado está correto. " + this._cfg._logNomeClasse);
			}
			if (this._prop._fieldId && this._var._arrayRegistros[0] && this._var._arrayRegistros[0][this._prop._fieldId] == undefined){
				console.error("Valor da 'fieldId' do item está indefinido, confira se o parametro passado está correto. " + this._cfg._logNomeClasse);
			}

			if (!Array.isArray(this._var._arrayRegistros)){
				var msg = "Não foi retornado uma lista de itens válida. ";
				this.setMessage( msg );
				console.warn( msg + "Confira se a configuração do componente está correta. " + this._cfg._logNomeClasse);
				return;
			}

			if (this._var._arrayRegistros != null && this._var._arrayRegistros.length > 0){
				var htmlSaida = "";

				if (this._prop._tableKeepOpen == true){
					htmlSaida += "<div> ";

					if (this._prop._tableShowClose){
						htmlSaida += "  <div class='text-danger pull-right acao-fechar' aria-hidden='true' title='Fechar tabela' role='button'> <h6> <span class='glyphicon glyphicon-remove text-danger'></span> Fechar </h6> </div> ";
					}
				}

				if (!this._prop._tableFields){

    				htmlSaida += "<ul class='list-group " + this._comp._classResultadoPesquisa + "' style='margin-bottom: 0;'>";

    				var valor = "";
    				this._var._arrayRegistros.forEach(function(item, index){

    					//Complemento pra verificar se tem que desativar a linha ou não
    					var complementoLinha = (this._prop._inputNames && ($(this._comp._destinoItensSelecionados + " input[value='" + item[this._prop._fieldId] + "']").length != 0)) ? "disabled" : "";
    					switch (typeof(this._prop._templateField)){
							case "function":
								valor = this._prop._templateField(item);
								break;
							case "string":
								valor = this._atualizaValoresTemplate(item, this._prop._templateField);
								break;
							default:
								valor = item[this._prop._field];
						}
						valor = (!valor && this._prop._whenNullSetEmpty) ? "" : valor;

						//Verifica se tem templateComplement para exibir em duas linhas ou não
						if (this._prop._templateComplement){
							let complemento = "";
							if (typeof(this._prop._templateComplement) === 'function') {
								complemento = this._prop._templateComplement(item);
							} else {
								complemento =  this._atualizaValoresTemplate(item, this._prop._templateComplement);
							}
							valor = "<strong>" + valor + "</strong> <br/>" + "<small>" + complemento + "</small>";
						}

    					htmlSaida += "<li class='list-group-item linhaSs " + complementoLinha + "' role='button' >" + valor + " </li>";
    				}, this);
    				htmlSaida += "</ul>";

				}
				else {
					htmlSaida += "<div class='table-responsive simple-search'>";
					htmlSaida += "<table class='table table-bordered table-striped table-hover " + this._comp._classResultadoPesquisa + "' style='margin-bottom: 0;'>";

					//Percorrendo header
					if (this._prop._tableTitles){
						htmlSaida += "<tr>";

						if (this._prop._tableShowSelect){
							htmlSaida += "<td width='42px'> </td>";
						}

						this._prop._tableTitles.forEach(function(titulo, index){
							htmlSaida += "<th> " + titulo + " </th>";
						});

						if (this._prop._tableLastColumn){
							htmlSaida += "<th></th>";
						}

						htmlSaida += "</tr>";
					}

					var complementoCss = (this._prop._disableSelectRow != true) ? "role='button'" : "";

					//Percorrendo registros
					this._var._arrayRegistros.forEach(function(registro, index){
					htmlSaida += "<tr class='linhaSs' " + complementoCss + ">"; //tabindex='0'

						if (this._prop._tableShowSelect){
							htmlSaida += "<td class='text-center'> <span class='glyphicon glyphicon-ok'></span>  </td>";
						}

						var valor = "";
						var tooltip = "";
						this._prop._tableFields.forEach(function(col, index){
							if (typeof(col) === 'function') {
								valor = col(registro);
							} else {
								valor = (col.indexOf(" ") >= 0 ) ? this._atualizaValoresTemplate(registro, col) : registro[col]; //Adicionando suporte a template
							}
							valor = (!valor && this._prop._whenNullSetEmpty) ? "" : valor;

							tooltip = (this._prop._tableFieldsTooltips && this._prop._tableFieldsTooltips[index]) ? this._prop._tableFieldsTooltips[index] : "";
							if (tooltip != ""){
								tooltip = (tooltip.indexOf(" ") >= 0 ) ? this._atualizaValoresTemplate(registro, tooltip) : this._atualizaValoresTemplate(registro, "#"+tooltip+"#"); //Adicionando suporte a template
								tooltip = " title='" + tooltip + "'";
							}
							htmlSaida += "<td" + tooltip + ">" + valor + "</td>";
						}, this);

						if (this._prop._tableLastColumn){
							if (this._prop._tableLastColumn ==='function' || this._prop._tableLastColumn instanceof Function){
								htmlSaida += "<td> " + this._atualizaValoresTemplate(registro, this._prop._tableLastColumn()) + " </td>";
							}
//							if (typeof this._prop._tableLastColumn === 'string' || this._prop._tableLastColumn instanceof String){
							else {
								htmlSaida += "<td> " + this._atualizaValoresTemplate(registro, this._prop._tableLastColumn) + " </td>";
							}
						}

						htmlSaida += "</tr>";
					}, this);

					htmlSaida += "</table>";
					htmlSaida += "</div>";

				}


				// Controle das paginas
//				var qtdPaginasTotal = (isNaN(this._prop._fieldSizePages)) ? eval("response." + this._prop._fieldSizePages) || -1 : this._prop._fieldSizePages;
				var qtdPaginasTotal = -1;
				if (!isNaN(this._prop._fieldSizePages)){
					qtdPaginasTotal = this._prop._fieldSizePages;
				}
				else {
					try{
						var aux = eval("response." + this._prop._fieldSizePages) || -1;
						qtdPaginasTotal = aux;
					}catch(error){
						console.warn("Erro ao tentar pegar o valor de fieldSizePages. ", error);
					}
				}

				var complementoBotaoAnterior = (this._var._paginaAtual == 1) ? "disabled" : "";
				var complementoBotaoProximo = (this._var._paginaAtual == qtdPaginasTotal) ? "disabled" : "";


				// Adiciona paginação
				if (qtdPaginasTotal && qtdPaginasTotal > 1 ){
					this._var._paginaAtual = (this._var._paginaAtual > (qtdPaginasTotal + 1)) ? (qtdPaginasTotal + 1) : this._var._paginaAtual;

					var dadosPaginacao = null;

					try{
						dadosPaginacao = (this._prop._fieldPages) ? eval("response." + this._prop._fieldPages) : null;
					}catch(error){
						console.warn("Erro ao usar o parâmetro 'fieldPages': " + this._prop._fieldPages);
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

				if (this._prop._queryContentExterno){
					htmlSaida += "</div> ";
				}

				$(this._prop._queryContent).html(htmlSaida);

				if (this._prop._tableKeepOpen == true){
					$(this._prop._queryContent).undelegate(".acao-fechar", "click");
    				$(this._prop._queryContent).delegate(".acao-fechar", "click", this._limparConteudo.bind(this));
				}

				if (this._prop._disableSelectRow != true){
					$(this._prop._queryContent).undelegate(".linhaSs", "click");
					$(this._prop._queryContent).delegate(".linhaSs:not(.disabled)", "click", this._acaoClickMouse.bind(this));
				}

				$(this._comp._resultadoPesquisa).undelegate(".linhaSs", "mouseover");
				$(this._comp._resultadoPesquisa).delegate(".linhaSs", "mouseover", this._acaoMouseOver.bind(this));

				$(this._prop._queryContent).undelegate(".clk-btn-prev", "click");
				$(this._prop._queryContent).delegate(".clk-btn-prev", "click", this._voltaPagina.bind(this));

				$(this._prop._queryContent).undelegate(".clk-btn-next", "click");
				$(this._prop._queryContent).delegate(".clk-btn-next", "click", this._proximaPagina.bind(this));

				$(this._prop._queryContent).undelegate(".pagination li", "click");
				$(this._prop._queryContent).delegate(".pagination li", "click", $.proxy(function (event) {
					var indexPaginacao = $(this._prop._queryContent + " .pagination li").index( $(event.currentTarget) );
					if (indexPaginacao >= 0){
						var domPaginaPaginacao = $(this._prop._queryContent + " .pagination li")[indexPaginacao];
						var paginaPaginacao = $(domPaginaPaginacao).data("pagina");
						this._pesquisar(paginaPaginacao);
					}
		    	},this));

			}
			else {
				this.setMessage( this._prop._defaultEmptyMsg );
				this._var._paginaAtual = ( this._var._paginaAtual - 1);
			}
			$(this._prop._query).focus();
		}
		else {
			this._logDebug( "function _trataRepostaServidor - Quase FIM : continuarExecutando = false" );
		}
		this._prop._oncomplete( response );

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

		if (!this._prop._whenSelectKeepOpen){
			this._limparConteudo();
		}

		let complemento = "";
		if (this._prop._templateComplement){
			if (typeof(this._prop._templateComplement) === 'function') {
				complemento = this._prop._templateComplement(row);
			} else {
				complemento =  this._atualizaValoresTemplate(row, this._prop._templateComplement);
			}
		}

		this.select( row[this._prop._fieldId], row[this._prop._field], complemento, true, row );
		this._prop._onselect( row );

	};

	_setComplemento( complemento ){
		if (this._prop._templateComplement){
			$(this._comp._containerAutoComplete + " ." + this._comp._classComplemento ).html( complemento );

			$(this._prop._query).hide();
			$(this._comp._containerAutoComplete + " ." + this._comp._classComplemento ).show();
		}
	}

	_geraComplementoElemento( complemento ){
		return (this._prop._inputNames && complemento) ? "<div class='form-control' readonly style='height: auto; font-size: 0.85em;'> " + complemento + " </div>" : "";
	}

	_acaoClickMouse(event){
		this._var._indexAtual = $(this._comp._resultadoPesquisa + " .linhaSs").index( $(event.currentTarget) );

		if (!$(this._comp._resultadoPesquisa + " .linhaSs").eq(this._var._indexAtual).hasClass("disabled") && $(this._comp._resultadoPesquisa + " .linhaSs").eq(this._var._indexAtual).attr("role") == "button"){
			$(this._comp._resultadoPesquisa + " .linhaSs").eq(this._var._indexAtual).addClass("disabled");
			this._selecionaLinha( this._var._arrayRegistros[this._var._indexAtual] );
		}
		else {
			this.focus();
		}
	};

	_acaoClickMouseRemoverItem(event){
		//Apenas insere evento se tiver desbloqueado
		if ( this._var._isBlocked == false ){
			$(event.currentTarget).parent().parent().remove();
			this._prop._onremoveselecteditem( $(event.currentTarget).parent().parent().find("input[type='hidden']").val() );
		}
	};

	_acaoMouseOver(event){
		$(this._comp._resultadoPesquisa + " ." + this._comp._classLinhaSelecionada).removeClass(this._comp._classLinhaSelecionada);
		if (!$(event.currentTarget).hasClass("disabled")){
			$(event.currentTarget).addClass(this._comp._classLinhaSelecionada);
		}
	};

	_acaoPressKey(event){
		// Se estiver bloqueado não realiza nenhuma ação
		if ($(this._prop._query).attr( "readonly" )){
			return;
		}

		switch (event.keyCode) {
			case 13: // Tecla ENTER
				this._var._indexAtual = $(this._comp._resultadoPesquisa + " .linhaSs").index( $(this._comp._resultadoPesquisa + " ." + this._comp._classLinhaSelecionada) );
				if (this._var._indexAtual >= 0){
					if (!$(this._comp._resultadoPesquisa + " .linhaSs").eq(this._var._indexAtual).hasClass("disabled")){
						$(this._comp._resultadoPesquisa + " .linhaSs").eq(this._var._indexAtual).addClass("disabled");
						this._selecionaLinha( this._var._arrayRegistros[this._var._indexAtual] );
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
				if (this._prop._tableKeepOpen != true && this._var._isDesbloqueado && this._prop._whenBlurClear && $(this._prop._query).val() ){
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
				this._var._indexAtual = $(this._comp._resultadoPesquisa + " .linhaSs:not(.disabled)").index( $(this._comp._resultadoPesquisa + " ." + this._comp._classLinhaSelecionada) );
				this._var._indexAtual++;

            	$(this._comp._resultadoPesquisa + " ." + this._comp._classLinhaSelecionada).removeClass(this._comp._classLinhaSelecionada);
            	$(this._comp._resultadoPesquisa + " .linhaSs:not(.disabled):eq(" + this._var._indexAtual + ")").addClass(this._comp._classLinhaSelecionada);
            	event.preventDefault();
				break;

			case 38: // Tecla para cima
            	this._var._indexAtual = $(this._comp._resultadoPesquisa + " .linhaSs:not(.disabled)").index( $(this._comp._resultadoPesquisa + " ." + this._comp._classLinhaSelecionada) );
            	this._var._indexAtual--;

            	$(this._comp._resultadoPesquisa + " ." + this._comp._classLinhaSelecionada).removeClass(this._comp._classLinhaSelecionada);
            	$(this._comp._resultadoPesquisa + " .linhaSs:not(.disabled):eq(" + this._var._indexAtual + ")").addClass(this._comp._classLinhaSelecionada);
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
				$(this._comp._resultadoPesquisa + " ." + this._comp._classLinhaSelecionada).removeClass(this._comp._classLinhaSelecionada);

				if (this._prop._delayAutoSearch != -1){

					//Se tiver iniciado um temporizador, cancela ele pra poder iniciar outro
					if (this._var._idTimeoutAutoSearch){
						clearTimeout(this._var._idTimeoutAutoSearch);
						this._var._autoIniciarStarted = false;
					}

					//Coloca um delay para fazer a busca
					if (this._var._autoIniciarStarted == false){
						this._var._autoIniciarStarted = true;
						this._var._idTimeoutAutoSearch = window.setTimeout($.proxy(function () {
							this._pesquisar(1);
						},this), this._prop._delayAutoSearch);
					}
				}
				break;
		}

	};

	_proximaPagina(){
		if (
				(this._var._ultimaPalavraPesquisada != "-1" && this._var._ultimaPalavraPesquisada != $(this._prop._query).val()) ||
				(this._var._ultimaPalavraPesquisada == "" && $(this._prop._query).val() == "" &&  $(this._prop._queryContent).html() == "" )
			){
			this._var._paginaAtual = 0;
		}

		if ( (
				this._var._ultimaPalavraPesquisada == $(this._prop._query).val() &&
				$(this._prop._queryContent).html() != ""
			  ) &&
				(
				(($(".clk-btn-next").length == 0) ||
				 ($(".clk-btn-next[disabled]").length > 0))
				 &&
				 (($(".pagination").length == 0) ||
				($(".pagination li:last-child.active").length > 0))
				)
			){
			this._logDebug("Pesquisa cancelada por usar mesmo termo pesquisado.");
			return;
		}

		this._pesquisar(this._var._paginaAtual+1);
	};

	_voltaPagina(){
		if ( (this._var._ultimaPalavraPesquisada == $(this._prop._query).val()) &&
				(
				(($(".clk-btn-prev").length == 0) ||
				 ($(".clk-btn-prev[disabled]").length > 0))
				 &&
				 (($(".pagination").length == 0) ||
				($(".pagination li:first-child.active").length > 0))
				)
			){
			this._logDebug("Pesquisa cancelada por usar mesmo termo pesquisado.");
			return;
		}

		this._pesquisar( (this._var._paginaAtual > 1) ? this._var._paginaAtual-1 : 1 );
	};

	_limparConteudo(){
		this._logDebug( "function _limparConteudo() - START" );

		var queryContent = document.querySelector( this._prop._queryContent );
		if (queryContent) queryContent.innerHTML = "";

		this._var._ultimoParametroPesquisado = "";
		this._var._ultimaPalavraPesquisada = "-1";
		this._var._paginaAtual = 0;

		if (this._prop._whenBlurClear && this._prop._queryId && !$(this._prop._queryId).val()){
			this._set(this._prop._query, "");
			this._set(this._prop._queryId, "");
		}

		this._logDebug( "function _limparConteudo() - END" );
	};

	reset(){
		this._logDebug( "function reset() - START" );

		if (!this._var._isBlocked){
			$(this._prop._query).val( "" );
			$(this._comp._destinoItensSelecionados).html("");
			this._setComplemento( "" );
			this._limparConteudo();
			this._desbloquear( false );

			$(this._prop._query).show();
			$(this._comp._containerAutoComplete + " ." + this._comp._classComplemento ).hide();
		}

//		this._adicionaValorPadrao();

		this._logDebug( "function onreset() - START" );
		this._prop._onreset();
		this._logDebug( "function onreset() - END" );
		this._logDebug( "function reset() - END" );
	};

	/**
	 * Retira o componente SimpleSearch do elemento
	 */
	destroy(){
		this._logDebug( "function destroy()" );

		var input = $( this._prop._query );
		var idSimpleSearch = $( this._prop._query ).parent().parent();

		$( this._prop._query ).parent().parent().after( input );
		$( idSimpleSearch ).remove();

		$( this._prop._query ).removeClass("form-control");
		$( this._prop._query ).removeAttr("autocomplete");
	}

	select( id, descricao, complemento, setFocus, row ){
		this._logDebug( "function select() - START" );

		if (this._prop._templateField && row) {
			if (typeof(this._prop._templateField) === 'function') {
				descricao = this._prop._templateField(row);
			} else {
				descricao = this._atualizaValoresTemplate(row, this._prop._templateField);
			}
		}
		//Verifica se vai usar o modo que adiciona vários itens num container, ou se pode selecionar apenas um item no próprio seletor
		if (!this._prop._inputNames){
			$(this._prop._query).val( descricao );
			$(this._prop._query).attr( "readonly", "readonly" );
			$(this._prop._query).parent().find(".glyphicon").removeClass("glyphicon-search").addClass("glyphicon-remove");

			if (this._prop._queryId){
				$(this._prop._queryId).val( (id) ? id : "" );
			}

			if (this._prop._query){
				this._var._isDesbloqueado = false;
			}

			if (complemento){
				this._setComplemento( "<strong>" + descricao + "</strong><br>" + complemento );
			}
		}

		//Adiciona na lista de itens selecionados
		else if (this._prop._inputNames && ($(this._comp._destinoItensSelecionados + " input[value='" + id + "']").length == 0)){
			var linha = "<div> <div class='input-group input-group-sm'> ";

			if (!this._prop._templateComplement){
				linha += "<input type='hidden' name='" + this._prop._inputNames + "' value='" + id + "' />";
				linha += "<input class='form-control' name='_" + this._prop._inputNames + "' value='" + descricao + "' readonly />";
			}
			else {
				linha += "<input type='hidden' name='" + this._prop._inputNames + "' value='" + id + "' />";
				linha += "<input type='hidden' name='_" + this._prop._inputNames + "' value='" + descricao + "' />";
				linha += "<div class='form-control' style='height: auto; resize: none;' readonly > <strong>" + descricao + "</strong><br>" + complemento + "</div>";
			}

			linha += "<span class='input-group-addon btn itemSs'>  <span class='glyphicon glyphicon-remove text-primary'></span> </span> ";
			linha += " </div> </div>";
			$(this._comp._destinoItensSelecionados).append(linha);


			if (setFocus == true){
				$(this._prop._query).focus();
			}

			$(this._comp._destinoItensSelecionados).undelegate(".itemSs", "click");
			$(this._comp._destinoItensSelecionados).delegate(".itemSs", "click", this._acaoClickMouseRemoverItem.bind(this));
		}

		this._logDebug( "function select() - END" );
	};

	disabled(){
		this._logDebug( "function disabled()" );

		this._var._isBlocked = true;

		if (this._prop._query){
			$(this._prop._query).attr( "readonly", "readonly" );
			$(this._prop._query).parent().find(".glyphicon").removeClass("glyphicon-search").removeClass("glyphicon-remove").addClass("glyphicon-lock");
		}
		else if (this._prop._queryButton){
			$(this._prop._queryButton).attr( "disabled", "disabled" );
		}

		//Se for no formato multi itens, desabilita os itens selecionados, para NÃO permitir remover os itens
		if (this._prop._inputNames){
			$( this. getContainer() ).find(".itemSs").attr( "disabled", "disabled" );
		}

		this._removeEventos();
	};

	enabled(){
		this._logDebug( "function enabled()" );

		this._var._isBlocked = false;
		this._adicionaEventos();

		if (this._prop._query){
			if (this._var._isDesbloqueado){
				$(this._prop._query).removeAttr( "readonly");
				$(this._prop._query).parent().find(".glyphicon").removeClass("glyphicon-lock").addClass("glyphicon-search").removeClass("glyphicon-remove");

				//Se for no formato multi itens, habilita os itens selecionados, para PERMITIR remover os itens
				if (this._prop._inputNames){
					$( this. getContainer() ).find(".itemSs").removeAttr( "disabled" );
				}
			}
			else {
				$(this._prop._query).parent().find(".glyphicon").removeClass("glyphicon-lock").removeClass("glyphicon-search").addClass("glyphicon-remove");
			}
		}
		else if (this._prop._queryButton){
			$(this._prop._queryButton).removeAttr( "disabled");
		}
	};

	focus(){
		this._logDebug( "function focus()" );
		$(this._prop._query).focus();
	};

	search( pagina ){
		this._logDebug( "function search()" );
		this._pesquisar( pagina );
	};

	getContainer(){
		return this._comp._containerAutoComplete;
	};

	disableRowByIndex( index ){
		var container = (this._prop._queryContent) ? this._prop._queryContent : this.getContainer();
		$( container + " .linhaSs").eq(index).removeAttr("role");
		$( container + " .linhaSs").eq(index).find(".glyphicon-ok").hide();
		$( container + " .linhaSs").eq(index).addClass("disabled");
	};

	setMessage( customMsg ){
		var msgEmptyResults = (customMsg) ?  customMsg : "Nenhum resultado encontrado para o termo informado.";
		$(this._prop._queryContent).html( "<p style='margin-top: 2px;'><strong> "+msgEmptyResults+" </strong></p>" );
	};

};