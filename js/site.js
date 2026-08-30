// 导航：顶部透明，滚动后浮现暖白背景
window.addEventListener('scroll', function () {
  var nav = document.querySelector('.nav');
  if (window.scrollY > 40) {
    nav.classList.add('nav-solid');
  } else {
    nav.classList.remove('nav-solid');
  }
});
