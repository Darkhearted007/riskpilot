/**
 * Marketing & Tracking Engine
 * Handles Meta Pixel events and UTM attribution for scaling.
 */

export const Pixel = {
  // Replace with actual ID later
  id: 'PLACEHOLDER',

  init(pixelId) {
    if (!pixelId || pixelId === 'PLACEHOLDER') return;
    this.id = pixelId;
    
    // Inject Meta Pixel Base Code if not present
    if (!window.fbq) {
      !(function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      window.fbq('init', this.id);
      window.fbq('track', 'PageView');
    }
  },

  track(event, params = {}) {
    if (window.fbq) {
      window.fbq('track', event, params);
      console.log(`[Marketing] Tracked ${event}`, params);
    }
  },

  trackPurchase(amount, currency = 'USD') {
    this.track('Purchase', {
      value: amount,
      currency: currency,
    });
  },

  trackLead() {
    this.track('CompleteRegistration');
  },

  trackInitiateCheckout(planName) {
    this.track('InitiateCheckout', { content_name: planName });
  }
};

/**
 * UTM Tracker
 * Captures source for scaling analytics (FB, Telegram, TradingView)
 */
export const getAttribution = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get('utm_source') || 'organic',
    medium: params.get('utm_medium') || 'internal',
    campaign: params.get('utm_campaign') || 'none',
  };
};
