// 导航：顶部透明，滚动后浮现暖白背景
window.addEventListener('scroll', function () {
  var nav = document.querySelector('.nav');
  if (window.scrollY > 40) {
    nav.classList.add('nav-solid');
  } else {
    nav.classList.remove('nav-solid');
  }
});

// hero 文字动画：DOM 解析完立即播放，不等图片下载（慢网不卡不延迟）
// 800ms 兜底：即使 DOMContentLoaded 异常未触发也开播，防止文字一直隐藏
function playHeroAnim() {
  document.documentElement.classList.remove('pre-anim');
}

// 人气计数：全部本地推算，不发任何网络请求，不依赖第三方服务
// 数字随日期平滑增长，同一时刻打开的人看到同一个值
// 要调数字只改下面三行：BASE 是上线当天的起点，RATE 控制每天涨多少
var VISIT_BASE = 1283946;                 // 上线当天的底数
var VISIT_LAUNCH = Date.UTC(2026, 7, 20); // 上线日 2026-08-20
var VISIT_RATE = 800;                     // 每天基础增量，实际在 1 到 3 倍之间浮动

function preludeVisits() {
  // 由日序号推导的伪随机，保证可复现：谁打开都算得出同一个数
  function wobble(n) {
    return Math.abs(Math.sin(n * 12.9898) * 43758.5453) % 1;
  }
  function dayRate(day) {
    return VISIT_RATE + Math.floor(wobble(day) * VISIT_RATE * 2);
  }

  var elapsed = new Date().getTime() - VISIT_LAUNCH;
  if (elapsed < 0) elapsed = 0;

  var days = Math.floor(elapsed / 86400000);
  if (days > 20000) days = 20000; // 设备时间离谱时兜底，防止空转

  var total = VISIT_BASE;
  for (var i = 0; i < days; i++) total += dayRate(i);
  // 当天按分钟往上爬，看着像有人陆续进来
  total += Math.floor(dayRate(days) * ((elapsed % 86400000) / 86400000));
  return total;
}

(function () {
  var text = String(preludeVisits()).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  var ids = ['site-visits', 'splash-visits'];
  for (var i = 0; i < ids.length; i++) {
    var el = document.getElementById(ids[i]);
    if (el) el.textContent = text;
  }
})();

// 开场加载页：等本页的图就绪再放行，帘子拉开时把 hero 动画一起开闸
// 三重保险：图片加载失败也计数、4.2 秒硬超时、样式里还有 7 秒兜底动画
(function () {
  var splash = document.getElementById('splash');
  var skipped = document.documentElement.className.indexOf('splash-skip') !== -1;
  var MAX_MS = 4200;  // 硬超时，网再慢也放行

  // hero 文字的最终兜底：不管下面走哪条路，文字都不会永久藏着
  setTimeout(playHeroAnim, MAX_MS + 2200);

  // 本次会话已看过加载页，或者这页根本没有加载页：hero 动画照常立即播
  if (!splash || skipped) {
    document.addEventListener('DOMContentLoaded', playHeroAnim);
    setTimeout(playHeroAnim, 800);
    return;
  }

  var fill = document.getElementById('splash-score-fill');
  var released = false;
  var quoter = null;

  // 要等的图：本页所有 img，外加 head 里 preload 的首屏背景图（它不进 document.images）
  var watched = [];
  var i;
  for (i = 0; i < document.images.length; i++) watched.push(document.images[i]);
  var pre = document.querySelectorAll('link[rel="preload"][as="image"]');
  for (i = 0; i < pre.length; i++) {
    var probe = new Image();
    probe.src = pre[i].href;
    watched.push(probe);
  }

  var total = watched.length || 1;
  var loaded = 0;

  // 进度就是真实加载比例，不掺任何时间成分
  function paint() {
    if (!fill || released) return;
    fill.style.transform = 'scaleX(' + (loaded / total) + ')';
  }

  function release() {
    if (released) return;
    released = true;
    if (quoter) clearInterval(quoter);
    if (fill) fill.style.transform = 'scaleX(1)';
    try { sessionStorage.setItem('prelude-splash', '1'); } catch (e) {}
    setTimeout(function () {
      playHeroAnim();               // 帘子拉开的同时，首页文字浮现
      splash.className = 'splash is-done';
      setTimeout(function () {
        if (splash.parentNode) splash.parentNode.removeChild(splash);
      }, 900);
    }, 260);
  }

  function one() {
    loaded++;
    paint();
    if (!released && loaded >= total) release();  // 全部到齐就立刻走
  }

  for (i = 0; i < watched.length; i++) {
    if (watched[i].complete) {
      loaded++;
    } else {
      watched[i].addEventListener('load', one);
      watched[i].addEventListener('error', one);  // 失败也算数，不能卡在这
    }
  }

  // 名言轮播：随机起点，隔几秒换一条
  var quotes = splash.querySelectorAll('.splash-quote');
  var qi = 0;
  if (quotes.length) {
    qi = Math.floor(Math.random() * quotes.length);
    quotes[qi].className = 'splash-quote is-on';
    if (quotes.length > 1) {
      quoter = setInterval(function () {
        quotes[qi].className = 'splash-quote';
        qi = (qi + 1) % quotes.length;
        quotes[qi].className = 'splash-quote is-on';
      }, 2200);
    }
  }

  paint();
  // 图片全在缓存里时一个 load 事件都不会来，这里直接放行
  if (loaded >= total) setTimeout(release, 0);
  // 硬超时：万一有图一直卡着也放行，剩下的边进边加载，不能把人晾在这
  setTimeout(release, MAX_MS);
})();
