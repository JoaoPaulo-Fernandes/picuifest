#!/usr/bin/env node
/* ============================================================
   VALIDADOR DE DADOS DO PICUI FEST
   ------------------------------------------------------------
   Uso:
     node ferramentas/validar-dados.js

   Confere eventos, coberturas e configuração antes de publicar.
   Retorna código 1 quando encontra erro.
   ============================================================ */

"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RAIZ = path.resolve(__dirname, "..");
const TIPOS = new Set(["forro", "religioso", "carnaval", "vaquejada", "cultural", "festa"]);
const STATUS = new Set(["confirmado", "a confirmar", "cancelado"]);
const ARTES = new Set(["sao-joao", "sanfona", "geracao"]);

const erros = [];
const avisos = [];
const notas = [];

function erro(mensagem) { erros.push(mensagem); }
function aviso(mensagem) { avisos.push(mensagem); }
function nota(mensagem) { notas.push(mensagem); }

function carregar(relativo, chave) {
  const caminho = path.join(RAIZ, relativo);
  if (!fs.existsSync(caminho)) {
    erro(`arquivo não encontrado: ${relativo}`);
    return null;
  }
  const contexto = { window: {} };
  vm.createContext(contexto);
  try {
    vm.runInContext(fs.readFileSync(caminho, "utf8"), contexto, { filename: caminho });
  } catch (falha) {
    erro(`não foi possível ler ${relativo}: ${falha.message}`);
    return null;
  }
  return contexto.window[chave];
}

function textoPreenchido(valor) {
  return typeof valor === "string" && valor.trim().length > 0;
}

function dataValida(data) {
  const partes = String(data || "").match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
  if (!partes) return false;
  const [ano, mes, dia, hora, minuto, segundo] = partes.slice(1).map(Number);
  const verificacao = new Date(Date.UTC(ano, mes - 1, dia, hora, minuto, segundo));
  return verificacao.getUTCFullYear() === ano &&
    verificacao.getUTCMonth() === mes - 1 &&
    verificacao.getUTCDate() === dia &&
    verificacao.getUTCHours() === hora &&
    verificacao.getUTCMinutes() === minuto &&
    verificacao.getUTCSeconds() === segundo;
}

function validarEventos(eventos) {
  if (!Array.isArray(eventos)) {
    erro("dados/eventos.js não define window.PICUI_EVENTOS como lista.");
    return { total: 0, exemplos: 0 };
  }
  if (!eventos.length) {
    nota("dados/eventos.js está vazio: a agenda mostra apenas o festival em destaque. Adicione eventos quando forem confirmados.");
    return { total: 0, exemplos: 0 };
  }

  const ids = new Set();
  let exemplos = 0;
  let passados = 0;

  eventos.forEach((ev, indice) => {
    const posicao = `evento ${indice + 1}${ev && ev.nome ? ` ("${ev.nome}")` : ""}`;

    if (!ev || typeof ev !== "object") {
      erro(`${posicao}: registro inválido.`);
      return;
    }
    if (ev.exemplo === true) exemplos++;

    ["id", "nome", "cidade", "local", "data", "tipo", "entrada", "descricao"].forEach((campo) => {
      if (!textoPreenchido(ev[campo])) erro(`${posicao}: campo "${campo}" vazio ou inválido.`);
    });

    if (textoPreenchido(ev.id)) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(ev.id)) {
        erro(`${posicao}: id "${ev.id}" deve usar apenas letras minúsculas, números e hífens.`);
      }
      if (ids.has(ev.id)) erro(`${posicao}: id "${ev.id}" repetido.`);
      ids.add(ev.id);
    }

    if (textoPreenchido(ev.data)) {
      const data = new Date(ev.data);
      if (!dataValida(ev.data) || Number.isNaN(data.getTime())) {
        erro(`${posicao}: data inválida ("${ev.data}").`);
      } else {
        if (!/[+-]\d{2}:\d{2}$/.test(ev.data)) {
          aviso(`${posicao}: data sem fuso horário. Use o formato AAAA-MM-DDTHH:MM:SS-03:00.`);
        }
        if (data.getTime() < Date.now()) passados++;
      }
    }

    if (textoPreenchido(ev.tipo) && !TIPOS.has(ev.tipo)) {
      erro(`${posicao}: tipo "${ev.tipo}" inválido.`);
    }
    if (ev.status !== undefined && !STATUS.has(ev.status)) {
      erro(`${posicao}: status "${ev.status}" inválido.`);
    }
    if (ev.destaque !== undefined && typeof ev.destaque !== "boolean") {
      erro(`${posicao}: "destaque" deve ser true ou false.`);
    }
    if (ev.programacao !== undefined) {
      if (!Array.isArray(ev.programacao)) {
        erro(`${posicao}: "programacao" deve ser uma lista.`);
      } else if (ev.programacao.some((item) => typeof item !== "string")) {
        erro(`${posicao}: todos os itens de "programacao" devem ser texto.`);
      }
    }
    if (textoPreenchido(ev.descricao) && ev.descricao.length < 25) {
      aviso(`${posicao}: descrição curta; o card pode ficar sem contexto.`);
    }
    if (textoPreenchido(ev.link)) {
      const link = ev.link.trim();
      if (!/^https?:\/\//i.test(link) && link.charAt(0) !== "@" && !/^[\w-]+(\.[\w-]+)+/.test(link)) {
        aviso(`${posicao}: link "${ev.link}" será tratado como perfil do Instagram.`);
      }
    }
  });

  if (passados) aviso(`${passados} ${passados === 1 ? "evento está" : "eventos estão"} com data no passado.`);

  return { total: eventos.length, exemplos };
}

function validarCoberturas(coberturas) {
  if (!coberturas || typeof coberturas !== "object" || Array.isArray(coberturas)) {
    erro("dados/coberturas.js não define window.PICUI_COBERTURAS como objeto.");
    return { total: 0, exemplos: 0 };
  }

  const lista = Object.entries(coberturas);
  if (!lista.length) {
    nota("nenhum texto editorial cadastrado; a galeria de fotos é validada à parte.");
    return { total: 0, exemplos: 0 };
  }

  let exemplos = 0;
  let comDestaque = 0;

  lista.forEach(([id, artigo]) => {
    const posicao = `cobertura "${id}"`;
    if (!artigo || typeof artigo !== "object") {
      erro(`${posicao}: registro inválido.`);
      return;
    }
    if (artigo.exemplo === true) exemplos++;
    if (artigo.destaque === true) comDestaque++;

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
      erro(`${posicao}: a chave deve usar apenas letras minúsculas, números e hífens.`);
    }
    if (!textoPreenchido(artigo.titulo)) erro(`${posicao}: campo "titulo" vazio.`);
    if (!textoPreenchido(artigo.kicker) && !textoPreenchido(artigo.kickerCurto)) {
      erro(`${posicao}: informe "kicker" ou "kickerCurto".`);
    }
    if (!textoPreenchido(artigo.credito)) erro(`${posicao}: campo "credito" vazio.`);
    if (!textoPreenchido(artigo.resumo)) aviso(`${posicao}: sem "resumo"; o card fica só com o título.`);
    if (!Array.isArray(artigo.paragrafos) || !artigo.paragrafos.length) {
      erro(`${posicao}: "paragrafos" deve ser uma lista com pelo menos um texto.`);
    } else if (artigo.paragrafos.some((p) => typeof p !== "string" || !p.trim())) {
      erro(`${posicao}: todos os parágrafos devem ser texto preenchido.`);
    }

    if (artigo.imagem) {
      const imagem = path.join(RAIZ, artigo.imagem);
      if (!fs.existsSync(imagem)) {
        erro(`${posicao}: imagem não encontrada em "${artigo.imagem}".`);
      }
      if (!textoPreenchido(artigo.imagemAlt)) {
        aviso(`${posicao}: imagem sem "imagemAlt" (descrição para acessibilidade).`);
      }
    } else if (artigo.arte && !ARTES.has(artigo.arte)) {
      erro(`${posicao}: arte "${artigo.arte}" inválida. Use sao-joao, sanfona ou geracao, ou informe "imagem".`);
    }
  });

  if (comDestaque > 1) aviso("mais de uma cobertura com destaque: true; só a primeira será usada como card grande.");

  return { total: lista.length, exemplos };
}

function validarGaleria(galeria) {
  if (!galeria || typeof galeria !== "object" || Array.isArray(galeria)) {
    nota("dados/galeria.js não define window.PICUI_GALERIA: a seção usa o aviso de “Cobertura do público em breve”.");
    return { totalDias: 0, totalFotos: 0, exemplos: 0 };
  }

  const dias = Array.isArray(galeria.dias) ? galeria.dias : [];
  if (!dias.length) {
    nota("a galeria está vazia: a seção mostra o aviso de “Cobertura do público em breve”.");
    return { totalDias: 0, totalFotos: 0, exemplos: 0 };
  }

  let totalFotos = 0;
  let exemplos = 0;
  const datas = new Set();

  dias.forEach((dia, indiceDia) => {
    const posicao = `galeria, dia ${indiceDia + 1}${dia && dia.rotulo ? ` ("${dia.rotulo}")` : ""}`;
    if (!dia || typeof dia !== "object") {
      erro(`${posicao}: registro inválido.`);
      return;
    }

    const data = String(dia.data || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || Number.isNaN(new Date(`${data}T12:00:00`).getTime())) {
      erro(`${posicao}: "data" deve usar AAAA-MM-DD.`);
    } else if (datas.has(data)) {
      erro(`${posicao}: data "${data}" repetida.`);
    } else {
      datas.add(data);
    }

    if (!textoPreenchido(dia.rotulo)) erro(`${posicao}: campo "rotulo" vazio (ex.: "Sexta, 27").`);
    if (!textoPreenchido(dia.titulo)) erro(`${posicao}: campo "titulo" vazio.`);

    if (!Array.isArray(dia.fotos)) {
      erro(`${posicao}: "fotos" deve ser uma lista.`);
      return;
    }

    dia.fotos.forEach((foto, indiceFoto) => {
      const onde = `${posicao}, foto ${indiceFoto + 1}`;
      if (!foto || typeof foto !== "object") {
        erro(`${onde}: registro inválido.`);
        return;
      }

      totalFotos++;
      if (foto.exemplo === true) exemplos++;

      if (!textoPreenchido(foto.src)) {
        erro(`${onde}: campo "src" vazio.`);
      } else if (!fs.existsSync(path.join(RAIZ, foto.src))) {
        erro(`${onde}: arquivo não encontrado em "${foto.src}".`);
      }
      if (!textoPreenchido(foto.alt)) erro(`${onde}: campo "alt" vazio (descrição para acessibilidade).`);
      if (!textoPreenchido(foto.credito)) erro(`${onde}: campo "credito" vazio.`);
    });
  });

  if (exemplos && exemplos === totalFotos) {
    nota(`as ${totalFotos} fotos da galeria são de exemplo; troque pelos arquivos reais antes de publicar.`);
  }

  return { totalDias: dias.length, totalFotos, exemplos };
}

function validarFestival(festival) {
  if (!festival || typeof festival !== "object" || Array.isArray(festival)) {
    aviso("dados/festival.js não define window.PICUI_FESTIVAL; o destaque da home fica desativado.");
    return { totalDias: 0 };
  }

  const posicao = "festival da home";
  ["id", "nome", "cidade", "local", "dataLabel", "resumo", "descricao", "entrada"].forEach((campo) => {
    if (!textoPreenchido(festival[campo])) erro(`${posicao}: campo "${campo}" vazio.`);
  });

  if (textoPreenchido(festival.id) && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(festival.id)) {
    erro(`${posicao}: id "${festival.id}" deve usar apenas letras minúsculas, números e hífens.`);
  }

  ["inicio", "fim", "showsInicio"].forEach((campo) => {
    if (!textoPreenchido(festival[campo]) || !dataValida(festival[campo])) {
      erro(`${posicao}: "${campo}" inválido. Use AAAA-MM-DDTHH:MM:SS-03:00.`);
    }
  });

  if (textoPreenchido(festival.cartaz)) {
    if (!fs.existsSync(path.join(RAIZ, festival.cartaz))) {
      erro(`${posicao}: cartaz não encontrado em "${festival.cartaz}".`);
    }
    if (!textoPreenchido(festival.cartazAlt)) {
      aviso(`${posicao}: cartaz sem "cartazAlt" (descrição para acessibilidade).`);
    }
  } else {
    aviso(`${posicao}: sem cartaz; o bloco de imagem do hero fica vazio.`);
  }
  if (textoPreenchido(festival.cartazWebp) && !fs.existsSync(path.join(RAIZ, festival.cartazWebp))) {
    aviso(`${posicao}: versão WebP do cartaz não encontrada em "${festival.cartazWebp}".`);
  }

  const dias = Array.isArray(festival.dias) ? festival.dias : [];
  if (!dias.length) {
    erro(`${posicao}: "dias" deve ser uma lista com a programação de pelo menos um dia.`);
    return { totalDias: 0 };
  }

  const datas = new Set();
  dias.forEach((dia, indice) => {
    const rotulo = `${posicao}, dia ${indice + 1}${dia && dia.data ? ` (${dia.data})` : ""}`;
    if (!dia || typeof dia !== "object") {
      erro(`${rotulo}: registro inválido.`);
      return;
    }
    if (!textoPreenchido(dia.data) || !dataValida(`${dia.data}T12:00:00`)) {
      erro(`${rotulo}: data inválida. Use AAAA-MM-DD.`);
    } else if (datas.has(dia.data)) {
      erro(`${rotulo}: data repetida.`);
    } else {
      datas.add(dia.data);
    }
    if (!textoPreenchido(dia.titulo)) erro(`${rotulo}: preencha o título do dia.`);
    if (!textoPreenchido(dia.resumo)) aviso(`${rotulo}: sem resumo; o painel fica só com a lista.`);

    if (dia.itens !== undefined) {
      if (!Array.isArray(dia.itens)) {
        erro(`${rotulo}: "itens" deve ser uma lista.`);
      } else {
        dia.itens.forEach((item) => {
          if (!item || typeof item !== "object" || !textoPreenchido(item.texto)) {
            erro(`${rotulo}: cada item precisa de um "texto".`);
          }
        });
      }
    }
    if (dia.atracoes !== undefined) {
      if (!Array.isArray(dia.atracoes) || dia.atracoes.some((nome) => !textoPreenchido(nome))) {
        erro(`${rotulo}: "atracoes" deve ser uma lista de nomes.`);
      }
    }
  });

  return { totalDias: dias.length };
}

function validarConfig(config) {
  if (!config || typeof config !== "object") {
    erro("config.js não define window.PICUI_CONFIG.");
    return;
  }

  const contatos = config.contatos || {};
  const whatsapp = String(contatos.whatsapp || "").replace(/\D/g, "");
  if (!whatsapp) erro("config.contatos.whatsapp está vazio.");
  else if (whatsapp.length < 12 || whatsapp.length > 13) {
    aviso("o WhatsApp deve ter código do país + DDD + número (12 ou 13 dígitos).");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(contatos.email || ""))) {
    erro("config.contatos.email inválido.");
  }
  if (String(contatos.instagram || "").startsWith("@")) {
    aviso('config.contatos.instagram deve ficar sem "@".');
  }

  const atualizada = config.site && config.site.agendaAtualizadaEm;
  if (!atualizada || Number.isNaN(new Date(`${String(atualizada).slice(0, 10)}T12:00:00`).getTime())) {
    erro("config.site.agendaAtualizadaEm inválida. Use AAAA-MM-DD.");
  }

  const formulario = config.formulario || {};
  if (formulario.modo === "endpoint" && !String(formulario.endpoint || "").trim()) {
    aviso('formulário em modo "endpoint" sem URL: o site volta para WhatsApp/e-mail.');
  }

  if (!Array.isArray(config.cidades) || !config.cidades.length) {
    erro("config.cidades deve ser uma lista com pelo menos uma cidade.");
  }
}

const eventos = carregar("dados/eventos.js", "PICUI_EVENTOS");
const coberturas = carregar("dados/coberturas.js", "PICUI_COBERTURAS");
const galeria = carregar("dados/galeria.js", "PICUI_GALERIA");
const festival = carregar("dados/festival.js", "PICUI_FESTIVAL");
const config = carregar("config.js", "PICUI_CONFIG");

const resumoEventos = validarEventos(eventos);
const resumoCoberturas = validarCoberturas(coberturas);
const resumoGaleria = validarGaleria(galeria);
const resumoFestival = validarFestival(festival);
validarConfig(config);

console.log("\nPicuí Fest — validação de dados\n");

if (erros.length) {
  erros.forEach((mensagem) => console.log(`ERRO  ${mensagem}`));
}
if (avisos.length) {
  avisos.forEach((mensagem) => console.log(`AVISO ${mensagem}`));
}
if (notas.length) {
  notas.forEach((mensagem) => console.log(`NOTA  ${mensagem}`));
}
if (!erros.length && !avisos.length) {
  console.log("Tudo certo: nenhum problema encontrado.");
}

console.log("");
console.log(`Eventos extras: ${resumoEventos.total} (${resumoEventos.exemplos} de exemplo)`);
console.log(`Coberturas editoriais: ${resumoCoberturas.total} (${resumoCoberturas.exemplos} de exemplo)`);
console.log(`Galeria: ${resumoGaleria.totalDias} dias, ${resumoGaleria.totalFotos} fotos (${resumoGaleria.exemplos} de exemplo)`);
console.log(`Festival em destaque: ${resumoFestival.totalDias} dias de programação`);
console.log("");

if (resumoEventos.exemplos || resumoCoberturas.exemplos || resumoGaleria.exemplos) {
  console.log("O site está em modo prévia. Substitua o conteúdo com exemplo: true antes de publicar.");
  console.log("");
}

if (erros.length) {
  console.log(`Falha: ${erros.length} ${erros.length === 1 ? "erro" : "erros"} e ${avisos.length} ${avisos.length === 1 ? "aviso" : "avisos"}.\n`);
  process.exit(1);
}

console.log(`OK: ${avisos.length} ${avisos.length === 1 ? "aviso" : "avisos"}, nenhum erro.\n`);
