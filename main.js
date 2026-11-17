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
  root.style.setProperty('--book-opacity', cfg.bookReleased ? '1' : '0.5');
  root.style.setProperty('--iron-opacity', cfg.ironReleased ? '1' : '0.55');

  // <div data-if="salesOpen"> / data-if="!salesOpen" — лишние ветки убираем из DOM
  document.querySelectorAll('[data-if]').forEach(function (el) {
    var expr = el.getAttribute('data-if');
    var negate = expr.charAt(0) === '!';
    var value = !!cfg[negate ? expr.slice(1) : expr];
    if (negate ? value : !value) { el.remove(); }
  });

  var iron = cfg.iron || {};
  var texts = {
    ironShort: cfg.ironReleased ? iron.shortOut : iron.shortSoon,
    ironCta: cfg.ironReleased ? iron.ctaOut : iron.ctaSoon
  };
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
        '<a href="' + esc(href) + '"' + linkAttrs(href) + ' class="kk-lift ' + STAGGER[Math.min(i, 3)] + '" style="display: flex; flex-direction: column; gap: 16px; padding: 12px 12px 22px; border-radius: 28px; background: #FFFFFF; color: #4A3C36; text-decoration: none">' +
        '<div class="kk-unveil" style="position: relative; overflow: hidden; aspect-ratio: 4 / 5; border-radius: 20px; background: ' + esc(p.tone || '#EAD8CD') + '; display: flex; align-items: flex-end; padding: 14px; box-sizing: border-box">' +
        (p.img ? '<img src="' + esc(p.img) + '" alt="' + esc(p.alt) + '" loading="lazy" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 20px; display: block">' : '') +
        '<span class="kk-glass" style="position: absolute; top: 14px; left: 14px; color: #4A3C36; border-radius: 999px; padding: 6px 13px; font-size: 12px; font-weight: 600">' + esc(badgeText(p.badge)) + '</span>' +
        '<span style="font-family: ' + SERIF + '; font-size: 44px; font-style: italic; line-height: 1; color: rgba(255,255,255,0.85); position: absolute; right: 16px; top: 10px">' + esc(p.num) + '</span>' +
        (p.img ? '' : '<span style="color: #6E5F58; font-size: 12px; font-weight: 500">' + esc(p.photo) + '</span>') +
        '</div>' +
        '<div style="padding: 0 10px; display: flex; flex-direction: column; gap: 8px; flex-grow: 1">' +
        '<span style="font-family: ' + SERIF + '; font-size: 28px; font-weight: 500; line-height: 1.05; color: #3F322D">' + esc(p.title) + '</span>' +
        '<span style="font-size: 15px; line-height: 1.6; color: #6E5F58; flex-grow: 1">' + esc(p.text) + '</span>' +
        '<span style="font-size: 14px; font-weight: 600; color: var(--accent)">Подробнее →</span>' +
        '</div>' +
        '</a>';
    }).join('');
  }

  /* ---------- «Разборы»: карусель (рилсы, советы) ---------- */
  var reelsEl = $('kk-reels');
  if (reelsEl) {
    var TYPES = { reel: 'Рилс', tip: 'Совет' };
    reelsEl.innerHTML = (cfg.reels || []).map(function (r) {
      var href = r.href || 'https://www.instagram.com/katy_konnova/';
      var type = TYPES[r.type] ? r.type : 'reel';
      return '' +
        '<a href="' + esc(href) + '"' + linkAttrs(href) + ' class="kk-car-card" style="background: ' + esc(r.tone || '#E8D4C8') + '">' +
        (r.img ? '<img src="' + esc(r.img) + '" alt="" loading="lazy" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block">' : '') +
        '<span style="position: relative; display: flex; justify-content: space-between; align-items: center">' +
        '<span class="kk-glass" style="border-radius: 999px; padding: 6px 13px; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent)">' + TYPES[type] + '</span>' +
        (type === 'reel' ? '<span class="kk-glass" aria-hidden="true" style="width: 44px; height: 44px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center"><svg viewBox="0 0 24 24" width="16" height="16" fill="var(--accent)"><path d="M8 5.5v13l10.5-6.5z"></path></svg></span>' : '') +
        '</span>' +
        (r.img ? '' : '<span style="font-size: 12px; color: #6E5F58; text-align: center">Обложка</span>') +
        '<span class="kk-glass" style="position: relative; border-radius: 18px; padding: 14px 16px; display: flex; flex-direction: column; gap: 4px">' +
        '<span style="font-family: ' + SERIF + '; font-size: 23px; font-weight: 500; line-height: 1.1">' + esc(r.title) + '</span>' +
        '<span style="font-size: 13px; color: #6E5F58">' + esc(r.sub) + '</span>' +
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
    ['marathon', 'Марафон'], ['reels', 'Разборы'], ['results', 'Результаты'], ['book', 'Книга и железо'],
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
      dot.style.cssText = 'display: block; width: 7px; height: 7px; border-radius: 999px; background: #D9C3B6; box-shadow: 0 0 0 3px #FBF7F3; transition: height .5s cubic-bezier(.2,.7,.2,1), background .5s ease';
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
        d.dot.style.background = on ? 'var(--accent)' : '#D9C3B6';
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
      return '<a href="' + esc(href || '#iron-test') + '"' + linkAttrs(href || '') + ' style="display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 56px; padding: 6px 22px; border-radius: 18px; background: ' + (primary ? 'var(--accent)' : '#FFFFFF') + '; color: ' + (primary ? '#FFFFFF' : '#4A3C36') + '; text-decoration: none; font-family: ' + SERIF + '; font-size: 21px; font-weight: 500">' + esc(label) +
        ' <span aria-hidden="true" style="font-family: \'Manrope\', sans-serif; font-size: 16px' + (primary ? '' : '; color: var(--accent)') + '">→</span></a>';
    };

    testEl.innerHTML = '' +
      '<div data-part="form" style="display: flex; flex-direction: column; gap: 16px">' +
      '<div style="display: flex; align-items: center; gap: 12px">' +
      '<span data-part="count" aria-live="polite" style="font-family: ' + SERIF + '; font-size: 20px; font-style: italic; color: var(--accent); white-space: nowrap"></span>' +
      '<div style="flex-grow: 1; height: 3px; border-radius: 999px; background: #EFE4DB; overflow: hidden"><div data-part="bar" style="height: 100%; width: 0%; background: var(--accent); border-radius: 999px; transition: width .6s cubic-bezier(.2,.7,.2,1)"></div></div>' +
      '</div>' +
      questions.map(function (text, i) {
        return '' +
          '<div role="group" aria-label="' + esc(text) + '" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 16px; padding: 14px 0; border-top: 1px solid #EFE4DB">' +
          '<span style="font-family: ' + SERIF + '; font-size: 22px; font-weight: 500; line-height: 1.25; color: #3F322D; flex: 1 1 260px">' + esc(text) + '</span>' +
          '<div style="display: flex; gap: 8px">' +
          '<button type="button" class="kk-yn" data-q="' + i + '" data-a="1" aria-pressed="false">Да</button>' +
          '<button type="button" class="kk-yn" data-q="' + i + '" data-a="0" aria-pressed="false">Нет</button>' +
          '</div>' +
          '</div>';
      }).join('') +
      '</div>' +
      '<div data-part="result" tabindex="-1" hidden style="display: flex; flex-direction: column; gap: 14px; outline: none">' +
      '<span data-part="score" style="font-size: 13px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #9C8378"></span>' +
      '<span data-part="title" style="font-family: ' + SERIF + '; font-size: 38px; font-weight: 500; line-height: 1.1; color: #3F322D"></span>' +
      '<span data-part="text" style="font-size: 16px; line-height: 1.7; color: #6E5F58"></span>' +
      '<div style="display: flex; flex-direction: column; gap: 10px; padding-top: 6px">' +
      stepLink(links.analyses, 'Какие анализы сдать', false) +
      stepLink(links.video, 'Видео: почему важно железо', false) +
      stepLink(links.buy || '#iron', texts.ironCta, true) +
      '</div>' +
      '<button type="button" data-part="reset" style="align-self: flex-start; min-height: 44px; padding: 0 4px; border: none; background: transparent; color: #7A6A62; font-family: \'Manrope\', sans-serif; font-weight: 500; font-size: 14px; text-decoration: underline; text-underline-offset: 4px; cursor: pointer">Пройти заново</button>' +
      '</div>';

    var part = function (name) { return testEl.querySelector('[data-part="' + name + '"]'); };
    var formEl = part('form');
    var resultEl = part('result');

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
})();
