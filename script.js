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

// Adicionar ícones de tema lado a lado
const temaIconeClaro = document.createElement('span');
temaIconeClaro.className = 'tema-icone';
temaIconeClaro.innerHTML = '⚪'; // Ícone de círculo claro

const temaIconeEscuro = document.createElement('span');
temaIconeEscuro.className = 'tema-icone';
temaIconeEscuro.innerHTML = '⚫'; // Ícone de círculo escuro

const separador = document.createElement('span');
separador.className = 'tema-separador';
separador.innerHTML = ' / ';

const temaContainer = document.createElement('div');
temaContainer.className = 'tema-container';
temaContainer.appendChild(temaIconeClaro);
temaContainer.appendChild(separador);
temaContainer.appendChild(temaIconeEscuro);

botaoTrabalho.parentElement.insertBefore(temaContainer, botaoTrabalho);

// Carregar tema salvo
function carregarTema() {
  const temaSalvo = localStorage.getItem('tema');
  if (temaSalvo === 'escuro') {
    document.body.classList.add('tema-escuro');
  }
}

// Alternar tema
function alternarTema() {
  document.body.classList.toggle('tema-escuro');
  if (document.body.classList.contains('tema-escuro')) {
    localStorage.setItem('tema', 'escuro');
  } else {
    localStorage.setItem('tema', 'claro');
  }
}

temaContainer.addEventListener('click', alternarTema);

// Carregar tema ao iniciar
carregarTema();

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
function atualizarCalendario(mes, ano) {
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
    const chaveAnotacao = `${ano}-${mes}-${dia}`;
    const temAnotacao = localStorage.getItem(chaveAnotacao);
    calendarioEl.innerHTML += `<div class="dia ${tipo} ${temAnotacao ? 'com-anotacao' : ''}" style="background-color: ${cor}" data-dia="${dia}" data-mes="${mes}" data-ano="${ano}">${dia}</div>`;
  }

  // Adicionar evento de clique para abrir o modal de anotações
  const dias = document.querySelectorAll('.dia');
  dias.forEach(diaEl => {
    diaEl.addEventListener('click', function() {
      const dia = parseInt(diaEl.getAttribute('data-dia'));
      const mes = parseInt(diaEl.getAttribute('data-mes'));
      const ano = parseInt(diaEl.getAttribute('data-ano'));
      abrirModalAnotacao(dia, mes, ano);
    });
  });
}

// Variáveis para controle de arrasto
let startX = 0;
let endX = 0;

// Função para iniciar o arrasto
function iniciarArrasto(event) {
  startX = event.touches ? event.touches[0].clientX : event.clientX;
}

// Função para finalizar o arrasto
function finalizarArrasto(event) {
  endX = event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
  const diffX = endX - startX;

  if (diffX > 50) {
    // Arrastou para a direita, mês anterior
    mudarMes(-1);
  } else if (diffX < -50) {
    // Arrastou para a esquerda, próximo mês
    mudarMes(1);
  }
}

// Função para mudar o mês com animação
function mudarMes(direcao) {
  // Adicionar classe de animação
  if (direcao === -1) {
    calendarioEl.classList.add('calendario-proximo-mes');
  } else if (direcao === 1) {
    calendarioEl.classList.add('calendario-mes-anterior');
  }

  // Esperar a animação terminar antes de mudar o mês
  setTimeout(() => {
    dataAtual.setMonth(dataAtual.getMonth() + direcao);
  renderizarCalendario(dataAtual.getMonth(), dataAtual.getFullYear());

    // Remover classes de animação
    calendarioEl.classList.remove('calendario-mes-anterior', 'calendario-proximo-mes');
  }, 300); // Tempo da animação em milissegundos
}

// Adicionar eventos de arrasto ao calendário
calendarioEl.addEventListener('mousedown', iniciarArrasto);
calendarioEl.addEventListener('touchstart', iniciarArrasto);
calendarioEl.addEventListener('mouseup', finalizarArrasto);
calendarioEl.addEventListener('touchend', finalizarArrasto);

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
  
  // Adicionar a opção para remover escalas
  const removerOption = document.createElement('option');
  removerOption.value = "remover";
  removerOption.textContent = "🗑️ Remover Escala";
  cicloSelect.appendChild(removerOption);
  
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
    exibirModalAlerta('Erro ao salvar escala. Por favor, recarregue a página.');
    return;
  }
  
  const nomeEscalaValue = nomeEscala.value.trim();
  const cicloValue = cicloNova.value.toUpperCase().replace(/[^TF]/g, '');
  
  console.log('Nome da escala:', nomeEscalaValue);
  console.log('Ciclo:', cicloValue);
  console.log('Estado atual das escalas:', JSON.stringify(escalas));

  if (!nomeEscalaValue) {
    console.log('Erro: nome da escala não preenchido');
    exibirModalAlerta("Por favor, preencha o nome da escala.");
    return;
  }

  if (!cicloValue || cicloValue.length < 2) {
    console.log('Erro: ciclo deve ter pelo menos 2 dias');
    exibirModalAlerta("O ciclo deve ter pelo menos 2 dias com caracteres T ou F.");
    return;
  }

  if (escalas.some(escala => escala.nome === nomeEscalaValue)) {
    console.log('Erro: escala com este nome já existe');
    exibirModalAlerta("Já existe uma escala com este nome. Por favor, escolha outro nome.");
    return;
  }

  const novaEscala = {
    nome: nomeEscalaValue,
    dataInicial: new Date().toISOString().split('T')[0],
    ciclo: cicloValue
  };

  console.log('Nova escala a ser adicionada:', JSON.stringify(novaEscala));
  
  escalas.push(novaEscala);
  console.log('Escalas após adicionar:', JSON.stringify(escalas));
  
  try {
    localStorage.setItem('escalas', JSON.stringify(escalas));
    console.log('Escalas salvas com sucesso no localStorage');
    
    const escalasVerificacao = localStorage.getItem('escalas');
    console.log('Escalas no localStorage:', escalasVerificacao);
    
    atualizarSelectEscalas();
    console.log('Select de escalas atualizado');
    
    fecharModalNovaEscala();
    
    abrirModal();
    
    console.log('===== Fim da função salvarNovaEscala =====');
  } catch (error) {
    console.error('Erro ao salvar escalas no localStorage:', error);
    exibirModalAlerta('Não foi possível salvar a escala. Verifique se o armazenamento local está disponível.');
  }
}

// Função para salvar a escala aplicada
function salvarEscalaAplicada() {
  const escalaAplicada = {
    dataInicial: dataInicialEscala.toISOString(),
    cicloEscala: cicloEscala
  };
  
  try {
    localStorage.setItem('escalaAplicada', JSON.stringify(escalaAplicada));
    console.log('Escala aplicada salva no localStorage', escalaAplicada);
  } catch (error) {
    console.error('Erro ao salvar escala aplicada:', error);
  }
}

// Função para carregar a escala aplicada
function carregarEscalaAplicada() {
  try {
    const escalaAplicadaSalva = localStorage.getItem('escalaAplicada');
    
    if (escalaAplicadaSalva) {
      const escalaAplicada = JSON.parse(escalaAplicadaSalva);
      dataInicialEscala = new Date(escalaAplicada.dataInicial);
      cicloEscala = escalaAplicada.cicloEscala;
      console.log('Escala aplicada carregada do localStorage', escalaAplicada);
    }
  } catch (error) {
    console.error('Erro ao carregar escala aplicada:', error);
  }
}

// Modificar a função aplicarEscala para salvar a escala aplicada
function aplicarEscala() {
  const dataInput = document.getElementById("dataInicial").value;
  const cicloValue = cicloSelect.value;

  if (!dataInput) {
    exibirModalAlerta("Por favor, selecione uma data inicial.");
    return;
  }

  if (cicloValue === "") {
    exibirModalAlerta("Por favor, selecione uma escala.");
    return;
  }

  if (cicloValue === "criar") {
    exibirModalAlerta("Por favor, crie uma nova escala primeiro.");
    return;
  }

  const escala = escalas[cicloValue];
  dataInicialEscala = new Date(dataInput);
  cicloEscala = escala.ciclo;
  
  // Salvar a escala aplicada
  salvarEscalaAplicada();
  
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
    } else if (value === "remover") {
      console.log('Opção de remover escala selecionada');
      abrirModalGerenciarEscalas();
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

// Função para abrir o modal de anotações
function abrirModalAnotacao(dia, mes, ano) {
  const modalAnotacao = document.createElement('div');
  modalAnotacao.className = 'modal';
  modalAnotacao.style.display = 'flex';
  modalAnotacao.id = 'modalAnotacao';

  // Conteúdo do modal
  modalAnotacao.innerHTML = `
    <div class="modal-content">
      <h3>Anotações para ${dia}/${mes + 1}/${ano}</h3>
      <textarea id="anotacaoTexto" rows="5" style="width: 100%;"></textarea>
      <div class="modal-buttons">
        <button class="btn-cancelar" id="btnCancelarAnotacao">Cancelar</button>
        <button class="btn-salvar" id="btnSalvarAnotacao">Salvar</button>
      </div>
    </div>
  `;

  // Adicionar o modal ao DOM
  document.body.appendChild(modalAnotacao);

  // Carregar anotação existente, se houver
  const chaveAnotacao = `${ano}-${mes}-${dia}`;
  const anotacaoSalva = localStorage.getItem(chaveAnotacao);
  if (anotacaoSalva) {
    document.getElementById('anotacaoTexto').value = anotacaoSalva;
  }

  // Event listeners para salvar e cancelar
  document.getElementById('btnSalvarAnotacao').addEventListener('click', function() {
    const textoAnotacao = document.getElementById('anotacaoTexto').value;
    localStorage.setItem(chaveAnotacao, textoAnotacao);
    exibirModalAlerta('Anotação salva com sucesso!');
    document.body.removeChild(modalAnotacao);
    
    // Atualizar o calendário mensal
    renderizarCalendario(dataAtual.getMonth(), dataAtual.getFullYear());
  });

  document.getElementById('btnCancelarAnotacao').addEventListener('click', function() {
    document.body.removeChild(modalAnotacao);
  });
}

// Função para exibir um modal de confirmação
function exibirModalConfirmacao(mensagem, onConfirmar, onCancelar) {
  const modalConfirmacao = document.createElement('div');
  modalConfirmacao.className = 'modal';
  modalConfirmacao.style.display = 'flex';
  modalConfirmacao.id = 'modalConfirmacao';

  // Conteúdo do modal
  modalConfirmacao.innerHTML = `
    <div class="modal-content">
      <h3>Confirmação</h3>
      <p>${mensagem}</p>
      <div class="modal-buttons">
        <button class="btn-cancelar" id="btnCancelarConfirmacao">Cancelar</button>
        <button class="btn-salvar" id="btnConfirmar">Confirmar</button>
      </div>
    </div>
  `;

  // Adicionar o modal ao DOM
  document.body.appendChild(modalConfirmacao);

  // Event listeners para confirmar e cancelar
  document.getElementById('btnConfirmar').addEventListener('click', function() {
    onConfirmar();
    document.body.removeChild(modalConfirmacao);
  });

  document.getElementById('btnCancelarConfirmacao').addEventListener('click', function() {
    if (onCancelar) onCancelar();
    document.body.removeChild(modalConfirmacao);
  });
}

// Função para exibir um modal de alerta
function exibirModalAlerta(mensagem) {
  const modalAlerta = document.createElement('div');
  modalAlerta.className = 'modal';
  modalAlerta.style.display = 'flex';
  modalAlerta.id = 'modalAlerta';

  // Conteúdo do modal
  modalAlerta.innerHTML = `
    <div class="modal-content">
      <h3>Alerta</h3>
      <p>${mensagem}</p>
      <div class="modal-buttons">
        <button class="btn-salvar" id="btnFecharAlerta">Fechar</button>
      </div>
    </div>
  `;

  // Adicionar o modal ao DOM
  document.body.appendChild(modalAlerta);

  // Event listener para fechar o alerta
  document.getElementById('btnFecharAlerta').addEventListener('click', function() {
    document.body.removeChild(modalAlerta);
  });
}

// Função para remover uma escala
function removerEscala(index) {
  console.log(`Removendo escala de índice ${index}`);
  
  if (index < 0 || index >= escalas.length) {
    console.error(`Índice inválido: ${index}`);
    return false;
  }
  
  const nomeEscala = escalas[index].nome;
  
  escalas.splice(index, 1);
  
  try {
    localStorage.setItem('escalas', JSON.stringify(escalas));
    console.log('Escalas atualizadas no localStorage após remoção');
    
    atualizarSelectEscalas();
    return true;
  } catch (error) {
    console.error('Erro ao salvar escalas após remoção:', error);
    exibirModalAlerta('Não foi possível remover a escala. Tente novamente.');
    return false;
  }
}

// Função para abrir modal de gerenciamento de escalas
function abrirModalGerenciarEscalas() {
  console.log('Abrindo modal para gerenciar escalas');
  
  fecharModal();
  
  const modalGerenciar = document.createElement('div');
  modalGerenciar.className = 'modal';
  modalGerenciar.style.display = 'flex';
  modalGerenciar.id = 'modalGerenciarEscalas';
  
  modalGerenciar.innerHTML = `
    <div class="modal-content">
      <h3>Gerenciar Escalas</h3>
      <div id="listaEscalas" class="lista-escalas">
        ${escalas.length > 0 ? '' : '<p>Não há escalas cadastradas.</p>'}
      </div>
      <div class="modal-buttons">
        <button class="btn-cancelar" id="btnFecharGerenciamento">Voltar</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modalGerenciar);
  
  const listaEscalas = document.getElementById('listaEscalas');
  if (listaEscalas && escalas.length > 0) {
    escalas.forEach((escala, index) => {
      const itemEscala = document.createElement('div');
      itemEscala.className = 'item-escala';
      itemEscala.innerHTML = `
        <div class="info-escala">
          <span class="nome-escala">${escala.nome}</span>
          <span class="ciclo-escala">Ciclo: ${escala.ciclo}</span>
        </div>
        <button class="btn-remover" data-index="${index}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      `;
      listaEscalas.appendChild(itemEscala);
    });
  }
  
  document.getElementById('btnFecharGerenciamento').addEventListener('click', function() {
    document.body.removeChild(modalGerenciar);
    abrirModal();
  });
  
  modalGerenciar.addEventListener('click', function(event) {
    if (event.target.closest('.btn-remover')) {
      const botao = event.target.closest('.btn-remover');
      const index = parseInt(botao.getAttribute('data-index'));
      
      exibirModalConfirmacao(`Tem certeza que deseja remover a escala "${escalas[index].nome}"?`, function() {
        if (removerEscala(index)) {
          document.body.removeChild(modalGerenciar);
          abrirModalGerenciarEscalas();
        }
      });
    }
  });
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
  
  // Adicionar validação para o campo de ciclo
  const cicloInput = document.getElementById('cicloNova');
  if (cicloInput) {
    // Validar durante digitação
    cicloInput.addEventListener('input', function(e) {
      // Converter para maiúsculo e manter apenas T e F
      let valorAtual = e.target.value.toUpperCase();
      let valorLimpo = valorAtual.replace(/[^TF]/g, '');
      
      // Se o valor foi modificado, atualizar o campo
      if (valorAtual !== valorLimpo) {
        e.target.value = valorLimpo;
      }
    });
    
    // Validar também no keydown para capturar antes da inserção
    cicloInput.addEventListener('keydown', function(e) {
      // Permitir teclas de controle (backspace, delete, setas, etc)
      if (e.ctrlKey || e.metaKey || e.key.length > 1) {
        return;
      }
      
      // Converter a tecla para maiúsculo e verificar se é T ou F
      const key = e.key.toUpperCase();
      if (key !== 'T' && key !== 'F') {
        e.preventDefault();
      }
    });
    
    console.log('Validação adicionada ao campo de ciclo');
  } else {
    console.error('Campo de ciclo não encontrado!');
  }
  
  // Carregar configurações
  carregarConfiguracoes();
  console.log('Configurações carregadas');
  
  // Carregar escalas
  carregarEscalas();
  console.log('Escalas carregadas:', escalas.length);
  
  // Atualizar select explicitamente
  atualizarSelectEscalas();
  
  // Carregar escala aplicada
  carregarEscalaAplicada();
  
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

function mostrarAnoCompleto() {
  // Função removida
  return;
}
