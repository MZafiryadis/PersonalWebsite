document.querySelectorAll('[data-print]').forEach(button => {
  button.addEventListener('click', () => window.print());
});

(() => {
  const measurementId = 'G-FSP3QVE44X';
  const storageKey = 'analytics-consent-v1';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  let started = false;
  let preference = null;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && saved.expires > Date.now() && ['accepted', 'declined'].includes(saved.value)) {
      preference = saved.value;
    }
  } catch (_) { /* Keep analytics off when storage is unavailable. */ }

  const panel = document.createElement('section');
  panel.className = 'analytics-consent';
  panel.setAttribute('aria-labelledby', 'analytics-title');
  panel.innerHTML = `<div class="wrap"><h2 id="analytics-title">Website analytics</h2>
    <p>May I use Google Analytics to understand visits to this website? If you accept, Google receives usage data and stores analytics cookies in your browser. You can decline and still use the whole site. Your choice is remembered for six months and can be changed using Analytics settings in the footer. <a href="https://policies.google.com/privacy">Google’s privacy policy</a>.</p>
    <div class="consent-actions"><button class="button" type="button" data-consent="accepted">Accept analytics</button><button class="button" type="button" data-consent="declined">Decline analytics</button></div></div>`;
  document.body.appendChild(panel);
  const settings = document.createElement('button');
  settings.type = 'button';
  settings.className = 'analytics-settings';
  settings.textContent = 'Analytics settings';
  document.querySelector('.footer-links').appendChild(settings);
  settings.addEventListener('click', () => {
    panel.hidden = false;
    panel.querySelector('button').focus();
  });

  function startAnalytics() {
    if (started) return;
    started = true;
    window['ga-disable-' + measurementId] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      allow_google_signals: false, allow_ad_personalization_signals: false,
      cookie_expires: lifetime / 1000, cookie_update: false
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.appendChild(script);
  }

  function stopAnalytics() {
    window['ga-disable-' + measurementId] = true;
    // Remove GA cookies at the host and parent-domain scopes used by gtag.
    const domains = location.hostname.split('.');
    const scopes = [''];
    for (let i = 0; i < domains.length; i++) {
      scopes.push('; domain=' + domains.slice(i).join('.'));
    }
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (name === '_ga' || name.startsWith('_ga_')) {
        scopes.forEach(scope => {
          document.cookie = name + '=; Max-Age=0; path=/' + scope;
        });
      }
    });
  }

  panel.querySelectorAll('[data-consent]').forEach(button => {
    button.addEventListener('click', () => {
      preference = button.dataset.consent;
      try {
        localStorage.setItem(storageKey, JSON.stringify({ value: preference, expires: Date.now() + lifetime }));
      } catch (_) { /* The choice still applies to this page. */ }
      panel.hidden = true;
      settings.focus();
      if (preference === 'accepted') {
        startAnalytics();
      } else {
        stopAnalytics();
        // Unload the already-running Google tag after withdrawal.
        if (started) location.reload();
      }
    });
  });
  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) location.reload();
  });
  panel.hidden = preference !== null;
  if (preference === 'accepted') startAnalytics();
  else stopAnalytics();
})();
