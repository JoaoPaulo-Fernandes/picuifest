#!/usr/bin/env node
/* ============================================================
   IMPORTADOR DE EVENTOS
   ------------------------------------------------------------
   Lê a planilha modelos/eventos.csv e gera dados/eventos.js.

   Uso:
     node ferramentas/importar-eventos.js
     node ferramentas/importar-eventos.js caminho/outra-planilha.csv

   A planilha deve ter o cabeçalho:
     id, nome, cidade, local, data, tipo, entrada, destaque,
     status, organizador, link, descricao, programacao

   - Linhas com id começando em "exemplo-" são ignoradas.
   - A programação usa " | " para separar os horários.
   - Antes de gravar, o arquivo atual é copiado para um backup.
   ============================================================ */

"use strict";

const fs = require("fs");
const path = require("path");

const RAIZ = path.resolve(__dirname, "..");
const ENTRADA = path.resolve(process.argv[2] || path.join(RAIZ, "modelos", "eventos.csv"));
const SAIDA = path.join(RAIZ, "dados", "eventos.js");

const TIPOS = new Set(["forro", "religioso", "carnaval", "vaquejada", "cultural", "festa"]);

function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function chave(texto) {
  return normalizar(texto).replace(/\s+/g, "_");
}

function slug(texto) {
  return normalizar(texto).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function detectarDelimitador(linha) {
  let virgulas = 0;
  let pontosVirgula = 0;
  let dentro = false;

  for (let i = 0; i < linha.length; i++) {
    const char = linha[i];
    if (char === '"') {
      if (dentro && linha[i + 1] === '"') i++;
      else dentro = !dentro;
    } else if (!dentro && char === ",") virgulas++;
    else if (!dentro && char === ";") pontosVirgula++;
  }

  return pontosVirgula > virgulas ? ";" : ",";
}

function lerCSV(texto) {
  const limpo = texto.replace(/^\uFEFF/, "");
  const primeiraLinha = limpo.split(/\r?\n/)[0] || "";
  const delimitador = detectarDelimitador(primeiraLinha);
  const linhas = [];
  let linha = [];
  let campo = "";
  let dentro = false;

  for (let i = 0; i < limpo.length; i++) {
    const char = limpo[i];

    if (char === '"') {
      if (dentro && limpo[i + 1] === '"') {
        campo += '"';
        i++;
      } else {
        dentro = !dentro;
      }
      continue;
    }

    if (!dentro && char === delimitador) {
      linha.push(campo);
      campo = "";
      continue;
    }

    if (!dentro && (char === "\n" || char === "\r")) {
      if (char === "\r" && limpo[i + 1] === "\n") i++;
      linha.push(campo);
      if (linha.some((valor) => valor.trim() !== "")) linhas.push(linha);
      linha = [];
      campo = "";
      continue;
    }

    campo += char;
  }

  linha.push(campo);
  if (linha.some((valor) => valor.trim() !== "")) linhas.push(linha);

  return { delimitador, linhas };
}

function normalizarData(valor) {
  let data = String(valor || "").trim();
  if (!data) return "";

  let partes = data.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}):(\d{2}))?$/);
  if (partes) {
    return `${partes[3]}-${partes[2]}-${partes[1]}T${partes[4] || "20"}:${partes[5] || "00"}:00-03:00`;
  }

  partes = data.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (partes) {
    return `${partes[1]}-${partes[2]}-${partes[3]}T${partes[4]}:${partes[5]}:${partes[6] || "00"}-03:00`;
  }

  partes = data.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (partes) {
    return `${partes[1]}-${partes[2]}-${partes[3]}T20:00:00-03:00`;
  }

  return data;
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

function normalizarStatus(valor) {
  const status = chave(valor);
  if (!status || status === "confirmado") return "";
  if (status === "a_confirmar") return "a confirmar";
  if (status === "cancelado") return "cancelado";
  return `__invalido__:${valor}`;
}

function normalizarTipo(valor) {
  const tipo = chave(valor).replace(/[\s-]+/g, "");
  return TIPOS.has(tipo) ? tipo : `__invalido__:${valor}`;
}

function simNao(valor) {
  return ["sim", "s", "true", "1", "x", "verdadeiro"].includes(chave(valor));
}

function formatarTexto(valor) {
  return JSON.stringify(String(valor || ""));
}

function formatarEvento(ev) {
  const linhas = [];
  const adicionar = (chaveNome, valor) => {
    linhas.push(`      ${chaveNome}: ${valor}`);
  };

  adicionar("id", formatarTexto(ev.id));
  adicionar("nome", formatarTexto(ev.nome));
  adicionar("cidade", formatarTexto(ev.cidade));
  adicionar("local", formatarTexto(ev.local));
  adicionar("data", formatarTexto(ev.data));
  adicionar("tipo", formatarTexto(ev.tipo));
  adicionar("entrada", formatarTexto(ev.entrada));
  adicionar("destaque", String(Boolean(ev.destaque)));
  if (ev.status) adicionar("status", formatarTexto(ev.status));
  if (ev.organizador) adicionar("organizador", formatarTexto(ev.organizador));
  if (ev.link) adicionar("link", formatarTexto(ev.link));
  adicionar("descricao", formatarTexto(ev.descricao));
  adicionar("programacao", `[${(ev.programacao || []).map(formatarTexto).join(", ")}]`);

  return `    {\n${linhas.join(",\n")}\n    }`;
}

function falhar(mensagem) {
  console.error(`\nERRO: ${mensagem}\n`);
  process.exit(1);
}

if (!fs.existsSync(ENTRADA)) {
  falhar(`planilha não encontrada em ${ENTRADA}`);
}

const csv = fs.readFileSync(ENTRADA, "utf8");
const { delimitador, linhas } = lerCSV(csv);

if (linhas.length < 2) {
  falhar("a planilha está vazia. Preencha o cabeçalho e pelo menos uma linha de evento.");
}

const cabecalho = linhas[0].map(chave);
const obrigatorias = ["nome", "cidade", "local", "data", "tipo", "descricao"];
const faltando = obrigatorias.filter((campo) => !cabecalho.includes(campo));
if (faltando.length) {
  falhar(`o cabeçalho não tem as colunas obrigatórias: ${faltando.join(", ")}`);
}

const eventos = [];
const erros = [];
const avisos = [];
const ids = new Set();

for (let i = 1; i < linhas.length; i++) {
  const numeroLinha = i + 1;
  const valores = linhas[i];
  const registro = {};
  cabecalho.forEach((campo, indice) => {
    registro[campo] = (valores[indice] || "").trim();
  });

  if (!registro.nome && !registro.id && !registro.descricao) continue;
  if (/^exemplo-/i.test(registro.id)) continue;

  const nome = registro.nome;
  const cidade = registro.cidade;
  const local = registro.local;
  const data = normalizarData(registro.data);
  const tipo = normalizarTipo(registro.tipo);
  const status = normalizarStatus(registro.status);
  const descricao = registro.descricao;

  const errosLinha = [];
  if (!nome) errosLinha.push(`linha ${numeroLinha}: preencha o nome do evento.`);
  if (!cidade) errosLinha.push(`linha ${numeroLinha}: preencha a cidade.`);
  if (!local) errosLinha.push(`linha ${numeroLinha}: preencha o local.`);
  if (!descricao) errosLinha.push(`linha ${numeroLinha}: preencha a descrição.`);
  if (!data || !dataValida(data)) {
    errosLinha.push(`linha ${numeroLinha}: data inválida ("${registro.data}"). Use 2027-01-10T20:00:00-03:00 ou 10/01/2027 20:00.`);
  }
  if (tipo.startsWith("__invalido__")) {
    errosLinha.push(`linha ${numeroLinha}: tipo inválido ("${registro.tipo}"). Use forro, religioso, carnaval, vaquejada, cultural ou festa.`);
  }
  if (status.startsWith("__invalido__")) {
    errosLinha.push(`linha ${numeroLinha}: status inválido ("${registro.status}"). Use confirmado, a confirmar ou cancelado.`);
  }
  if (errosLinha.length) {
    erros.push(...errosLinha);
    continue;
  }

  let id = slug(registro.id) || slug(`${nome}-${data.slice(0, 10)}`);
  if (!id) {
    erros.push(`linha ${numeroLinha}: não foi possível gerar um id. Preencha a coluna id.`);
    continue;
  }
  if (ids.has(id)) {
    let sufixo = 2;
    while (ids.has(`${id}-${sufixo}`)) sufixo++;
    avisos.push(`linha ${numeroLinha}: id "${id}" repetido; usei "${id}-${sufixo}".`);
    id = `${id}-${sufixo}`;
  }
  ids.add(id);

  const programacao = String(registro.programacao || "")
    .split(/\s*\|\s*|\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  eventos.push({
    id,
    nome,
    cidade,
    local,
    data,
    tipo,
    entrada: registro.entrada || "Consultar",
    destaque: simNao(registro.destaque),
    status,
    organizador: registro.organizador,
    link: registro.link,
    descricao,
    programacao
  });
}

if (erros.length) {
  console.error("\nNão importei nada. Corrija os pontos abaixo na planilha:\n");
  erros.forEach((erro) => console.error(`- ${erro}`));
  console.error("");
  process.exit(1);
}

if (!eventos.length) {
  falhar(
    "nenhum evento válido encontrado. Preencha a planilha e troque o id de exemplo " +
    "(linhas com id começando em \"exemplo-\" são ignoradas de propósito)."
  );
}

fs.mkdirSync(path.dirname(SAIDA), { recursive: true });

if (fs.existsSync(SAIDA)) {
  const agora = new Date();
  const selo = [
    agora.getFullYear(),
    String(agora.getMonth() + 1).padStart(2, "0"),
    String(agora.getDate()).padStart(2, "0")
  ].join("") + "-" + [
    String(agora.getHours()).padStart(2, "0"),
    String(agora.getMinutes()).padStart(2, "0"),
    String(agora.getSeconds()).padStart(2, "0")
  ].join("");
  const backup = path.join(path.dirname(SAIDA), `eventos.backup-${selo}.js`);
  fs.copyFileSync(SAIDA, backup);
  console.log(`Backup do arquivo anterior: ${path.relative(RAIZ, backup)}`);
}

const dataHoje = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
}).format(new Date());

const conteudo = `/* ============================================================
   EVENTOS DO PICUI FEST
   ------------------------------------------------------------
   Arquivo gerado automaticamente pelo importador em ${dataHoje}.
   Fonte: ${path.relative(RAIZ, ENTRADA)}
   Delimitador detectado: ${delimitador === ";" ? "ponto e vírgula" : "vírgula"}

   Para atualizar, edite a planilha e rode de novo:
     node ferramentas/importar-eventos.js

   Campos:
   - id, nome, cidade, local, data, tipo, entrada, destaque
   - status: "confirmado" (padrão), "a confirmar" ou "cancelado"
   - organizador e link: opcionais
   - descricao, programacao
   ============================================================ */
window.PICUI_EVENTOS = [
${eventos.map(formatarEvento).join(",\n")}
];
`;

fs.writeFileSync(SAIDA, conteudo);

console.log(`\n${eventos.length} ${eventos.length === 1 ? "evento importado" : "eventos importados"} para ${path.relative(RAIZ, SAIDA)}.`);
avisos.forEach((aviso) => console.log(`Aviso: ${aviso}`));
console.log("\nPróximos passos:");
console.log("  1. rode: node ferramentas/validar-dados.js");
console.log("  2. atualize agendaAtualizadaEm em config.js");
console.log("  3. abra index.html e confira a agenda\n");
