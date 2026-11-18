(function () {
  'use strict';

  var cfg = window.SITE_CONFIG || {};
  var SERIF = "'Cormorant Garamond', serif";
  var STAGGER = ['kk-reveal', 'kk-s2', 'kk-s3', 'kk-s4'];

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function linkAttrs(href) {
    return /^https?:/.test(href) ? ' target="_blank" rel="noopener"' : '';
  }

  /* ---------- Флаги: config.js + переопределение из адреса (для показа) ---------- */
  var params = new URLSearchParams(window.location.search);
  ['salesOpen', 'bookReleased', 'ironReleased'].forEach(function (key) {
    if (params.has(key)) { cfg[key] = /^(1|true)$/.test(params.get(key)); }
    cfg[key] = !!cfg[key];
  });
  var accentParam = params.get('accent');
  if (accentParam && /^[0-9a-fA-F]{6}$/.test(accentParam)) { cfg.accent = '#' + accentParam; }

  var root = document.documentElement;
  if (cfg.accent) { root.style.setProperty('--accent', cfg.accent); }
  var italic = params.has('italic') ? /^(1|true)$/.test(params.get('italic')) : cfg.italic !== false;
  root.classList.toggle('kk-no-italic', !italic);
  root.style.setProperty('--book-opacity', cfg.bookReleased ? '1' : '0.5');

  // <div data-if="salesOpen"> / data-if="!salesOpen" — лишние ветки убираем из DOM
  document.querySelectorAll('[data-if]').forEach(function (el) {
    var expr = el.getAttribute('data-if');
    var negate = expr.charAt(0) === '!';
    var value = !!cfg[negate ? expr.slice(1) : expr];
    if (negate ? value : !value) { el.remove(); }
  });

  /* Добавки: список в config.js. released берётся из флага (flag) или из поля released. */
  var supplements = (cfg.supplements || []).map(function (p) {
    var out = {};
    for (var k in p) { out[k] = p[k]; }
    out.isOut = p.flag ? !!cfg[p.flag] : !!p.released;
    return out;
  });
  var ironSupp = supplements.filter(function (p) { return p.id === 'iron'; })[0] || supplements[0] || {};
  var texts = {
    ironCta: ironSupp.isOut ? ironSupp.ctaOut : ironSupp.ctaSoon
  };
  // <a data-link="marathonForm"> — адрес из config.links; внешние ссылки открываются в новой вкладке
  document.querySelectorAll('[data-link]').forEach(function (el) {
    var url = (cfg.links || {})[el.getAttribute('data-link')];
    if (!url) { return; }
    el.setAttribute('href', url);
    if (/^https?:/.test(url)) { el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener'); }
  });

  document.querySelectorAll('[data-text]').forEach(function (el) {
    var t = texts[el.getAttribute('data-text')];
    if (t) { el.textContent = t; }
  });

  /* ---------- «Мои проекты» ---------- */
  function badgeText(badge) {
    if (badge && typeof badge === 'object') { return cfg[badge.flag] ? badge.on : badge.off; }
    return badge || '';
  }
  var projectsEl = $('kk-projects');
  if (projectsEl) {
    projectsEl.innerHTML = (cfg.projects || []).map(function (p, i) {
      var href = p.href || '#';
      return '' +
        '<a href="' + esc(href) + '"' + linkAttrs(href) + ' class="kk-lift ' + STAGGER[Math.min(i, 3)] + '" style="display: flex; flex-direction: column; gap: 16px; padding: 12px 12px 22px; border-radius: 28px; background: #FFFFFF; color: #4A3F36; text-decoration: none">' +
        '<div class="kk-unveil" style="position: relative; overflow: hidden; aspect-ratio: 4 / 5; border-radius: 20px; background: ' + esc(p.tone || '#EADECD') + '; display: flex; align-items: flex-end; padding: 14px; box-sizing: border-box">' +
        (p.img ? '<img src="' + esc(p.img) + '" alt="' + esc(p.alt) + '" loading="lazy" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 20px; display: block">' : '') +
        '<span class="kk-glass" style="position: absolute; top: 14px; left: 14px; color: #4A3F36; border-radius: 999px; padding: 6px 13px; font-size: 12px; font-weight: 600">' + esc(badgeText(p.badge)) + '</span>' +
        '<span style="font-family: ' + SERIF + '; font-size: 44px; font-style: italic; line-height: 1; color: rgba(255,255,255,0.85); position: absolute; right: 16px; top: 10px">' + esc(p.num) + '</span>' +
        (p.img ? '' : '<span style="color: #6E6258; font-size: 12px; font-weight: 500">' + esc(p.photo) + '</span>') +
        '</div>' +
        '<div style="padding: 0 10px; display: flex; flex-direction: column; gap: 8px; flex-grow: 1">' +
        '<span style="font-family: ' + SERIF + '; font-size: 28px; font-weight: 500; line-height: 1.05; color: #3F352D">' + esc(p.title) + '</span>' +
        '<span style="font-size: 15px; line-height: 1.6; color: #6E6258; flex-grow: 1">' + esc(p.text) + '</span>' +
        '<span style="font-size: 14px; font-weight: 600; color: var(--accent)">Подробнее →</span>' +
        '</div>' +
        '</a>';
    }).join('');
  }

  /* ---------- «Добавки»: по блоку на каждую запись из config.js ---------- */
  var suppEl = $('supplements');
  if (suppEl) {
    var SUPP_TPL = "<div id=\"{{ID}}\" class=\"kk-supp\" style=\"max-width: 1240px; margin: 0 auto; padding: 104px 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(360px, 100%), 1fr)); gap: 56px; align-items: center\">\n<div class=\"kk-left\" style=\"position: relative; display: flex; flex-direction: column; gap: 20px\">\n<p style=\"margin: 0; display: flex; align-items: center; gap: 12px; font-size: 13px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: #9C8878\"><span aria-hidden=\"true\" style=\"width: 36px; height: 1px; background: #CDBDA5\"></span>Добавка · {{STATUS}}</p>\n<h2 style=\"margin: 0; font-family: 'Cormorant Garamond', serif; font-weight: 500; font-size: clamp(34px, 9.2vw, 52px); line-height: 1.05; color: #3F352D\">{{TITLE}} <span style=\"font-style: italic; color: var(--accent)\">{{ACCENT}}</span></h2>\n<p style=\"margin: 0; font-size: 17px; line-height: 1.7; color: #6E6258; max-width: 520px\">{{LEAD}}</p>\n<div style=\"display: grid; grid-template-columns: repeat(auto-fit, minmax(min(160px, 100%), 1fr)); gap: 10px\">\n{{FACTS}}\n</div>\n<div style=\"display: flex; flex-wrap: wrap; gap: 10px\">\n<a href=\"{{CTAHREF}}\"{{CTAATTR}} style=\"display: inline-flex; align-items: center; gap: 10px; min-height: 52px; padding: 8px 28px; box-sizing: border-box; border-radius: 28px; background: var(--accent); color: #FFFFFF; text-decoration: none; font-weight: 600\">{{CTA}}</a>\n{{SECONDARY}}\n</div>\n<p style=\"margin: 0; font-size: 13px; line-height: 1.55; color: #9C8878\">{{NOTE}}</p>\n</div>\n<div class=\"kk-right kk-prod-stage\" style=\"{{ORDER}}position: relative; min-height: 460px; display: flex; align-items: center; justify-content: center\">\n<div aria-hidden=\"true\" style=\"position: absolute; right: 6%; bottom: 4%; width: 320px; height: 280px; border-radius: 999px; background: #E3D5C0; filter: blur(56px); opacity: 0.8\"></div>\n<div aria-hidden=\"true\" style=\"position: absolute; width: 430px; max-width: 96%; aspect-ratio: 1 / 1; border-radius: 999px; border: 1px dashed #D9CBB6\"></div>\n<div class=\"kk-glass\" style=\"position: relative; width: 340px; max-width: 78%; aspect-ratio: 1 / 1; border-radius: 999px; display: flex; align-items: flex-end; justify-content: center; overflow: hidden\">\n<div aria-hidden=\"true\" style=\"position: absolute; bottom: 0; width: 100%; height: 34%; background: #EAE0D0\"></div>\n<div style=\"position: relative; margin-bottom: 22%; width: 46%; aspect-ratio: 5 / 7; opacity: {{OPACITY}}; display: flex; flex-direction: column; box-shadow: 0 22px 40px rgba(122,86,74,0.2); border-radius: 22px 22px 18px 18px\">\n<span aria-hidden=\"true\" style=\"height: 17%; border-radius: 14px 14px 4px 4px; background: #D8C4A6; margin: 0 6%\"></span>\n<span style=\"flex-grow: 1; border-radius: 16px 16px 18px 18px; background: #FFFFFF; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px\"><span style=\"font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase; color: #7A6D62\">{{BRAND}}</span><span style=\"font-family: 'Cormorant Garamond', serif; font-size: clamp(26px, 7vw, 34px); font-style: italic; color: #4A3F36\">{{LABEL}}</span><span aria-hidden=\"true\" style=\"width: 28px; height: 1px; background: #CDBDA5\"></span></span>\n</div>\n</div>\n{{PILL0}}\n{{PILL1}}\n</div>\n</div>";
    var FACT_TPL = "<div class=\"kk-glass\" style=\"border-radius: 22px; padding: 18px 20px; display: flex; flex-direction: column; gap: 6px\"><span style=\"font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 500; line-height: 1.1; color: #3F352D\">{{T}}</span><span style=\"font-size: 14px; line-height: 1.55; color: #6E6258\">{{D}}</span></div>";
    var SECOND_TPL = "<a href=\"{{H}}\"{{A}} style=\"display: inline-flex; align-items: center; gap: 10px; min-height: 52px; padding: 0 24px; border-radius: 999px; border: 1px solid var(--accent); color: var(--accent); text-decoration: none; font-weight: 600\">{{T}} <span aria-hidden=\"true\">→</span></a>";
    var PILL_TPL = ["<span class=\"kk-pill kk-bob1 kk-glass\" style=\"position: absolute; left: 2%; top: 16%; border-radius: 999px; padding: 10px 22px; font-family: 'Cormorant Garamond', serif; font-size: 22px; font-style: italic; color: #4A3F36\">{{T}}</span>", "<span class=\"kk-pill kk-bob4 kk-glass\" style=\"position: absolute; right: 0; bottom: 14%; border-radius: 999px; padding: 10px 22px; font-family: 'Cormorant Garamond', serif; font-size: 22px; font-style: italic; color: #4A3F36\">{{T}}</span>"];
    var fill = function (tpl, map) {
      return tpl.replace(/\{\{(\w+)\}\}/g, function (_, key) { return map[key] == null ? '' : map[key]; });
    };
    suppEl.innerHTML = supplements.map(function (p, i) {
      var ctaHref = (p.isOut ? p.hrefOut : p.hrefSoon) || '#readers';
      var pills = p.pills || [];
      var sec = p.secondary;
      return fill(SUPP_TPL, {
        ID: esc(p.id || 'supplement-' + (i + 1)),
        STATUS: esc(p.isOut ? p.statusOut : p.statusSoon),
        TITLE: esc(p.title),
        ACCENT: esc(p.titleAccent),
        LEAD: esc(p.lead),
        FACTS: (p.facts || []).map(function (f) { return fill(FACT_TPL, { T: esc(f.title), D: esc(f.text) }); }).join('\n'),
        CTAHREF: esc(ctaHref),
        CTAATTR: linkAttrs(ctaHref),
        CTA: esc(p.isOut ? p.ctaOut : p.ctaSoon),
        SECONDARY: sec ? fill(SECOND_TPL, { H: esc(sec.href), A: linkAttrs(sec.href), T: esc(sec.text) }) : '',
        NOTE: esc(p.note),
        BRAND: esc(p.brand),
        LABEL: esc(p.label),
        OPACITY: p.isOut ? '1' : '0.55',
        PILL0: pills[0] ? fill(PILL_TPL[0], { T: esc(pills[0]) }) : '',
        PILL1: pills[1] ? fill(PILL_TPL[1], { T: esc(pills[1]) }) : '',
        ORDER: i % 2 ? 'order: -1; ' : ''
      });
    }).join('\n');
  }

  /* ---------- «Разборы»: карусель (рилсы, советы) ---------- */
  var reelsEl = $('kk-reels');
  if (reelsEl) {
    var TYPES = { reel: 'Рилс', tip: 'Совет' };
    reelsEl.innerHTML = (cfg.reels || []).map(function (r) {
      var href = r.href || 'https://www.instagram.com/katy_konnova/';
      var type = TYPES[r.type] ? r.type : 'reel';
      return '' +
        '<a href="' + esc(href) + '"' + linkAttrs(href) + ' class="kk-car-card" style="background: ' + esc(r.tone || '#E8DBC8') + '">' +
        (r.img ? '<img src="' + esc(r.img) + '" alt="" loading="lazy" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block">' : '') +
        '<span style="position: relative; display: flex; justify-content: space-between; align-items: center">' +
        '<span class="kk-glass" style="border-radius: 999px; padding: 6px 13px; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent)">' + TYPES[type] + '</span>' +
        (type === 'reel' ? '<span class="kk-glass" aria-hidden="true" style="width: 44px; height: 44px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center"><svg viewBox="0 0 24 24" width="16" height="16" fill="var(--accent)"><path d="M8 5.5v13l10.5-6.5z"></path></svg></span>' : '') +
        '</span>' +
        (r.img ? '' : '<span style="font-size: 12px; color: #6E6258; text-align: center">Обложка</span>') +
        '<span class="kk-glass" style="position: relative; border-radius: 18px; padding: 14px 16px; display: flex; flex-direction: column; gap: 4px">' +
        '<span style="font-family: ' + SERIF + '; font-size: 23px; font-weight: 500; line-height: 1.1">' + esc(r.title) + '</span>' +
        '<span style="font-size: 13px; color: #6E6258">' + esc(r.sub) + '</span>' +
        '</span>' +
        '</a>';
    }).join('');

    var cards = [].slice.call(reelsEl.children);
    var active = -1;
    var centerOf = function (c) { return c.offsetLeft + c.offsetWidth / 2; };
    var nearest = function () {
      var mid = reelsEl.scrollLeft + reelsEl.clientWidth / 2, best = 0, bd = Infinity;
      cards.forEach(function (c, i) { var d = Math.abs(centerOf(c) - mid); if (d < bd) { bd = d; best = i; } });
      return best;
    };
    var mark = function () {
      var n = nearest();
      if (n === active) return;
      active = n;
      cards.forEach(function (c, i) { c.classList.toggle('is-active', i === n); });
    };
    var go = function (i, instant) {
      i = Math.max(0, Math.min(cards.length - 1, i));
      reelsEl.scrollTo({ left: centerOf(cards[i]) - reelsEl.clientWidth / 2, behavior: instant ? 'instant' : 'smooth' });
    };
    if (cards.length) {
      var ticking = false;
      reelsEl.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        setTimeout(function () { ticking = false; mark(); }, 60);
      }, { passive: true });
      window.addEventListener('resize', function () { go(active < 0 ? 0 : active, true); mark(); });
      // клик по боковой карточке сначала выводит её в центр, по центральной — открывает ссылку
      cards.forEach(function (c, i) {
        c.addEventListener('click', function (e) { if (i !== active) { e.preventDefault(); go(i); } });
      });
      reelsEl.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
      });
      [].forEach.call(document.querySelectorAll('.kk-car-btn'), function (b) {
        b.addEventListener('click', function () { go(active + Number(b.getAttribute('data-dir'))); });
      });
      go(Math.floor((cards.length - 1) / 2), true);
      mark();
    }
  }

  /* ---------- Индикатор разделов справа (scroll-spy) ---------- */
  var sections = [
    ['top', 'Главная'], ['projects', 'Проекты'], ['system', 'Система'], ['about', 'Обо мне'],
    ['marathon', 'Марафон'], ['pro', 'PRO Стройность'], ['reels', 'Разборы'], ['results', 'Результаты'], ['book', 'Книга'], ['supplements', 'Добавки'],
    ['iron-test', 'Тест'], ['readers', 'Читательницам']
  ];
  var railEl = $('kk-rail');
  if (railEl) {
    var dots = sections.map(function (s, i) {
      var a = document.createElement('a');
      a.href = '#' + s[0];
      a.setAttribute('aria-label', (i + 1) + '. ' + s[1]);
      a.style.cssText = 'position: relative; display: flex; align-items: center; justify-content: center; width: 20px; height: 26px';
      var dot = document.createElement('span');
      dot.style.cssText = 'display: block; width: 7px; height: 7px; border-radius: 999px; background: #D9CBB6; box-shadow: 0 0 0 3px #FBF8F3; transition: height .5s cubic-bezier(.2,.7,.2,1), background .5s ease';
      a.appendChild(dot);
      railEl.appendChild(a);
      return { link: a, dot: dot };
    });
    var numEl = $('kk-rail-num');
    var labelEl = $('kk-rail-label');
    var activeIdx = -1;
    var setActive = function (idx) {
      if (idx === activeIdx) { return; }
      activeIdx = idx;
      dots.forEach(function (d, i) {
        var on = i === idx;
        d.link.setAttribute('aria-current', on ? 'true' : 'false');
        d.dot.style.height = on ? '26px' : '7px';
        d.dot.style.background = on ? 'var(--accent)' : '#D9CBB6';
      });
      numEl.textContent = (idx + 1 < 10 ? '0' : '') + (idx + 1);
      labelEl.textContent = sections[idx][1];
    };
    var onScroll = function () {
      var mid = window.innerHeight * 0.45;
      var act = 0;
      for (var i = 1; i < sections.length; i++) {
        var el = $(sections[i][0]);
        if (el && el.getBoundingClientRect().top <= mid) { act = i; }
      }
      setActive(act);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Тест «Хватает ли вам железа?» ---------- */
  var testEl = $('kk-test');
  var test = cfg.ironTest || {};
  var questions = test.questions || [];
  if (testEl && questions.length) {
    var total = questions.length;
    var links = test.links || {};
    var answers = {};

    var stepLink = function (href, label, primary) {
      return '<a href="' + esc(href || '#iron-test') + '"' + linkAttrs(href || '') + ' style="display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 56px; padding: 6px 22px; border-radius: 18px; background: ' + (primary ? 'var(--accent)' : '#FFFFFF') + '; color: ' + (primary ? '#FFFFFF' : '#4A3F36') + '; text-decoration: none; font-family: ' + SERIF + '; font-size: 21px; font-weight: 500">' + esc(label) +
        ' <span aria-hidden="true" style="font-family: \'Manrope\', sans-serif; font-size: 16px' + (primary ? '' : '; color: var(--accent)') + '">→</span></a>';
    };

    testEl.innerHTML = '' +
      '<div data-part="form" style="display: flex; flex-direction: column; gap: 16px">' +
      '<div style="display: flex; align-items: center; gap: 12px">' +
      '<span data-part="count" aria-live="polite" style="font-family: ' + SERIF + '; font-size: 20px; font-style: italic; color: var(--accent); white-space: nowrap"></span>' +
      '<div style="flex-grow: 1; height: 3px; border-radius: 999px; background: #EFE7DB; overflow: hidden"><div data-part="bar" style="height: 100%; width: 0%; background: var(--accent); border-radius: 999px; transition: width .6s cubic-bezier(.2,.7,.2,1)"></div></div>' +
      '</div>' +
      questions.map(function (text, i) {
        return '' +
          '<div role="group" aria-label="' + esc(text) + '" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 16px; padding: 14px 0; border-top: 1px solid #EFE7DB">' +
          '<span style="font-family: ' + SERIF + '; font-size: 22px; font-weight: 500; line-height: 1.25; color: #3F352D; flex: 1 1 260px">' + esc(text) + '</span>' +
          '<div style="display: flex; gap: 8px">' +
          '<button type="button" class="kk-yn" data-q="' + i + '" data-a="1" aria-pressed="false">Да</button>' +
          '<button type="button" class="kk-yn" data-q="' + i + '" data-a="0" aria-pressed="false">Нет</button>' +
          '</div>' +
          '</div>';
      }).join('') +
      '</div>' +
      '<div data-part="result" tabindex="-1" hidden style="display: flex; flex-direction: column; gap: 14px; outline: none">' +
      '<span data-part="score" style="font-size: 13px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #9C8878"></span>' +
      '<span data-part="title" style="font-family: ' + SERIF + '; font-size: 38px; font-weight: 500; line-height: 1.1; color: #3F352D"></span>' +
      '<span data-part="text" style="font-size: 16px; line-height: 1.7; color: #6E6258"></span>' +
      '<div style="display: flex; flex-direction: column; gap: 10px; padding-top: 6px">' +
      stepLink(links.analyses, 'Какие анализы сдать', false) +
      stepLink(links.video, 'Видео: почему важно железо', false) +
      stepLink(links.buy || '#iron', texts.ironCta, true) +
      '</div>' +
      '<button type="button" data-part="reset" style="align-self: flex-start; min-height: 44px; padding: 0 4px; border: none; background: transparent; color: #7A6D62; font-family: \'Manrope\', sans-serif; font-weight: 500; font-size: 14px; text-decoration: underline; text-underline-offset: 4px; cursor: pointer">Пройти заново</button>' +
      '</div>';

    var part = function (name) { return testEl.querySelector('[data-part="' + name + '"]'); };
    var formEl = part('form');
    var resultEl = part('result');

    var symEl = $('kk-symptoms');
    var update = function () {
      var answered = 0, score = 0;
      for (var i = 0; i < total; i++) {
        if (answers[i] === true || answers[i] === false) { answered++; }
        if (answers[i] === true) { score++; }
      }
      testEl.querySelectorAll('.kk-yn').forEach(function (btn) {
        var a = answers[btn.getAttribute('data-q')];
        var isYes = btn.getAttribute('data-a') === '1';
        btn.setAttribute('aria-pressed', (isYes ? a === true : a === false) ? 'true' : 'false');
      });
      if (symEl) {
        symEl.querySelectorAll('.kk-chip').forEach(function (chip) {
          chip.setAttribute('aria-pressed', answers[chip.getAttribute('data-q')] === true ? 'true' : 'false');
        });
      }
      part('count').textContent = answered + ' из ' + total;
      part('bar').style.width = Math.round(answered / total * 100) + '%';

      var done = answered === total;
      if (done) {
        var results = test.results || [];
        var res = results[results.length - 1] || { title: '', text: '' };
        for (var r = 0; r < results.length; r++) {
          if (score <= results[r].maxScore) { res = results[r]; break; }
        }
        part('score').textContent = 'Ваш результат · ' + score + ' из ' + total;
        part('title').textContent = res.title;
        part('text').textContent = res.text;
      }
      var wasDone = !resultEl.hidden;
      formEl.hidden = done;
      resultEl.hidden = !done;
      if (done && !wasDone) {
        resultEl.classList.remove('kk-load');
        void resultEl.offsetWidth; // перезапуск анимации появления
        resultEl.classList.add('kk-load');
        resultEl.focus({ preventScroll: true });
      }
    };

    /* Плитки «Знакомо?»: нажатие отмечает «Да» в вопросе с тем же номером */
    var symptoms = (test.symptoms || []).slice(0, total);
    if (symEl && symptoms.length) {
      symEl.innerHTML = '' +
        '<span style="font-family: ' + SERIF + '; font-size: 26px; font-style: italic; color: var(--accent)">Знакомо?</span>' +
        '<div role="group" aria-label="Знакомые симптомы" style="display: flex; flex-wrap: wrap; gap: 8px">' +
        symptoms.map(function (text, i) {
          return '<button type="button" class="kk-chip" data-q="' + i + '" aria-pressed="false">' + esc(text) + '</button>';
        }).join('') +
        '</div>' +
        '<span style="font-size: 13px; line-height: 1.55; color: #9C8878">Отметьте, что про вас, — ответы «Да» в тесте проставятся сами.</span>';
      symEl.addEventListener('click', function (e) {
        var chip = e.target.closest('.kk-chip');
        if (!chip) { return; }
        var q = chip.getAttribute('data-q');
        if (answers[q] === true) { delete answers[q]; } else { answers[q] = true; }
        update();
      });
    }

    testEl.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) { return; }
      if (btn.classList.contains('kk-yn')) {
        answers[btn.getAttribute('data-q')] = btn.getAttribute('data-a') === '1';
        update();
      } else if (btn.getAttribute('data-part') === 'reset') {
        answers = {};
        update();
      }
    });
    update();
  }
  /* ---------- «Результаты»: лента историй со стрелками ---------- */
  var resEl = $('kk-results');
  if (resEl && resEl.children.length) {
    var resBtns = [].slice.call(document.querySelectorAll('[data-results]'));
    var resState = function () {
      var max = resEl.scrollWidth - resEl.clientWidth;
      resBtns.forEach(function (b) {
        var dir = Number(b.getAttribute('data-results'));
        b.disabled = dir < 0 ? resEl.scrollLeft <= 2 : resEl.scrollLeft >= max - 2;
      });
    };
    var resGo = function (dir) {
      var step = resEl.children.length > 1 ? resEl.children[1].offsetLeft - resEl.children[0].offsetLeft : resEl.clientWidth;
      var perPage = Math.max(1, Math.round(resEl.clientWidth / step));
      resEl.scrollBy({ left: dir * step * perPage, behavior: 'smooth' });
    };
    resBtns.forEach(function (b) {
      b.addEventListener('click', function () { resGo(Number(b.getAttribute('data-results'))); });
    });
    resEl.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); resGo(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); resGo(1); }
    });
    var resTick = false;
    resEl.addEventListener('scroll', function () {
      if (resTick) { return; }
      resTick = true;
      setTimeout(function () { resTick = false; resState(); }, 80);
    }, { passive: true });
    window.addEventListener('resize', resState);
    resState();
  }

  /* ---------- Появление при скролле ---------- */
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* Заголовки h2 выезжают построчно. Слова оборачиваются в маски; номер строки
     считается в момент появления, поэтому перенос на любой ширине учитывается. */
  if (!reduced && hasIO) {
    var wrapWords = function (node) {
      [].slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 1) { wrapWords(child); return; }
        if (child.nodeType !== 3 || !/\S/.test(child.nodeValue)) { return; }
        var frag = document.createDocumentFragment();
        child.nodeValue.split(/(\s+)/).forEach(function (piece) {
          if (!piece) { return; }
          if (/^\s+$/.test(piece)) { frag.appendChild(document.createTextNode(' ')); return; }
          var outer = document.createElement('span');
          outer.className = 'kk-w';
          var inner = document.createElement('span');
          inner.textContent = piece;
          outer.appendChild(inner);
          frag.appendChild(outer);
        });
        node.replaceChild(frag, child);
      });
    };
    var headIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) { return; }
        var line = -1, lastTop = null;
        [].forEach.call(en.target.querySelectorAll('.kk-w'), function (w) {
          if (lastTop === null || Math.abs(w.offsetTop - lastTop) > 4) { line++; lastTop = w.offsetTop; }
          w.firstChild.style.transitionDelay = (line * 0.13) + 's';
        });
        en.target.classList.add('is-in');
        headIO.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.3 });
    [].forEach.call(document.querySelectorAll('h2'), function (h) {
      wrapWords(h);
      h.classList.add('kk-split');
      headIO.observe(h);
    });
  }

  /* Запасной вариант для браузеров без animation-timeline (Firefox): те же анимации
     появления, но запускаются один раз, когда блок входит в экран. ?nosda=1 — для проверки. */
  var noSDA = document.documentElement.classList.contains('kk-no-sda'); // ставится скриптом в <head>
  if (noSDA && !hasIO) { document.documentElement.classList.remove('kk-no-sda'); }
  if (noSDA && !reduced && hasIO) {
    var seenIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('kk-seen'); seenIO.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    [].forEach.call(document.querySelectorAll('.kk-reveal,.kk-s2,.kk-s3,.kk-s4,.kk-blur,.kk-left,.kk-right,.kk-zoom,.kk-unveil,.kk-ln'), function (el) {
      // линии иконок — части SVG: наблюдаем за самим <svg>
      seenIO.observe(el.classList.contains('kk-ln') ? (el.closest('svg') || el) : el);
    });
    var bar = document.querySelector('.kk-progress');
    if (bar) {
      var grow = function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = 'scaleY(' + (max > 0 ? Math.min(1, Math.max(0.02, window.scrollY / max)) : 1) + ')';
      };
      window.addEventListener('scroll', grow, { passive: true });
      grow();
    }
  }
})();
