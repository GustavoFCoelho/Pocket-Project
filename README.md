# Pocket Project

Protótipo de RPG de navegador em perspectiva 2.5D, com exploração de mapa em grade e renderização em Three.js. A proposta é capturar a leitura visual de um RPG portátil de captura de criaturas, com personagens e criaturas originais.

## Versão inicial: 0.1.0

- Cena 3D com câmera ortográfica inclinada.
- Mapa explorável com trilha, vegetação, árvores, flores e marco de cenário.
- Personagem principal, guia e criatura originais em sprites com acabamento pixel art.
- Movimento por WASD/setas e controles de toque; interações com E/Enter ou botão A.
- Câmera acompanha o personagem e a interface se adapta a telas menores.
- Nenhum material ou personagem de Pokémon foi incluído.\n- Sistema de batalha por turnos: aproxime-se de Mossbit e pressione E/Enter ou o botão A.\n- Duas criaturas jogáveis no grupo: Mossbit (Bosque) e Cindercub (Brasa), com troca, PV, ataques e dano.\n- Animações próprias de idle, investida e dano, além de efeitos visuais diferentes para folhas, brasa e impacto.\n- Artes originais das criaturas em pixel art, carregadas no módulo de batalha.

## Batalhas\n\nA batalha começa ao interagir com Mossbit na trilha. Escolha Mossbit ou Cindercub, use um dos dois ataques da criatura ativa e troque de parceiro quando precisar. O oponente selvagem é sorteado entre as duas espécies. A batalha pode ser encerrada pelo botão × ou pela tecla Escape.\n\n## Skills do projeto

As skills ficam em `.agents/skills/` e orientam a criação de cenas Three.js, sprites 2D, mapas 2D e mídia para jogos. `video2dsprite` também está instalado para uma etapa futura de animação; o fluxo de vídeo não está disponível nesta sessão. Os três sprites atuais foram gerados com o recurso de imagem do ChatGPT e finalizados localmente com redução de resolução e paleta.

## Requisitos

- Node.js 22.12 ou superior.
- Navegador com suporte a WebGL.

## Executar localmente

```bash
npm install
npm run dev
```

Para gerar a versão estática:

```bash
npm run build
npm run preview
```

## Dependências principais

- `three`: biblioteca de renderização 3D.
- `vite`: servidor de desenvolvimento e empacotador.

As versões declaradas ficam em `package.json`; o arquivo de lock será gerado junto da instalação das dependências para registrar versões reproduzíveis.

## Próximas etapas sugeridas

1. Criar animações de caminhada em quatro direções e sprites adicionais.
2. Definir colisão por tiles e expandir interações.
3. Adicionar grama alta e um encontro demonstrativo.
4. Separar exploração e batalha em cenas, antes de implementar sistemas extensos.
