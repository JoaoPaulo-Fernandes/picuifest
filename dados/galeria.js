/* ============================================================
   GALERIA DA COBERTURA — FOTOS DO PÚBLICO, DIA POR DIA
   ------------------------------------------------------------
   A seção "Cobertura & memória" mostra as fotos de quem esteve
   no festival, separadas por dia. Quando há dias cadastrados aqui,
   a galeria tem prioridade sobre os cards editoriais de
   dados/coberturas.js.

   Como publicar as fotos reais:
   1. salve as imagens em imagens/cobertura/2026/11-27/ (um
      diretório por dia);
   2. converta para WebP e use no máximo 1600 px de largura;
   3. preencha as fotos de cada dia abaixo, com src, alt e crédito;
   4. remova "demo: true" e os exemplos.

   As fotos com exemplo: true nunca são exibidas. Se não houver
   fotos reais, a página mostra um aviso de cobertura em preparação.

   Campos de cada dia:
   - data: AAAA-MM-DD
   - rotulo: texto curto da aba (ex.: "Sexta, 27")
   - titulo: título do álbum
   - resumo: uma linha sobre a noite
   - fotos: lista de { src, alt, legenda, credito }

   Campos de cada foto:
   - src: caminho da imagem (de preferência WebP)
   - alt: descrição para leitores de tela
   - legenda: texto curto exibido no lightbox
   - credito: "Foto: equipe Picuí Fest" ou "Foto: @perfil"
   ============================================================ */
window.PICUI_GALERIA = {
  titulo: "Quem esteve lá",
  descricao: "As fotos do público, noite por noite.",
  demo: true,
  notaDemo: "Prévia do layout com imagens de exemplo. As fotos reais entram aqui, separadas por dia.",
  instagram: "picuifest",

  dias: [
    {
      data: "2026-11-27",
      rotulo: "Sexta, 27",
      titulo: "Primeira noite de shows",
      resumo: "Xand Avião, JM Puxado e Dois Corações no Estádio Amauri Sales de Melo.",
      fotos: [
        {
          src: "imagens/cobertura/demo/27-01.svg",
          alt: "Espaço de exemplo para foto do público na sexta, 27 — imagem 1",
          legenda: "Espaço reservado para a primeira foto da noite.",
          credito: "Exemplo",
          exemplo: true
        },
        {
          src: "imagens/cobertura/demo/27-02.svg",
          alt: "Espaço de exemplo para foto do público na sexta, 27 — imagem 2",
          legenda: "Espaço reservado para foto do público.",
          credito: "Exemplo",
          exemplo: true
        },
        {
          src: "imagens/cobertura/demo/27-03.svg",
          alt: "Espaço de exemplo para foto do público na sexta, 27 — imagem 3",
          legenda: "Espaço reservado para foto do público.",
          credito: "Exemplo",
          exemplo: true
        },
        {
          src: "imagens/cobertura/demo/27-04.svg",
          alt: "Espaço de exemplo para foto do público na sexta, 27 — imagem 4",
          legenda: "Espaço reservado para foto do público.",
          credito: "Exemplo",
          exemplo: true
        },
        {
          src: "imagens/cobertura/demo/27-05.svg",
          alt: "Espaço de exemplo para foto do público na sexta, 27 — imagem 5",
          legenda: "Espaço reservado para foto do público.",
          credito: "Exemplo",
          exemplo: true
        }
      ]
    },
    {
      data: "2026-11-28",
      rotulo: "Sábado, 28",
      titulo: "A noite mais cheia",
      resumo: "Calcinha Preta, Brasas do Forró e Donas da Farra depois da Corrida do Garçom.",
      fotos: [
        {
          src: "imagens/cobertura/demo/28-01.svg",
          alt: "Espaço de exemplo para foto do público no sábado, 28 — imagem 1",
          legenda: "Espaço reservado para a primeira foto da noite.",
          credito: "Exemplo",
          exemplo: true
        },
        {
          src: "imagens/cobertura/demo/28-02.svg",
          alt: "Espaço de exemplo para foto do público no sábado, 28 — imagem 2",
          legenda: "Espaço reservado para foto do público.",
          credito: "Exemplo",
          exemplo: true
        },
        {
          src: "imagens/cobertura/demo/28-03.svg",
          alt: "Espaço de exemplo para foto do público no sábado, 28 — imagem 3",
          legenda: "Espaço reservado para foto do público.",
          credito: "Exemplo",
          exemplo: true
        },
        {
          src: "imagens/cobertura/demo/28-04.svg",
          alt: "Espaço de exemplo para foto do público no sábado, 28 — imagem 4",
          legenda: "Espaço reservado para foto do público.",
          credito: "Exemplo",
          exemplo: true
        },
        {
          src: "imagens/cobertura/demo/28-05.svg",
          alt: "Espaço de exemplo para foto do público no sábado, 28 — imagem 5",
          legenda: "Espaço reservado para foto do público.",
          credito: "Exemplo",
          exemplo: true
        }
      ]
    },
    {
      data: "2026-11-29",
      rotulo: "Domingo, 29",
      titulo: "Noite de encerramento",
      resumo: "Limão com Mel, Fernandinha, Michelle Andrade e Forró de Griff fecham o festival.",
      fotos: [
        {
          src: "imagens/cobertura/demo/29-01.svg",
          alt: "Espaço de exemplo para foto do público no domingo, 29 — imagem 1",
          legenda: "Espaço reservado para a primeira foto da noite.",
          credito: "Exemplo",
          exemplo: true
        },
        {
          src: "imagens/cobertura/demo/29-02.svg",
          alt: "Espaço de exemplo para foto do público no domingo, 29 — imagem 2",
          legenda: "Espaço reservado para foto do público.",
          credito: "Exemplo",
          exemplo: true
        },
        {
          src: "imagens/cobertura/demo/29-03.svg",
          alt: "Espaço de exemplo para foto do público no domingo, 29 — imagem 3",
          legenda: "Espaço reservado para foto do público.",
          credito: "Exemplo",
          exemplo: true
        },
        {
          src: "imagens/cobertura/demo/29-04.svg",
          alt: "Espaço de exemplo para foto do público no domingo, 29 — imagem 4",
          legenda: "Espaço reservado para foto do público.",
          credito: "Exemplo",
          exemplo: true
        },
        {
          src: "imagens/cobertura/demo/29-05.svg",
          alt: "Espaço de exemplo para foto do público no domingo, 29 — imagem 5",
          legenda: "Espaço reservado para foto do público.",
          credito: "Exemplo",
          exemplo: true
        }
      ]
    }
  ]
};
