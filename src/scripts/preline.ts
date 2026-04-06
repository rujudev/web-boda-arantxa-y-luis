import $ from 'jquery';
import _ from 'lodash';

window.$ = $;
window.jQuery = $;
window._ = _;

async function initPreline() {
  try {
    await import('preline');
    window.HSStaticMethods?.autoInit();
  } catch (e) {
    console.warn('[preline] initialization error:', e);
  }
}

if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', initPreline);
else initPreline();

document.addEventListener('astro:page-load', initPreline);
