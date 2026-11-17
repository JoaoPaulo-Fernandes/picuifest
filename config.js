/* ============================================================
   PICUI FEST — CONFIGURAÇÃO GERAL
   ------------------------------------------------------------
   Este é o único lugar que você precisa editar para trocar
   contatos, canais de envio, cidades e pacotes de patrocínio.
   ============================================================ */

window.PICUI_CONFIG = {
  site: {
    nome: "Picuí Fest",
    cidade: "Picuí",
    estado: "PB",
    // Data da última atualização exibida na agenda.
    agendaAtualizadaEm: "2026-11-16"
  },

  contatos: {
    // WhatsApp com código do país e só números.
    whatsapp: "5583996433186",
    email: "contatopicuifest@gmail.com",
    // Sem o @.
    instagram: "picuifest"
  },

  formulario: {
    // "whatsapp" | "email" | "ambos" | "endpoint"
    modo: "ambos",

    // Se usar Formspree, Web3Forms ou outro serviço, cole a URL
    // abaixo e mude o modo para "endpoint".
    endpoint: "",

    assuntoEmail: "Evento para a agenda — Picuí Fest"
  },

  patrocinio: {
    // Se deixar vazio, o site usa os contatos acima.
    whatsapp: "5583996433186",
    email: "contatopicuifest@gmail.com",

    // Pacotes exibidos na seção "Patrocine".
    // Edite nomes, descrições e benefícios livremente.
    pacotes: [
      {
        nome: "Apoio",
        descricao: "Para o comércio local marcar presença e apoiar a festa.",
        preco: "Sob consulta",
        beneficios: [
          "Logo no rodapé do site",
          "Menção na agenda semanal",
          "1 publicação nas redes"
        ]
      },
      {
        nome: "Parceiro",
        descricao: "Presença contínua na agenda, na cobertura e nas redes.",
        preco: "Sob consulta",
        destaque: true,
        beneficios: [
          "Logo em destaque no site",
          "Marca nos cards de eventos apoiados",
          "Publicações e stories",
          "Cobertura de 1 evento"
        ]
      },
      {
        nome: "Master",
        descricao: "A marca principal do Picuí Fest durante a temporada.",
        preco: "Sob consulta",
        beneficios: [
          "Marca no topo do site",
          "Conteúdo dedicado",
          "Ativação no evento",
          "Pacote completo de redes"
        ]
      }
    ]
  },

  // Cidades que aparecem no filtro, no mapa e no formulário.
  cidades: [
    "Picuí",
    "Nova Palmeira",
    "Frei Martinho",
    "Baraúna",
    "Cuité",
    "Nova Floresta",
    "Pedra Lavrada",
    "Cubati"
  ]
};
