const calendarioEl = document.getElementById("calendario");
const cabecalhoEl = document.getElementById("cabecalho");
const modalEl = document.getElementById("modal");
const anoCompletoEl = document.getElementById("anoCompleto");
const calendarioPrincipalEl = document.getElementById("calendarioPrincipal");
const corTrabalhoEl = document.getElementById("corTrabalho");
const corFolgaEl = document.getElementById("corFolga");

// Elementos do DOM
const botaoTrabalho = document.querySelector('.botao-cor[data-tipo="trabalho"]');
const botaoFolga = document.querySelector('.botao-cor[data-tipo="folga"]');
const inputCorTrabalho = document.querySelector('.cor-input[data-tipo="trabalho"]');
const inputCorFolga = document.querySelector('.cor-input[data-tipo="folga"]');
const escalaSelect = document.getElementById("escalaSelect");
const modalNovaEscala = document.getElementById("modalNovaEscala");
const cicloSelect = document.getElementById("cicloSelect");
const anoAtualEl = document.getElementById("anoAtual");

let dataAtual = new Date();
let dataInicialEscala = new Date();
let cicloEscala = "TTFF";
let corTrabalho = "#22c55e";
let corFolga = "#f59e0b";

// Cores padrão
const CORES_PADRAO = {
  trabalho: '#22c55e',
  folga: '#f59e0b'
};

// Estrutura para armazenar as escalas
let escalas = [];

// Variáveis para armazenar o mês e ano originais
let mesOriginal = 0;
let anoOriginal = 0;

// Carregar configurações salvas
function carregarConfiguracoes() {
  const configSalva = localStorage.getItem('configuracoes');
  if (configSalva) {
    const config = JSON.parse(configSalva);
    if (config.cores) {
      botaoTrabalho.style.backgroundColor = config.cores.trabalho;
      botaoFolga.style.backgroundColor = config.cores.folga;
      inputCorTrabalho.value = config.cores.trabalho;
      inputCorFolga.value = config.cores.folga;
    }
  } else {
    // Usar cores padrão
    botaoTrabalho.style.backgroundColor = CORES_PADRAO.trabalho;
    botaoFolga.style.backgroundColor = CORES_PADRAO.folga;
    inputCorTrabalho.value = CORES_PADRAO.trabalho;
    inputCorFolga.value = CORES_PADRAO.folga;
  }
}

// Salvar configurações
function salvarConfiguracoes() {
  const config = {
    cores: {
      trabalho: inputCorTrabalho.value,
      folga: inputCorFolga.value
    }
  };
  localStorage.setItem('configuracoes', JSON.stringify(config));
}

// Event listeners para os inputs de cor
inputCorTrabalho.addEventListener('input', (e) => {
  botaoTrabalho.style.backgroundColor = e.target.value;
  salvarConfiguracoes();
  atualizarCalendario();
});

inputCorFolga.addEventListener('input', (e) => {
  botaoFolga.style.backgroundColor = e.target.value;
  salvarConfiguracoes();
  atualizarCalendario();
});

// Função para atualizar o calendário
function atualizarCalendario() {
  const dias = document.querySelectorAll('.dia');
  dias.forEach(dia => {
    if (dia.classList.contains('trabalho')) {
      dia.style.backgroundColor = inputCorTrabalho.value;
    } else if (dia.classList.contains('folga')) {
      dia.style.backgroundColor = inputCorFolga.value;
    }
  });
}

function renderizarCalendario(mes, ano) {
  calendarioEl.innerHTML = "";

  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  cabecalhoEl.textContent = primeiroDia.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  // Adicionar cabeçalho dos dias da semana
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  diasSemana.forEach(dia => {
    calendarioEl.innerHTML += `<div class="dia-semana">${dia}</div>`;
  });

  const diaSemanaInicio = primeiroDia.getDay();
  for (let i = 0; i < diaSemanaInicio; i++) {
    calendarioEl.innerHTML += `<div class="dia vazio"></div>`;
  }

  for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
    const data = new Date(ano, mes, dia);
    const diasDiferenca = Math.floor((data - dataInicialEscala) / (1000 * 60 * 60 * 24));
    const posicao = ((diasDiferenca % cicloEscala.length) + cicloEscala.length) % cicloEscala.length;
    const tipo = cicloEscala[posicao] === "T" ? "trabalho" : "folga";
    
    // Aplicar a cor diretamente no elemento
    const cor = tipo === "trabalho" ? inputCorTrabalho.value : inputCorFolga.value;
    calendarioEl.innerHTML += `<div class="dia ${tipo}" style="background-color: ${cor}">${dia}</div>`;
  }
}

function mudarMes(delta) {
  dataAtual.setMonth(dataAtual.getMonth() + delta);
  renderizarCalendario(dataAtual.getMonth(), dataAtual.getFullYear());
}

function abrirModal() {
  modalEl.style.display = "flex";
}

// Carregar escalas salvas
function carregarEscalas() {
  const escalasSalvas = localStorage.getItem('escalas');
  if (escalasSalvas) {
    escalas = JSON.parse(escalasSalvas);
    atualizarSelectEscalas();
  }
}

// Salvar escalas
function salvarEscalas() {
  localStorage.setItem('escalas', JSON.stringify(escalas));
}

// Atualizar o select de escalas
function atualizarSelectEscalas() {
  // Atualizar o select no modal de configuração
  cicloSelect.innerHTML = '<option value="">Selecione uma escala</option>';
  escalas.forEach((escala, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = escala.nome;
    cicloSelect.appendChild(option);
  });
  
  // Adicionar opção para criar nova escala
  const criarOption = document.createElement('option');
  criarOption.value = "criar";
  criarOption.textContent = "+ Criar Nova Escala";
  cicloSelect.appendChild(criarOption);
}

// Abrir modal de nova escala
function abrirModalNovaEscala() {
  modalNovaEscala.style.display = "flex";
}

// Fechar modal de configuração
function fecharModal() {
  modalEl.style.display = "none";
}

// Fechar modal de nova escala
function fecharModalNovaEscala() {
  modalNovaEscala.style.display = "none";
}

// Salvar nova escala
function salvarNovaEscala() {
  const nomeEscala = document.getElementById("nomeEscala").value;
  const ciclo = document.getElementById("cicloNova").value.toUpperCase().replace(/[^TF]/g, '');

  if (!nomeEscala || !ciclo) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  if (ciclo.length < 2) {
    alert("O ciclo deve ter pelo menos 2 dias.");
    return;
  }

  const novaEscala = {
    nome: nomeEscala,
    dataInicial: new Date().toISOString().split('T')[0], // Usar a data atual como padrão
    ciclo: ciclo
  };

  escalas.push(novaEscala);
  salvarEscalas();
  atualizarSelectEscalas();
  fecharModalNovaEscala();

  // Limpar campos
  document.getElementById("nomeEscala").value = "";
  document.getElementById("cicloNova").value = "";
}

// Event listener para o select de ciclos
cicloSelect.addEventListener('change', (e) => {
  const value = e.target.value;
  if (value === "criar") {
    // Fechar o modal atual e abrir o modal de nova escala
    fecharModal();
    abrirModalNovaEscala();
  } else if (value !== "") {
    // Selecionar a escala escolhida
    const escala = escalas[value];
    document.getElementById("dataInicial").value = escala.dataInicial;
  }
});

// Modificar a função aplicarEscala para usar o select
function aplicarEscala() {
  const dataInput = document.getElementById("dataInicial").value;
  const cicloValue = cicloSelect.value;

  if (!dataInput) {
    alert("Por favor, selecione uma data inicial.");
    return;
  }

  if (cicloValue === "") {
    alert("Por favor, selecione uma escala.");
    return;
  }

  if (cicloValue === "criar") {
    alert("Por favor, crie uma nova escala primeiro.");
    return;
  }

  const escala = escalas[cicloValue];
  dataInicialEscala = new Date(dataInput);
  cicloEscala = escala.ciclo;
  fecharModal();
  renderizarCalendario(dataAtual.getMonth(), dataAtual.getFullYear());
}

// Função para mudar o ano
function mudarAno(delta) {
  // Atualizar apenas o ano atual para exibição, sem afetar o ano original
  const anoAtual = dataAtual.getFullYear();
  dataAtual.setFullYear(anoAtual + delta);
  
  // Atualizar o título com o ano atual
  anoAtualEl.textContent = dataAtual.getFullYear();
  
  // Re-renderizar o calendário completo com o novo ano
  renderizarCalendariosAno();
}

// Função para voltar ao calendário mensal
function voltarParaCalendario() {
  // Restaurar o mês e ano originais
  dataAtual.setMonth(mesOriginal);
  dataAtual.setFullYear(anoOriginal);
  renderizarCalendario(dataAtual.getMonth(), dataAtual.getFullYear());
  
  const anoModal = document.getElementById("anoCompleto");
  anoModal.style.display = "none";
}

function mostrarAnoCompleto() {
  const container = document.getElementById("calendarios-container");
  container.innerHTML = "";

  // Armazenar o mês e ano atuais antes de mostrar o ano completo
  mesOriginal = dataAtual.getMonth();
  anoOriginal = dataAtual.getFullYear();

  const anoModal = document.getElementById("anoCompleto");
  anoModal.style.display = "flex";
  
  // Atualizar o título com o ano atual
  anoAtualEl.textContent = dataAtual.getFullYear();

  // Renderizar os calendários do ano
  renderizarCalendariosAno();
}

// Função para renderizar os calendários do ano
function renderizarCalendariosAno() {
  const container = document.getElementById("calendarios-container");
  container.innerHTML = "";
  
  for (let i = 0; i < 12; i++) {
    const mesEl = document.createElement("div");
    mesEl.classList.add("mes-item");
    
    // Criar miniatura do calendário
    const miniaturaCalendario = document.createElement("div");
    miniaturaCalendario.classList.add("miniatura-calendario");
    
    // Adicionar dias da semana na miniatura
    const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    diasSemana.forEach(dia => {
      miniaturaCalendario.innerHTML += `<div class="miniatura-dia-semana">${dia}</div>`;
    });

    // Calcular e adicionar os dias do mês
    const primeiroDia = new Date(dataAtual.getFullYear(), i, 1);
    const ultimoDia = new Date(dataAtual.getFullYear(), i + 1, 0);
    const diaSemanaInicio = primeiroDia.getDay();

    // Adicionar dias vazios no início
    for (let j = 0; j < diaSemanaInicio; j++) {
      miniaturaCalendario.innerHTML += `<div class="miniatura-dia vazio"></div>`;
    }

    // Adicionar os dias do mês
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const data = new Date(dataAtual.getFullYear(), i, dia);
      const diasDiferenca = Math.floor((data - dataInicialEscala) / (1000 * 60 * 60 * 24));
      const posicao = ((diasDiferenca % cicloEscala.length) + cicloEscala.length) % cicloEscala.length;
      const tipo = cicloEscala[posicao] === "T" ? "trabalho" : "folga";
      
      // Aplicar a cor diretamente no elemento
      const cor = tipo === "trabalho" ? inputCorTrabalho.value : inputCorFolga.value;
      miniaturaCalendario.innerHTML += `<div class="miniatura-dia ${tipo}" style="background-color: ${cor}">${dia}</div>`;
    }

    // Adicionar nome do mês e miniatura
    const nomeMes = document.createElement("div");
    nomeMes.classList.add("nome-mes");
    nomeMes.textContent = new Date(dataAtual.getFullYear(), i, 1).toLocaleDateString("pt-BR", { month: "long" });
    
    mesEl.appendChild(nomeMes);
    mesEl.appendChild(miniaturaCalendario);
    
    // Armazenar o índice do mês em uma variável para evitar problemas de escopo
    const mesIndex = i;
    
    mesEl.onclick = () => {
      // Definir o mês selecionado
      dataAtual.setMonth(mesIndex);
      renderizarCalendario(dataAtual.getMonth(), dataAtual.getFullYear());
      
      // Fechar o modal
      const anoModal = document.getElementById("anoCompleto");
      anoModal.style.display = "none";
    };
    
    container.appendChild(mesEl);
  }
}

// Carregar escalas ao iniciar
window.onload = () => {
  carregarConfiguracoes();
  carregarEscalas();
  renderizarCalendario(dataAtual.getMonth(), dataAtual.getFullYear());
};
