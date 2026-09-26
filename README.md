# Ceneri di Roma — Codex Público

Site estático para GitHub Pages, com **HTML apenas como estrutura**, lógica de apresentação em JavaScript e **todo o conteúdo editável separado em JSON**.

## Estrutura

```text
ceneri-di-roma/
├── index.html              # somente o esqueleto da aplicação
├── css/
│   └── style.css           # identidade visual
├── js/
│   └── script.js           # carregamento dos dados + renderização + interações
└── data/
    ├── site.json           # textos gerais do site
    ├── council.json        # Consilium Nocturnum
    ├── clans.json          # clãs e descrições
    ├── people.json         # NPCs/personagens
    ├── lineages.json       # árvore genealógica pública
    └── locations.json      # locais/territórios
```

## Adicionar um novo personagem

Edite somente `data/people.json` e acrescente um objeto:

```json
{
  "id": "novo-personagem",
  "name": "Nome do Personagem",
  "clan": "Ventrue",
  "role": "Função",
  "initials": "NP",
  "summary": "Texto curto que aparece no catálogo.",
  "details": "Informações públicas que aparecem ao abrir a ficha."
}
```

O personagem aparecerá automaticamente na busca e no filtro de clã.

## Adicionar uma relação na árvore

Em `data/lineages.json`, inclua o `personId` correspondente ao personagem existente em `people.json`.

## Adicionar um clã

Inclua um novo objeto em `data/clans.json`. O filtro de personagens também será atualizado automaticamente.

## Importante: GitHub Pages

Como o site carrega os JSON com `fetch()`, **não abra `index.html` diretamente com duplo clique** para testar. O navegador pode bloquear o carregamento dos arquivos JSON por causa das regras de segurança locais.

No GitHub Pages tudo funciona normalmente porque os arquivos serão servidos pelo mesmo domínio.

Para publicar:

1. Crie um repositório no GitHub.
2. Envie a pasta `ceneri-di-roma` para a raiz do repositório.
3. Vá em **Settings → Pages**.
4. Selecione **Deploy from a branch → main → / (root)**.
5. Publique e compartilhe o endereço gerado.

## Regra de ouro do Codex

O repositório deve conter apenas **informações que os jogadores podem consultar**. Segredos de Narrador, motivações ocultas, estatísticas e verdades ainda não descobertas devem continuar no seu Obsidian.
