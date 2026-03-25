# 🔊 VolumeMax for Firefox

Controle o volume de cada aba do Firefox de forma independente — e amplifique além do limite padrão, chegando até **600%**.

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

A extensão usa a **Web Audio API** do navegador. Ao ajustar o volume de uma aba, um `GainNode` é criado e conectado a todos os elementos de áudio e vídeo da página. Isso permite amplificar o som além do limite de 100% que o sistema operacional impõe.

---

## 📄 Licença

MIT — sinta-se livre para usar, modificar e distribuir.
