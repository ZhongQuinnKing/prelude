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
document.addEventListener('DOMContentLoaded', playHeroAnim);
setTimeout(playHeroAnim, 800);

// 页脚人气计数：全部本地推算，不发任何网络请求，不依赖第三方服务
// 数字随日期平滑增长，同一时刻打开的人看到同一个值
// 要调数字只改下面三行：BASE 是上线当天的起点，RATE 控制每天涨多少
(function () {
  var el = document.getElementById('site-visits');
  if (!el) return;

  var BASE = 1283946;                 // 上线当天的底数
  var LAUNCH = Date.UTC(2026, 7, 20); // 上线日 2026-08-20
  var RATE = 800;                     // 每天基础增量，实际在 1 到 3 倍之间浮动

  // 由日序号推导的伪随机，保证可复现：谁打开都算得出同一个数
  function wobble(n) {
    return Math.abs(Math.sin(n * 12.9898) * 43758.5453) % 1;
  }
  function dayRate(day) {
    return RATE + Math.floor(wobble(day) * RATE * 2);
  }

  var elapsed = new Date().getTime() - LAUNCH;
  if (elapsed < 0) elapsed = 0;

  var days = Math.floor(elapsed / 86400000);
  if (days > 20000) days = 20000; // 设备时间离谱时兜底，防止空转

  var total = BASE;
  for (var i = 0; i < days; i++) total += dayRate(i);
  // 当天按分钟往上爬，看着像有人陆续进来
  total += Math.floor(dayRate(days) * ((elapsed % 86400000) / 86400000));

  el.textContent = String(total).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
})();
