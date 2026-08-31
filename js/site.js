// 导航：顶部透明，滚动后浮现暖白背景
window.addEventListener('scroll', function () {
  var nav = document.querySelector('.nav');
  if (window.scrollY > 40) {
    nav.classList.add('nav-solid');
  } else {
    nav.classList.remove('nav-solid');
  }
});

// hero 文字动画：等页面完全加载后再播放，避免网络慢时动画在后台播完
// 4 秒兜底：即使资源没加载完也触发，防止文字一直隐藏
function playHeroAnim() {
  document.documentElement.classList.remove('pre-anim');
}
window.addEventListener('load', playHeroAnim);
setTimeout(playHeroAnim, 4000);
