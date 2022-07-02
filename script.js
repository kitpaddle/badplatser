let viewport_width = document.documentElement.clientWidth;
let viewport_height = document.documentElement.clientHeight;
document.getElementById('main').style.width = viewport_width+'px';
document.getElementById('main').style.height = viewport_height+'px';

// Add listener to resize when window resizes.
window.addEventListener('resize', function(event) {
  viewport_width = document.documentElement.clientWidth;
  viewport_height = document.documentElement.clientHeight;
  document.getElementById('main').style.width = viewport_width+'px';
  document.getElementById('main').style.height = viewport_height+'px';
  document.getElementById('tooltip').style.height = viewport_height-80+'px';
}, true);
