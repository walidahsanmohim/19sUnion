
    (function () {
      window.themeInk  = function () { return '#0f172a'; };
      window.themeGrid = function () { return 'rgba(148,163,184,0.12)'; };
      window.themeTick = function () { return '#cbd5e1'; };
      window.applyChartTheme = function () {
        if (typeof Chart === 'undefined') return;
        Chart.defaults.color = window.themeTick();
        Chart.defaults.borderColor = window.themeGrid();
      };
      try { window.applyChartTheme(); } catch (e) {}
    })();
  