const assetsBase = "https://t.sawczak.com/phonemes/assets";
const imgWordBase = assetsBase + "/mots";
const imgFaceBase = assetsBase + "/faces";

let recording_indices = {
  phonemes: {},
  words: {}
};

const jukebox = new Jukebox();

const stage = new _Stage();

const addScenes = () => {
  stage.addScene(
    new _Scene("game", "#gamePanel", "", [$("#gamePanel button")])
  );
  stage.addScene(new _Scene("help", "#helpPanel", "#btnHelp", []));

  stage.setDefault("game");
};

const format_all = () => {
  $("#languagePanel").remove();
  $("#focusPanel").append('<div id="languagePanel" class="flexRow"></div>');
  let lp = $("#languagePanel");

  for (let g of phonemes_fr) {
    lp.append(format_g(g));
  }
};

const format_g = (g) => {
  let name = g.name[0].toUpperCase() + g.name.slice(1);

  let title = `<div class='g-title flexRow'><h2>${name}</h2></div>`;
  let body = "";
  for (let p of g.phonemes) {
    body += format_p(p);
  }

  body = `<div class='phoneme-group-body flexRow'>${body}</div>`;

  return `<div id='g-${g.name}' class='phoneme-group flexCol'>${title}${body}</div>`;
};

const format_p = (p) => {
  let parts = [format_p_notes(p), format_p_inner(p)];

  return `<div id='p-${p.symbol}' class='p-wrap'>${parts.join("")}</div>`;
};

const format_p_inner = (p) => {
  let parts = [format_p_left(p), format_p_right(p)];

  return `<div id='p-inner-${
    p.symbol
  }' class='p-inner flexRow flexRowLeft'>${parts.join("")}</div>`;
};

const format_p_left = (p) => {
  let parts = [
    format_p_top_left(p),
    format_p_middle_left(p),
    format_p_bottom_left(p)
  ];

  return `<div class='p-left flexCol'>${parts.join("")}</div>`;
};

const format_p_right = (p) => {
  let parts = [
    format_p_top_right(p),
    format_p_middle_right(p),
    format_p_bottom_right(p)
  ];

  return `<div class='p-right flexCol'>${parts.join("")}</div>`;
};

const format_p_top_left = (p) => {
  parts = [format_p_symbol(p), format_p_play_symbol(p)];
  return `<div class="p-top-left flexRow">${parts.join("")}</div>`;
};

const format_p_middle_left = (p) => {
  return `<div class="p-middle-left flexRow">${format_p_image(p)}</div>`;
};

const format_p_bottom_left = (p) => {
  return `<div class="p-bottom-left flexRow">${format_p_main_spelling(
    p
  )}</div>`;
};

const format_p_top_right = (p) => {
  return `<div class="p-top-right flexRow">${format_p_other_spellings(
    p
  )}</div>`;
};

const format_p_middle_right = (p) => {
  return `<div class="p-middle-right flexRow">${format_p_face(p)}</div>`;
};

const format_p_bottom_right = (p) => {
  return `<div class="p-bottom-right flexRow">${format_p_meta(p)}</div>`;
};

const format_p_symbol = (p) => {
  let sl = `<div class='p-slash'></div>`;
  let inner = `${sl}<div class='p-symbol' id='p-symbol-${p.symbol}'>${p.symbol}</div>${sl}`;
  return `<div class='p-symbol-group flexRow' title='${p.name}' id='p-symbol-group-${p.symbol}'>${inner}</div>`;
};

const format_p_play_symbol = (p) => {
  return `<button class='p-b-play p-b-play-symbol buttonBase buttonEffects buttonDark' id='b-play-${p.symbol}' title="Dire /${p.symbol}/"><i class="fa-solid fa-play" ></i></button>`;
};

const format_p_image = (p) => {
  let img = `<img src="${
    imgWordBase + "/" + asciiizeWord(p.words[0])
  }.webp" title='Illustration: "${p.words[0].toLowerCase()}"'>`;
  return `<div class="p-image">${img}</div>`;
};

const format_p_face = (p) => {
  let img = `<img src="${
    imgFaceBase + "/" + p.symbolASCII
  }.webp" title='Illustration of face shape: "/${p.symbol}/"'>`;
  return `<div class="p-face">${img}</div>`;
};

const format_p_main_spelling = (p) => {
  let sp = format_p_spelling(p.symbol, p.spellings[0], p.words[0]);
  return `<div class='p-main-spelling flexRow'>${sp}</div>`;
};

const format_p_other_spellings = (p) => {
  parts = [];

  for (let i = 1; i < p.words.length; i++) {
    parts.push(format_p_spelling(p.symbol, p.spellings[i], p.words[i]));
  }

  return `<div class='p-other-spellings word-dark flexCol'>${parts.join(
    ""
  )}</div>`;
};

const format_p_spelling = (symbol, spelling, word) => {
  // let sp = `<div class="p-spelling">${spelling}</div>`;
  // let sep = `<div class="p-sep">~</div>`;
  let wl = word.toLowerCase();
  let wo = `<div class="p-word">${format_p_word(word)}</div>`;
  let bu = `<button class="p-b-word buttonBase buttonEffects buttonDark" id="b-play-${symbol}-${wl}" title='Dire "${wl}"'><i class="fa-solid fa-play"></i></button>`;

  return `<div class="p-spelling-group flexRow" title='Grapheme: "${spelling}"'>${wo}${bu}</div>`;
};

const format_p_word = (word) => {
  let html = "";
  for (let c of word) {
    if (c.toLowerCase() == c) {
      html += c;
    } else {
      html += `<span class='p-word-highlight'>${c.toLowerCase()}</span>`;
    }
  }

  return html;
};

const format_p_meta = (p) => {
  let parts = [];

  parts.push(format_p_wiki(p));
  parts.push(format_p_play_wiki(p));
  if (p.notes != "___") {
    // parts.push('<div class="p-sep">•</div>');
    parts.push(format_p_notes_link(p));
  }

  return `<div class="p-meta flexRow">${parts.join("")}</div>`;
};

const format_p_play_wiki = (p) => {
  let b1 = `<button class='p-b-play p-b-play-wiki buttonBase buttonEffects buttonDark' id='b-play-wiki-${p.symbol}' title="Dire /${p.symbol}/" (version Wikipédia)"><i class="fa-solid fa-play" ></i></button>`;

  let b2 = `<button class='p-b-play p-b-play-wiki-m buttonBase buttonEffects buttonDark hide' id='b-play-wiki-m-${p.symbol}' title="Dire /${p.symbol}/" (version Michael)"><i class="fa-solid fa-play" ></i></button>`;

  return b1 + b2;
};

const format_p_wiki = (p) => {
  return `<a href="${p.url_wiki}" title="Wikipedia: ${p.name}">Wiki</a>`;
};

const format_p_notes_link = (p) => {
  return `<div class='p-notes-link' id='p-notes-link-${p.symbol}'>Notes</div>`;
};

const format_p_notes = (p) => {
  return `<div class='p-notes' id='p-notes-${p.symbol}'>${p.notes}</div>`;
};

const preload_jukebox = () => {
  for (let g of phonemes_fr) {
    for (let p of g.phonemes) {
      jukebox.addByURL(`${p.symbol}-w`, p.url_pro);
      jukebox.addByURL(
        `${p.symbol}-w-m`,
        `${assetsBase}/` + michael_mode_fr["phonemes"][p.symbolASCII][0]
      );
    }
  }

  let n, tag, suffix, url;
  for (let subset in recordings_fr) {
    for (let item in recordings_fr[subset]) {
      n = recording_indices[subset][item][0];
      for (let i = 0; i < n; i++) {
        tag = `${item}-${i}`;
        suffix = recordings_fr[subset][item][i];
        url = assetsBase + "/" + suffix;
        jukebox.addByURL(tag, url);
      }
    }
  }
};

const play_recording = (subset, item) => {
  let indices = recording_indices[subset][item];
  let n = indices[0];
  let i = indices[1];
  let key = `${item}-${i}`;

  indices[1] += 1;
  if (indices[1] >= n) {
    indices[1] = 0;
  }

  jukebox.play(key);
};

const play_phoneme = (item) => {
  play_recording("phonemes", item);
};

const play_word = (item) => {
  play_recording("words", item);
};

const bind_phonemes = () => {
  for (let g of phonemes_fr) {
    for (let p of g.phonemes) {
      // wiki player
      $(`#b-play-wiki-${p.symbol}`).click(() => {
        jukebox.play(`${p.symbol}-w`);
      });

      // michael player
      $(`#b-play-wiki-m-${p.symbol}`).click(() => {
        jukebox.play(`${p.symbol}-w-m`);
      });

      // symbol player
      // $(`#b-play-${p.symbol}`).click(() => play(p.symbol));
      $(`#b-play-${p.symbol}`).click(() => play_phoneme(p.symbolASCII));

      // word reader
      for (let w of p.words) {
        // $(`#b-play-${p.symbol}-${w.toLowerCase()}`).click(() => say(w));
        $(`#b-play-${p.symbol}-${w.toLowerCase()}`).click(() =>
          play_word(asciiizeWord(w))
        );
      }

      // notes shower
      $(`#p-notes-link-${p.symbol}`).hover(revealNotes, hideNotes);
    }
  }
};

const say = (w) => {
  window.speechSynthesis.cancel();
  Speech.say(normalizeWord(w), "fr-CA", undefined, 0.8, 0.75);
};

const normalizeWord = (w) => {
  /* sadge */
  return w.toLowerCase().replace("œ", "oe");
};

const revealNotes = (el) => {
  let symbol = el.target.id.split("-").slice(-1)[0];
  $(`#p-notes-${symbol}`).addClass("p-notes-reveal");
  $(`#p-notes-link-${symbol}`).addClass("p-inner-reveal");
  $(`#p-symbol-group-${symbol}`).addClass("p-inner-reveal");
};

const hideNotes = (el) => {
  let symbol = el.target.id.split("-").slice(-1)[0];
  $(`#p-notes-${symbol}`).removeClass("p-notes-reveal");
  $(`#p-notes-link-${symbol}`).removeClass("p-inner-reveal");
  $(`#p-symbol-group-${symbol}`).removeClass("p-inner-reveal");
};

const asciiizeWord = (w) => {
  /* sadger badger */
  return normalizeWord(w)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const initialize_recording_indices = () => {
  let n;
  for (let subset in recordings_fr) {
    for (let item in recordings_fr[subset]) {
      // shuffle
      recordings_fr[subset][item] = Tools.shuffle(recordings_fr[subset][item]);

      n = recordings_fr[subset][item].length;
      recording_indices[subset][item] = [n, Tools.random(n - 1)];
    }
  }
};

const handleKeyup = (e) => {
  // switch (e.code) {
  //     case 'KeyH':
  //         stage.toggle('help');
  //         break;
  // }
};

const handleToggleMichaelMode = () => {
  if (app.optMM.value()) {
    $("#labelMMode").removeClass("secret");
    $(".p-b-play-wiki").addClass("hide");
    $(".p-b-play-wiki-m").removeClass("hide");
  } else {
    $("#labelMMode").addClass("secret");
    $(".p-b-play-wiki").removeClass("hide");
    $(".p-b-play-wiki-m").addClass("hide");
  }
};

const createOptions = () => {
  app.optMM = new OptionCheckbox($("#mMode"));
};

const setDefaultOptions = () => {
  app.optMM.value(false);
};

const bindOptions = () => {
  app.optMM.change(handleToggleMichaelMode);
};

const bind = () => {
  // $(document).keyup(handleKeyup);
};

const initialize = () => {
  // Speech.wake();
  format_all();

  initialize_recording_indices();

  preload_jukebox();
  bind_phonemes();
  bind();

  createOptions();
  setDefaultOptions();
  bindOptions();

  addScenes();
  stage.show("game");
};

class App {}
const app = new App();

$(document).ready(initialize);