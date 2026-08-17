# Meu Treino — versão Pro

Aplicativo de registro do seu treino para publicar no GitHub Pages.

## Incluído
- Abas separadas de segunda a sexta + sábado opcional.
- Pêndulo na segunda e abdominal na quarta.
- Registro por série de **kg, repetições e RIR**.
- Salvamento automático a cada alteração no navegador.
- Histórico de todos os dias registrados.
- Relatório diário para impressão/PDF.
- Relatório semanal com sessões, séries, repetições e volume.
- Gráfico semanal de volume.
- Comparação com o treino anterior e sugestão automática:
  - **⬆ Pode aumentar**
  - **→ Mantenha**
  - **↘ Mantenha/reduza**
- Backup e restauração em JSON.

## Publicar no GitHub Pages
1. Crie um repositório no GitHub.
2. Envie `index.html` e `README.md`.
3. Abra **Settings → Pages**.
4. Em Source, selecione **Deploy from a branch**.
5. Escolha a branch `main` e a pasta `/root`.
6. Salve.

## Salvamento
O registro é salvo automaticamente no `localStorage` do navegador. O GitHub hospeda o aplicativo, mas não guarda seus registros pessoais como banco de dados. Para trocar de dispositivo, use **Dados → Exportar backup** e depois **Importar backup**.

