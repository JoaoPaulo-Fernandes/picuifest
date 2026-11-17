(() => {

  "use strict";
  document.documentElement.classList.add("js");

  /* ============================================================
     CONFIGURAÇÃO E DADOS
     Contatos, eventos, coberturas e parceiros ficam em arquivos
     separados, fáceis de editar sem mexer neste código.
     ============================================================ */
  const CONFIG = window.PICUI_CONFIG || {};
  const CONTATOS = CONFIG.contatos || {};
  const FORM_CONFIG = CONFIG.formulario || {};
  const PATROCINIO = CONFIG.patrocinio || {};
  const festival = window.PICUI_FESTIVAL && typeof window.PICUI_FESTIVAL === "object" ? window.PICUI_FESTIVAL : null;
  const eventos = (Array.isArray(window.PICUI_EVENTOS) ? window.PICUI_EVENTOS : []).slice();
  const artigos = window.PICUI_COBERTURAS || {};
  const galeria = window.PICUI_GALERIA && typeof window.PICUI_GALERIA === "object" ? window.PICUI_GALERIA : null;
  const patrocinadores = Array.isArray(window.PICUI_PATROCINADORES) ? window.PICUI_PATROCINADORES : [];

  if (festival && festival.id && festival.nome) {
    eventos.push({
      id: festival.id,
      nome: festival.nome,
      cidade: festival.cidade,
      local: festival.local,
      data: festival.showsInicio,
      tipo: "festa",
      entrada: festival.entrada,
      destaque: true,
      status: festival.status || "confirmado",
      organizador: festival.organizador,
      link: festival.link,
      descricao: festival.descricao,
      programacao: [],
      periodo: festival.dataLabel,
      showsLabel: festival.showsLabel,
      festival: true
    });
  }

  const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
  const MESES_LONGOS = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];
  const cidadesRegiao = Array.isArray(CONFIG.cidades) && CONFIG.cidades.length
    ? CONFIG.cidades
    : ["Picuí", "Nova Palmeira", "Frei Martinho", "Baraúna", "Cuité", "Nova Floresta", "Pedra Lavrada", "Cubati"];

  const TIPOS = {
    forro: "Forró",
    religioso: "Religioso",
    carnaval: "Carnaval",
    vaquejada: "Vaquejada",
    cultural: "Cultural",
    festa: "Festa"
  };

  /* ---------- Helpers ---------- */
  const $ = (sel) => document.querySelector(sel);

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function dataLocal(iso) {
    const [ano, mes, dia] = iso.slice(0, 10).split("-").map(Number);
    return new Date(ano, mes - 1, dia);
  }

  function partesData(iso) {
    const d = dataLocal(iso);
    return {
      dia: pad2(d.getDate()),
      mes: MESES[d.getMonth()],
      semana: new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(d)
    };
  }

  function horaCurta(iso) {
    const [h, m] = iso.slice(11, 16).split(":");
    return m === "00" ? `${h}h` : `${h}h${m}`;
  }

  function dataLonga(iso) {
    const texto = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long", day: "2-digit", month: "long", year: "numeric"
    }).format(dataLocal(iso));
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  function normalizar(texto) {
    return String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function slug(texto) {
    return normalizar(texto).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  const pinSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';

  function onlyDigits(valor) {
    return String(valor || "").replace(/\D/g, "");
  }

  function formatarTelefone(numero) {
    const digitos = onlyDigits(numero);
    const local = digitos.length > 11 ? digitos.slice(-11) : digitos;
    if (local.length === 11) return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
    if (local.length === 10) return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
    return numero;
  }

  function montarLinkWhatsApp(numero, texto) {
    const digitos = onlyDigits(numero);
    if (!digitos) return "";
    const base = `https://wa.me/${digitos}`;
    return texto ? `${base}?text=${encodeURIComponent(texto)}` : base;
  }

  function montarLinkEmail(email, assunto, corpo) {
    if (!email) return "";
    const params = [];
    if (assunto) params.push(`subject=${encodeURIComponent(assunto)}`);
    if (corpo) params.push(`body=${encodeURIComponent(corpo)}`);
    return `mailto:${email}${params.length ? `?${params.join("&")}` : ""}`;
  }

  function formatarDataCurta(iso) {
    if (!iso || iso.indexOf("-") < 0) return iso || "";
    const [ano, mes, dia] = iso.slice(0, 10).split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function linkExterno(valor) {
    const texto = String(valor || "").trim();
    if (!texto) return "";
    if (/^https?:\/\//i.test(texto)) return texto;
    if (texto.charAt(0) === "@") return `https://instagram.com/${texto.slice(1)}`;
    if (/^[\w-]+(\.[\w-]+)+/.test(texto)) return `https://${texto}`;
    return `https://instagram.com/${texto}`;
  }

  function escaparAtributo(valor) {
    return String(valor == null ? "" : valor)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /* ---------- Estado e agenda ---------- */
  const estado = { tipo: "todos", cidade: "todas", busca: "" };
  const agendaGrid = $("#agenda-grid");
  const resultado = $("#resultado");
  const buscaInput = $("#busca");
  const cidadeSelect = $("#filtro-cidade");

  function statusBadge(ev) {
    if (ev.status === "a confirmar") return '<span class="status">A confirmar</span>';
    if (ev.status === "cancelado") return '<span class="status status--cancelado">Cancelado</span>';
    return "";
  }

  function cardEvento(ev) {
    const p = partesData(ev.data);
    return `
      <article class="evento">
        ${ev.destaque ? '<span class="selo">✦ Destaque</span>' : ""}
        <div class="evento-top">
          <div class="data-bloco" aria-hidden="true"><strong>${p.dia}</strong><span>${p.mes}</span></div>
          <div class="evento-tags">
            <span class="tag tag--${ev.tipo}">${TIPOS[ev.tipo]}</span>
            ${statusBadge(ev)}
          </div>
        </div>
        <div class="evento-body">
          <p class="evento-cidade">${ev.cidade} • PB</p>
          <h3>${ev.nome}</h3>
          <p class="evento-local">${pinSvg} ${ev.local} • ${ev.periodo || horaCurta(ev.data)}</p>
          <p class="evento-desc">${ev.descricao}</p>
        </div>
        <div class="evento-foot">
          <span class="evento-entrada">${ev.entrada}</span>
          <button class="link-btn" type="button" data-evento="${ev.id}" aria-label="Ver detalhes de ${ev.nome}">Detalhes <span aria-hidden="true">→</span></button>
        </div>
      </article>`;
  }

  function renderAgenda() {
    const termo = normalizar(estado.busca.trim());
    const lista = eventos
      .filter((ev) => ev.status !== "cancelado")
      .filter((ev) => {
        const okTipo = estado.tipo === "todos" || ev.tipo === estado.tipo;
        const okCidade = estado.cidade === "todas" || ev.cidade === estado.cidade;
        const alvo = normalizar(`${ev.nome} ${ev.cidade} ${ev.local} ${ev.descricao} ${TIPOS[ev.tipo]}`);
        const okBusca = !termo || alvo.includes(termo);
        return okTipo && okCidade && okBusca;
      })
      .sort((a, b) => new Date(a.data) - new Date(b.data));

    resultado.textContent = `${lista.length} ${lista.length === 1 ? "evento" : "eventos"}`;

    if (!lista.length) {
      if (!eventos.length) {
        agendaGrid.innerHTML = `
          <div class="vazio">
            <strong>A agenda está sendo preparada.</strong>
            <p>O Festival da Carne de Sol é o destaque do momento. Novos eventos entram aqui assim que forem confirmados.</p>
          </div>`;
        return;
      }
      agendaGrid.innerHTML = `
        <div class="vazio">
          <strong>Nada por aqui ainda.</strong>
          <p>Não encontramos eventos com esses filtros. Tente outra cidade, outro tipo de festa ou limpe a busca.</p>
          <button class="btn btn--ghost btn--sm" type="button" data-limpar>Limpar filtros</button>
        </div>`;
      return;
    }

    agendaGrid.classList.toggle("agenda-grid--unico", lista.length === 1);
    agendaGrid.innerHTML = lista.map(cardEvento).join("");
  }

  function configurarFiltros() {
    const ativos = eventos.filter((ev) => ev && ev.status !== "cancelado");
    const tipos = new Set(ativos.map((ev) => ev.tipo));

    let tiposVisiveis = 0;
    document.querySelectorAll(".chip").forEach((chip) => {
      if (chip.dataset.tipo === "todos") return;
      const existe = tipos.has(chip.dataset.tipo);
      chip.hidden = !existe;
      if (existe) tiposVisiveis++;
    });

    const grupo = document.querySelector(".filtro-grupo");
    if (grupo) grupo.hidden = tiposVisiveis <= 1;

    if (cidadeSelect) {
      cidadeSelect.hidden = cidadesNaAgenda.length <= 1;
      if (cidadeSelect.hidden) cidadeSelect.value = "todas";
    }

    if (buscaInput) {
      const caixa = buscaInput.closest(".busca");
      const semBusca = ativos.length <= 1;
      buscaInput.hidden = semBusca;
      if (caixa) caixa.hidden = semBusca;
    }

    const barra = document.querySelector(".filtros");
    if (barra) {
      barra.hidden = false;
      barra.classList.toggle("filtros--compacto", ativos.length <= 1);
    }
  }

  function limparFiltros() {
    estado.tipo = "todos";
    estado.cidade = "todas";
    estado.busca = "";
    buscaInput.value = "";
    cidadeSelect.value = "todas";
    document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("ativo", c.dataset.tipo === "todos"));
    renderAgenda();
  }

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("ativo"));
      chip.classList.add("ativo");
      estado.tipo = chip.dataset.tipo;
      renderAgenda();
    });
  });

  cidadeSelect.addEventListener("change", () => {
    estado.cidade = cidadeSelect.value;
    renderAgenda();
  });

  buscaInput.addEventListener("input", () => {
    estado.busca = buscaInput.value;
    renderAgenda();
  });

  agendaGrid.addEventListener("click", (evt) => {
    const alvo = evt.target.closest("[data-evento]");
    if (alvo) {
      abrirEvento(alvo.dataset.evento);
      return;
    }
    if (evt.target.closest("[data-limpar]")) limparFiltros();
  });

  /* ---------- Cidades e formulário ---------- */
  cidadesRegiao.forEach((cidade) => {
    const optForm = document.createElement("option");
    optForm.value = cidade;
    optForm.textContent = cidade;
    $("#cidade-evento").appendChild(optForm);
  });

  const cidadesNaAgenda = (() => {
    const vistas = new Set(
      eventos
        .filter((ev) => ev && ev.status !== "cancelado")
        .map((ev) => ev.cidade)
        .filter(Boolean)
    );
    const daRegiao = cidadesRegiao.filter((cidade) => vistas.has(cidade));
    const extras = [...vistas].filter((cidade) => !cidadesRegiao.includes(cidade));
    return [...daRegiao, ...extras];
  })();

  cidadesNaAgenda.forEach((cidade) => {
    const opt = document.createElement("option");
    opt.value = cidade;
    opt.textContent = cidade;
    cidadeSelect.appendChild(opt);
  });

  function renderCidades() {
    const regionais = eventos.filter((ev) =>
      ev && ev.status !== "cancelado" && !ev.festival && (!festival || ev.id !== festival.id)
    );
    const secao = $("#regiao");
    if (secao) secao.hidden = regionais.length === 0;
    document.querySelectorAll("[data-link-regiao]").forEach((link) => {
      link.hidden = regionais.length === 0;
    });
    if (!regionais.length) return;

    const contagem = {};
    regionais.forEach((ev) => { contagem[ev.cidade] = (contagem[ev.cidade] || 0) + 1; });
    $("#circuito-cidades").innerHTML = cidadesRegiao.map((cidade) => {
      const total = contagem[cidade] || 0;
      const rotulo = total ? `${total} ${total === 1 ? "evento" : "eventos"}` : "em breve";
      return `<span class="cidade-chip"><strong>${cidade}</strong><span>${rotulo}</span></span>`;
    }).join("");
  }

  /* ---------- Contagem regressiva do festival ---------- */
  let timerContagem = null;

  function iniciarContagem(iso) {
    const caixa = $("#contagem");
    if (!caixa || !iso) return;

    clearInterval(timerContagem);
    const alvo = new Date(iso).getTime();
    if (Number.isNaN(alvo)) return;
    const rotulo = $("#cd-rotulo");

    function tick() {
      const restante = alvo - Date.now();
      if (restante <= 0) {
        clearInterval(timerContagem);
        if (rotulo) rotulo.textContent = "Os shows já começaram";
        caixa.innerHTML = '<p class="contagem-fim">A festa começou! ✦</p>';
        return;
      }

      const dias = $("#cd-dias");
      if (!dias) {
        clearInterval(timerContagem);
        return;
      }
      const segundos = Math.floor(restante / 1000);
      dias.textContent = pad2(Math.floor(segundos / 86400));
      $("#cd-horas").textContent = pad2(Math.floor((segundos % 86400) / 3600));
      $("#cd-min").textContent = pad2(Math.floor((segundos % 3600) / 60));
      $("#cd-seg").textContent = pad2(segundos % 60);
    }

    tick();
    timerContagem = setInterval(tick, 1000);
  }

  /* ---------- Festival em destaque ---------- */
  function nomeDiaSemana(iso, formato) {
    const texto = new Intl.DateTimeFormat("pt-BR", { weekday: formato || "long" }).format(dataLocal(iso));
    return texto.replace(/\.$/, "");
  }

  function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  function renderFestival() {
    if (!festival || !Array.isArray(festival.dias) || !festival.dias.length) return;

    const tabs = $("#festival-tabs");
    const painel = $("#festival-painel");
    if (!tabs || !painel) return;

    const dias = festival.dias
      .filter((dia) => dia && dia.data)
      .slice()
      .sort((a, b) => a.data.localeCompare(b.data));

    if (!dias.length) return;

    tabs.innerHTML = dias.map((dia, indice) => {
      const [, mes, numero] = dia.data.split("-");
      return `<button class="dia-tab${indice === 0 ? " ativo" : ""}" type="button" role="tab"
        id="dia-tab-${indice}" aria-selected="${indice === 0}" aria-controls="festival-painel"
        tabindex="${indice === 0 ? "0" : "-1"}">
        <span class="dia-tab-semana">${nomeDiaSemana(dia.data, "short")}</span>
        <strong>${numero}</strong>
        <span class="dia-tab-mes">${MESES[Number(mes) - 1]}</span>
      </button>`;
    }).join("");

    function conteudo(dia) {
      const [, mes, numero] = dia.data.split("-");
      const atracoes = Array.isArray(dia.atracoes) ? dia.atracoes : [];
      const itens = Array.isArray(dia.itens) ? dia.itens : [];

      return `
        <div class="dia-topo">
          <p class="dia-data">${capitalizar(nomeDiaSemana(dia.data))} • ${Number(numero)} de ${MESES_LONGOS[Number(mes) - 1]}</p>
          <h3>${dia.titulo}</h3>
          ${dia.resumo ? `<p class="dia-resumo">${dia.resumo}</p>` : ""}
        </div>
        ${atracoes.length ? `<div class="dia-atracoes">
          <p class="dia-rotulo">No palco</p>
          <ul>${atracoes.map((nome) => `<li>${nome}</li>`).join("")}</ul>
        </div>` : ""}
        ${itens.length ? `<ul class="dia-programa">
          ${itens.map((item) => `<li>
            <span class="dia-hora">${item.hora || "A confirmar"}</span>
            <span class="dia-texto">${item.texto}</span>
          </li>`).join("")}
        </ul>` : ""}
        <p class="dia-nota">${dia.nota || "Horários das atividades diurnas a confirmar com a organização."}</p>`;
    }

    function abrirDia(indice, focar) {
      const dia = dias[indice];
      if (!dia) return;

      tabs.querySelectorAll(".dia-tab").forEach((tab, i) => {
        const ativo = i === indice;
        tab.classList.toggle("ativo", ativo);
        tab.setAttribute("aria-selected", String(ativo));
        tab.setAttribute("tabindex", ativo ? "0" : "-1");
        if (ativo && focar) tab.focus();
      });

      painel.classList.remove("dia-in");
      painel.innerHTML = conteudo(dia);
      painel.setAttribute("aria-labelledby", `dia-tab-${indice}`);
      void painel.offsetWidth;
      painel.classList.add("dia-in");
    }

    tabs.addEventListener("click", (evt) => {
      const tab = evt.target.closest(".dia-tab");
      if (!tab) return;
      abrirDia([...tabs.querySelectorAll(".dia-tab")].indexOf(tab), false);
    });

    tabs.addEventListener("keydown", (evt) => {
      const atual = [...tabs.querySelectorAll(".dia-tab")].indexOf(document.activeElement);
      if (atual < 0) return;

      let proximo = atual;
      if (evt.key === "ArrowRight") proximo = (atual + 1) % dias.length;
      else if (evt.key === "ArrowLeft") proximo = (atual - 1 + dias.length) % dias.length;
      else if (evt.key === "Home") proximo = 0;
      else if (evt.key === "End") proximo = dias.length - 1;
      else return;

      evt.preventDefault();
      abrirDia(proximo, true);
    });

    abrirDia(0, false);
  }

  /* ---------- Cartaz em destaque ---------- */
  function configurarCartaz() {
    const botoes = document.querySelectorAll("[data-cartaz]");
    if (!botoes.length || !festival || !festival.cartaz) return;

    botoes.forEach((botao) => {
      botao.addEventListener("click", () => {
        modalConteudo.innerHTML = `
          <p class="modal-kicker">Cartaz oficial</p>
          <h2 id="modal-titulo">${festival.nome}</h2>
          <p class="modal-data">${festival.dataLabel}</p>
          <div class="modal-cartaz">
            <img src="${festival.cartazWebp || festival.cartaz}" alt="${escaparAtributo(festival.cartazAlt)}">
          </div>
          <p class="modal-credito">${festival.cartazCredito || ""}</p>
          <div class="modal-acoes">
            <a class="btn" href="${linkExterno(festival.link)}" target="_blank" rel="noopener">Instagram do festival</a>
          </div>`;
        abrirModal();
      });
    });
  }

  /* ---------- Transições das seções durante a rolagem ---------- */
  function configurarRevelacao() {
    const alvos = document.querySelectorAll("main > section.section:not(.hero)");
    if (!alvos.length) return;

    const preferenciaMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preferenciaMovimento.matches || !("IntersectionObserver" in window)) return;

    let ultimaPosicao = window.scrollY;
    let direcao = 1;
    window.addEventListener("scroll", () => {
      const posicao = window.scrollY;
      if (Math.abs(posicao - ultimaPosicao) > 2) {
        direcao = posicao > ultimaPosicao ? 1 : -1;
        ultimaPosicao = posicao;
      }
    }, { passive: true });

    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        const secao = entrada.target;
        if (!entrada.isIntersecting) {
          secao.classList.remove("section-scroll-in");
          return;
        }

        secao.style.setProperty("--section-scroll-offset", direcao > 0 ? "16px" : "-16px");
        secao.classList.remove("section-scroll-in");
        void secao.offsetWidth;
        secao.classList.add("section-scroll-in");
      });
    }, { rootMargin: "-8% 0px -8% 0px", threshold: 0.12 });

    alvos.forEach((alvo) => observador.observe(alvo));

    preferenciaMovimento.addEventListener("change", (evt) => {
      if (evt.matches) {
        observador.disconnect();
        alvos.forEach((alvo) => alvo.classList.remove("section-scroll-in"));
      } else {
        alvos.forEach((alvo) => observador.observe(alvo));
      }
    });
  }

  /* ---------- Faixa de programação ---------- */
  function renderTicker() {
    const faixa = $("#faixa-programacao");
    const track = $("#marquee-track");
    if (!faixa || !track) return;

    const noites = festival && Array.isArray(festival.dias)
      ? festival.dias.filter((dia) => dia && dia.data && Array.isArray(dia.atracoes) && dia.atracoes.length)
      : [];
    if (!noites.length) {
      faixa.hidden = true;
      return;
    }

    const itens = noites.map((dia) => {
      const partes = partesData(dia.data);
      const diaSemana = nomeDiaSemana(dia.data, "short");
      const horarios = dia.itens || [];
      const horario = horarios.find((item) => /in[ií]cio dos shows/i.test(item.texto || "")) ||
        horarios.find((item) => item.hora);
      const quando = [diaSemana, `${partes.dia} ${partes.mes}`, horario && horario.hora]
        .filter(Boolean)
        .join(" • ");
      const artistas = dia.atracoes.map(escaparAtributo).join(" · ");
      return `<span><b>${escaparAtributo(quando)}</b><i>${artistas}</i></span>`;
    });
    const quantidade = Math.max(2, Math.ceil(5 / itens.length));
    const grupo = `<div class="marquee-group">${Array.from({ length: quantidade }, () => itens).flat().join("")}</div>`;
    track.innerHTML = grupo + grupo;
    faixa.hidden = false;
  }

  $("#ano-atual").textContent = new Date().getFullYear();
  configurarFiltros();
  renderCidades();
  renderAgenda();
  renderFestival();
  renderTicker();
  configurarCartaz();
  configurarRevelacao();
  if (festival && festival.showsInicio) iniciarContagem(festival.showsInicio);

  /* ---------- Modal ---------- */
  const modal = $("#modal");
  const modalConteudo = $("#modal-conteudo");
  const toast = $("#toast");
  let toastTimer = null;

  function showToast(mensagem) {
    toast.textContent = mensagem;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
  }

  function abrirModal() {
    if (modal.open) modal.close();
    modal.showModal();
    document.body.classList.add("sem-scroll");
  }

  $("#modal-close").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (evt) => {
    if (evt.target === modal) modal.close();
  });
  modal.addEventListener("close", () => {
    document.body.classList.remove("sem-scroll");
    fotoAtual = null;
    if (location.hash.indexOf("#evento-") === 0 || location.hash.indexOf("#artigo-") === 0) {
      try { history.replaceState(null, "", location.pathname + location.search); } catch (erro) { /* file:// */ }
    }
  });

  function abrirEvento(id) {
    const ev = eventos.find((item) => item.id === id);
    if (!ev) return;
    fotoAtual = null;

    modalConteudo.innerHTML = `
      <div class="modal-head">
        <span class="tag tag--${ev.tipo}">${TIPOS[ev.tipo]}</span>
        <span class="modal-cidade">${ev.cidade} • PB</span>
        ${statusBadge(ev)}
      </div>
      <h2 id="modal-titulo">${ev.nome}</h2>
      <p class="modal-data">${ev.periodo ? `${ev.periodo} • shows em ${ev.showsLabel}` : `${dataLonga(ev.data)} • ${horaCurta(ev.data)}`}</p>
      <p class="modal-local">${pinSvg} ${ev.local} — ${ev.cidade}</p>
      <p class="modal-desc">${ev.descricao}</p>
      ${ev.organizador ? `<p class="modal-organizador">Organização: <strong>${ev.organizador}</strong></p>` : ""}
      ${ev.link ? `<p class="modal-link"><a href="${linkExterno(ev.link)}" target="_blank" rel="noopener">${ev.link}</a></p>` : ""}
      ${ev.programacao && ev.programacao.length ? `<div class="modal-programacao">
        <h3>Programação</h3>
        <ul>${ev.programacao.map((item) => `<li>${item}</li>`).join("")}</ul>
      </div>` : ""}
      <div class="modal-info">
        <div><span>Entrada</span><strong>${ev.entrada}</strong></div>
        <div><span>Cidade</span><strong>${ev.cidade} • PB</strong></div>
        <div><span>Local</span><strong>${ev.local}</strong></div>
      </div>
      <div class="modal-acoes">
        <button class="btn" type="button" data-acao="calendario">Adicionar ao calendário</button>
        <button class="btn btn--ghost" type="button" data-acao="mapa">Abrir no mapa</button>
        <button class="btn btn--ghost" type="button" data-acao="compartilhar">Compartilhar</button>
        ${ev.festival ? '<button class="btn btn--mustard" type="button" data-acao="programacao-festival">Programação por dia</button>' : ""}
      </div>`;

    const btnProgramacao = modalConteudo.querySelector('[data-acao="programacao-festival"]');
    if (btnProgramacao) {
      btnProgramacao.addEventListener("click", () => {
        modal.close();
        requestAnimationFrame(() => {
          const secao = $("#festival");
          if (secao) secao.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    }

    modalConteudo.querySelector('[data-acao="calendario"]').addEventListener("click", () => adicionarCalendario(ev.id));
    modalConteudo.querySelector('[data-acao="mapa"]').addEventListener("click", () => {
      const consulta = encodeURIComponent(`${ev.local}, ${ev.cidade}, Paraíba`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${consulta}`, "_blank", "noopener");
    });
    modalConteudo.querySelector('[data-acao="compartilhar"]').addEventListener("click", () => compartilhar(ev.id, "evento"));

    abrirModal();
  }

  function abrirArtigo(id) {
    const artigo = artigos[id];
    if (!artigo) return;
    fotoAtual = null;

    modalConteudo.innerHTML = `
      <p class="modal-kicker">${artigo.kicker}</p>
      <h2 id="modal-titulo">${artigo.titulo}</h2>
      <div class="artigo-texto">${artigo.paragrafos.map((p) => `<p>${p}</p>`).join("")}</div>
      ${artigo.citacao ? `<blockquote>${artigo.citacao}</blockquote>` : ""}
      <p class="modal-credito">${artigo.credito}</p>
      <div class="modal-acoes">
        <button class="btn" type="button" data-acao="compartilhar-artigo">Compartilhar cobertura</button>
      </div>`;

    modalConteudo.querySelector('[data-acao="compartilhar-artigo"]').addEventListener("click", () => compartilhar(id, "artigo"));
    abrirModal();
  }

  function arteCobertura(artigo) {
    if (artigo.imagem) {
      return `<img src="${artigo.imagem}" alt="${escaparAtributo(artigo.imagemAlt)}" loading="lazy">`;
    }
    const modelo = document.getElementById(`arte-${artigo.arte || "sao-joao"}`);
    return modelo ? modelo.innerHTML : "";
  }

  function cardCobertura(id, artigo, grande) {
    return `
      <article class="artigo${grande ? " artigo--grande" : ""}">
        <div class="arte">
          ${arteCobertura(artigo)}
          ${artigo.selo ? `<span class="arte-selo">${artigo.selo}</span>` : ""}
        </div>
        <div class="artigo-body">
          <p class="artigo-kicker">${artigo.kickerCurto || artigo.kicker || ""}</p>
          <h3>${artigo.titulo}</h3>
          <p>${artigo.resumo || ""}</p>
          <button class="artigo-link" type="button" data-artigo="${id}" aria-label="Ler cobertura: ${escaparAtributo(artigo.titulo)}">Ler cobertura <span aria-hidden="true">→</span></button>
        </div>
      </article>`;
  }

  /* ---------- Galeria da cobertura (fotos do público por dia) ---------- */
  const galeriaEstado = { dia: 0 };
  let fotoAtual = null;

  function diasGaleria() {
    if (!galeria || !Array.isArray(galeria.dias)) return [];
    return galeria.dias
      .filter((dia) => dia && Array.isArray(dia.fotos))
      .map((dia) => ({
        ...dia,
        fotos: dia.fotos.filter((foto) => foto && foto.src && foto.exemplo !== true)
      }));
  }

  function rotuloTab(dia) {
    const partes = String(dia.rotulo || "").split(",");
    return {
      semana: (partes[0] || "").trim(),
      numero: (partes[1] || "").trim() || (partes[0] || "").trim()
    };
  }

  function textoFotos(total) {
    return `${total} ${total === 1 ? "foto" : "fotos"}`;
  }

  function fotoGaleria(dia, diaIndice, foto, indice) {
    const capa = indice === 0;
    return `
      <button class="galeria-foto${capa ? " galeria-foto--capa" : ""}" type="button"
        data-foto="${diaIndice}:${indice}"
        aria-label="Ampliar foto ${indice + 1} de ${dia.fotos.length} — ${escaparAtributo(dia.rotulo || "Cobertura")}">
        <img src="${escaparAtributo(foto.src)}" alt="${escaparAtributo(foto.alt || foto.legenda || "")}"
          loading="${capa ? "eager" : "lazy"}" decoding="async">
      </button>`;
  }

  function painelGaleria(indice) {
    const dias = diasGaleria();
    const dia = dias[indice];
    if (!dia) return "";

    const total = dia.fotos.length;
    return `
      <div class="galeria-cabeca">
        <div>
          <p class="galeria-data">${escaparAtributo(dia.dataLabel || dia.rotulo || "")}</p>
          <h3>${escaparAtributo(dia.titulo || dia.rotulo || "Cobertura")}</h3>
          ${dia.resumo ? `<p class="galeria-resumo">${escaparAtributo(dia.resumo)}</p>` : ""}
        </div>
        <span class="galeria-qtd">${textoFotos(total)}</span>
      </div>
      ${total
        ? `<div class="galeria-fotos">${dia.fotos.map((foto, i) => fotoGaleria(dia, indice, foto, i)).join("")}</div>`
        : `<div class="galeria-vazio">
            <strong>As fotos deste dia ainda não chegaram.</strong>
            <p>A equipe publica as imagens do público depois da curadoria.</p>
          </div>`}`;
  }

  function renderGaleria() {
    const grid = $("#cobertura-grid");
    const dias = diasGaleria();
    if (!grid || !dias.some((dia) => dia.fotos.length)) return false;

    if (galeriaEstado.dia >= dias.length) galeriaEstado.dia = 0;

    const insta = String(galeria.instagram || CONTATOS.instagram || "").replace(/^@/, "").trim();
    const instaLink = insta ? `https://instagram.com/${encodeURIComponent(insta)}` : "";

    grid.classList.add("galeria");
    grid.innerHTML = `
      <div class="galeria-topo">
        <div class="galeria-tabs" role="tablist" aria-label="Fotos do festival por dia">
          ${dias.map((dia, i) => {
            const rotulo = rotuloTab(dia);
            const ativo = i === galeriaEstado.dia;
            return `
              <button class="galeria-tab${ativo ? " ativo" : ""}" type="button" role="tab"
                id="galeria-tab-${i}" aria-controls="galeria-painel" aria-selected="${ativo}"
                tabindex="${ativo ? 0 : -1}" data-dia="${i}">
                <span class="galeria-tab-semana">${escaparAtributo(rotulo.semana)}</span>
                <strong>${escaparAtributo(rotulo.numero)}</strong>
                <span class="galeria-tab-info">${textoFotos(dia.fotos.length)}</span>
              </button>`;
          }).join("")}
        </div>
      </div>
      <div class="galeria-painel" id="galeria-painel" role="tabpanel"
        aria-labelledby="galeria-tab-${galeriaEstado.dia}" tabindex="0" aria-live="polite">
        ${painelGaleria(galeriaEstado.dia)}
      </div>
      <div class="galeria-rodape">
        <span>Fotos publicadas após curadoria da equipe.</span>
        ${insta ? `<a href="${instaLink}" target="_blank" rel="noopener">Marque @${escaparAtributo(insta)} nas suas fotos</a>` : ""}
      </div>`;

    return true;
  }

  function atualizarGaleria(indice, focar) {
    const dias = diasGaleria();
    if (!dias[indice]) return;

    galeriaEstado.dia = indice;
    const painel = $("#galeria-painel");
    if (painel) {
      painel.innerHTML = painelGaleria(indice);
      painel.setAttribute("aria-labelledby", `galeria-tab-${indice}`);
    }

    document.querySelectorAll("#cobertura-grid .galeria-tab").forEach((tab, i) => {
      const ativo = i === indice;
      tab.classList.toggle("ativo", ativo);
      tab.setAttribute("aria-selected", String(ativo));
      tab.tabIndex = ativo ? 0 : -1;
      if (ativo && focar) tab.focus();
    });
  }

  function renderizarFoto(focar) {
    if (!fotoAtual) return;
    const dia = diasGaleria()[fotoAtual.dia];
    if (!dia || !dia.fotos[fotoAtual.foto]) return;

    const foto = dia.fotos[fotoAtual.foto];
    const total = dia.fotos.length;
    const anteriorDesativado = total <= 1 ? " disabled" : "";
    const rotulo = fotoAtual.foto + 1;

    modalConteudo.innerHTML = `
      <p class="modal-kicker">${escaparAtributo(dia.rotulo || "")} • Cobertura do público</p>
      <h2 id="modal-titulo">${escaparAtributo(dia.titulo || dia.rotulo || "Cobertura")}</h2>
      <figure class="modal-foto">
        <img src="${escaparAtributo(foto.src)}" alt="${escaparAtributo(foto.alt || foto.legenda || "Foto do público")}">
        <figcaption>
          ${foto.legenda ? `<strong>${escaparAtributo(foto.legenda)}</strong>` : ""}
          ${foto.credito ? `<span>${escaparAtributo(foto.credito)}</span>` : ""}
        </figcaption>
      </figure>
      <div class="modal-foto-nav">
        <button class="btn btn--ghost btn--sm" type="button" data-foto-nav="anterior"${anteriorDesativado}>← Anterior</button>
        <span class="modal-foto-contador">${rotulo} de ${total}</span>
        <button class="btn btn--ghost btn--sm" type="button" data-foto-nav="proxima"${anteriorDesativado}>Próxima →</button>
      </div>`;

    if (focar) {
      const alvo = modalConteudo.querySelector(`[data-foto-nav="${focar}"]`);
      if (alvo && !alvo.disabled) alvo.focus();
    }
  }

  function abrirFoto(diaIndice, fotoIndice) {
    const dia = diasGaleria()[diaIndice];
    if (!dia || !dia.fotos[fotoIndice]) return;
    fotoAtual = { dia: diaIndice, foto: fotoIndice };
    renderizarFoto();
    abrirModal();
  }

  function moverFoto(passo) {
    if (!fotoAtual) return;
    const dia = diasGaleria()[fotoAtual.dia];
    if (!dia || !dia.fotos.length) return;
    const total = dia.fotos.length;
    fotoAtual.foto = (fotoAtual.foto + passo + total) % total;
    renderizarFoto(passo > 0 ? "proxima" : "anterior");
  }

  modalConteudo.addEventListener("click", (evt) => {
    const botao = evt.target.closest("[data-foto-nav]");
    if (!botao) return;
    moverFoto(botao.dataset.fotoNav === "proxima" ? 1 : -1);
  });

  modal.addEventListener("keydown", (evt) => {
    if (!fotoAtual) return;
    if (evt.key === "ArrowRight") {
      evt.preventDefault();
      moverFoto(1);
    } else if (evt.key === "ArrowLeft") {
      evt.preventDefault();
      moverFoto(-1);
    }
  });

  function renderCoberturas() {
    const grid = $("#cobertura-grid");
    if (!grid) return;

    if (renderGaleria()) return;

    const lista = Object.entries(artigos).filter(([, artigo]) => artigo && artigo.titulo);
    if (!lista.length) {
      grid.innerHTML = `
        <div class="vazio">
          <strong>Fotos da cobertura em preparação.</strong>
          <p>As imagens de demonstração foram ocultadas. As fotos reais serão publicadas nesta seção depois do festival e da curadoria da equipe.</p>
        </div>`;
      return;
    }

    const indiceGrande = Math.max(0, lista.findIndex(([, artigo]) => artigo.destaque));
    const [grande] = lista.splice(indiceGrande, 1);
    grid.innerHTML = cardCobertura(grande[0], grande[1], true) +
      (lista.length
        ? `<div class="cobertura-col">${lista.map(([id, artigo]) => cardCobertura(id, artigo, false)).join("")}</div>`
        : "");
  }

  $("#cobertura-grid").addEventListener("click", (evt) => {
    const aba = evt.target.closest("[data-dia]");
    if (aba) {
      atualizarGaleria(Number(aba.dataset.dia), false);
      return;
    }

    const foto = evt.target.closest("[data-foto]");
    if (foto) {
      const [dia, indice] = foto.dataset.foto.split(":").map(Number);
      abrirFoto(dia, indice);
      return;
    }

    const botao = evt.target.closest("[data-artigo]");
    if (botao) abrirArtigo(botao.dataset.artigo);
  });

  $("#cobertura-grid").addEventListener("keydown", (evt) => {
    const aba = evt.target.closest("[data-dia]");
    if (!aba) return;

    const abas = [...document.querySelectorAll("#cobertura-grid .galeria-tab")];
    const atual = abas.indexOf(aba);
    if (atual < 0) return;

    let proximo = atual;
    if (evt.key === "ArrowRight") proximo = (atual + 1) % abas.length;
    else if (evt.key === "ArrowLeft") proximo = (atual - 1 + abas.length) % abas.length;
    else if (evt.key === "Home") proximo = 0;
    else if (evt.key === "End") proximo = abas.length - 1;
    else return;

    evt.preventDefault();
    atualizarGaleria(proximo, true);
  });

  /* ---------- Calendário (.ics) ---------- */
  function icsData(data) {
    return data.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }

  function escaparICS(texto) {
    return String(texto == null ? "" : texto)
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\r?\n/g, "\\n");
  }

  function eventoICS(ev) {
    const inicio = new Date(ev.data);
    const fim = new Date(inicio.getTime() + 4 * 3600 * 1000);
    const descricao = [
      ev.descricao,
      ev.entrada ? `Entrada: ${ev.entrada}` : "",
      ev.organizador ? `Organização: ${ev.organizador}` : "",
      ev.link ? `Link: ${ev.link}` : ""
    ].filter(Boolean).join("\n");

    return [
      "BEGIN:VEVENT",
      `UID:${ev.id}-${inicio.getTime()}@picuifest`,
      `DTSTAMP:${icsData(new Date())}`,
      `DTSTART:${icsData(inicio)}`,
      `DTEND:${icsData(fim)}`,
      `SUMMARY:${escaparICS(ev.nome)}`,
      `LOCATION:${escaparICS(`${ev.local}, ${ev.cidade} - PB`)}`,
      `DESCRIPTION:${escaparICS(descricao)}`,
      "END:VEVENT"
    ];
  }

  function montarICS(lista, nomeCalendario) {
    const linhas = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Picui Fest//PT-BR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-CALNAME:${escaparICS(nomeCalendario || "Agenda Picuí Fest")}`
    ];
    lista.forEach((ev) => linhas.push(...eventoICS(ev)));
    linhas.push("END:VCALENDAR");
    return linhas.join("\r\n");
  }

  function baixarArquivoICS(conteudo, nomeArquivo) {
    const blob = new Blob([conteudo], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function adicionarCalendario(id) {
    const ev = eventos.find((item) => item.id === id);
    if (!ev) return;
    baixarArquivoICS(montarICS([ev], ev.nome), `${slug(ev.nome)}.ics`);
    showToast("Evento baixado para o seu calendário.");
  }

  function baixarAgendaCompleta() {
    const lista = eventos
      .filter((ev) => ev.status !== "cancelado")
      .slice()
      .sort((a, b) => new Date(a.data) - new Date(b.data));

    if (!lista.length) {
      showToast("Ainda não há eventos confirmados para exportar.");
      return;
    }

    baixarArquivoICS(montarICS(lista, "Agenda Picuí Fest"), "agenda-picui-fest.ics");
    showToast(`${lista.length} ${lista.length === 1 ? "evento baixado" : "eventos baixados"} para o seu calendário.`);
  }

  const baixarAgendaBtn = $("#baixar-agenda");
  if (baixarAgendaBtn) baixarAgendaBtn.addEventListener("click", baixarAgendaCompleta);

  /* ---------- Compartilhar ---------- */
  function copiarTexto(texto) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(texto).catch(() => copiaAlternativa(texto));
      return;
    }
    copiaAlternativa(texto);
  }

  function copiaAlternativa(texto) {
    const area = document.createElement("textarea");
    area.value = texto;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try { document.execCommand("copy"); } catch (erro) { /* ignora */ }
    area.remove();
  }

  async function compartilhar(id, tipo) {
    const base = location.href.split("#")[0];
    let titulo = "";
    let url = "";

    if (tipo === "evento") {
      const ev = eventos.find((item) => item.id === id);
      if (!ev) return;
      titulo = ev.nome;
      url = `${base}#evento-${ev.id}`;
    } else {
      const artigo = artigos[id];
      if (!artigo) return;
      titulo = artigo.titulo;
      url = `${base}#artigo-${id}`;
    }

    if (navigator.share) {
      try {
        await navigator.share({ title: `${titulo} — Picuí Fest`, text: "Confira no Picuí Fest.", url });
        return;
      } catch (erro) {
        if (erro && erro.name === "AbortError") return;
      }
    }

    copiarTexto(url);
    showToast("Link copiado para compartilhar.");
  }

  /* ---------- Contatos, patrocínio e parceiros ---------- */
  function whatsappPatrocinio() {
    return PATROCINIO.whatsapp || CONTATOS.whatsapp;
  }

  function emailPatrocinio() {
    return PATROCINIO.email || CONTATOS.email;
  }

  function aplicarContatos() {
    const whatsapp = CONTATOS.whatsapp;
    const email = CONTATOS.email;
    const instagram = String(CONTATOS.instagram || "").replace(/^@/, "");
    const linkWhatsGeral = montarLinkWhatsApp(whatsapp, "Olá! Vim pelo site do Picuí Fest.");
    const linkEmail = montarLinkEmail(email);
    const linkInsta = instagram ? `https://instagram.com/${instagram}` : "";

    document.querySelectorAll("[data-whatsapp]").forEach((el) => {
      if (linkWhatsGeral) el.href = linkWhatsGeral;
      else el.hidden = true;
    });

    document.querySelectorAll('[data-rede="instagram"]').forEach((el) => {
      if (linkInsta) el.href = linkInsta;
      else el.hidden = true;
    });

    document.querySelectorAll('[data-rede="email"]').forEach((el) => {
      if (linkEmail) el.href = linkEmail;
      else el.hidden = true;
    });

    document.querySelectorAll('[data-rede="whatsapp"]').forEach((el) => {
      if (linkWhatsGeral) el.href = linkWhatsGeral;
      else el.hidden = true;
    });

    document.querySelectorAll("[data-contato]").forEach((el) => {
      const tipo = el.dataset.contato;
      if (tipo === "email") {
        if (!email) return;
        el.href = linkEmail;
        el.textContent = email;
      }
      if (tipo === "instagram") {
        if (!linkInsta) return;
        el.href = linkInsta;
        el.textContent = `@${instagram}`;
      }
      if (tipo === "whatsapp") {
        if (!linkWhatsGeral) return;
        el.href = linkWhatsGeral;
        el.textContent = formatarTelefone(whatsapp);
      }
    });

    const ctaWhats = $("#patrocinio-whatsapp");
    if (ctaWhats) {
      const link = montarLinkWhatsApp(whatsappPatrocinio(), "Olá! Quero saber mais sobre os pacotes de patrocínio do Picuí Fest.");
      if (link) ctaWhats.href = link;
      else ctaWhats.hidden = true;
    }

    const ctaEmail = $("#patrocinio-email");
    if (ctaEmail) {
      const link = montarLinkEmail(
        emailPatrocinio(),
        "Patrocínio — Picuí Fest",
        "Olá! Quero saber mais sobre os pacotes de patrocínio do Picuí Fest."
      );
      if (link) ctaEmail.href = link;
      else ctaEmail.hidden = true;
    }
  }

  function renderPacotes() {
    const grid = $("#pacotes-grid");
    if (!grid) return;

    const pacotes = Array.isArray(PATROCINIO.pacotes) ? PATROCINIO.pacotes : [];
    if (!pacotes.length) {
      grid.hidden = true;
      return;
    }

    const whatsapp = whatsappPatrocinio();
    grid.innerHTML = pacotes.map((pacote) => {
      const benefícios = Array.isArray(pacote.beneficios) ? pacote.beneficios : [];
      const link = montarLinkWhatsApp(
        whatsapp,
        `Olá! Tenho interesse no pacote ${pacote.nome} do Picuí Fest.`
      );
      return `
        <article class="pacote${pacote.destaque ? " pacote--destaque" : ""}">
          <div class="pacote-top">
            <h3>${pacote.nome}</h3>
            ${pacote.destaque ? '<span class="pacote-selo">Mais escolhido</span>' : ""}
          </div>
          <p class="pacote-desc">${pacote.descricao || ""}</p>
          ${pacote.preco ? `<p class="pacote-preco">${pacote.preco}</p>` : ""}
          ${benefícios.length ? `<ul>${benefícios.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}
          ${link ? `<a class="pacote-link" href="${link}" target="_blank" rel="noopener">Quero este <span aria-hidden="true">→</span></a>` : ""}
        </article>`;
    }).join("");
  }

  function renderParceiros() {
    const grid = $("#parceiros-grid");
    if (!grid) return;

    const lista = patrocinadores.filter((parceiro) => parceiro && parceiro.nome);
    const whatsapp = whatsappPatrocinio();
    const linkVaga = montarLinkWhatsApp(whatsapp, "Olá! Quero colocar minha marca no Picuí Fest.");
    const vagas = Math.max(4 - lista.length, 0);

    const cards = lista.map((parceiro) => {
      const conteudo = `
        ${parceiro.logo ? `<img src="${parceiro.logo}" alt="" loading="lazy">` : ""}
        <strong>${parceiro.nome}</strong>
        ${parceiro.categoria ? `<small>${parceiro.categoria}</small>` : ""}`;
      return parceiro.url
        ? `<a class="parceiro" href="${linkExterno(parceiro.url)}" target="_blank" rel="noopener">${conteudo}</a>`
        : `<div class="parceiro">${conteudo}</div>`;
    }).join("");

    const lugares = Array.from({ length: vagas }, () => `
      <a class="parceiro parceiro--vazio" href="${linkVaga || "#contato"}"${linkVaga ? ' target="_blank" rel="noopener"' : ""}>
        <span class="parceiro-tag">Espaço</span>
        <strong>Sua marca aqui</strong>
        <small>Patrocine o Picuí Fest</small>
      </a>`).join("");

    grid.innerHTML = cards + lugares;
  }

  function atualizarDataAgenda() {
    const alvo = $("#agenda-atualizada");
    if (!alvo) return;
    const iso = CONFIG.site && CONFIG.site.agendaAtualizadaEm;
    if (!iso) return;

    const data = new Date(`${iso.slice(0, 10)}T12:00:00`);
    if (Number.isNaN(data.getTime())) return;

    const texto = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit", month: "long", year: "numeric"
    }).format(data);
    alvo.dateTime = iso.slice(0, 10);
    alvo.textContent = `atualizada em ${texto}`;
  }

  /* ---------- Formulário ---------- */
  const form = $("#form-evento");
  const nota = $("#form-nota");
  $("#data-evento").min = new Date().toISOString().slice(0, 10);

  function mostrarNota(mensagem) {
    nota.hidden = false;
    nota.textContent = mensagem;
  }

  function montarMensagemEvento(dados) {
    return [
      "Olá! Quero divulgar um evento no Picuí Fest.",
      "",
      `Nome: ${dados.nome}`,
      `Contato: ${dados.contato}`,
      `Evento: ${dados.evento}`,
      `Cidade: ${dados.cidade}`,
      `Data: ${formatarDataCurta(dados.data)}`,
      `Tipo: ${dados.tipo}`,
      dados.link ? `Link: ${dados.link}` : "",
      "",
      `Descrição: ${dados.descricao}`
    ].filter(Boolean).join("\n");
  }

  function endpointFormularioAtivo() {
    return String(FORM_CONFIG.modo || "").toLowerCase() === "endpoint" &&
      Boolean(String(FORM_CONFIG.endpoint || "").trim());
  }

  async function enviarEndpoint(dados, mensagem) {
    mostrarNota("Enviando seu evento...");
    try {
      const resposta = await fetch(FORM_CONFIG.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...dados, mensagem, origem: "Picuí Fest", pagina: location.href })
      });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      mostrarNota("Recebemos seu evento! A curadoria vai conferir os dados e responder pelo contato informado.");
      showToast("Evento enviado para a curadoria.");
      form.reset();
    } catch (erro) {
      mostrarNota("Não foi possível enviar agora. Use o WhatsApp ou o e-mail — a mensagem já vai preenchida.");
      showToast("Falha no envio. Tente pelo WhatsApp.");
    }
  }

  function configurarCanaisFormulario() {
    const canais = $("#form-canais");
    const endpointBtn = $("#form-endpoint");
    const ajuda = document.querySelector(".form-ajuda");
    const modo = String(FORM_CONFIG.modo || "ambos").toLowerCase();
    const temWhats = Boolean(onlyDigits(CONTATOS.whatsapp));
    const temEmail = Boolean(CONTATOS.email);

    if (endpointFormularioAtivo()) {
      if (canais) canais.hidden = true;
      if (endpointBtn) endpointBtn.hidden = false;
      if (ajuda) ajuda.textContent = "Seu evento vai direto para a nossa equipe. Entramos em contato para confirmar os detalhes.";
      return;
    }

    if (endpointBtn) endpointBtn.hidden = true;

    const botaoWhats = canais && canais.querySelector('[data-canal="whatsapp"]');
    const botaoEmail = canais && canais.querySelector('[data-canal="email"]');
    const modoEfetivo = modo === "endpoint" ? "ambos" : modo;
    const usarWhats = (modoEfetivo === "whatsapp" || modoEfetivo === "ambos") && temWhats;
    const usarEmail = (modoEfetivo === "email" || modoEfetivo === "ambos") && temEmail;

    if (botaoWhats) botaoWhats.hidden = !usarWhats;
    if (botaoEmail) botaoEmail.hidden = !usarEmail;
    if (canais) {
      canais.hidden = !usarWhats && !usarEmail;
      canais.style.gridTemplateColumns = usarWhats && usarEmail ? "" : "1fr";
    }

    if (ajuda) {
      if (usarWhats && usarEmail) {
        ajuda.textContent = "Escolha o canal: o WhatsApp ou o e-mail abre com a mensagem já preenchida. Você confere antes de enviar.";
      } else if (usarWhats) {
        ajuda.textContent = "O botão abre o WhatsApp com a mensagem já preenchida. Você confere antes de enviar.";
      } else if (usarEmail) {
        ajuda.textContent = "O botão abre o seu aplicativo de e-mail com a mensagem já preenchida.";
      } else {
        ajuda.textContent = "O envio pelo site ainda não está configurado. Fale com a gente pelo Instagram.";
      }
    }

    if (!usarWhats && !usarEmail) {
      document.querySelectorAll('#form-evento button[type="submit"]').forEach((botao) => {
        botao.disabled = true;
      });
    }
  }

  form.addEventListener("submit", async (evt) => {
    evt.preventDefault();
    const dados = Object.fromEntries(new FormData(form).entries());
    const canal = (evt.submitter && evt.submitter.dataset.canal) ||
      (endpointFormularioAtivo() ? "endpoint" : "");
    const mensagem = montarMensagemEvento(dados);

    if (canal === "endpoint") {
      await enviarEndpoint(dados, mensagem);
      return;
    }

    if (canal === "email") {
      const link = montarLinkEmail(
        CONTATOS.email,
        `${FORM_CONFIG.assuntoEmail || "Evento para a agenda"} — ${dados.evento}`,
        mensagem
      );
      if (!link) {
        mostrarNota("O e-mail ainda não está configurado.");
        return;
      }
      window.location.href = link;
      mostrarNota("Abrimos o seu aplicativo de e-mail com os dados do evento. Confira e envie.");
      showToast("Mensagem pronta no seu e-mail.");
      form.reset();
      return;
    }

    if (canal === "whatsapp") {
      const link = montarLinkWhatsApp(CONTATOS.whatsapp, mensagem);
      if (!link) {
        mostrarNota("O WhatsApp ainda não está configurado.");
        return;
      }
      window.open(link, "_blank", "noopener");
      mostrarNota("Abrimos o WhatsApp com os dados do evento. Se a janela não aparecer, verifique o bloqueador de pop-ups ou use o botão de e-mail.");
      showToast("Evento encaminhado para o WhatsApp.");
      form.reset();
      return;
    }

    mostrarNota("Escolha um canal de envio acima.");
  });

  /* ---------- Aviso de conteúdo de exemplo ---------- */
  function atualizarAvisoExemplos() {
    const aviso = $("#aviso-previa");
    const texto = $("#aviso-previa-texto");
    if (!aviso || !texto) return;

    const totalEventos = eventos.filter((ev) => ev && ev.exemplo).length;
    const totalArtigos = Object.values(artigos).filter((artigo) => artigo && artigo.exemplo).length;
    if (!totalEventos && !totalArtigos) return;

    const partes = [];
    if (totalEventos) partes.push(`${totalEventos} ${totalEventos === 1 ? "evento" : "eventos"}`);
    if (totalArtigos) partes.push(`${totalArtigos} ${totalArtigos === 1 ? "cobertura" : "coberturas"}`);

    texto.innerHTML = `<strong>Prévia:</strong> ${partes.join(" e ")} de exemplo. Substitua pelos dados reais antes de publicar.`;
    aviso.hidden = false;

    const fechar = $("#aviso-previa-fechar");
    if (fechar) fechar.addEventListener("click", () => { aviso.hidden = true; }, { once: true });
  }

  /* ---------- Inicialização dos blocos editáveis ---------- */
  aplicarContatos();
  renderCoberturas();
  renderPacotes();
  renderParceiros();
  atualizarDataAgenda();
  atualizarAvisoExemplos();
  configurarCanaisFormulario();

  /* ---------- Navegação e pequenos ajustes ---------- */
  const menuBtn = $("#menu-btn");
  const nav = $("#nav");

  menuBtn.addEventListener("click", () => {
    const aberto = nav.classList.toggle("aberto");
    menuBtn.setAttribute("aria-expanded", String(aberto));
    menuBtn.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  });

  document.querySelector(".site-header").addEventListener("keydown", (evt) => {
    if (evt.key !== "Escape" || menuBtn.getAttribute("aria-expanded") !== "true") return;
    nav.classList.remove("aberto");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Abrir menu");
    menuBtn.focus();
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("aberto");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "Abrir menu");
    });
  });

  const header = document.querySelector(".site-header");
  const aoRolar = () => header.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  document.querySelectorAll("[data-placeholder]").forEach((link) => {
    link.addEventListener("click", (evt) => {
      evt.preventDefault();
      showToast(`${link.dataset.placeholder}: link ainda não configurado.`);
    });
  });

  /* ---------- Links diretos para eventos e coberturas ---------- */
  function abrirPorHash() {
    const hash = location.hash;
    if (hash.indexOf("#evento-") === 0) abrirEvento(hash.slice(8));
    if (hash.indexOf("#artigo-") === 0) abrirArtigo(hash.slice(8));
  }

  window.addEventListener("hashchange", abrirPorHash);
  abrirPorHash();

})();
