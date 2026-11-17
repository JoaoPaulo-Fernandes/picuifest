/* ============================================================
   EVENTOS DO PICUI FEST
   ------------------------------------------------------------
   A agenda começa vazia e recebe apenas eventos reais.
   O Festival da Carne de Sol entra automaticamente por
   dados/festival.js e NÃO deve ser repetido aqui.

   Para adicionar um evento:
   1. preencha modelos/eventos.csv
   2. rode: node ferramentas/importar-eventos.js
   3. valide: node ferramentas/validar-dados.js

   Também é possível copiar um bloco de modelos/exemplos-eventos.js
   e colar antes do "];".

   Campos:
   - id: identificador único, sem espaços (ex.: "sao-joao-2027")
   - nome, cidade, local: textos que aparecem no site
   - data: AAAA-MM-DDTHH:MM:SS-03:00 (horário da Paraíba)
   - tipo: forro | religioso | carnaval | vaquejada | cultural | festa
   - entrada: "Gratuito" ou "A partir de R$ 20"
   - destaque: true para aparecer com o selo de destaque
   - status: "confirmado" (padrão), "a confirmar" ou "cancelado"
   - exemplo: true marca conteúdo de demonstração; remova ao publicar
   - organizador: opcional, nome de quem organiza
   - link: opcional, Instagram ou site oficial
   - descricao: texto curto para o card
   - programacao: lista de horários e atrações
   ============================================================ */
window.PICUI_EVENTOS = [];
