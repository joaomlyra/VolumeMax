# 🔊 VolumeMax for Firefox

Controle o volume de cada aba do Firefox de forma independente — e amplifique além do limite padrão, chegando até **600%**.

## Teste local da versão 1.1.0

Use `E:\extensão\volumemax\manifest.json` em **about:debugging → Este Firefox → Carregar extensão temporária**. Se já carregou esta pasta, clique em **Recarregar** na extensão. Depois recarregue as páginas dos vídeos.

Desative a outra versão `VolumeMax-Firefox` e outros amplificadores durante o teste: dois processadores podem disputar o mesmo elemento de áudio. A pasta de trabalho desta versão é `volumemax`; não é necessário ZIP nem envio à loja.

Mudanças: execução em frames e shadow roots abertos; reaplicação do volume em novas páginas/frames; estado por aba durante a sessão do navegador; reativação do AudioContext ao interagir com a página; até três tentativas de conexão; avisos de conexão, ausência de player e contexto suspenso; correção do botão silenciar/restaurar e do slider da lista de abas.

Foi preservada a conexão direta `createMediaElementSource → GainNode`, sem bloquear Netflix ou elementos com chaves DRM. Isso conserva a abordagem da versão que você testou; a reprodução real na Netflix e em outros serviços ainda precisa de teste manual. Os quatro testes em `node tests/volumemax-legacy.test.cjs` (na pasta pai) usam APIs simuladas e não comprovam compatibilidade de áudio com serviços reais.

Limitações: mídias sem autorização CORS podem ficar silenciosas após conexão ao Web Audio; players que já possuem um processador podem rejeitar outra conexão; shadow roots fechados e páginas restritas não são acessíveis. Esses limites não são resolvidos apenas pelo suporte a frames. O aviso de conexão bem-sucedida não comprova que o áudio esteja audível. Se um site ficar sem som, desative a extensão e recarregue a página.

---

## ✨ Funcionalidades

- 🎚️ Controle de volume por aba, de 0% a 600%
- 🎛️ Knob visual interativo (arraste para cima/baixo ou use o scroll)
- ⚡ Presets rápidos: Mudo, 50%, 100%, 150%, 200%, 400%, 600%
- 🔇 Botão de silenciar/ativar por aba
- 📑 Lista de todas as abas abertas com slider individual
- 💾 Lembra o volume de cada aba durante a sessão

---

## 🚀 Instalação

### Opção 1 — Firefox Add-ons (recomendado)

A extensão está disponível oficialmente na loja do Firefox:

👉 [Instalar pelo Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/volumemax/)

---

### Opção 2 — Uso temporário (sem instalar)

Útil para testar ou usar sem precisar publicar. O volume será resetado ao fechar o Firefox.

1. Faça o download ou clone este repositório
2. Abra o Firefox e acesse `about:debugging`
3. Clique em **"Este Firefox"** no menu lateral esquerdo
4. Clique em **"Carregar extensão temporária..."**
5. Navegue até a pasta do projeto e selecione o arquivo `manifest.json`
6. A extensão será carregada e aparecerá na barra de ferramentas

> ⚠️ Extensões temporárias são removidas automaticamente quando o Firefox é fechado.

## 🛠️ Como usar

1. Clique no ícone da extensão na barra de ferramentas
2. Use o **knob**, o **slider** ou os **presets** para ajustar o volume da aba atual
3. Para controlar outras abas, use os mini-sliders na lista inferior do popup
4. O botão **Silenciar** zera o volume instantaneamente; clique novamente para restaurar
5. O botão **Resetar** volta o volume para 100%

---

## 🗂️ Estrutura do projeto

```
volume-master-firefox/
├── manifest.json     # Configuração da extensão
├── popup.html        # Interface do popup
├── popup.js          # Lógica do popup
├── content.js        # Script injetado nas páginas para controlar o áudio
├── background.js     # Limpeza de dados ao fechar abas
└── icon.svg          # Ícone da extensão
```

---

## 🧠 Como funciona

A extensão usa a **Web Audio API** do navegador. Ao detectar um player, conecta o elemento a um `GainNode`; o controle altera o ganho entre 0 e 6. Isso amplifica o sinal em relação ao volume original do player, sem alterar o volume do sistema operacional.

---

## 📄 Licença

MIT — sinta-se livre para usar, modificar e distribuir.
