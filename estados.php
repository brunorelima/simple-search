<?php
// sleep(5);

header('Content-Type: application/json; charset=utf-8');

//Recebe parametros
$cmUfDsSigla = isset($_REQUEST["cmUfDsSigla"]) ? $_REQUEST["cmUfDsSigla"] : null;
$cmUfDsNome = isset($_REQUEST["cmUfDsNome"]) ? $_REQUEST["cmUfDsNome"] : null;
$busca = isset($_REQUEST["busca"]) ? $_REQUEST["busca"] : "";
$pagina = (isset($_REQUEST["pagina"]) ? $_REQUEST["pagina"] : 1);

$saida = array();

function tirarAcentos($string){
	return preg_replace(array("/(á|à|ã|â|ä)/","/(Á|À|Ã|Â|Ä)/","/(é|è|ê|ë)/","/(É|È|Ê|Ë)/","/(í|ì|î|ï)/","/(Í|Ì|Î|Ï)/","/(ó|ò|õ|ô|ö)/","/(Ó|Ò|Õ|Ô|Ö)/","/(ú|ù|û|ü)/","/(Ú|Ù|Û|Ü)/","/(ñ)/","/(Ñ)/"),explode(" ","a A e E i I o O u U n N"),$string);
}

$todosEstados = json_decode('
		[
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
		]		
		');

$estadosFiltrados = $todosEstados;

if (!empty($busca)){
	$estadosFiltrados = array();
	foreach ($todosEstados as $key => $item) {
		if ( (stripos( tirarAcentos($item->ds_nome), tirarAcentos($busca)) !== false) || (stripos( tirarAcentos($item->ds_sigla), tirarAcentos($busca)) !== false)  ){
			$estadosFiltrados[] = $item;	
		}
	}
}

if (!empty($cmUfDsSigla)){
	$estadosFiltrados = ($estadosFiltrados != $todosEstados) ? $estadosFiltrados : array();
	foreach ($todosEstados as $key => $item) {
		if ( (stripos( tirarAcentos($item->ds_sigla), tirarAcentos($cmUfDsSigla)) !== false)  ){
			$estadosFiltrados[] = $item;	
		}
	}
}

if (!empty($cmUfDsNome)){
	$estadosFiltrados = ($estadosFiltrados != $todosEstados) ? $estadosFiltrados : array();
	foreach ($todosEstados as $key => $item) {
		if ( (stripos( tirarAcentos($item->ds_nome), tirarAcentos($cmUfDsNome)) !== false)  ){
			$estadosFiltrados[] = $item;	
		}
	}
}

$tamanhoPagina = 10;
$offset = ($pagina - 1) * $tamanhoPagina;

$qtdPaginasTotal = ceil(sizeof($estadosFiltrados) / $tamanhoPagina);
$estadosFiltrados = array_slice($estadosFiltrados, $offset, $tamanhoPagina);


$saida["status"] = "ok";
$saida["obj"]["registros"] = $estadosFiltrados;

$saida["obj"]["propriedades"]["qtdPaginasTotal"] = $qtdPaginasTotal; //3;
for ($i = 1; $i <= $qtdPaginasTotal; $i++) {
	$saida["obj"]["navegacao"]["paginas"][] = array('pagina'=> $i, 'legenda'=> $i, 'active'=> ($pagina == $i ? "active" : "") );
}

echo json_encode( $saida );



/*
	//Simula um erro
	$saida["status"] = "erro";
	$saida["msg"] = "Simulando erro";
	$saida["obj"] = "";
*/




/*
 * Exemplo de saída:
 * 
 * {
	status: "ok",
	obj: {
		registros: [
			{
				id: 1,
				ds_sigla: "AC",
				ds_nome: "Acre"
			},
			{
				id: 2,
				ds_sigla: "AL",
				ds_nome: "Alagoas"
			},
			{
				id: 3,
				ds_sigla: "AM",
				ds_nome: "Amazonas"
			},
			//...		  
		],
		propriedades: {
			qtdPaginasTotal: 3
		},
		navegacao: {
			paginas: [
				{
					pagina: 1,
					legenda: 1,
					active: "active"
				},
				{
					pagina: 2,
					legenda: 2,
					active: ""
				},
				{
					pagina: 3,
					legenda: 3,
					active: ""
				}
			]
		}
	}
}

*/
