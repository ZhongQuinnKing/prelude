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
