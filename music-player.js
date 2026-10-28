/* =========================================================
   ELDAR ARCHIVE · 하단 고정 음악 플레이어
   - 사이트 안에서 페이지를 옮겨도 음악이 끊기지 않습니다.
     (링크를 누르면 페이지 전체를 새로 불러오지 않고 본문만 교체)
   - 새로고침하거나 주소로 직접 들어와도 듣던 곡·위치를 이어서 재생합니다.
   ========================================================= */
(function () {
  'use strict';
  if (window.__eldarPlayer) return;
  window.__eldarPlayer = true;

  /* =====================================================
     설정 — 곡을 추가·수정할 때는 이 부분만 고치면 됩니다.
     file : images 폴더 안의 실제 파일 이름 (대소문자·띄어쓰기까지 똑같이)
     title: 플레이어에 표시될 곡 제목
     main : true 인 곡이 처음 방문했을 때 재생되는 메인 곡
     ===================================================== */
  var CONFIG = {
    folder: 'images/',              // 음악 파일이 들어 있는 폴더
    startOnFirstInteraction: true,  // 처음 방문 시, 화면을 처음 클릭하는 순간 메인 곡 재생
    seamlessNavigation: true        // 페이지 이동 시 음악이 끊기지 않게 본문만 교체
  };

  var TRACKS = [
    { title: '이 세계 위에서',        file: '이 세계 위에서 _ ELDAL TALE 메인 테마곡.mp3', main: true },
    { title: 'THIS PAGE',             file: 'THIS PAGE.mp3' },
    { title: "What's your gold?",     file: 'What_s your gold_.mp3' },
    { title: 'Summer Splash',         file: 'Summer Splash.mp3' },
    { title: '아름다운 세계',         file: '아름다운 세계.mp3' },
    { title: '방망이 대신 펜을 들고', file: '방망이 대신 펜을 들고.mp3' },
    { title: '깜빡이는 등불',         file: '깜빡이는 등불.mp3' },
    { title: '뽑지 않은 검',          file: '뽑지 않은 검.mp3' },
    { title: 'MY EMPIRE',             file: 'MY EMPIRE.mp3' },
    { title: '텅 빈 손',              file: '텅 빈 손.mp3' },
    { title: '내기 하나 할까요?',     file: '내기 하나 할까요_.mp3' },
    { title: '일곱 나라의 방랑자',    file: '일곱 나라의 방랑자.mp3' },
    { title: 'Green Rat',             file: 'Green Rat.mp3' },
    { title: '아이스베어',            file: '아이스베어.mp3' },
    { title: '바람 씨앗',             file: '바람 씨앗.mp3' },
    { title: '모두의 수호자',         file: '모두의 수호자_.mp3' },
    { title: '이야기에 기원을 담아',  file: '이야기에 기원을 담아.mp3' },
    { title: '목숨값',                file: '목숨값.mp3' },
    { title: 'ThunderStep',           file: 'ThunderStep.mp3' },
    { title: '모래와 송곳니',         file: '모래와 송곳니.mp3' },
    { title: '나쁜 날의 약속',        file: '나쁜 날의 약속.mp3' },
    { title: '남아있는 향기',         file: '남아있는 향기.mp3' },
    { title: 'Bunny Hop!',            file: 'Bunny Hop!.mp3' },
    { title: 'DROP KICK!',            file: 'DROP KICK!.mp3' },
    { title: '역시 인심 하면 바다지?', file: '역시 인심 하면 바다지_.mp3' },
    { title: '이상',                  file: '이상.mp3' },
    { title: '내 뒤에 서',            file: '내 뒤에 서.mp3' },
    { title: '번개같은 심판',         file: '번개같은 심판.mp3' },
    { title: '오래된 횃불',           file: '오래된 횃불.mp3' },
    { title: '구원',                  file: '구원.mp3' },
    { title: 'The Climber',            file: 'The Climber.mp3' },
    { title: 'The Diggers',            file: 'The Diggers.mp3' },
    { title: 'Dullahan',               file: 'Dullahan.mp3' },
    { title: '노래 하나, 이야기 여러 개', file: '노래 하나, 이야기 여러 개.mp3' },
    { title: 'Name of this wind',      file: 'Name of this wind.mp3' },
    { title: '날아라, 작은 날개야',    file: '날아라, 작은 날개야.mp3' }
  ];

  /* ===================================================== */

  var N = TRACKS.length;
  if (!N) return;

  var SCRIPT_URL = (document.currentScript && document.currentScript.src) || location.href;
  var BASE = new URL(CONFIG.folder, SCRIPT_URL);
  var MAIN = Math.max(0, TRACKS.findIndex(function (t) { return t.main; }));
  var KEY = 'eldarPlayer:v1';
  var VKEY = 'eldarPlayer:volume';

  function trackUrl(t) {
    return new URL(t.file.split('/').map(encodeURIComponent).join('/'), BASE).href;
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(s) {
    if (!isFinite(s) || s < 0) s = 0;
    s = Math.floor(s);
    return Math.floor(s / 60) + ':' + pad(s % 60);
  }
  function store(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function read(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } }
  function storeL(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) {} }
  function readL(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- 아이콘 ---------- */
  var I = {
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h2.2v14H6zM19.5 5.4v13.2L9.6 12z"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.8 5H18v14h-2.2zM4.5 5.4 14.4 12l-9.9 6.6z"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6L19 12z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z"/></svg>',
    repeat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v3l4-4-4-4v3H5v6h2zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2z"/></svg>',
    shuffle: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.6 9.2 5.4 4 4 5.4l5.2 5.2zM14.5 4l2 2L4 18.6 5.4 20 18 7.5l2 2V4zm.3 9.4-1.4 1.4 3.1 3.1-2 2H20v-5.5l-2 2z"/></svg>',
    vol: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>',
    mute: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9zm13.6 3 2.7-2.7-1.4-1.4-2.7 2.7-2.7-2.7-1.4 1.4 2.7 2.7-2.7 2.7 1.4 1.4 2.7-2.7 2.7 2.7 1.4-1.4z"/></svg>',
    list: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h12v2H3zm0 5h12v2H3zm0 5h8v2H3zm14-10h5v2h-3v8.5A2.5 2.5 0 1 1 17 14z"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4z"/></svg>',
    note: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v10.6A4 4 0 1 0 14 17V7h4V3z"/></svg>'
  };

  var MODES = {
    all: { label: '전체 반복', icon: I.repeat, badge: '' },
    one: { label: '한 곡 반복', icon: I.repeat, badge: '1' },
    shuffle: { label: '무작위 재생', icon: I.shuffle, badge: '' }
  };
  var MODE_ORDER = ['all', 'one', 'shuffle'];

  /* ---------- DOM 생성 ---------- */
  var root = document.createElement('div');
  root.id = 'eldar-player';
  root.setAttribute('data-mp', '');
  root.setAttribute('role', 'region');
  root.setAttribute('aria-label', '음악 플레이어');
  root.innerHTML =
    '<div class="mp-list" id="mp-list" hidden>' +
      '<div class="mp-list-head"><strong>PLAYLIST</strong><small>' + N + '곡</small></div>' +
      '<ol>' + TRACKS.map(function (t, i) {
        return '<li><button type="button" class="mp-item" data-i="' + i + '">' +
          '<span class="mp-no">' + pad(i + 1) + '</span>' +
          '<span class="mp-name">' + esc(t.title) + '</span>' +
          (t.main ? '<span class="mp-tag">MAIN</span>' : '<span></span>') +
        '</button></li>';
      }).join('') + '</ol>' +
    '</div>' +
    '<div class="mp-bar">' +
      '<div class="mp-disc" aria-hidden="true"><span><b>E</b></span></div>' +
      '<div class="mp-info">' +
        '<div class="mp-kicker"><span class="mp-eq" aria-hidden="true"><i></i><i></i><i></i></span>' +
          '<span class="mp-state">Paused</span><span class="mp-count"></span><span class="mp-hint" hidden></span></div>' +
        '<div class="mp-title" aria-live="polite"></div>' +
      '</div>' +
      '<div class="mp-prog">' +
        '<span class="mp-time mp-cur">0:00</span>' +
        '<input class="mp-range mp-seek" type="range" min="0" max="1000" step="1" value="0" aria-label="재생 위치">' +
        '<span class="mp-time mp-dur">0:00</span>' +
      '</div>' +
      '<div class="mp-ctrls">' +
        '<button type="button" class="mp-btn mp-prev" aria-label="이전 곡" title="이전 곡">' + I.prev + '</button>' +
        '<button type="button" class="mp-btn mp-play" aria-label="재생" title="재생">' + I.play + '</button>' +
        '<button type="button" class="mp-btn mp-next" aria-label="다음 곡" title="다음 곡">' + I.next + '</button>' +
      '</div>' +
      '<div class="mp-extra">' +
        '<button type="button" class="mp-btn mp-mode" aria-label="전체 반복" title="전체 반복"></button>' +
        '<div class="mp-vol">' +
          '<button type="button" class="mp-btn mp-mute" aria-label="음소거" title="음소거">' + I.vol + '</button>' +
          '<input class="mp-range mp-volume" type="range" min="0" max="100" step="1" value="80" aria-label="음량">' +
        '</div>' +
        '<button type="button" class="mp-btn mp-listbtn" aria-label="재생 목록" title="재생 목록" aria-expanded="false" aria-controls="mp-list">' + I.list + '</button>' +
        '<button type="button" class="mp-btn mp-close" aria-label="음악 끄기" title="음악 끄기">' + I.close + '</button>' +
      '</div>' +
    '</div>';

  var reopen = document.createElement('button');
  reopen.type = 'button';
  reopen.className = 'mp-reopen';
  reopen.setAttribute('data-mp', '');
  reopen.setAttribute('aria-label', '음악 플레이어 열기');
  reopen.title = '음악 플레이어 열기';
  reopen.innerHTML = I.note;
  reopen.hidden = true;

  var loadbar = document.createElement('div');
  loadbar.id = 'mp-loadbar';
  loadbar.setAttribute('data-mp', '');

  var audio = new Audio();
  audio.preload = 'metadata';

  function $(s) { return root.querySelector(s); }
  var el = {
    list: $('.mp-list'), items: [].slice.call(root.querySelectorAll('.mp-item')),
    state: $('.mp-state'), count: $('.mp-count'), hint: $('.mp-hint'), title: $('.mp-title'),
    cur: $('.mp-cur'), dur: $('.mp-dur'), seek: $('.mp-seek'),
    prev: $('.mp-prev'), play: $('.mp-play'), next: $('.mp-next'),
    mode: $('.mp-mode'), mute: $('.mp-mute'), vol: $('.mp-volume'),
    listBtn: $('.mp-listbtn'), close: $('.mp-close')
  };

  /* ---------- 상태 ---------- */
  var cur = MAIN;
  var mode = 'all';
  var closed = false;
  var userPaused = false;   // 사용자가 직접 멈춘 경우 자동 재생하지 않음
  var pendingSeek = 0;
  var seeking = false;
  var errorRun = 0;
  var lastSave = 0;
  var intendPlay = false;   // 재생을 시도 중인지 (파일 오류 시 다음 곡으로 넘길지 판단)

  var frozen = false;       // 페이지를 떠나는 중에는 (오디오가 초기화되므로) 저장하지 않음
  function save() {
    if (frozen) return;
    store(KEY, {
      i: cur,
      t: (pendingSeek && audio.currentTime < 0.5) ? pendingSeek : (audio.currentTime || 0),
      playing: !audio.paused,
      closed: closed,
      userPaused: userPaused,
      mode: mode
    });
  }

  /* ---------- 화면 갱신 ---------- */
  function setPct(input, ratio) {
    input.style.setProperty('--p', (Math.max(0, Math.min(1, ratio)) * 100).toFixed(2) + '%');
  }

  function render() {
    var playing = !audio.paused;
    var t = TRACKS[cur];
    root.setAttribute('data-playing', String(playing));
    el.state.textContent = playing ? 'Now Playing' : 'Paused';
    el.count.textContent = pad(cur + 1) + ' / ' + pad(N);
    el.title.textContent = t.title;
    el.title.title = t.title;
    el.play.innerHTML = playing ? I.pause : I.play;
    el.play.setAttribute('aria-label', playing ? '일시정지' : '재생');
    el.play.title = playing ? '일시정지' : '재생';
    var m = MODES[mode];
    el.mode.innerHTML = m.icon + (m.badge ? '<span class="mp-badge">' + m.badge + '</span>' : '');
    el.mode.setAttribute('aria-label', '재생 방식: ' + m.label);
    el.mode.title = m.label;
    el.mode.classList.toggle('is-on', mode !== 'all');
    el.items.forEach(function (b, i) {
      if (i === cur) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    var muted = audio.muted || audio.volume === 0;
    el.mute.innerHTML = muted ? I.mute : I.vol;
    el.mute.setAttribute('aria-label', muted ? '음소거 해제' : '음소거');
    el.mute.title = muted ? '음소거 해제' : '음소거';
    if ('mediaSession' in navigator) {
      try { navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'; } catch (e) {}
    }
  }

  function hint(msg) {
    el.hint.textContent = msg || '';
    el.hint.hidden = !msg;
    el.count.hidden = !!msg;
    el.state.hidden = !!msg;
  }

  function updateTime() {
    var d = audio.duration;
    el.cur.textContent = fmt(audio.currentTime);
    el.dur.textContent = fmt(d);
    if (!seeking && isFinite(d) && d > 0) {
      el.seek.value = Math.round(audio.currentTime / d * 1000);
      setPct(el.seek, audio.currentTime / d);
    }
  }

  /* ---------- 재생 제어 ---------- */
  function load(i, autoplay) {
    if (i !== cur) pendingSeek = 0;
    cur = (i + N) % N;
    audio.src = trackUrl(TRACKS[cur]);
    el.seek.value = 0; setPct(el.seek, 0);
    el.cur.textContent = '0:00'; el.dur.textContent = '0:00';
    setMediaSession();
    render();
    if (autoplay) play();
    save();
  }

  function play() {
    intendPlay = true;
    var p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(function (err) {
        if (err && err.name === 'NotAllowedError') {
          intendPlay = false;
          hint('화면을 누르면 재생됩니다');
          armFirstInteraction();
        }
        render();
      });
    }
  }

  function toggle() {
    if (audio.paused) { userPaused = false; play(); }
    else { userPaused = true; intendPlay = false; audio.pause(); }
  }

  function pickShuffle() {
    if (N < 2) return cur;
    var j; do { j = Math.floor(Math.random() * N); } while (j === cur);
    return j;
  }
  function next() { userPaused = false; load(mode === 'shuffle' ? pickShuffle() : cur + 1, true); }
  function prev() {
    userPaused = false;
    if (audio.currentTime > 3) { pendingSeek = 0; audio.currentTime = 0; play(); return; }
    load(mode === 'shuffle' ? pickShuffle() : cur - 1, true);
  }

  function closePlayer() {
    intendPlay = false;
    audio.pause();
    pendingSeek = 0;
    audio.currentTime = 0;
    closed = true;
    userPaused = true;
    toggleList(false);
    root.hidden = true;
    reopen.hidden = false;
    document.documentElement.classList.remove('mp-on');
    disarm();
    save();
  }
  function openPlayer(andPlay) {
    closed = false;
    root.hidden = false;
    reopen.hidden = true;
    document.documentElement.classList.add('mp-on');
    if (andPlay) { userPaused = false; play(); }
    save();
  }

  function toggleList(force) {
    var open = typeof force === 'boolean' ? force : el.list.hidden;
    el.list.hidden = !open;
    el.listBtn.setAttribute('aria-expanded', String(open));
    el.listBtn.classList.toggle('is-on', open);
    if (open) {
      var a = el.items[cur];
      if (a && a.scrollIntoView) a.scrollIntoView({ block: 'nearest' });
    }
  }

  /* 브라우저 자동재생 차단 시: 화면을 처음 누르는 순간 재생 */
  var armed = false;
  var FIRST_EVENTS = ['click', 'keydown', 'touchend'];
  function onFirst(e) {
    if (root.contains(e.target) || reopen.contains(e.target)) return; // 플레이어 버튼은 각자 처리
    disarm();
    if (!closed && !userPaused && audio.paused) play();
  }
  function armFirstInteraction() {
    if (armed || !CONFIG.startOnFirstInteraction || closed || userPaused) return;
    armed = true;
    FIRST_EVENTS.forEach(function (ev) { document.addEventListener(ev, onFirst, true); });
  }
  function disarm() {
    if (!armed) return;
    armed = false;
    FIRST_EVENTS.forEach(function (ev) { document.removeEventListener(ev, onFirst, true); });
  }

  /* ---------- 오디오 이벤트 ---------- */
  audio.addEventListener('play', function () { hint(''); disarm(); errorRun = 0; render(); save(); });
  audio.addEventListener('pause', function () { render(); save(); });
  audio.addEventListener('loadedmetadata', function () {
    if (pendingSeek && pendingSeek < audio.duration - 1) audio.currentTime = pendingSeek;
    else pendingSeek = 0;
    el.items[cur] && el.items[cur].classList.remove('is-broken');
    updateTime();
  });
  audio.addEventListener('seeked', function () {
    if (pendingSeek && audio.currentTime > 0.5) pendingSeek = 0;
  });
  audio.addEventListener('timeupdate', function () {
    updateTime();
    var now = Date.now();
    if (now - lastSave > 1000) { lastSave = now; save(); }
  });
  audio.addEventListener('ended', function () {
    if (mode === 'one') { audio.currentTime = 0; play(); }
    else next();
  });
  audio.addEventListener('error', function () {
    if (!audio.src) return;
    el.items[cur] && el.items[cur].classList.add('is-broken');
    errorRun++;
    hint('파일을 찾을 수 없습니다');
    if (intendPlay && errorRun < N && !userPaused) {
      setTimeout(function () { load(cur + 1, true); }, 1200);
    }
  });

  /* ---------- 버튼 이벤트 ---------- */
  el.play.addEventListener('click', toggle);
  el.next.addEventListener('click', next);
  el.prev.addEventListener('click', prev);
  el.mode.addEventListener('click', function () {
    mode = MODE_ORDER[(MODE_ORDER.indexOf(mode) + 1) % MODE_ORDER.length];
    render(); save();
  });
  el.listBtn.addEventListener('click', function () { toggleList(); });
  el.close.addEventListener('click', closePlayer);
  reopen.addEventListener('click', function () { openPlayer(true); });
  el.items.forEach(function (b) {
    b.addEventListener('click', function () {
      var i = +b.getAttribute('data-i');
      userPaused = false;
      if (i === cur) { if (audio.paused) play(); }
      else load(i, true);
    });
  });

  el.seek.addEventListener('input', function () {
    seeking = true;
    var r = el.seek.value / 1000;
    setPct(el.seek, r);
    if (isFinite(audio.duration)) el.cur.textContent = fmt(r * audio.duration);
  });
  el.seek.addEventListener('change', function () {
    var r = el.seek.value / 1000;
    pendingSeek = 0;
    if (isFinite(audio.duration)) audio.currentTime = r * audio.duration;
    seeking = false;
    save();
  });

  var lastVol = 0.8;
  function setVolume(v) {
    v = Math.max(0, Math.min(1, v));
    audio.volume = v;
    audio.muted = v === 0;
    el.vol.value = Math.round(v * 100);
    setPct(el.vol, v);
    if (v > 0) lastVol = v;
    storeL(VKEY, v);
    render();
  }
  el.vol.addEventListener('input', function () { setVolume(el.vol.value / 100); });
  el.mute.addEventListener('click', function () {
    setVolume(audio.volume > 0 && !audio.muted ? 0 : (lastVol || 0.8));
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !el.list.hidden) toggleList(false);
  });
  document.addEventListener('click', function (e) {
    if (!el.list.hidden && !root.contains(e.target)) toggleList(false);
  });

  /* ---------- 운영체제 미디어 키 / 잠금화면 ---------- */
  function setMediaSession() {
    if (!('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: TRACKS[cur].title, artist: 'ELDAR ARCHIVE', album: '엘다르 이야기'
      });
    } catch (e) {}
  }
  if ('mediaSession' in navigator) {
    var ms = navigator.mediaSession;
    try {
      ms.setActionHandler('play', function () { userPaused = false; play(); });
      ms.setActionHandler('pause', function () { userPaused = true; intendPlay = false; audio.pause(); });
      ms.setActionHandler('previoustrack', prev);
      ms.setActionHandler('nexttrack', next);
    } catch (e) {}
  }

  function freeze() { save(); frozen = true; }
  window.addEventListener('beforeunload', freeze);
  window.addEventListener('pagehide', freeze);
  window.addEventListener('pageshow', function (e) { if (e.persisted) frozen = false; });

  /* =====================================================
     페이지 이동 시 음악 유지 (본문만 교체)
     ===================================================== */
  var cache = {};
  var navigating = false;
  var canSeamless = CONFIG.seamlessNavigation && location.protocol !== 'file:' &&
    'pushState' in history && typeof DOMParser !== 'undefined' && typeof fetch === 'function';

  function pageKey(u) { var x = new URL(u, location.href); x.hash = ''; return x.href; }

  function linkTarget(e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.closest('[data-mp]')) return null;
    if ((a.target && a.target !== '_self') || a.hasAttribute('download') || a.getAttribute('data-no-seamless') !== null) return null;
    var u = new URL(a.getAttribute('href'), location.href);
    if (u.origin !== location.origin) return null;
    if (!/(\.html?|\/)$/i.test(u.pathname)) return null;
    return u;
  }

  function fetchPage(url) {
    var k = pageKey(url);
    if (!cache[k]) {
      cache[k] = fetch(k, { credentials: 'same-origin' }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        var type = r.headers.get('content-type') || '';
        if (type && type.indexOf('html') === -1) throw new Error('not html');
        return r.text();
      });
      cache[k].catch(function () { delete cache[k]; });
    }
    return cache[k];
  }

  function syncStylesheets(doc, url) {
    var want = [].map.call(doc.head.querySelectorAll('link[rel~="stylesheet"]'), function (l) {
      return new URL(l.getAttribute('href'), url).href;
    });
    var have = [].slice.call(document.head.querySelectorAll('link[rel~="stylesheet"]'));
    var waits = [];
    want.forEach(function (h) {
      if (!have.some(function (l) { return l.href === h; })) {
        var l = document.createElement('link');
        l.rel = 'stylesheet'; l.href = h;
        waits.push(new Promise(function (r) { l.onload = l.onerror = r; setTimeout(r, 3000); }));
        document.head.appendChild(l);
      }
    });
    return Promise.all(waits).then(function () {
      have.forEach(function (l) {
        if (!l.hasAttribute('data-mp') && want.indexOf(l.href) === -1 && !/music-player\.css/.test(l.href)) l.remove();
      });
    });
  }

  function swapPage(doc) {
    // <head>: 제목, 설명, 페이지 전용 <style>
    document.title = doc.title;
    var d1 = document.head.querySelector('meta[name="description"]');
    var d2 = doc.head.querySelector('meta[name="description"]');
    if (d1 && d2) d1.setAttribute('content', d2.getAttribute('content') || '');
    [].forEach.call(document.head.querySelectorAll('style:not([data-mp])'), function (s) { s.remove(); });
    [].forEach.call(doc.head.querySelectorAll('style'), function (s) {
      document.head.appendChild(document.importNode(s, true));
    });

    // <body>: 플레이어만 남기고 교체
    var body = document.body;
    body.className = doc.body.className;
    if (doc.body.getAttribute('style')) body.setAttribute('style', doc.body.getAttribute('style'));
    else body.removeAttribute('style');
    [].slice.call(body.childNodes).forEach(function (n) {
      if (!(n.nodeType === 1 && n.hasAttribute('data-mp'))) body.removeChild(n);
    });
    var frag = document.createDocumentFragment();
    [].slice.call(doc.body.childNodes).forEach(function (n) { frag.appendChild(document.importNode(n, true)); });
    body.insertBefore(frag, body.firstChild);

    // 새 본문의 스크립트 실행
    [].forEach.call(body.querySelectorAll('script'), function (old) {
      if (old.closest('[data-mp]')) return;
      if (/music-player\.js/.test(old.getAttribute('src') || '')) { old.remove(); return; }
      var s = document.createElement('script');
      [].forEach.call(old.attributes, function (a) { s.setAttribute(a.name, a.value); });
      s.textContent = old.textContent;
      old.parentNode.replaceChild(s, old);
    });
  }

  function scrollAfter(u, y) {
    var html = document.documentElement;
    var prevBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    if (typeof y === 'number') window.scrollTo(0, y);
    else if (u.hash) {
      var t = document.getElementById(decodeURIComponent(u.hash.slice(1)));
      if (t) t.scrollIntoView(); else window.scrollTo(0, 0);
    } else window.scrollTo(0, 0);
    html.style.scrollBehavior = prevBehavior;
  }

  function navigate(href, opts) {
    opts = opts || {};
    var u = new URL(href, location.href);
    if (navigating) return;
    navigating = true;
    var html = document.documentElement;
    html.classList.remove('mp-loaded');
    html.classList.add('mp-loading');
    fetchPage(u.href).then(function (text) {
      var doc = new DOMParser().parseFromString(text, 'text/html');
      return syncStylesheets(doc, u.href).then(function () {
        if (opts.push) {
          try { history.replaceState({ mp: 1, y: window.scrollY }, '', location.href); } catch (e) {}
          history.pushState({ mp: 1, y: 0 }, '', u.href);
        }
        toggleList(false);
        swapPage(doc);
        scrollAfter(u, opts.y);
        document.dispatchEvent(new CustomEvent('eldar:pagechange', { detail: { url: u.href } }));
      });
    }).catch(function () {
      location.href = u.href; // 실패하면 일반 이동 (음악은 이어서 재생)
    }).then(function () {
      navigating = false;
      html.classList.remove('mp-loading');
      html.classList.add('mp-loaded');
      setTimeout(function () { html.classList.remove('mp-loaded'); }, 700);
    });
  }

  if (canSeamless) {
    try { history.scrollRestoration = 'manual'; } catch (e) {}
    try { history.replaceState({ mp: 1, y: window.scrollY }, '', location.href); } catch (e) {}

    document.addEventListener('click', function (e) {
      var u = linkTarget(e);
      if (!u) return;
      var samePage = u.pathname === location.pathname && u.search === location.search;
      if (samePage && u.hash) return;               // 같은 페이지 안의 #이동은 브라우저 기본 동작
      e.preventDefault();
      if (samePage) { scrollAfter(u); return; }      // 지금 보고 있는 페이지 링크 → 맨 위로
      navigate(u.href, { push: true });
    });

    // 링크에 마우스를 올리면 미리 불러와서 이동을 빠르게
    function warm(e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.closest('[data-mp]')) return;
      var u = new URL(a.getAttribute('href'), location.href);
      if (u.origin === location.origin && /(\.html?|\/)$/i.test(u.pathname) && pageKey(u.href) !== pageKey(location.href)) {
        fetchPage(u.href).catch(function () {});
      }
    }
    document.addEventListener('mouseover', warm, { passive: true });
    document.addEventListener('touchstart', warm, { passive: true });

    window.addEventListener('popstate', function (e) {
      var y = e.state && typeof e.state.y === 'number' ? e.state.y : undefined;
      navigate(location.href, { push: false, y: y });
    });
    window.addEventListener('scroll', function () {
      clearTimeout(window.__mpScrollT);
      window.__mpScrollT = setTimeout(function () {
        try { history.replaceState({ mp: 1, y: window.scrollY }, '', location.href); } catch (e) {}
      }, 150);
    }, { passive: true });
  }

  /* ---------- 시작 ---------- */
  function mount() {
    document.body.appendChild(loadbar);
    document.body.appendChild(root);
    document.body.appendChild(reopen);

    var savedVol = parseFloat(readL(VKEY));
    setVolume(isFinite(savedVol) ? savedVol : 0.8);

    var st = read(KEY);
    if (st && typeof st.i === 'number') {
      mode = MODES[st.mode] ? st.mode : 'all';
      closed = !!st.closed;
      userPaused = !!st.userPaused;
      cur = Math.max(0, Math.min(N - 1, st.i));
      pendingSeek = st.t || 0;
      load(cur, false);
      pendingSeek = st.t || 0;
      if (closed) { root.hidden = true; reopen.hidden = false; }
      else {
        document.documentElement.classList.add('mp-on');
        if (!userPaused) play();   // 직접 멈춘 게 아니면 이어서 재생 (막히면 첫 클릭 때)
      }
    } else {
      document.documentElement.classList.add('mp-on');
      load(MAIN, false);
      if (CONFIG.startOnFirstInteraction) play(); // 막히면 첫 클릭 때 재생
    }
    render();
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);

  // 다른 스크립트에서 쓸 수 있도록 (선택)
  window.EldarPlayer = {
    play: function () { userPaused = false; play(); },
    pause: function () { userPaused = true; intendPlay = false; audio.pause(); },
    next: next, prev: prev,
    playTrack: function (i) { userPaused = false; load(i, true); },
    navigate: function (href) { canSeamless ? navigate(href, { push: true }) : (location.href = href); }
  };
})();
