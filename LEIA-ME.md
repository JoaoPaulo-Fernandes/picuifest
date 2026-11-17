# Picuí Fest

Site de agenda, cobertura e memória das festas de Picuí e região, na Paraíba.
Página única, responsiva, com identidade visual de cordel moderno.

## Estado atual

- A agenda está **enxuta de propósito**: por enquanto mostra apenas o **XVI Festival da Carne de Sol 2026**.
- Os eventos e as coberturas de demonstração foram movidos para `modelos/exemplos-eventos.js` e `modelos/exemplos-coberturas.js`. Esses arquivos **não são carregados** pelo site.
- A home destaca o festival, com programação dia a dia, cartaz oficial e contagem regressiva.
- A seção de cobertura mostra a galeria de fotos do público, organizada por dia (sexta 27, sábado 28 e domingo 29), com abas, mosaico e lightbox. Enquanto não houver fotos reais, usa imagens de exemplo claramente marcadas.
- A agenda, as coberturas e os cards são montados a partir dos arquivos em `dados/`.
- O formulário envia eventos pelo WhatsApp **ou** por e-mail, com mensagem pronta.

## Checklist para publicar com dados reais

1. Preencha `modelos/eventos.csv` com os eventos confirmados.
2. Rode `node ferramentas/importar-eventos.js`.
3. Adicione as coberturas reais em `dados/coberturas.js` (use `modelos/exemplos-coberturas.js` como referência).
4. Organize as fotos por dia e atualize `dados/galeria.js` (veja “Como publicar as fotos da cobertura”).
5. Confira a programação e o cartaz do festival em `dados/festival.js`.
6. Preencha os parceiros em `dados/patrocinadores.js`.
7. Rode `node ferramentas/validar-dados.js`.
8. Atualize `agendaAtualizadaEm` em `config.js`.
9. Abra `index.html`, confira a agenda, o modal, a galeria e o formulário.

## Arquivos

```
index.html                     Estrutura, estilo e conteúdo fixo da página
app.js                         Lógica da agenda, modais, coberturas, calendário e formulário
config.js                      Contatos, canais do formulário, cidades e pacotes
dados/festival.js              Destaque da home: dias, atrações, cartaz e contagem
dados/eventos.js               Lista de eventos (vazia até entrarem eventos reais)
dados/coberturas.js            Textos e cards editoriais (vazio por enquanto)
dados/galeria.js               Fotos da cobertura por dia (abas, mosaico e lightbox)
dados/patrocinadores.js        Marcas parceiras
imagens/festival/              Cartaz oficial (PNG e WebP)
imagens/cobertura/demo/        Imagens de exemplo da galeria (substituir)
modelos/eventos.csv            Planilha-modelo para receber os eventos reais
modelos/cobertura-modelo.js    Modelo de uma cobertura
modelos/exemplos-eventos.js    Exemplos de eventos (referência, não carregado)
modelos/exemplos-coberturas.js Exemplos de coberturas (referência, não carregado)
ferramentas/importar-eventos.js  Converte a planilha em dados/eventos.js
ferramentas/validar-dados.js     Confere eventos, coberturas, festival e configuração
package.json                   Atalhos opcionais (npm) para importar e validar
LEIA-ME.md                     Este guia
```

## Como visualizar

Abra `index.html` no navegador. Não precisa instalar nada nem rodar servidor.

## Festival em destaque

O festival da home fica em `dados/festival.js`. Ele alimenta:

- o hero com o cartaz, os dados principais e a contagem regressiva;
- a seção “Oito dias de festa”, com abas por dia;
- o card em destaque na agenda e o botão “Programação por dia” no modal;
- a faixa animada de próximos eventos.

Campos principais:

| Campo | Como preencher |
|---|---|
| `inicio` / `fim` | Período geral, no formato `AAAA-MM-DDTHH:MM:SS-03:00`. |
| `showsInicio` | Data e hora usada na contagem regressiva. |
| `cartaz` / `cartazWebp` | Caminhos da imagem oficial. O WebP é usado quando o navegador aceita. |
| `cartazAlt` | Descrição do cartaz para leitores de tela. |
| `dataLabel` | Texto do período exibido no site. |
| `entrada` | Use “Consultar a organização” enquanto a entrada não for declarada. |
| `dias` | Lista com `data`, `titulo`, `resumo`, `itens` e, se houver, `atracoes`. |

Cada item da programação tem `hora` e `texto`. Quando o horário não foi divulgado, deixe `hora: ""`; o site mostra “A confirmar”.

Para trocar o cartaz, salve a imagem em `imagens/festival/`, atualize os dois caminhos em `dados/festival.js` e rode o validador. O cartaz também abre ampliado ao clicar na imagem ou no botão “Ver o cartaz”.

> O festival é um evento real e não leva `exemplo: true`. Ele é somado automaticamente à agenda; o importador de eventos não sobrescreve este arquivo.

## Receber os eventos reais

### 1. Preencha a planilha

Abra `modelos/eventos.csv` no Excel, LibreOffice ou Google Sheets. Cada linha é um evento.

| Coluna | Obrigatório | Como preencher |
|---|---|---|
| `id` | não | Identificador curto, sem espaços. Se ficar vazio, o importador gera a partir do nome e da data. |
| `nome` | sim | Nome do evento. |
| `cidade` | sim | Cidade do evento. |
| `local` | sim | Praça, parque, ginásio etc. |
| `data` | sim | Veja os formatos aceitos abaixo. |
| `tipo` | sim | `forro`, `religioso`, `carnaval`, `vaquejada`, `cultural` ou `festa`. |
| `entrada` | não | `Gratuito`, `A partir de R$ 20` etc. Se ficar vazio, entra `Consultar`. |
| `destaque` | não | `sim` ou `nao`. |
| `status` | não | `confirmado`, `a confirmar` ou `cancelado`. |
| `organizador` | não | Nome de quem organiza. |
| `link` | não | Instagram (`@perfil`) ou site completo. |
| `descricao` | sim | Texto curto para o card. |
| `programacao` | não | Horários separados por &#124;. Ex.: `20h — Abertura &#124; 22h — Show`. |

**Datas aceitas:**

- `2027-01-10T20:00:00-03:00` (recomendado)
- `2027-01-10 20:00`
- `10/01/2027 20:00`
- `2027-01-10` (quando não houver horário, assume 20h)

A planilha pode usar vírgula ou ponto e vírgula como separador — o importador detecta.

> A linha com `id` começando em `exemplo-` é ignorada de propósito. Troque esse id ao cadastrar o primeiro evento real.

### 2. Importe

```bash
node ferramentas/importar-eventos.js
```

Se tiver npm instalado, pode usar o atalho:

```bash
npm run importar
```

Para usar outra planilha:

```bash
node ferramentas/importar-eventos.js caminho/da/planilha.csv
```

O importador:

- valida os campos e as datas antes de gravar;
- transforma a planilha em `dados/eventos.js`;
- cria um backup `dados/eventos.backup-AAAAAMMDD-HHMMSS.js` do arquivo anterior;
- não grava nada se encontrar erro.

Depois, rode a validação e confira o site.

## Editar eventos manualmente

Se preferir, edite `dados/eventos.js` direto. O formato é:

```js
{
  id: "forro-da-comunidade",
  nome: "Forró da Comunidade",
  cidade: "Picuí",
  local: "Praça Central",
  data: "2027-01-10T20:00:00-03:00",
  tipo: "forro",
  entrada: "Gratuito",
  destaque: false,
  status: "confirmado",
  organizador: "Associação do bairro",   // opcional
  link: "@festadacomunidade",            // opcional
  descricao: "Texto curto que aparece no card.",
  programacao: ["20h — Abertura", "22h — Atração principal"]
}
```

- `id`: único, sem espaços ou acentos.
- `tipo`: `forro`, `religioso`, `carnaval`, `vaquejada`, `cultural` ou `festa`.
- `status`: `"confirmado"` (padrão), `"a confirmar"` ou `"cancelado"`.
  Cancelados não aparecem na agenda nem entram no calendário.
- Se o evento for de exemplo, mantenha `exemplo: true`. Ao publicar dados reais, remova essa linha.
- `programacao` pode ficar vazia (`[]`); o modal esconde o bloco.

> Evite manter `dados/eventos.backup-*.js` na pasta publicada. Eles são só segurança local.

## Como atualizar a data da agenda

Em `config.js`, altere:

```js
agendaAtualizadaEm: "2026-11-16"
```

A data aparece como “Atualizada em 16 de novembro” ao lado do título da agenda.

## Contatos e redes

Também em `config.js`:

```js
contatos: {
  whatsapp: "5583996433186",
  email: "contatopicuifest@gmail.com",
  instagram: "picuifest"
}
```

- WhatsApp: código do país + DDD + número, **só números**.
- Instagram: sem `@`.
- Esses dados atualizam automaticamente o rodapé, os ícones, o botão flutuante e os CTAs de patrocínio.

## Como o formulário funciona

O formulário não depende de servidor. Por padrão, ele oferece dois botões:

- **Enviar pelo WhatsApp**: abre o WhatsApp com a mensagem já preenchida.
- **Enviar por e-mail**: abre o aplicativo de e-mail com assunto e corpo prontos.

Para mudar o comportamento, edite em `config.js`:

```js
formulario: {
  modo: "ambos",          // "whatsapp" | "email" | "ambos" | "endpoint"
  endpoint: "",           // usado apenas no modo "endpoint"
  assuntoEmail: "Evento para a agenda — Picuí Fest"
}
```

### Receber os dados em um serviço

1. Crie um formulário no Formspree, Web3Forms, Netlify Forms ou similar.
2. Cole a URL do endpoint em `endpoint`.
3. Troque o modo para `"endpoint"`.

Nesse modo, o site envia um JSON por `POST` com os campos do formulário e a mensagem pronta. Se o envio falhar, o visitante é orientado a usar WhatsApp ou e-mail.

## Como editar as coberturas

Os cards da seção de cobertura são montados automaticamente a partir de `dados/coberturas.js`, na ordem em que aparecem no arquivo.

Para publicar uma cobertura:

1. Copie o modelo em `modelos/cobertura-modelo.js`.
2. Cole dentro de `dados/coberturas.js`, antes do `};` final.
3. Troque a chave (`id`) e preencha os campos.
4. Remova `exemplo: true` quando o texto for real.

Campos do card:

- `destaque: true`: transforma a cobertura no card grande. Só a primeira com destaque é usada.
- `selo`: etiqueta sobre a arte.
- `kickerCurto`: linha pequena do card.
- `resumo`: texto curto do card.
- `arte`: `sao-joao`, `sanfona` ou `geracao` (ilustrações de reserva).
- `imagem`: caminho de uma foto real, relativo ao `index.html`.
- `imagemAlt`: descrição da foto para acessibilidade.

Campos do modal:

- `kicker`, `titulo`, `paragrafos`, `citacao` (opcional) e `credito`.

Para usar foto real:

```js
imagem: "imagens/coberturas/sao-joao-2026.jpg",
imagemAlt: "Praça cheia durante o São João, com quadrilha no centro."
```

Crie a pasta `imagens/coberturas/` e use fotos horizontais, de preferência com 1600 px de largura.

## Como publicar as fotos da cobertura

A galeria da seção “Cobertura & memória” fica em `dados/galeria.js`. Ela tem prioridade sobre os cards editoriais: quando há dias cadastrados, o site mostra as abas por dia, o mosaico e o lightbox.

### 1. Organize as fotos por dia

Salve os arquivos em uma pasta por dia, por exemplo:

```
imagens/cobertura/2026/11-27/
imagens/cobertura/2026/11-28/
imagens/cobertura/2026/11-29/
```

Use fotos horizontais, com até 1600 px de largura. O ideal é converter para WebP para o site carregar mais rápido:

```bash
cwebp -q 82 foto-original.jpg -o foto-01.webp
```

### 2. Preencha `dados/galeria.js`

Cada dia tem `data`, `rotulo`, `titulo`, `resumo` e a lista de `fotos`. Cada foto precisa de:

```js
{
  src: "imagens/cobertura/2026/11-27/foto-01.webp",
  alt: "Público dançando em frente ao palco na primeira noite.",
  legenda: "Primeira noite de shows",
  credito: "Foto: equipe Picuí Fest"
}
```

- `alt` é obrigatório: descreva a cena para quem usa leitor de tela.
- `credito` é obrigatório: use “Foto: equipe Picuí Fest” ou “Foto: @perfil”.
- A primeira foto de cada dia vira a capa do mosaico.
- Se um dia ainda não tiver fotos, deixe `fotos: []`. O site mostra “As fotos deste dia ainda não chegaram.”

### 3. Remova o modo de exemplo

Enquanto as imagens forem de demonstração:

- `demo: true` no topo do arquivo;
- `exemplo: true` em cada foto de exemplo.

Ao publicar as fotos reais, remova essas marcações e apague as referências aos SVGs de `imagens/cobertura/demo/`. O aviso de exemplo e os selos “EXEMPLO” desaparecem sozinhos.

### 4. Confira

```bash
node ferramentas/validar-dados.js
```

O validador confere datas, títulos, `alt`, créditos e se cada arquivo `src` existe de verdade.

> Publique fotos de menores apenas com autorização dos responsáveis. A curadoria das imagens é responsabilidade da equipe do festival.

## Patrocínio e parceiros

### Pacotes

Em `config.js`, edite `patrocinio.pacotes`. Cada pacote aceita:

```js
{
  nome: "Parceiro",
  descricao: "Texto curto do pacote.",
  preco: "Sob consulta",
  destaque: true,
  beneficios: ["Benefício 1", "Benefício 2"]
}
```

O botão “Quero este” de cada pacote abre o WhatsApp com o nome do pacote na mensagem.

### Parceiros

Abra `dados/patrocinadores.js` e adicione:

```js
{
  nome: "Pousada Serra Azul",
  categoria: "Pousada",
  url: "https://instagram.com/pousadaserraazul",
  logo: "imagens/parceiros/pousada-serra-azul.png"
}
```

- `logo` é opcional. Sem imagem, o site mostra o nome em texto.
- Use imagens horizontais, com fundo transparente ou claro e pelo menos 400 px de largura.
- Enquanto houver menos de 4 parceiros, o site completa a grade com espaços “Sua marca aqui”.

Os contatos de patrocínio usam `patrocinio.whatsapp` e `patrocinio.email`. Se ficarem vazios, o site usa os contatos gerais.

## Cidades do filtro e do formulário

A lista fica em `config.js`:

```js
cidades: ["Picuí", "Nova Palmeira", "..."]
```

Acrescentar uma cidade aqui já a inclui no filtro, no formulário e no circuito regional.

## Validar antes de publicar

```bash
node ferramentas/validar-dados.js
```

Se tiver npm instalado:

```bash
npm run validar
```

O validador confere:

- campos obrigatórios dos eventos;
- ids repetidos ou fora do padrão;
- datas inválidas, sem fuso ou no passado;
- tipos e status desconhecidos;
- coberturas sem título, texto ou crédito;
- imagens de cobertura que não existem;
- programação do festival, datas dos dias e existência do cartaz;
- contatos e configuração básica;
- quantos eventos e coberturas ainda estão marcados como exemplo.

Ele mostra `ERRO` e `AVISO`. Se houver erro, o comando termina com código 1.

## Como publicar

O site é 100% estático. Envie:

- `index.html`
- `app.js`
- `config.js`
- a pasta `dados/`
- a pasta `imagens/`, se existir

As pastas `modelos/` e `ferramentas/` são de apoio e não precisam ir para o servidor.

Opções de publicação:

1. **Netlify Drop**: arraste a pasta para [app.netlify.com/drop](https://app.netlify.com/drop).
2. **Vercel**: importe a pasta como projeto estático.
3. **GitHub Pages**: suba o projeto e ative o Pages.
4. **Hospedagem tradicional**: envie por FTP.

Depois, registre um domínio (por exemplo, `picuifest.com.br`) e confira os links de WhatsApp, e-mail e Instagram.

## O que ainda é conteúdo de exemplo

- Os eventos de demonstração em `modelos/exemplos-eventos.js` (referência, não aparecem no site).
- As coberturas editoriais de demonstração em `modelos/exemplos-coberturas.js` (referência, não aparecem no site).
- As 15 imagens de exemplo da galeria, em `imagens/cobertura/demo/` (todas com `exemplo: true`).
- O mapa ilustrativo e a contagem de eventos por cidade.

O festival em `dados/festival.js` é conteúdo real, baseado na programação divulgada pela Prefeitura de Picuí e no cartaz oficial. Ainda assim, confirme horários de atividades diurnas e a entrada com a organização antes de divulgar.

A agenda e a cobertura só exibem conteúdo real: enquanto `dados/eventos.js` estiver vazio, aparece apenas o festival; enquanto a galeria não tiver fotos reais, os espaços de exemplo ficam marcados como “EXEMPLO”.

## Próximos passos recomendados

1. **Confirmar os eventos reais** com as organizações e a prefeitura antes de publicar.
2. **Preencher a planilha** e importar os eventos.
3. **Adicionar as fotos reais da cobertura** em `dados/galeria.js` e remover as marcações de exemplo.
4. **Fechar os primeiros patrocinadores** e preencher `dados/patrocinadores.js`.
5. **Medir audiência** com um analytics leve (Plausible, Umami ou Google Analytics).
6. **Evoluir o formulário** para um painel de envio e aprovação, se a demanda crescer.
7. **Criar versões de compartilhamento** para Instagram/WhatsApp (card do evento, capa da agenda).

## Ideias editoriais

- “Roteiro do fim de semana”: três eventos para visitar.
- “Antes e depois”: a praça vazia e a praça na noite de festa.
- “Quem faz a festa”: sanfoneiros, cozinheiras, quadrilhas, produtores.
- “Memória”: fotos antigas do São João e do carnaval, com relatos de moradores.
- “Guia do visitante”: onde comer, dormir e chegar em Picuí.
- “Depois da festa”: balanço de público, economia local e bastidores.

## Observação

Este é um protótipo pronto para receber o conteúdo real. Revise datas, contatos e informações antes de divulgar publicamente.
