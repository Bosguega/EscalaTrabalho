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

// Abrir modal de configuração
function abrirModal() {
  console.log('Abrindo modal de configuração');
  
  // Atualizar o select de escalas para garantir que está com os dados atualizados
  atualizarSelectEscalas();
  
  // Garantir que a data inicial tenha um valor padrão, se estiver vazia
  const dataInput = document.getElementById("dataInicial");
  if (dataInput && !dataInput.value) {
    dataInput.value = new Date().toISOString().split('T')[0]; // Define a data atual como padrão
  }
  
  // Exibir o modal
  modalEl.style.display = "flex";
}

// Carregar escalas salvas
function carregarEscalas() {
  try {
    const escalasSalvas = localStorage.getItem('escalas');
    if (escalasSalvas) {
      escalas = JSON.parse(escalasSalvas);
      atualizarSelectEscalas();
    } else {
      console.log('Nenhuma escala salva encontrada');
    }
  } catch (error) {
    console.error('Erro ao carregar escalas:', error);
    escalas = []; // Inicializar com array vazio em caso de erro
  }
}

// Salvar escalas
function salvarEscalas() {
  try {
    localStorage.setItem('escalas', JSON.stringify(escalas));
    console.log('Escalas salvas com sucesso:', escalas);
  } catch (error) {
    console.error('Erro ao salvar escalas:', error);
    alert('Não foi possível salvar a escala. Verifique se o armazenamento local está disponível.');
  }
}

// Atualizar o select de escalas
function atualizarSelectEscalas() {
  console.log('Atualizando select de escalas');
  
  // Verificar se o elemento cicloSelect existe
  if (!cicloSelect) {
    console.error('Erro: cicloSelect não encontrado!');
    return;
  }
  
  // Limpar o conteúdo atual
  cicloSelect.innerHTML = '';
  
  // Adicionar a opção padrão
  const defaultOption = document.createElement('option');
  defaultOption.value = "";
  defaultOption.textContent = "Selecione uma escala";
  cicloSelect.appendChild(defaultOption);
  
  // Adicionar as escalas existentes
  if (escalas && escalas.length > 0) {
    console.log(`Adicionando ${escalas.length} escalas ao select`);
    escalas.forEach((escala, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = escala.nome;
      cicloSelect.appendChild(option);
    });
  } else {
    console.log('Não há escalas para adicionar ao select');
  }
  
  // Adicionar opção para criar nova escala
  const criarOption = document.createElement('option');
  criarOption.value = "criar";
  criarOption.textContent = "+ Criar Nova Escala";
  cicloSelect.appendChild(criarOption);
  
  console.log('Select atualizado com sucesso. Opções:', cicloSelect.options.length);
}

// Função para garantir que o modal de nova escala seja aberto
function handleCriarNovaEscala() {
  console.log("Iniciando processo para criar nova escala");
  
  // Verificar se o modal existe
  if (!modalNovaEscala) {
    console.error("Erro: Modal de nova escala não encontrado!");
    alert("Erro ao abrir o formulário de nova escala. Por favor, recarregue a página.");
    return;
  }
  
  // Limpar os campos
  const nomeInput = document.getElementById("nomeEscala");
  const cicloInput = document.getElementById("cicloNova");
  
  if (nomeInput) nomeInput.value = "";
  if (cicloInput) cicloInput.value = "";
  
  // Fechar o modal de configuração primeiro
  fecharModal();
  
  // Abrir o modal de nova escala
  console.log("Abrindo modal de nova escala");
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
  console.log('===== Início da função salvarNovaEscala =====');
  
  const nomeEscala = document.getElementById("nomeEscala");
  const cicloNova = document.getElementById("cicloNova");
  
  if (!nomeEscala || !cicloNova) {
    console.error('Elementos de formulário não encontrados!');
    alert('Erro ao salvar escala. Por favor, recarregue a página.');
    return;
  }
  
  const nomeEscalaValue = nomeEscala.value;
  const cicloValue = cicloNova.value.toUpperCase().replace(/[^TF]/g, '');
  
  console.log('Nome da escala:', nomeEscalaValue);
  console.log('Ciclo:', cicloValue);
  console.log('Estado atual das escalas:', JSON.stringify(escalas));

  if (!nomeEscalaValue || !cicloValue) {
    console.log('Erro: campos obrigatórios não preenchidos');
    alert("Por favor, preencha todos os campos.");
    return;
  }

  if (cicloValue.length < 2) {
    console.log('Erro: ciclo deve ter pelo menos 2 dias');
    alert("O ciclo deve ter pelo menos 2 dias.");
    return;
  }

  // Verificar se já existe uma escala com o mesmo nome
  if (escalas.some(escala => escala.nome === nomeEscalaValue)) {
    console.log('Erro: escala com este nome já existe');
    alert("Já existe uma escala com este nome. Por favor, escolha outro nome.");
    return;
  }

  const novaEscala = {
    nome: nomeEscalaValue,
    dataInicial: new Date().toISOString().split('T')[0], // Usar a data atual como padrão
    ciclo: cicloValue
  };

  console.log('Nova escala a ser adicionada:', JSON.stringify(novaEscala));
  
  // Adicionar a nova escala
  escalas.push(novaEscala);
  console.log('Escalas após adicionar:', JSON.stringify(escalas));
  
  // Salvar no localStorage
  try {
    localStorage.setItem('escalas', JSON.stringify(escalas));
    console.log('Escalas salvas com sucesso no localStorage');
    
    // Verificar se as escalas foram realmente salvas
    const escalasVerificacao = localStorage.getItem('escalas');
    console.log('Escalas no localStorage:', escalasVerificacao);
    
    // Atualizar o select
    atualizarSelectEscalas();
    console.log('Select de escalas atualizado');
    
    // Fechar modal e limpar campos
    fecharModalNovaEscala();
    
    // Reabrir o modal de configuração
    console.log('Reabrindo modal de configuração');
    abrirModal();
    
    console.log('===== Fim da função salvarNovaEscala =====');
  } catch (error) {
    console.error('Erro ao salvar escalas no localStorage:', error);
    alert('Não foi possível salvar a escala. Verifique se o armazenamento local está disponível.');
  }
}

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

// Função original para abrir o modal de nova escala
function abrirModalNovaEscala() {
  handleCriarNovaEscala();
}

// Adicionar delegação de eventos para modais e inputs
document.addEventListener('click', function(event) {
  const target = event.target;
  console.log('Clique detectado em:', target.tagName, target.id || target.className);
  
  // Verificar se o clique foi em um botão dentro dos modais
  if (target.id === 'btnSalvarNovaEscala') {
    console.log('Botão Salvar Nova Escala clicado via delegação');
    salvarNovaEscala();
  } else if (target.id === 'btnCancelarNovaEscala') {
    console.log('Botão Cancelar Nova Escala clicado via delegação');
    fecharModalNovaEscala();
  } else if (target.classList.contains('btn-aplicar')) {
    console.log('Botão Aplicar clicado via delegação');
    aplicarEscala();
  } else if (target.classList.contains('btn-cancelar') && !target.id) {
    console.log('Botão Cancelar modal principal clicado via delegação');
    fecharModal();
  }
});

// Adicionar delegação de eventos para select e outros inputs
document.addEventListener('change', function(event) {
  if (event.target.id === 'cicloSelect') {
    const value = event.target.value;
    console.log('Valor selecionado no cicloSelect via delegação:', value);
    
    if (value === "criar") {
      console.log('Opção de criar nova escala selecionada');
      // Chamar a função dedicada
      handleCriarNovaEscala();
    } else if (value !== "") {
      console.log('Escala existente selecionada, índice:', value);
      // Preencher a data inicial com a da escala selecionada (opcional)
      try {
        const escala = escalas[parseInt(value)];
        console.log('Escala selecionada:', JSON.stringify(escala));
        if (escala && escala.dataInicial) {
          document.getElementById("dataInicial").value = escala.dataInicial;
        }
      } catch (error) {
        console.error('Erro ao processar escala selecionada:', error);
      }
    }
  }
});

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

// Carregar configurações e escalas ao iniciar
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM carregado, inicializando aplicação...');
  
  // Inicializar a data atual
  dataAtual = new Date();
  console.log('Data atual inicializada:', dataAtual.toISOString());
  
  // Verificar elementos críticos
  if (!cicloSelect) {
    console.error('ERRO CRÍTICO: cicloSelect não encontrado na inicialização!');
  } else {
    console.log('cicloSelect encontrado com sucesso');
  }
  
  if (!modalNovaEscala) {
    console.error('ERRO CRÍTICO: modalNovaEscala não encontrado na inicialização!');
  } else {
    console.log('modalNovaEscala encontrado com sucesso');
  }
  
  // Carregar configurações
  carregarConfiguracoes();
  console.log('Configurações carregadas');
  
  // Carregar escalas
  carregarEscalas();
  console.log('Escalas carregadas:', escalas.length);
  
  // Atualizar select explicitamente
  atualizarSelectEscalas();
  
  // Renderizar calendário
  renderizarCalendario(dataAtual.getMonth(), dataAtual.getFullYear());
  console.log('Calendário renderizado');
  
  console.log('Inicialização concluída');
});

// Verificação adicional para debug
window.addEventListener('load', () => {
  // Verificar conteúdo do select após carregamento completo
  console.log('Estado do select após carregamento completo:');
  if (cicloSelect) {
    console.log('Número de opções:', cicloSelect.options.length);
    for (let i = 0; i < cicloSelect.options.length; i++) {
      console.log(`Opção ${i}:`, cicloSelect.options[i].value, cicloSelect.options[i].textContent);
    }
  } else {
    console.error('cicloSelect não encontrado no evento load!');
  }
});

// Registrar o Service Worker corrigido
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    console.log('Registrando Service Worker...');
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('ServiceWorker registrado com sucesso:', registration.scope);
      })
      .catch(error => {
        console.error('Falha ao registrar o ServiceWorker:', error);
      });
  });
}

// Adicionar verificação e log quando a página carregar
window.addEventListener('load', () => {
  console.log('Página carregada completamente');
  console.log('Elementos do modal nova escala:', {
    modal: modalNovaEscala ? 'existe' : 'não existe',
    btnSalvar: document.getElementById("btnSalvarNovaEscala") ? 'existe' : 'não existe',
    btnCancelar: document.getElementById("btnCancelarNovaEscala") ? 'existe' : 'não existe',
    inputNome: document.getElementById("nomeEscala") ? 'existe' : 'não existe',
    inputCiclo: document.getElementById("cicloNova") ? 'existe' : 'não existe'
  });
  console.log('Escalas carregadas:', escalas);
});
