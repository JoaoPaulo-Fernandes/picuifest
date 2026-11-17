/* ============================================================
   FESTIVAL DA CARNE DE SOL — DESTAQUE DA HOME
   ------------------------------------------------------------
   Este arquivo guarda o evento principal em cartaz. Ele alimenta
   o hero da página inicial, a seção de programação por dia, o
   cartaz, a contagem regressiva e o card na agenda.

   Fontes oficiais usadas aqui:
   - Prefeitura de Picuí (programação oficial divulgada em 17/08/2026)
   - Cartaz oficial da divulgação
   - Instagram do festival: @festivalcarnedesol

   Campos:
   - inicio / fim: período geral do festival
   - showsInicio: data e hora usada na contagem regressiva
   - cartaz: imagem oficial do cartaz (relativa ao index.html)
   - dias: programação dia a dia, com itens e atrações
   - entrada: não foi declarada oficialmente; mantenha "Consultar"
   ============================================================ */
window.PICUI_FESTIVAL = {
  id: "festival-da-carne-de-sol-2026",
  nome: "XVI Festival da Carne de Sol",
  nomeCurto: "Festival da Carne de Sol",
  cidade: "Picuí",
  local: "Estádio Amauri Sales de Melo",
  inicio: "2026-11-22T08:00:00-03:00",
  fim: "2026-11-29T23:59:00-03:00",
  showsInicio: "2026-11-27T20:00:00-03:00",
  dataLabel: "22 a 29 de novembro de 2026",
  showsLabel: "27, 28 e 29 de novembro",
  entrada: "Consultar a organização",
  status: "confirmado",
  organizador: "Prefeitura de Picuí",
  link: "@festivalcarnedesol",
  instagram: "festivalcarnedesol",

  cartaz: "imagens/festival/cartaz-2026.png",
  cartazWebp: "imagens/festival/cartaz-2026.webp",
  cartazAlt: "Cartaz oficial do XVI Festival da Carne de Sol, com as atrações de 27, 28 e 29 de novembro de 2026.",
  cartazCredito: "Divulgação / Prefeitura de Picuí",

  resumo: "Oito dias de festa dedicados à carne de sol: feira de negócios, oficinas de gastronomia, cultura popular e três noites de shows no Estádio Amauri Sales de Melo.",

  descricao: "De 22 a 29 de novembro, Picuí recebe a 16ª edição do festival, com feira de negócios, oficinas, cultura popular e shows de Xand Avião, Calcinha Preta, Limão com Mel e mais.",

  fatos: [
    { valor: "22—29", rotulo: "novembro de 2026" },
    { valor: "3", rotulo: "noites de shows" },
    { valor: "40", rotulo: "estandes na feira" }
  ],

  feira: {
    local: "Praça de Eventos",
    estandes: 40,
    descricao: "Feira de Negócios com 40 estandes de produtos, serviços e gastronomia da região."
  },

  dias: [
    {
      data: "2026-11-22",
      titulo: "Corrida da Rua da Carne de Sol",
      resumo: "A programação abre com a corrida que leva o nome do festival pelas ruas da cidade.",
      itens: [
        { hora: "", texto: "Largada da Corrida da Rua da Carne de Sol, com saída da Praça de Eventos." }
      ]
    },
    {
      data: "2026-11-23",
      titulo: "Gastronomia da carne de sol",
      resumo: "Dia de formação para quem trabalha com a cozinha e quer aprender mais sobre a carne de sol.",
      itens: [
        { hora: "", texto: "Cursos sobre a gastronomia da carne de sol." }
      ]
    },
    {
      data: "2026-11-24",
      titulo: "Cortes, linguiça e montagem de pratos",
      resumo: "Oficinas práticas com o Sebrae e cozinheiros da região.",
      itens: [
        { hora: "", texto: "Curso de cortes especiais de carnes de sol bovinas, com o Sebrae." },
        { hora: "", texto: "Oficina de linguiça de carne de sol com queijo." },
        { hora: "", texto: "Atividades de montagem de pratos." }
      ]
    },
    {
      data: "2026-11-25",
      titulo: "Abertura oficial e música instrumental",
      resumo: "A festa é oficialmente aberta com três apresentações instrumentais no palco do festival.",
      itens: [
        { hora: "18h", texto: "Abertura oficial do XVI Festival da Carne de Sol." },
        { hora: "", texto: "Oficina de pizza de carne de sol, com o Senac." }
      ],
      atracoes: [
        "Orquestra Sinfônica do Sesc",
        "Banda da Polícia Civil da Paraíba",
        "Filarmônica de Picuí"
      ]
    },
    {
      data: "2026-11-26",
      titulo: "Cultura local na Feira de Negócios",
      resumo: "Artistas da terra ocupam o palco da feira, que reúne 40 estandes de produtos e serviços da região.",
      itens: [
        { hora: "10h", texto: "Apresentações de artistas locais na Feira de Negócios." },
        { hora: "", texto: "Oficinas ao longo do dia." }
      ]
    },
    {
      data: "2026-11-27",
      titulo: "Xand Avião, JM Puxado e Dois Corações",
      resumo: "A primeira noite de shows no Estádio Amauri Sales de Melo.",
      itens: [
        { hora: "20h", texto: "Início dos shows (a partir das 20h)." }
      ],
      atracoes: [
        "Xand Avião",
        "JM Puxado",
        "Dois Corações"
      ]
    },
    {
      data: "2026-11-28",
      titulo: "Calcinha Preta, Brasas do Forró e Donas da Farra",
      resumo: "Um dia inteiro de atividades na feira e a segunda noite de shows no estádio.",
      itens: [
        { hora: "", texto: "Apresentações culturais de artistas da terra." },
        { hora: "", texto: "Oficina de queijo de manteiga." },
        { hora: "", texto: "Oficina de salpicão de carne de sol." },
        { hora: "", texto: "Corrida do Garçom, com premiação de R$ 2 mil." },
        { hora: "20h", texto: "Início dos shows (a partir das 20h)." }
      ],
      atracoes: [
        "Calcinha Preta",
        "Brasas do Forró",
        "Donas da Farra"
      ]
    },
    {
      data: "2026-11-29",
      titulo: "Limão com Mel, Fernandinha e Michelle Andrade",
      resumo: "O último dia mistura concurso gastronômico, oficina e a despedida no palco.",
      itens: [
        { hora: "", texto: "Apresentações culturais." },
        { hora: "16h", texto: "Concurso do Maior Comilão de Carne de Sol, com premiação de R$ 15 mil." },
        { hora: "", texto: "Oficina de hambúrguer de carne de sol." },
        { hora: "18h", texto: "Início dos shows (a partir das 18h)." }
      ],
      atracoes: [
        "Limão com Mel",
        "Fernandinha",
        "Michelle Andrade",
        "Forró de Griff"
      ]
    }
  ]
};
