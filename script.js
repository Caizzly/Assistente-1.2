// ─── DADOS ──────────────────────────────────────────────────────────
const SM_2026 = 1621.00;
const TITLES = {
  triagem: 'Triagem & Orientação', 'orientacao-oficial': 'Pauta do Oficial',
  familia: 'Família / Divórcio', interdicao: 'Interdição / Curatela',
  saude: 'Saúde / Cirurgia', habitacao: 'Habitação', educacao: 'Educação / Creche',
  detran: 'DETRAN / Veículos', previdencia: 'Previdência / BPC',
  consumidor: 'Consumidor / Bancário', oficios: 'Ofícios', declaracoes: 'Declarações',
  pecas: 'Peças Iniciais', calculadora: 'Calculadoras', glossario: 'Glossário Jurídico',
  contatos: 'Contatos e Varas'
};

// ─── NAV ────────────────────────────────────────────────────────────
function sw(id) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  event.currentTarget.classList.add('active');
  document.getElementById('page-title').textContent = TITLES[id] || id;
}

function switchInner(group, panel) {
  const prefix = group + '-';
  document.querySelectorAll(`[id^="${prefix}"]`).forEach(p => { if (p.classList.contains('inner-panel')) p.classList.remove('active'); });
  document.getElementById(prefix + panel).classList.add('active');
  const btns = event.currentTarget.closest('.tab-panel').querySelectorAll('.inner-tab');
  btns.forEach(b => b.classList.remove('active'));
  event.currentTarget.classList.add('active');
}

// ─── PROGRESSO GENÉRICO ──────────────────────────────────────────────
function calcProg(id) {
  const checkboxes = document.querySelectorAll(`#tab-${id} input[type=checkbox]`);
  const checked = [...checkboxes].filter(c => c.checked).length;
  const pct = checkboxes.length ? Math.round(checked / checkboxes.length * 100) : 0;
  const bar = document.getElementById('prog-' + id);
  const cnt = document.getElementById('cnt-' + id);
  if (bar) bar.style.width = pct + '%';
  if (cnt) cnt.textContent = `${checked} / ${checkboxes.length} marcados`;
}

// ─── TRIAGEM DINÂMICA ────────────────────────────────────────────────
const CHECKLISTS = {
  alimentos: {
    questoes: ['Qual a renda atual do alimentante?','Quantos filhos/dependentes?','Já houve acordo extrajudicial?','Há processo anterior? (nº, Vara)'],
    alertas: [
      {t:'danger', h:'Nexo de Parentesco', d:'Comprovar parentesco (certidão de nascimento ou casamento). Sem isso, não há ação de alimentos.'},
      {t:'info', h:'Binômio Necessidade-Possibilidade', d:'Art. 1.694 CC: para filhos menores, necessidade é presumida.'},
      {t:'warn', h:'Desconto em Folha', d:'Se o alimentante trabalha formalmente, solicitar dados da empresa para desconto em folha.'},
    ],
    docs: {
      'Documentos Básicos': ['RG e CPF do autor e do alimentando','Comprovante de endereço','Certidão de nascimento dos filhos','Conta bancária para depósito da pensão'],
      'Renda (todos os moradores)': ['CTPS + 3 holerites (empregado) ou 3 extratos bancários (autônomo/desempregado)']
    }
  },
  divorcio: {
    questoes: ['O divórcio é consensual ou litigioso?','Há filhos menores?','Há bens a partilhar?','Há histórico de violência doméstica?'],
    alertas: [
      {t:'danger', h:'Certidão de Casamento', d:'Deve ser atualizada — emitida nos últimos 90 dias.'},
      {t:'warn', h:'Pesquisa Fonética', d:'Válida por apenas 15 dias. Verificar antes de protocolar.'},
      {t:'info', h:'Valor da Causa', d:'Referência DPSP Jundiaí: R$ 19.452,00 (≈ 12× SM 2026). Com bens: 50% do valor.'},
    ],
    docs: {
      'Documentos Básicos': ['RG e CPF de ambos os cônjuges','Certidão de casamento atualizada','Certidões de nascimento dos filhos (se houver)','Documentos de bens a partilhar (imóvel, veículo)']
    }
  },
  interdicao: {
    questoes: ['Qual a relação de parentesco entre o autor e o interditando?','Há laudo médico público recente (até 6 meses) com CID?','A pessoa possui bens (imóvel, veículo, conta, benefício INSS)?'],
    alertas: [
      {t:'danger', h:'Laudo Médico — prazo máximo 6 meses', d:'Hospital PÚBLICO com CID e atestando incapacidade para atos da vida civil.'},
      {t:'danger', h:'Certidões obrigatórias', d:'SSP/SP + TJSP criminal + TJSP cível + TRF3 + PF. Sem todas, a Defensoria não atua.'},
      {t:'warn', h:'Firma Reconhecida', d:'Carta dos demais parentes e declaração de não oposição devem ter firma reconhecida.'},
    ],
    docs: {
      'Documentos Essenciais': ['RG e CPF do proponente e do interditando','Laudo médico público (máx. 6 meses) com CID','4 certidões (SSP + TJSP criminal + TRF3 + PF)','Declaração de Responsabilidade do Curador (formulário DPSP)'],
      'Renda': ['CTPS + holerites ou extratos de todos os moradores']
    }
  },
  vaga_creche: {
    questoes: ['Criança está inscrita na Secretaria Municipal de Educação?','Há recusa documentada por escrito?','Há 3 orçamentos de creches particulares?'],
    alertas: [
      {t:'danger', h:'3 Orçamentos Obrigatórios', d:'Com valor de matrícula, mensalidade (parcial e integral), CNPJ, assinatura e data.'},
      {t:'warn', h:'Comprovante de residência', d:'SOMENTE em nome dos pais (não dos avós).'},
    ],
    docs: {
      'Documentos': ['RG e CPF do responsável','Certidão de nascimento e cartão de vacinação da criança','Comprovante de residência (em nome dos pais)','Inscrição ou recusa documentada na SME','3 orçamentos de creches particulares','Declaração de ausência de auxílio-creche'],
      'Renda (todos os moradores)': ['CTPS + 3 holerites ou extratos de todos os membros']
    }
  },
  saude_alta_complexidade: {
    questoes: ['Qual o procedimento/medicamento solicitado?','Já houve pedido na rede pública? Foi negado formalmente?','Há urgência médica (risco de vida)?','Há laudo médico detalhando a necessidade?'],
    alertas: [
      {t:'info', h:'Tutela de Urgência', d:'Fumus boni iuris: laudo + negativa pública. Periculum in mora: risco de agravamento.'},
      {t:'warn', h:'NATIJUS', d:'Expedir ofício ao NATIJUS solicitando nota técnica para cirurgias de alta complexidade.'},
    ],
    docs: {
      'Documentos': ['RG e CPF do paciente','Laudo médico com CID','Prescrição médica atualizada','Negativa administrativa do SUS ou plano (se houver)'],
      'Renda': ['CTPS + 3 holerites ou 3 extratos de todos os moradores']
    }
  },
  alvara_pequena_monta: {
    questoes: ['Qual o valor e o banco do bem a ser levantado?','Qual o grau de parentesco com o falecido?','Há outros herdeiros?'],
    alertas: [{t:'info', h:'Procedimento', d:'Ação de alvará judicial. Verificar se o banco exige alvará ou apenas carta de autorização.'}],
    docs: {
      'Documentos': ['RG e CPF do requerente','Certidão de óbito','Documentos de parentesco','Extrato/saldo da conta bancária do falecido'],
      'Renda': ['Documentos de renda de todos os moradores']
    }
  },
  cumprimento_sentenca: {
    questoes: ['Qual a obrigação fixada na sentença (pagar, fazer, entregar)?','Como se comprova o descumprimento?','O processo está arquivado?'],
    alertas: [{t:'warn', h:'Desarquivamento', d:'Se o processo estiver arquivado, protocolar petição de desarquivamento antes.'}],
    docs: {
      'Documentos': ['RG e CPF do interessado e do requerido','Sentença com a obrigação a ser cumprida','Documentos que comprovem o descumprimento','Dados de 2 testemunhas (nome, RG, endereço)'],
      'Renda': ['CTPS + holerites ou extratos de todos os moradores']
    }
  },
  heranca_renuncia: {
    questoes: ['Em favor de quem será feita a renúncia?','A renúncia é total ou parcial?','Há outros herdeiros que também vão renunciar?'],
    alertas: [],
    docs: {
      'Documentos': ['RG e CPF do renunciante e de todos os herdeiros','Certidão de óbito do falecido','Documentos de parentesco','RG e CPF do beneficiário da renúncia'],
      'Renda': ['CTPS + extratos bancários de todos os moradores']
    }
  },
  despejo_desocupacao: {
    questoes: ['Há processo de despejo em andamento? Qual o número?','Qual o prazo concedido para desocupação?','Há crianças em idade escolar?'],
    alertas: [{t:'info', h:'CUEM', d:'Se o assistido ocupa imóvel público há mais de 5 anos, verificar possibilidade de CUEM (MP 2.220/2001).'}],
    docs: {
      'Documentos': ['RG e CPF do interessado','Contrato de locação ou declaração de posse','Intimação / mandado de despejo (cópia)','Documentos das crianças em idade escolar'],
      'Renda': ['CTPS + extratos bancários dos últimos 3 meses']
    }
  },
  religamento_energia: {
    questoes: ['Qual a distribuidora? (CPFL, ENEL, Elektro...)','A interrupção foi por inadimplência ou outro motivo?','Há pessoas vulneráveis na residência?'],
    alertas: [],
    docs: {
      'Documentos': ['RG e CPF do titular','Comprovante de endereço','Última fatura de energia ou histórico de débitos','CadÚnico (se inscrito)'],
      'Renda': ['CTPS + 3 holerites ou extratos de 3 meses']
    }
  },
  historico_debitos_agua: {
    questoes: ['Qual a empresa de saneamento?','O fornecimento foi cortado ou há corte iminente?','Deseja parcelamento, tarifa social ou contestação?'],
    alertas: [],
    docs: {
      'Documentos': ['RG e CPF do titular','Última conta de água ou histórico de débitos','CadÚnico (para tarifa social)'],
      'Renda': ['CTPS + extratos de 3 meses']
    }
  },
  execucao_alimentos: {
    questoes: ['Quantas parcelas estão em atraso?','Há decisão judicial fixando o pagamento?','O devedor trabalha? Possui bens?'],
    alertas: [{t:'danger', h:'Prisão civil', d:'Execução de alimentos pode ensejar prisão civil do devedor. Fundamentar em art. 528 CPC.'}],
    docs: {
      'Documentos': ['RG e CPF do credor','Decisão que fixou os alimentos','Comprovantes das parcelas em atraso','Dados do devedor: nome, CPF, endereço, local de trabalho'],
      'Renda': ['Documentos de renda de todos os moradores']
    }
  },
  professor_auxiliar: {
    questoes: ['Qual a escola (municipal ou estadual)?','A criança tem diagnóstico formal (TEA, etc.)?','Já houve pedido administrativo negado?'],
    alertas: [
      {t:'danger', h:'Laudo Médico Completo', d:'Deve conter nome da doença, CID, justificativa do cuidador. Para TEA: grau (Nível 1, 2 ou 3).'},
      {t:'danger', h:'Pedido Administrativo Prévio', d:'Necessária cópia do pedido administrativo negado.'},
    ],
    docs: {
      'Documentos': ['RG e CPF do responsável e da criança','Laudo médico completo com CID','Cópia do pedido administrativo negado','Formulário DPSP de Análise de Necessidade de Profissional Especializado','Comprovante de matrícula'],
      'Renda': ['CTPS + extratos de todos os moradores']
    }
  },
  transferencia_escola: {
    questoes: ['Qual o motivo da transferência?','A criança está inscrita na escola de destino?'],
    alertas: [{t:'info', h:'Procedimento', d:'Na maioria dos casos: ofício administrativo solicitando celeridade à SME.'}],
    docs: { 'Documentos': ['RG e CPF do responsável e da criança','Comprovante de matrícula atual','Documentos que justifiquem a transferência'] }
  },
  cdhu_info: {
    questoes: ['O financiamento está quitado ou em andamento?','Qual o nº do contrato e da matrícula do imóvel?'],
    alertas: [
      {t:'info', h:'Relatório de Quitação', d:'Quando quitado, solicitar especificamente o "relatório de quitação com força de escritura".'},
      {t:'info', h:'E-mail CDHU', d:'Enviar resposta para: jundiai.remoto@defensoria.sp.def.br. Solicitar resposta em 10 dias.'},
    ],
    docs: { 'Documentos': ['RG e CPF do titular','Contrato CDHU','Matrícula atualizada do imóvel','IPTU atualizado'] }
  },
  revisional_alimentante: {
    questoes: ['Qual a renda atual do alimentante?','Qual o valor atual da pensão fixada?','Houve redução de renda ou aumento de dependentes?'],
    alertas: [{t:'info', h:'Fundamento', d:'Art. 1.699 CC: revisão cabível quando o alimentante ou alimentando sofre alteração significativa na situação econômica.'}],
    docs: { 'Documentos': ['RG e CPF do alimentante','Decisão judicial que fixou os alimentos','Comprovante de renda atual','Documentos de nova composição familiar, se houver'] }
  },
  uniao_estavel: {
    questoes: ['Há prova documental da união (ao menos 1)?','Há bens comuns a partilhar?','Há filhos do casal?'],
    alertas: [{t:'danger', h:'Ao menos 1 documento de prova', d:'Fotografias, cartas, contrato conjunto, extrato bancário conjunto, IRPF, certidão de dependência INSS.'}],
    docs: {
      'Documentos': ['RG e CPF de ambos','Prova da união (ao menos 1 documento)','Documentos de bens comuns','Certidão de nascimento dos filhos'],
      'Renda': ['CTPS + extratos de todos os moradores']
    }
  },
  uniao_falecido: {
    questoes: ['Há certidão de óbito do companheiro?','Quem são os herdeiros do falecido? (pais, filhos, irmãos)','Há inventário em andamento?'],
    alertas: [
      {t:'danger', h:'Certidão de Óbito', d:'Obrigatória. Sem ela, não há como demonstrar o falecimento.'},
      {t:'danger', h:'Herdeiros', d:'Levantar nome e endereço de TODOS os herdeiros — serão réus ou intervenientes.'},
      {t:'warn', h:'Inventário', d:'Verificar no Distribuidor se há inventário em andamento. Certidão negativa do Colégio Notarial para extrajudicial.'},
    ],
    docs: {
      'Documentos': ['RG e CPF da autora','Certidão de óbito do companheiro','Documentos de prova da união','Dados de todos os herdeiros','Documentos de bens comuns'],
      'Renda': ['CTPS + extratos de todos os moradores']
    }
  },
  divorcio_conversao: {
    questoes: ['Há sentença de separação com trânsito em julgado?','Pretende voltar ao nome de solteiro(a)?','Há bens não partilhados?'],
    alertas: [{t:'warn', h:'Pesquisa Fonética', d:'Válida por apenas 15 dias. Verificar antes de protocolar.'}],
    docs: { 'Documentos': ['RG e CPF de ambos','Certidão de casamento atualizada','Sentença de separação com trânsito em julgado','Pesquisa fonética válida','Documentos dos filhos'] }
  },
  internacao: {
    questoes: ['Há relatório médico apontando necessidade de internação?','Foi feito pedido administrativo de internação? Há indeferimento?','A pessoa oferece risco a si ou a terceiros?','A pessoa já foi atendida pelo CAPS / CAPS-AD?'],
    alertas: [{t:'info', h:'CAPS', d:'Juntar documentos de atendimento na rede pública (CAPS, UPA) antes do ajuizamento.'}],
    docs: {
      'Documentos': ['RG e CPF do autor e da pessoa a ser internada','Relatório médico detalhado com indicação de internação','Indeferimento do pedido administrativo (se houver)','Boletim de Ocorrência (se há risco)','Documentos de atendimento no CAPS/UPA'],
      'Renda': ['CTPS + extratos de todos os moradores']
    }
  },
  sobrepartilha: {
    questoes: ['Há testamento? Foi aberto em cartório?','Quais os bens a partilhar? Há ITCMD a recolher?','Todos os herdeiros concordam?'],
    alertas: [],
    docs: { 'Documentos': ['RG e CPF de todos os herdeiros','Certidão de óbito','Documentos dos bens','Testamento (se houver)','Documentos de parentesco'] }
  },
};

function atualizarTriagem(val) {
  const d = CHECKLISTS[val];
  const qc = document.getElementById('questoes-container');
  const cc = document.getElementById('checklist-container');
  const ac = document.getElementById('alertas-container');
  if (!d) { qc.innerHTML = ''; cc.innerHTML = '<p class="placeholder-text">Selecione uma demanda.</p>'; ac.innerHTML = ''; document.getElementById('progress-wrap').style.display='none'; return; }
  ac.innerHTML = (d.alertas||[]).map(a => `<div class="alert alert-${a.t}"><strong>${a.h}</strong>${a.d}</div>`).join('');
  qc.innerHTML = '<h3 style="margin-top:12px;margin-bottom:8px;">Perguntas de Triagem</h3>' + d.questoes.map(q => `<div class="questao">${q}</div>`).join('');
  let html = '';
  Object.entries(d.docs).forEach(([sec, items]) => {
    html += `<div class="check-group"><div class="check-group-header">${sec}</div>`;
    items.forEach(it => { html += `<div class="check-item"><input type="checkbox" onchange="calcProgTriagem()"><span>${it}</span></div>`; });
    html += '</div>';
  });
  cc.innerHTML = html;
  document.getElementById('progress-wrap').style.display = 'block';
  calcProgTriagem();
}

function calcProgTriagem() {
  const all = document.querySelectorAll('#checklist-container input[type=checkbox]');
  const checked = [...all].filter(c=>c.checked).length;
  const pct = all.length ? Math.round(checked/all.length*100) : 0;
  document.getElementById('prog-bar').style.width = pct+'%';
  document.getElementById('prog-label').textContent = `${checked} / ${all.length} documentos marcados`;
}

// ─── PAUTA DO OFICIAL ────────────────────────────────────────────────
const DEMANDA_MAP = [
  {kw:['divórcio','divorc','casamento','certidão de casamento'], label:'Divórcio / Guarda / Alimentos', tab:'familia', acao:'Verificar certidão de casamento atualizada, documentos dos filhos (vacinação e matrícula), comprovante de endereço e bens.'},
  {kw:['alimentos','pensão','alimento','pensao'], label:'Ação de Alimentos', tab:'familia', acao:'Verificar certidão de nascimento dos filhos, renda do alimentante, conta bancária para depósito.'},
  {kw:['interdição','curatela','interdit','curatel'], label:'Interdição / Curatela', tab:'interdicao', acao:'Verificar laudo médico público (máx. 6 meses) com CID, certidões do proponente (SSP, TJSP, TRF3, PF).'},
  {kw:['levantamento de curatela','levantamento da curatela'], label:'Levantamento de Curatela', tab:'interdicao', acao:'Verificar laudo médico atualizado (IMESC ou público) atestando recuperação da capacidade. Agendar CAM e jurídico.'},
  {kw:['transporte especial'], label:'Transporte Especial', tab:'saude', acao:'Expedir ofício reiterado se necessário. Verificar laudo médico que justifique necessidade do transporte.'},
  {kw:['cirurgia','cirurg','operação','operacao'], label:'Cirurgia / Saúde', tab:'saude', acao:'Verificar laudo médico com CID, negativa administrativa do SUS. Expedir ofício para SMS/UGPS e NATIJUS.'},
  {kw:['medicament','remédio','remedio'], label:'Medicamento / Saúde', tab:'saude', acao:'Verificar prescrição médica atualizada, negativa do SUS ou plano de saúde.'},
  {kw:['alvará','levantamento de valores','pequena monta'], label:'Alvará — Levantamento de Valores', tab:'triagem', acao:'Verificar documentos de parentesco, certidão de óbito, extrato bancário do falecido.'},
  {kw:['ofício reiterado','oficio reiterado'], label:'Ofício Reiterado', tab:'oficios', acao:'Verificar nº do ofício anterior e órgão destinatário. Gerar novo ofício com referência ao anterior.'},
  {kw:['creche','escola','transferência de escola','professor auxiliar'], label:'Educação', tab:'educacao', acao:'Verificar inscrição na SME, 3 orçamentos de creches particulares, declaração de ausência de auxílio-creche.'},
  {kw:['cdhu','habitação','contrato cdhu','contrato da cdhu'], label:'CDHU / Habitação', tab:'habitacao', acao:'Verificar contrato CDHU, matrícula atualizada do imóvel, comprovante de pagamento das parcelas.'},
  {kw:['detran','veículo','veiculo','placa'], label:'DETRAN / Veículo', tab:'detran', acao:'Verificar RENAVAM, placa, BO (se roubo/furto), e se há terceiro de boa-fé envolvido.'},
  {kw:['morte presumida'], label:'Morte Presumida', tab:'triagem', acao:'Ação de declaração de morte presumida (art. 7º CC). Verificar certidão de nascimento, documentos de cônjuge e últimas informações sobre o desaparecimento.'},
  {kw:['inquérito policial','inquerito policial'], label:'Inquérito Policial', tab:'triagem', acao:'Encaminhar à assistida cópia integral do procedimento apuratório se possível.'},
  {kw:['remarcar','reagendar','remarcar atendimento'], label:'Reagendamento', tab:'triagem', acao:'Remarcar conforme disponibilidade da agenda.'},
  {kw:['bpc','loas','benefício','beneficio'], label:'BPC-LOAS / Previdência', tab:'previdencia', acao:'Verificar elegibilidade: renda per capita ≤ R$ 405,25, CadÚnico atualizado há menos de 24 meses. Encaminhar para DPU Campinas ou JEF de Jundiaí.'},
];

function analisarPauta() {
  const texto = document.getElementById('pauta-input').value.trim();
  if (!texto) return;
  const res = document.getElementById('pauta-resultado');
  const linhas = texto.split('\n').map(l => l.trim()).filter(l => l);
  let html = '';
  const lower = texto.toLowerCase();

  // Tentar identificar linhas de pauta estruturada
  const pauta_re = /(\d{2}:\d{2})\s*[-–]\s*(\d{5,})\s*[-–]\s*\*?(\w+)\s*[-–]\s*([^-–\n]+)\s*[-–]\s*([\s\S]+)/;
  const casos = [];
  let buffer = '';
  linhas.forEach((linha, i) => {
    if (/^\d{2}:\d{2}/.test(linha)) { if (buffer) casos.push(buffer.trim()); buffer = linha; }
    else { buffer += ' ' + linha; }
    if (i === linhas.length - 1 && buffer) casos.push(buffer.trim());
  });

  if (casos.length > 1) {
    // Formato estruturado
    html = `<div class="ia-card" style="margin-bottom:16px"><div class="ia-card-header">✦ ${casos.length} atendimento(s) identificado(s)</div><div class="ia-card-body">`;
    casos.forEach(caso => {
      const m = caso.match(/^(\d{2}:\d{2})\s*[-–]\s*(\d+)\s*[-–]\s*\*?(\w+)\s*[-–]\s*([^-–]+)\s*[-–]\s*([\s\S]+)/);
      if (m) {
        const [, hora, cpf, est, nome, orient] = m;
        const det = detectarDemandas(orient + ' ' + nome);
        html += `<div style="border:1px solid var(--rule);border-radius:4px;padding:12px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <strong>${hora} · ${nome.trim()}</strong>
            <span style="font-size:11px;color:var(--ink-3)">${est} · CPF: ${cpf}</span>
          </div>
          ${det.chips}
          <div class="ia-result" style="margin-top:8px"><h4>Orientação do Oficial</h4>${orient.trim()}</div>
          ${det.acoes ? `<div class="ia-result" style="margin-top:8px;background:#f0fff6"><h4>✦ Ação Sugerida</h4>${det.acoes}</div>` : ''}
        </div>`;
      }
    });
    html += '</div></div>';
  } else {
    // Relato livre
    const det = detectarDemandas(lower);
    html = `<div class="ia-card"><div class="ia-card-header">✦ Análise do Relato</div><div class="ia-card-body">
      ${det.chips || '<span style="font-size:12px;color:var(--ink-3)">Nenhuma demanda identificada automaticamente.</span>'}
      ${det.acoes ? `<div class="ia-result" style="margin-top:10px"><h4>Demanda Provável + Próximos Passos</h4>${det.acoes}</div>` : ''}
      ${det.tab ? `<button class="btn btn-primary btn-sm" style="margin-top:10px" onclick="sw('${det.tab}');document.querySelectorAll('.tab-btn').forEach(b=>{if(b.onclick&&b.onclick.toString().includes('${det.tab}'))b.classList.add('active')})">Ver aba completa →</button>` : ''}
    </div></div>`;
  }

  res.innerHTML = html;
}

function detectarDemandas(texto) {
  const lower = texto.toLowerCase();
  const matches = DEMANDA_MAP.filter(d => d.kw.some(k => lower.includes(k)));
  if (!matches.length) return {chips: '', acoes: '', tab: ''};
  const chips = matches.map(m => `<span class="chip chip-familia">${m.label}</span>`).join(' ');
  const acoes = matches.map(m => `<strong>${m.label}:</strong> ${m.acao}`).join('<br><br>');
  return {chips, acoes, tab: matches[0].tab};
}

// ─── CALCULADORA ALIMENTOS ───────────────────────────────────────────
function calcAlimentos() {
  const sit = document.getElementById('calc-situacao').value;
  const fw = document.getElementById('calc-formal-wrap');
  const iw = document.getElementById('calc-informal-wrap');
  fw.style.display = sit === 'formal' ? 'block' : 'none';
  iw.style.display = sit === 'informal' ? 'block' : 'none';
  const ref = document.getElementById('calc-informal-ref');
  if (ref) document.getElementById('calc-custom-wrap').style.display = ref.value === 'custom' ? 'block' : 'none';
  if (!sit) return;
  let html = '';
  if (sit === 'formal') {
    const bruto = parseFloat(document.getElementById('calc-bruto').value)||0;
    const inss = parseFloat(document.getElementById('calc-inss').value)||0;
    const sind = parseFloat(document.getElementById('calc-sindicato').value)||0;
    const pct = parseFloat(document.getElementById('calc-percentual').value)||33.33;
    if (!bruto) return;
    const liq = bruto - inss - sind;
    const pensao = liq * (pct/100);
    html = `<strong>Salário bruto:</strong> R$ ${bruto.toFixed(2)}<br><strong>Descontos:</strong> R$ ${(inss+sind).toFixed(2)}<br><strong>Líquido:</strong> R$ ${liq.toFixed(2)}<hr style="margin:8px 0"><strong style="font-size:15px;color:var(--ok)">💰 Pensão mensal: R$ ${pensao.toFixed(2)}</strong><br><strong>13º (parte da pensão):</strong> R$ ${pensao.toFixed(2)}<br><strong>Férias (1/3 + mês):</strong> R$ ${(pensao*4/3).toFixed(2)}`;
  } else {
    if (!ref) return;
    let valor = 0;
    if (ref.value==='1') valor=SM_2026;
    else if (ref.value==='1.5') valor=SM_2026*1.5;
    else if (ref.value==='2') valor=SM_2026*2;
    else valor = parseFloat(document.getElementById('calc-custom').value)||0;
    if (!valor) return;
    html = `<strong>Salário mínimo 2026:</strong> R$ ${SM_2026.toFixed(2)}<hr style="margin:8px 0"><strong style="font-size:15px;color:var(--ok)">💰 Pensão: R$ ${valor.toFixed(2)}/mês</strong><br><small>Depositado até o dia 10 de cada mês. Reajuste automático pelo SM vigente.</small>`;
  }
  const r = document.getElementById('resultado-alimentos');
  r.style.display='block';
  r.innerHTML = html;
}

// ─── CALCULADORA VALOR DA CAUSA ──────────────────────────────────────
function calcValorCausa() {
  const tipo = document.getElementById('calc-vc-tipo').value;
  const wrap = document.getElementById('calc-vc-campos');
  const res = document.getElementById('resultado-vc');
  res.style.display='none'; wrap.innerHTML='';
  const add = (id,lb,ph) => { wrap.innerHTML += `<div><label>${lb}</label><input type="number" id="${id}" placeholder="${ph}" oninput="calcVC()" step="0.01"></div>`; };
  if (tipo==='alimentos_12x') { add('vc-pensao','Valor da pensão mensal (R$)','Ex: 1621.00'); }
  else if (tipo==='divorcio_sem_bens') {
    res.style.display='block';
    res.innerHTML='<strong style="font-size:14px;color:var(--ok)">Valor sugerido: R$ 19.452,00</strong><br><small>≈ 12× salário mínimo 2026 (referência DPSP Jundiaí)</small>';
    return;
  } else if (tipo==='divorcio_com_bens') { add('vc-bens','Valor total dos bens a partilhar (R$)','Ex: 150000.00'); }
  else if (tipo==='execucao_alimentos') { add('vc-parcelas','Valor de cada parcela (R$)','Ex: 1621.00'); add('vc-qtd','Quantidade de parcelas em atraso','Ex: 6'); }
  else if (tipo==='cumprimento') { add('vc-obrigacao','Valor da obrigação (R$)','Ex: 5000.00'); }
}

function calcVC() {
  const tipo = document.getElementById('calc-vc-tipo').value;
  let valor=0, txt='';
  if (tipo==='alimentos_12x') { const p=parseFloat(document.getElementById('vc-pensao')?.value)||0; valor=p*12; txt=`R$ ${p.toFixed(2)} × 12 meses`; }
  else if (tipo==='divorcio_com_bens') { const b=parseFloat(document.getElementById('vc-bens')?.value)||0; valor=b*0.5; txt=`50% de R$ ${b.toFixed(2)}`; }
  else if (tipo==='execucao_alimentos') { const p=parseFloat(document.getElementById('vc-parcelas')?.value)||0; const q=parseFloat(document.getElementById('vc-qtd')?.value)||0; valor=p*q; txt=`R$ ${p.toFixed(2)} × ${q} parcelas`; }
  else if (tipo==='cumprimento') { valor=parseFloat(document.getElementById('vc-obrigacao')?.value)||0; txt=`Obrigação: R$ ${valor.toFixed(2)}`; }
  if (valor>0) {
    document.getElementById('resultado-vc').style.display='block';
    document.getElementById('resultado-vc').innerHTML=`${txt}<hr style="margin:6px 0"><strong style="font-size:15px;color:var(--ok)">Valor da causa: R$ ${valor.toLocaleString('pt-BR',{minimumFractionDigits:2})}</strong>`;
  }
}

// ─── CALCULADORA PRAZOS ──────────────────────────────────────────────
function calcPrazos() {
  const ini = document.getElementById('prazo-inicio').value;
  const tipo = document.getElementById('prazo-tipo').value;
  document.getElementById('prazo-custom-wrap').style.display = tipo==='custom'?'block':'none';
  if (!ini||!tipo) return;
  let dias = parseInt(tipo);
  const uteis = tipo.includes('clt') || tipo==='15'||tipo==='5';
  if (tipo==='custom') dias = parseInt(document.getElementById('prazo-custom-dias').value)||0;
  if (!dias) return;
  const d0 = new Date(ini+'T12:00:00');
  let df = new Date(d0);
  if (uteis) {
    let count=0;
    while(count<Math.abs(dias)) {
      df.setDate(df.getDate()+1);
      if(df.getDay()!==0&&df.getDay()!==6) count++;
    }
  } else df = new Date(d0.getTime()+dias*86400000);
  const opts={weekday:'long',day:'2-digit',month:'long',year:'numeric'};
  const diff=Math.ceil((df-new Date())/86400000);
  const r=document.getElementById('resultado-prazo');
  r.style.display='block';
  r.innerHTML=`<strong>Início:</strong> ${d0.toLocaleDateString('pt-BR',opts)}<br><strong>Prazo:</strong> ${dias} dias${uteis?' úteis':''}<hr style="margin:6px 0"><strong style="font-size:14px;color:var(--ok)">Vencimento: ${df.toLocaleDateString('pt-BR',opts)}</strong><br><small style="color:${diff<0?'var(--danger)':diff<=5?'var(--warn)':'var(--ink-3)'}">${diff<0?'⚠ PRAZO VENCIDO há '+Math.abs(diff)+' dias':diff===0?'⚠ VENCE HOJE':'Faltam '+diff+' dias'}</small>`;
}

// ─── PRESCRIÇÃO TRABALHISTA ──────────────────────────────────────────
function calcPrescricao() {
  const dem = document.getElementById('data-demissao').value;
  const aju = document.getElementById('data-ajuizamento').value;
  if (!dem) return;
  const dDem = new Date(dem+'T12:00:00');
  const dAju = aju ? new Date(aju+'T12:00:00') : new Date();
  const diffM = (dAju - dDem) / (1000*60*60*24*365.25);
  const bienal_ok = diffM <= 2;
  const quinqM = diffM > 5 ? (diffM - 5) : 0;
  const r = document.getElementById('resultado-prescricao');
  r.style.display='block';
  r.innerHTML=`<strong>Extinção do contrato:</strong> ${dDem.toLocaleDateString('pt-BR')}<br><strong>Data de referência:</strong> ${dAju.toLocaleDateString('pt-BR')}<br><strong>Tempo decorrido:</strong> ${diffM.toFixed(1)} anos<hr style="margin:6px 0">
  <span style="color:${bienal_ok?'var(--ok)':'var(--danger)'}"><strong>${bienal_ok?'✔ Dentro do prazo bienal':'✘ PRAZO BIENAL VENCIDO — ação extinta com resolução de mérito'}</strong></span>
  ${bienal_ok?`<br><br><strong>Créditos retroativos:</strong> apenas dos últimos 5 anos (a partir da distribuição)${quinqM>0?`<br><em>Atenção: créditos anteriores a ${new Date(dAju.getTime()-5*365.25*86400000).toLocaleDateString('pt-BR')} estão prescritos</em>`:''}` : ''}`;
}

// ─── OFÍCIOS ─────────────────────────────────────────────────────────
function g2(id) { const el=document.getElementById(id); return el?(el.value.trim()||el.placeholder||'___________'):'___________'; }
function dataFmt(v) { if(!v) return '___________'; const [y,m,d]=v.split('-'); const ms=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']; return `${parseInt(d)} de ${ms[parseInt(m)-1]} de ${y}`; }

function renderOficio() {
  const tipo = document.getElementById('tipo-oficio').value;
  const extra = document.getElementById('campo-extra-wrap');
  extra.innerHTML = '';
  if (!tipo) { document.getElementById('output-oficios').innerHTML='<span class="placeholder-text">Preencha os campos para gerar o ofício...</span>'; return; }
  const usuario = g2('nome-usuario'), cpf = g2('cpf-usuario'), end = g2('end-usuario'), defensor = g2('nome-defensor'), num = g2('num-oficio'), data = dataFmt(document.getElementById('data-oficio').value);

  const HEADER = (dest) => `DEFENSORIA PÚBLICA DO ESTADO DE SÃO PAULO
Unidade de Jundiaí
Ofício nº ${num}

Jundiaí, ${data}.

A(o) ${dest}

ASSUNTO: `;

  let texto = '';
  if (tipo==='religamento_cpfl') {
    texto = HEADER('Ilmo(a). Sr(a). Responsável\nCPFL Energia S.A.') + `Religamento de energia elétrica e aferimento de medidor — ${usuario} — CPF: ${cpf}

Por meio desta, em nome do(a) assistido(a) ${usuario}, CPF nº ${cpf}, residente na ${end}, solicita-se, respeitosamente, o religamento do fornecimento de energia elétrica no imóvel acima identificado, bem como o aferimento do medidor instalado no local.

Informa-se que o(a) assistido(a) é hipossuficiente econômico(a), encontrando-se em situação de vulnerabilidade social, razão pela qual recorre à Defensoria Pública.

Solicita-se, outrossim, que seja verificada a possibilidade de enquadramento do(a) assistido(a) na Tarifa Social de Energia Elétrica, bem como o parcelamento de eventuais débitos existentes.

Atenciosamente,

${defensor}
Defensor(a) Público(a)
Defensoria Pública do Estado de São Paulo — Jundiaí`;
  } else if (tipo==='historico_enel') {
    texto = HEADER('Ilmo(a). Sr(a). Responsável\nEnel Distribuição São Paulo S.A.') + `Histórico de débitos, proposta de acordo e regularização do fornecimento — ${usuario} — CPF: ${cpf}

Em nome do(a) assistido(a) ${usuario}, CPF nº ${cpf}, residente na ${end}, solicita-se, respeitosamente, o fornecimento do histórico completo de débitos, parcelas e consumo registrados no cadastro do referido imóvel, bem como apresentação de proposta de acordo para regularização dos valores em aberto.

Atenciosamente,

${defensor}
Defensor(a) Público(a)
Defensoria Pública do Estado de São Paulo — Jundiaí`;
  } else if (tipo==='dae_agua') {
    texto = HEADER('Ilmo(a). Sr(a). Diretor(a)\nDAE — Departamento de Água e Esgoto') + `Histórico de débitos e regularização do fornecimento de água — ${usuario} — CPF: ${cpf}

Em nome do(a) assistido(a) ${usuario}, CPF nº ${cpf}, residente na ${end}, solicita-se o fornecimento do histórico completo de débitos e proposta de parcelamento dos valores eventualmente em aberto, visando à regularização do serviço de abastecimento de água.

Atenciosamente,

${defensor}
Defensor(a) Público(a)
Defensoria Pública do Estado de São Paulo — Jundiaí`;
  } else if (tipo==='medico_interdicao') {
    extra.innerHTML = '<div><label>Nome da Unidade de Saúde</label><input type="text" id="nome-unidade" placeholder="Ex: UBS Central de Jundiaí" oninput="renderOficio()"></div>';
    const un = g2('nome-unidade');
    texto = HEADER(`Ilmo(a). Sr(a). Diretor(a)\n${un}`) + `Solicitação de declaração médica para fins de interdição judicial — Paciente: ${usuario} — CPF: ${cpf}

Solicita-se, respeitosamente, a expedição de declaração médica em favor do(a) paciente ${usuario}, CPF nº ${cpf}, residente na ${end}, contendo as seguintes informações, necessárias para instrução de ação de interdição judicial perante o Poder Judiciário:

a) diagnóstico atual da doença ou transtorno, com indicação expressa do Código Internacional de Doenças (CID);
b) descrição da condição clínica e histórico de tratamento;
c) avaliação expressa sobre a capacidade ou incapacidade do(a) paciente para os atos da vida civil.

O documento é essencial para que esta Defensoria Pública possa promover a devida proteção jurídica ao(à) assistido(a).

Atenciosamente,

${defensor}
Defensor(a) Público(a)
Defensoria Pública do Estado de São Paulo — Jundiaí`;
  } else if (tipo==='reiterado') {
    extra.innerHTML = '<div><label>Órgão destinatário</label><input type="text" id="orgao-dest" placeholder="Ex: Secretaria Municipal de Saúde de Jundiaí" oninput="renderOficio()"><label>Nº do ofício anterior</label><input type="text" id="num-ant" placeholder="Ex: 9854321/2025" oninput="renderOficio()"><label>Assunto original</label><input type="text" id="assunto-ant" placeholder="Descreva brevemente o pedido anterior" oninput="renderOficio()"></div>';
    texto = HEADER(`Ilmo(a). Sr(a). Responsável\n${g2('orgao-dest')}`) + `Ofício Reiterado — Referência: Ofício nº ${g2('num-ant')} — ${g2('assunto-ant')} — ${usuario}

Reitera-se o teor do Ofício nº ${g2('num-ant')}, enviado anteriormente a esse órgão, relativo a(o) ${g2('assunto-ant')}, em nome do(a) assistido(a) ${usuario}, CPF nº ${cpf}.

Até a presente data não recebemos resposta ao referido expediente. Em razão disso, renovamos o pedido e aguardamos manifestação no prazo de 10 (dez) dias.

A inércia ou negativa injustificada ensejará o imediato ajuizamento de ação judicial para tutela do direito do(a) assistido(a).

Atenciosamente,

${defensor}
Defensor(a) Público(a)
Defensoria Pública do Estado de São Paulo — Jundiaí`;
  } else if (tipo==='cdhu') {
    extra.innerHTML = '<div><label>Nº do Contrato CDHU</label><input type="text" id="cdhu-contrato" placeholder="Ex: 12345/SP" oninput="renderOficio()"><label>Nº da Matrícula do Imóvel</label><input type="text" id="cdhu-matricula" placeholder="Ex: 45678" oninput="renderOficio()"></div>';
    texto = HEADER('Ilmo(a). Sr(a). Responsável\nCDHU — Companhia de Desenvolvimento Habitacional e Urbano') + `Solicitação de informações contratuais — ${usuario} — CPF: ${cpf} — Contrato nº ${g2('cdhu-contrato')}

Em nome do(a) assistido(a) ${usuario}, CPF nº ${cpf}, residente na ${end}, titular do contrato de aquisição de imóvel nº ${g2('cdhu-contrato')}, matrícula nº ${g2('cdhu-matricula')}, solicita-se, respeitosamente:

a) informações sobre a situação atual do contrato (quitado, em andamento, inadimplente);
b) em caso de quitação: expedição do relatório de quitação com força de escritura;
c) histórico de pagamentos e débitos eventualmente existentes;
d) dados cadastrais atualizados do imóvel.

Solicita-se resposta no prazo de 10 (dez) dias, encaminhando a resposta para: jundiai.remoto@defensoria.sp.def.br.

Atenciosamente,

${defensor}
Defensor(a) Público(a)
Defensoria Pública do Estado de São Paulo — Jundiaí`;
  } else if (tipo==='natijus') {
    extra.innerHTML = '<div><label>Procedimento / Medicamento solicitado</label><input type="text" id="nat-proced" placeholder="Ex: Cirurgia de coluna L4-L5" oninput="renderOficio()"><label>CID do paciente</label><input type="text" id="nat-cid" placeholder="Ex: M51.1" oninput="renderOficio()"></div>';
    texto = HEADER('Ilmo(a). Sr(a). Coordenador(a)\nNATIJUS — Núcleo de Apoio Técnico ao Judiciário') + `Solicitação de Nota Técnica — ${usuario} — CPF: ${cpf}

Em nome do(a) assistido(a) ${usuario}, CPF nº ${cpf}, portador(a) do diagnóstico ${g2('nat-cid')}, solicita-se a emissão de Nota Técnica sobre a necessidade e disponibilidade de ${g2('nat-proced')}, para subsidiar ação judicial de obrigação de fazer contra o Município de Jundiaí.

Documento médico e prescrição anexos.

Atenciosamente,

${defensor}
Defensor(a) Público(a)
Defensoria Pública do Estado de São Paulo — Jundiaí`;
  } else if (tipo==='desarquivamento') {
    extra.innerHTML = '<div><label>Número do processo</label><input type="text" id="proc-num" placeholder="Ex: 1023456-78.2019.8.26.0309" oninput="renderOficio()"><label>Vara</label><input type="text" id="proc-vara" placeholder="Ex: 2ª Vara de Família" oninput="renderOficio()"></div>';
    texto = `AO JUÍZO DE DIREITO DA ${g2('proc-vara').toUpperCase()} DA COMARCA DE JUNDIAÍ/SP

Autos nº ${g2('proc-num')}

A Defensoria Pública do Estado de São Paulo, em favor de ${usuario}, CPF nº ${cpf}, vem, respeitosamente, requerer:

1. O DESARQUIVAMENTO dos presentes autos;
2. A abertura de vista à Defensoria para as devidas providências em prol do(a) assistido(a).

Informa-se que o(a) assistido(a) compareceu a esta Unidade em ${data} para dar andamento ao processo em epígrafe.

Jundiaí, ${data}.

${defensor}
Defensor(a) Público(a)
Defensoria Pública do Estado de São Paulo — Jundiaí`;
  } else if (tipo==='sindical_despejo') {
    extra.innerHTML = '<div><label>Processo / Número do mandado</label><input type="text" id="desp-proc" placeholder="Ex: 1012345-67.2024.8.26.0309" oninput="renderOficio()"></div>';
    texto = `AO JUÍZO DE DIREITO DA COMARCA DE JUNDIAÍ/SP

Ref.: Processo nº ${g2('desp-proc')}

${usuario}, CPF nº ${cpf}, residente na ${end}, assistido(a) da Defensoria Pública do Estado de São Paulo — Unidade de Jundiaí, por meio de seu(sua) Defensor(a) Público(a), vem requerer prazo suplementar para desocupação do imóvel, em razão de necessitar de tempo para providenciar nova moradia.

Ressalta-se que o(a) assistido(a) encontra-se em situação de vulnerabilidade socioeconômica, sem condições imediatas de arcar com os custos de mudança e aluguel de novo imóvel.

Jundiaí, ${data}.

${defensor}
Defensor(a) Público(a)
Defensoria Pública do Estado de São Paulo — Jundiaí`;
  }

  document.getElementById('output-oficios').textContent = texto;
}

function copiarOficio() { navigator.clipboard.writeText(document.getElementById('output-oficios').textContent).then(()=>alert('✔ Ofício copiado!')); }

// ─── DECLARAÇÕES ─────────────────────────────────────────────────────
function renderDeclaracao() {
  const tipo = document.getElementById('tipo-declaracao').value;
  const fields = document.getElementById('decl-fields');
  fields.innerHTML = '';
  if (!tipo) return;
  const add = (id,lb,ph) => { fields.innerHTML+=`<div><label>${lb}</label><input type="text" id="${id}" placeholder="${ph}" oninput="gerarDeclaracao()"></div>`; };
  if (tipo==='comparecimento_presencial'||tipo==='comparecimento_virtual') {
    add('dc-nome','Nome do(a) Assistido(a)','Nome completo');
    add('dc-cpf','CPF','000.000.000-00');
    add('dc-data','Data do Atendimento','Ex: 25 de junho de 2026');
    add('dc-defensor','Defensor(a) Público(a)','Nome completo');
  } else if (tipo==='nao_oposicao_curatela') {
    add('dc-nome','Nome do Declarante','Nome completo');
    add('dc-cpf','CPF','000.000.000-00');
    add('dc-interditando','Nome do Interditando','Nome completo');
    add('dc-parentesco','Grau de Parentesco','Ex: irmã, mãe, filho');
    add('dc-curador','Nome do(a) Curador(a) proposto(a)','Nome completo');
  } else if (tipo==='responsabilidade_curatela') {
    add('dc-nome','Nome do(a) Curador(a)','Nome completo');
    add('dc-cpf','CPF','000.000.000-00');
    add('dc-interditando','Nome do Curatelado','Nome completo');
  } else if (tipo==='renuncia_heranca') {
    add('dc-nome','Nome do Renunciante','Nome completo');
    add('dc-cpf','CPF','000.000.000-00');
    add('dc-falecido','Nome do Falecido','Nome completo');
    add('dc-beneficiario','Nome do Beneficiário da Renúncia','Nome completo');
  } else if (tipo==='ausencia_auxilio_creche') {
    add('dc-nome','Nome do(a) Declarante (responsável)','Nome completo');
    add('dc-cpf','CPF','000.000.000-00');
    add('dc-empresa','Empresa Empregadora','Nome da empresa');
  }
  gerarDeclaracao();
}

function gerarDeclaracao() {
  const tipo = document.getElementById('tipo-declaracao').value;
  const gd = (id) => { const el=document.getElementById(id); return el?(el.value.trim()||el.placeholder||'___________'):'___________'; };
  let texto='';
  if (tipo==='comparecimento_presencial') {
    texto=`DECLARAÇÃO DE COMPARECIMENTO PRESENCIAL\n\nDeclaro que ${gd('dc-nome')}, CPF nº ${gd('dc-cpf')}, compareceu presencialmente ao atendimento da Defensoria Pública do Estado de São Paulo — Unidade de Jundiaí, no dia ${gd('dc-data')}.\n\nJundiaí, ${gd('dc-data')}.\n\n${gd('dc-defensor')}\nDefensor(a) Público(a)`;
  } else if (tipo==='comparecimento_virtual') {
    texto=`DECLARAÇÃO DE COMPARECIMENTO VIRTUAL\n\nDeclaro que ${gd('dc-nome')}, CPF nº ${gd('dc-cpf')}, compareceu por meio virtual ao atendimento da Defensoria Pública do Estado de São Paulo — Unidade de Jundiaí, no dia ${gd('dc-data')}.\n\nJundiaí, ${gd('dc-data')}.\n\n${gd('dc-defensor')}\nDefensor(a) Público(a)`;
  } else if (tipo==='nao_oposicao_curatela') {
    texto=`DECLARAÇÃO DE NÃO OPOSIÇÃO À CURATELA\n\nEu, ${gd('dc-nome')}, CPF nº ${gd('dc-cpf')}, ${gd('dc-parentesco')} do(a) interditando(a) ${gd('dc-interditando')}, declaro, para os devidos fins de direito, que NÃO ME OPONHO à interdição judicial do(a) referido(a) e à nomeação de ${gd('dc-curador')} como curador(a).\n\nJundiaí, ___________.\n\nAssinatura: ___________________________\n${gd('dc-nome')}\nDocumento com firma reconhecida em cartório`;
  } else if (tipo==='responsabilidade_curatela') {
    texto=`DECLARAÇÃO DE RESPONSABILIDADE DO(A) CURADOR(A)\n\nEu, ${gd('dc-nome')}, CPF nº ${gd('dc-cpf')}, declaro estar ciente das responsabilidades inerentes ao exercício da curatela do(a) assistido(a) ${gd('dc-interditando')}, comprometendo-me a:\n\na) zelar pelo bem-estar, saúde e integridade do(a) curatelado(a);\nb) administrar com responsabilidade os bens e rendimentos do(a) curatelado(a);\nc) comunicar qualquer mudança de endereço à Defensoria Pública;\nd) responder civilmente pelos atos praticados no exercício da curatela.\n\nJundiaí, ___________.\n\nAssinatura: ___________________________\n${gd('dc-nome')}`;
  } else if (tipo==='renuncia_heranca') {
    texto=`DECLARAÇÃO DE RENÚNCIA DE DIREITOS HEREDITÁRIOS\n\nEu, ${gd('dc-nome')}, CPF nº ${gd('dc-cpf')}, herdeiro(a) do(a) falecido(a) ${gd('dc-falecido')}, declaro, de forma livre e espontânea, que RENUNCIO à totalidade dos direitos hereditários que me competem no espólio do(a) referido(a), em favor de ${gd('dc-beneficiario')}.\n\nJundiaí, ___________.\n\nAssinatura: ___________________________\nDocumento com firma reconhecida em cartório`;
  } else if (tipo==='ausencia_auxilio_creche') {
    texto=`DECLARAÇÃO DE AUSÊNCIA DE RECEBIMENTO DE AUXÍLIO-CRECHE\n\nEu, ${gd('dc-nome')}, CPF nº ${gd('dc-cpf')}, declaro, para os devidos fins de direito, que NÃO recebo auxílio-creche da empresa ${gd('dc-empresa')}, nem de qualquer outro empregador, para custear despesas com creche ou educação infantil de meu(minha) filho(a).\n\nDeclaro ainda que estou ciente de que a prestação de informações falsas nesta declaração sujeita-me às sanções previstas em lei.\n\nJundiaí, ___________.\n\nAssinatura: ___________________________\n${gd('dc-nome')}`;
  }
  document.getElementById('output-declaracao').textContent = texto||'Preencha os campos acima.';
}

function copiarDeclaracao() { navigator.clipboard.writeText(document.getElementById('output-declaracao').textContent).then(()=>alert('✔ Declaração copiada!')); }

// ─── PEÇAS INICIAIS ──────────────────────────────────────────────────
const DPSP_ID = `vem, respeitosamente, à presença de Vossa Excelência, por intermédio da Defensoria Pública do Estado de São Paulo, dispensada da apresentação do instrumento de mandato nos termos do artigo 128, inciso XI da Lei Complementar 80/1994`;
const END_MUN = `MUNICÍPIO DE JUNDIAÍ, ente da Federação, pessoa jurídica de direito público interno, que deve ser citado na pessoa do seu Chefe do Executivo, sito à Avenida da Liberdade, s/nº, Jardim Botânico, CEP 13214-015, Jundiaí/SP — CNPJ: 45.780.103/0001-50`;

const PI_CONFIGS = {
  pi_alimentos_filhos: { vara:'VARA DA FAMÍLIA E SUCESSÕES', campos:[
    {id:'p_vara_num',label:'Nº da Vara',ph:'Ex: 2'},
    {id:'p_autor_nome',label:'Nome do(a) Filho(a)',ph:'Nome completo'},
    {id:'p_autor_nasc',label:'Data nascimento (filho)',ph:'DD/MM/AAAA'},
    {id:'p_rep_nome',label:'Nome da Genitora (representante)',ph:'Nome completo'},
    {id:'p_rep_cpf',label:'CPF da Genitora',ph:'000.000.000-00'},
    {id:'p_rep_end',label:'Endereço da Genitora',ph:'Rua, nº, bairro, Jundiaí/SP'},
    {id:'p_rep_tel',label:'Telefone',ph:'(11) 99999-9999'},
    {id:'p_reu_nome',label:'Nome do Genitor (réu)',ph:'Nome completo'},
    {id:'p_reu_cpf',label:'CPF do Genitor',ph:'000.000.000-00'},
    {id:'p_reu_end',label:'Endereço do Genitor',ph:'Rua, nº, bairro'},
    {id:'p_reu_prof',label:'Profissão do Genitor',ph:'Ex: motorista'},
    {id:'p_pct',label:'Percentual dos alimentos (%)',ph:'33.33'},
    {id:'p_conta_banco',label:'Banco (depósito pensão)',ph:'Ex: Bradesco'},
    {id:'p_conta_ag',label:'Agência',ph:'0000'},
    {id:'p_conta_num',label:'Conta corrente',ph:'00000-0'},
    {id:'p_defensor',label:'Defensor(a) Público(a)',ph:'Nome completo'},
  ], alertas:[]},
  pi_cirurgia: { vara:'VARA DA FAZENDA PÚBLICA', campos:[
    {id:'p_vara_num',label:'Nº da Vara',ph:'Ex: 1'},
    {id:'p_autor_nome',label:'Nome do(a) Autor(a)',ph:'Nome completo'},
    {id:'p_autor_cpf',label:'CPF',ph:'000.000.000-00'},
    {id:'p_autor_end',label:'Endereço',ph:'Rua, nº, bairro, Jundiaí/SP'},
    {id:'p_autor_tel',label:'Telefone',ph:'(11) 99999-9999'},
    {id:'p_diagnostico',label:'Diagnóstico',ph:'Ex: Ruptura de LCA'},
    {id:'p_cid',label:'CID',ph:'Ex: M23.2'},
    {id:'p_cirurgia',label:'Procedimento cirúrgico',ph:'Ex: Cirurgia de reconstrução do LCA'},
    {id:'p_medico',label:'Nome do(a) médico(a)',ph:'Dr(a). Nome Sobrenome'},
    {id:'p_oficio_num',label:'Nº do ofício anterior (se houver)',ph:'Opcional'},
    {id:'p_defensor',label:'Defensor(a) Público(a)',ph:'Nome completo'},
  ], alertas:[{tipo:'info',t:'Tutela de Urgência',d:'Fumus boni iuris (laudo + negativa) + Periculum in mora (risco de agravamento). Incluir pedido de multa diária (astreinte) de R$ 500,00.'}]},
  pi_cuem: { vara:'VARA DA FAZENDA PÚBLICA', campos:[
    {id:'p_vara_num',label:'Nº da Vara',ph:'Ex: 1'},
    {id:'p_autor_nome',label:'Nome do(a) Autor(a)',ph:'Nome completo'},
    {id:'p_autor_cpf',label:'CPF',ph:'000.000.000-00'},
    {id:'p_autor_end',label:'Endereço do imóvel',ph:'Rua, nº, bairro, Jundiaí/SP'},
    {id:'p_autor_tel',label:'Telefone',ph:'(11) 99999-9999'},
    {id:'p_anos_posse',label:'Anos de posse (aprox.)',ph:'Ex: 8 anos'},
    {id:'p_renda',label:'Renda da autora',ph:'Ex: R$ 1.621,00/mês'},
    {id:'p_notificacao',label:'Data da notificação de desocupação',ph:'Ex: 15/03/2026'},
    {id:'p_historico',label:'Histórico da posse',ph:'Descreva brevemente como o imóvel foi ocupado'},
    {id:'p_defensor',label:'Defensor(a) Público(a)',ph:'Nome completo'},
  ], alertas:[{tipo:'info',t:'Fundamento',d:'Art. 183 CF + MP 2.220/2001. Direito subjetivo do possuidor que preenche os requisitos. Solicitar liminar para suspender notificação de desocupação.'}]},
};
PI_CONFIGS.pi_alimentos_guarda = {...PI_CONFIGS.pi_alimentos_filhos, vara:'VARA DA FAMÍLIA E SUCESSÕES'};
PI_CONFIGS.pi_alimentos_mae = {...PI_CONFIGS.pi_alimentos_filhos};
PI_CONFIGS.pi_exoneracao = {...PI_CONFIGS.pi_alimentos_filhos};
PI_CONFIGS.pi_guarda_avos = {...PI_CONFIGS.pi_alimentos_filhos};
PI_CONFIGS.pi_cirurgia_menor = {...PI_CONFIGS.pi_cirurgia, vara:'VARA DA INFÂNCIA E JUVENTUDE'};

function renderPI() {
  const tipo = document.getElementById('pi-tipo').value;
  const cfg = PI_CONFIGS[tipo];
  const campos = document.getElementById('pi-campos');
  const alerta = document.getElementById('pi-alerta');
  const out = document.getElementById('output-pi');
  const btns = document.getElementById('pi-btns');
  campos.innerHTML=''; alerta.innerHTML=''; out.style.display='none'; btns.style.display='none';
  if (!cfg) return;
  alerta.innerHTML = (cfg.alertas||[]).map(a=>`<div class="alert alert-${a.tipo}"><strong>${a.t}</strong>${a.d}</div>`).join('');
  const grid=document.createElement('div');
  grid.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px';
  (cfg.campos||[]).forEach(c=>{
    const div=document.createElement('div');
    div.innerHTML=`<label>${c.label}</label><input type="text" id="${c.id}" placeholder="${c.ph}" oninput="gerarPI()">`;
    grid.appendChild(div);
  });
  campos.appendChild(grid);
  btns.style.display='block';
}

function gp(id) { const el=document.getElementById(id); return el?(el.value.trim()||el.placeholder||'___________'):'___________'; }

function gerarPI() {
  const tipo = document.getElementById('pi-tipo').value;
  const cfg = PI_CONFIGS[tipo];
  if (!cfg) return;
  let texto='';
  if (tipo==='pi_alimentos_filhos'||tipo==='pi_alimentos_guarda') {
    texto=`AO JUÍZO DA ${gp('p_vara_num')}ª ${cfg.vara} DA COMARCA DE JUNDIAÍ/SP\n\n${gp('p_autor_nome')}, nascido(a) em ${gp('p_autor_nasc')}, representado(a) pela genitora ${gp('p_rep_nome')}, inscrita no CPF/MF sob o nº ${gp('p_rep_cpf')}, residente e domiciliada na ${gp('p_rep_end')}, telefone: ${gp('p_rep_tel')}, ${DPSP_ID}, ajuizar a presente\n\nAÇÃO DE ALIMENTOS${tipo==='pi_alimentos_guarda'?' C/C REGULAMENTAÇÃO DE GUARDA E CONVIVÊNCIA':''}\n\nem face de ${gp('p_reu_nome')}, inscrito(a) no CPF/MF sob o nº ${gp('p_reu_cpf')}, residente na ${gp('p_reu_end')}, pelos motivos a seguir.\n\nDOS FATOS\n\n${gp('p_autor_nome')} é filho(a) de ${gp('p_rep_nome')} e ${gp('p_reu_nome')}, conforme certidão de nascimento anexa. A criança vive sob a responsabilidade exclusiva de sua genitora, que arca sozinha com todos os gastos indispensáveis à sua subsistência e pleno desenvolvimento.\n\nO genitor, por sua vez, não contribui para o sustento do(s) filho(s). Exerce atividade profissional remunerada como ${gp('p_reu_prof')}.\n\nDA FUNDAMENTAÇÃO JURÍDICA\n\nCom fundamento nos artigos 229 da Constituição Federal, artigo 1.694 e seguintes do Código Civil e Lei nº 5.478/68, os pais têm o dever de prestar alimentos aos filhos menores. O vínculo de parentesco é comprovado pela documentação anexada. A necessidade da criança, em razão de sua idade, é legalmente presumida.\n\nDOS PEDIDOS\n\nAnte o exposto, requer:\na) os benefícios da JUSTIÇA GRATUITA;\nb) TUTELA DE URGÊNCIA para fixação de ALIMENTOS PROVISÓRIOS;\nc) fixação de ALIMENTOS definitivos:\n   i. Desemprego/informal: 1 salário mínimo federal vigente, depositado até o dia 10;\n   ii. Emprego formal: ${gp('p_pct')}% dos rendimentos líquidos (bruto − INSS − contribuição sindical);\nd) depósito em: ${gp('p_conta_banco')}, agência ${gp('p_conta_ag')}, cc ${gp('p_conta_num')};\ne) ofício ao INSS para verificar vínculos e endereço do réu;\nf) procedência total do pedido.\n\nJundiaí, data do protocolo digital.\n\n${gp('p_defensor')}\nDefensor(a) Público(a)`;
  } else if (tipo==='pi_cirurgia'||tipo==='pi_cirurgia_menor') {
    texto=`AO JUÍZO DA ${gp('p_vara_num')}ª ${cfg.vara} DA COMARCA DE JUNDIAÍ/SP\n\n${gp('p_autor_nome')}, inscrito(a) no CPF/MF sob o nº ${gp('p_autor_cpf')}, residente na ${gp('p_autor_end')}, telefone ${gp('p_autor_tel')}, ${DPSP_ID}, propor a presente\n\nAÇÃO DE OBRIGAÇÃO DE FAZER,\nCOM PEDIDO DE TUTELA DE URGÊNCIA\n\nem face do ${END_MUN}, pelos motivos a seguir.\n\nDOS FATOS\n\nA parte autora foi diagnosticada com ${gp('p_diagnostico')} (CID ${gp('p_cid')}), conforme relatório médico do(a) Dr(a). ${gp('p_medico')}, anexo.\n\nHá indicação médica absoluta de realização de ${gp('p_cirurgia')}.\n\nA parte autora buscou resolver extrajudicialmente o impasse${gp('p_oficio_num')!=='Opcional'?`. Foi expedido o ofício nº ${gp('p_oficio_num')} à Secretaria Municipal de Saúde. Sem resposta até a presente data.`:'.'}\n\nDA FUNDAMENTAÇÃO JURÍDICA\n\nO presente pedido fundamenta-se nos artigos 196 e 198, inciso II, da Constituição Federal. A tutela de urgência ampara-se no art. 300 do CPC — fumus boni iuris (laudo médico e omissão do Poder Público) e periculum in mora (risco de agravamento irreversível à saúde).\n\nDOS PEDIDOS\n\nAnte o exposto, requer:\na) JUSTIÇA GRATUITA;\nb) TUTELA DE URGÊNCIA para que o réu realize ou custeie ${gp('p_cirurgia')}, em prazo a ser fixado pelo Juízo, sob pena de multa diária de R$ 500,00;\nc) procedência total do pedido.\n\nJundiaí, data do protocolo digital.\n\n${gp('p_defensor')}\nDefensor(a) Público(a)`;
  } else if (tipo==='pi_cuem') {
    texto=`AO JUÍZO DA ${gp('p_vara_num')}ª ${cfg.vara} DA COMARCA DE JUNDIAÍ/SP\n\n${gp('p_autor_nome')}, inscrito(a) no CPF/MF sob o nº ${gp('p_autor_cpf')}, residente na ${gp('p_autor_end')}, telefone ${gp('p_autor_tel')}, ${DPSP_ID}, propor a presente\n\nAÇÃO DE CONCESSÃO DE USO ESPECIAL PARA FINS DE MORADIA (CUEM),\nCOM PEDIDO DE TUTELA DE URGÊNCIA\n\nem face do ${END_MUN}, pelos motivos a seguir.\n\nDOS FATOS\n\nA autora reside há aproximadamente ${gp('p_anos_posse')} no imóvel objeto da demanda, de forma mansa, pacífica e ininterrupta, utilizado exclusivamente para sua moradia e de sua família. ${gp('p_historico')}\n\nEm ${gp('p_notificacao')}, a autora foi notificada pela Municipalidade para desocupação do imóvel.\n\nA autora possui renda de ${gp('p_renda')}, não possui outro imóvel e não tem rede familiar de apoio em Jundiaí.\n\nDOS FUNDAMENTOS JURÍDICOS\n\nO art. 183 da Constituição Federal e a Medida Provisória nº 2.220/2001 asseguram a concessão de uso especial para fins de moradia àquele que possua como seu, por 5 anos ininterruptamente, imóvel público de até 250m², exclusivamente para moradia, desde que não seja proprietário de outro imóvel. A concessão é direito subjetivo, não podendo ser negada pela Administração.\n\nDOS PEDIDOS\n\nAnte o exposto, requer:\na) JUSTIÇA GRATUITA;\nb) TUTELA DE URGÊNCIA para suspender os efeitos da notificação de desocupação;\nc) concessão do DIREITO DE CUEM sobre o imóvel na ${gp('p_autor_end')};\nd) subsidiariamente: auxílio habitacional suficiente.\n\nJundiaí, data do protocolo digital.\n\n${gp('p_defensor')}\nDefensor(a) Público(a)`;
  } else {
    texto = '[ Modelo em construção para este tipo de ação. Use o modelo mais próximo e adapte. ]';
  }
  const out = document.getElementById('output-pi');
  out.textContent = texto;
  out.style.display = 'block';
}

function copiarPI() { const t=document.getElementById('output-pi').textContent; if(!t) return; navigator.clipboard.writeText(t).then(()=>alert('✔ Peça copiada!')); }

// ─── GLOSSÁRIO ───────────────────────────────────────────────────────
const GLOSSARIO = [
  ['A Quo / Ad Quem','Juiz/tribunal de origem (A Quo) · Juiz/tribunal superior para onde vai o recurso (Ad Quem)'],
  ['Ação','Processo judicial movido para defender ou proteger um direito.'],
  ['Acórdão','Decisão final feita por um grupo de juízes em um tribunal.'],
  ['Ad Cautelam','Por segurança / Por cautela.'],
  ['Aditamento em Pauta','Adicionar novos processos à lista de julgamento.'],
  ['Aditar','Adicionar / Complementar uma petição ou documento.'],
  ['Advogado Dativo','Advogado nomeado de graça pelo juiz para defender quem não pode pagar.'],
  ['Agravo','Recurso para contestar uma decisão provisória do juiz que não termina o processo.'],
  ['Agravo de Instrumento','Recurso usado quando o juiz nega andamento a outro recurso.'],
  ['Alvará','Autorização judicial assinada pelo juiz para liberar pagamento ou permitir um ato.'],
  ['Arbitragem','Resolução de conflito por pessoa escolhida pelas partes, sem ir à Justiça.'],
  ['Arquivo Provisório','Local onde ficam guardados os processos pausados.'],
  ['Assédio','Palavra ou gesto repetido que afeta a segurança e dignidade de alguém no trabalho.'],
  ['Audiência','Sessão em que o juiz tenta acordo, faz perguntas e decide o caso.'],
  ['Astreintes','Multa diária aplicada pelo juiz para forçar o cumprimento de obrigação.'],
  ['Autos','Conjunto de documentos que compõem o processo.'],
  ['Bis in Idem','Repetir a mesma cobrança ou punição sobre a mesma coisa.'],
  ['Cediço','Sabido / Conhecido de todos.'],
  ['Citra Petita','Decisão que julgou menos do que foi pedido.'],
  ['Concluso','Aguardando decisão do juiz.'],
  ['Com Fulgro / Com Base em','Fundamento legal da petição.'],
  ['Conciliação Infrutífera','Não houve acordo.'],
  ['Dano Emergente','Prejuízo imediato sofrido pelo lesado.'],
  ['De Cujus','Pessoa falecida.'],
  ['Deferir','Aprovar / Conceder o pedido.'],
  ['Destarte','Assim / Desta maneira.'],
  ['Dilação','Adiamento ou prorrogação de prazo.'],
  ['Dolo','Intenção de prejudicar / Má-fé.'],
  ['Ementa','Resumo da decisão judicial.'],
  ['Exequível','Possível de ser cumprido.'],
  ['Ex Nunc','Vale daqui para frente (não retroage).'],
  ['Ex Tunc','Vale desde o início (retroage).'],
  ['Exordial / Inicial','Petição inicial — peça que começa o processo.'],
  ['Extra Petita','Decisão diferente do que foi pedido.'],
  ['Fumus Boni Iuris','Probabilidade de ter o direito (um dos requisitos para liminares).'],
  ['Impugnar','Opor-se / Contestar.'],
  ['In Casu','Neste caso específico.'],
  ['Inaudita Altera Pars','Decisão tomada sem ouvir o outro lado primeiro (liminar).'],
  ['Inépcia','Falha grave na petição inicial que impede o processo.'],
  ['Litispendência','Existência de ação idêntica em curso (mesmo pedido, mesmas partes).'],
  ['Periculum in Mora','Risco de que a demora no processo cause dano irreparável (requisito para liminares).'],
  ['Perempção','Perda do direito de demandar por abandono repetido da causa.'],
  ['Petição Inicial','Documento que começa o processo judicial.'],
  ['Preclusão','Perda do direito de praticar um ato processual por deixar passar o prazo.'],
  ['Prescrição','Perda do direito de ação por não ter sido exercido no prazo legal.'],
  ['Súmula','Resumo da posição consolidada de um tribunal sobre determinado assunto.'],
  ['Trânsito em Julgado','Momento em que a decisão se torna definitiva, sem mais recursos.'],
  ['Tutela de Urgência','Decisão rápida do juiz para proteger o direito antes do julgamento final.'],
  ['Tutela de Evidência','Decisão antecipada baseada na clareza do direito, sem necessidade de urgência.'],
  ['Vara','Unidade do Poder Judiciário onde um juiz atua.'],
];

let glossFiltro = '';
function renderGlossario() {
  const tbody = document.getElementById('gloss-body');
  const filtro = glossFiltro.toLowerCase();
  tbody.innerHTML = GLOSSARIO
    .filter(([t,s]) => !filtro || t.toLowerCase().includes(filtro) || s.toLowerCase().includes(filtro))
    .map(([t,s]) => `<tr><td><strong>${t}</strong></td><td>${s}</td></tr>`).join('');
}
function filtrarGlossario() { glossFiltro = document.getElementById('gloss-busca').value; renderGlossario(); }

// ─── INIT ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  renderGlossario();
  const campoData = document.getElementById('data-oficio');
  if (campoData) campoData.valueAsDate = new Date();
});
// ─── MENU HAMBÚRGUER (CELULAR) ───────────────────────────────────────
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const btn     = document.getElementById('hamburger-btn');

  if (!sidebar) return;

  const aberta = sidebar.classList.contains('open');

  if (aberta) {
    fecharSidebar();
  } else {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

function fecharSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const btn     = document.getElementById('hamburger-btn');

  if (!sidebar) return;
  sidebar.classList.remove('open');
  overlay.classList.remove('open');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

// Fecha sidebar automaticamente ao trocar de aba no celular
const _sw_original = window.sw;
window.sw = function(id) {
  if (_sw_original) _sw_original(id);
  if (window.innerWidth <= 768) fecharSidebar();
};

// Fecha sidebar se redimensionar para desktop
window.addEventListener('resize', function() {
  if (window.innerWidth > 768) fecharSidebar();
});