
        // Copy-to-clipboard for payment numbers (with file:// fallback)
        (function () {
          function copyText(text) {
            if (navigator.clipboard && window.isSecureContext) {
              return navigator.clipboard.writeText(text);
            }
            return new Promise(function (resolve, reject) {
              var ta = document.createElement('textarea');
              ta.value = text;
              ta.style.position = 'fixed';
              ta.style.opacity = '0';
              document.body.appendChild(ta);
              ta.select();
              try { if (document.execCommand('copy')) { resolve(); } else { reject(); } }
              catch (e) { reject(e); }
              finally { document.body.removeChild(ta); }
            });
          }
          document.querySelectorAll('.pay-number').forEach(function (btn) {
            btn.addEventListener('click', function () {
              if (btn.classList.contains('copied')) return;
              var icon = btn.querySelector('i');
              var oldClass = icon.className;
              copyText(btn.getAttribute('data-copy')).then(function () {
                btn.classList.add('copied');
                icon.className = 'fa-solid fa-check';
                setTimeout(function () {
                  btn.classList.remove('copied');
                  icon.className = oldClass;
                }, 1600);
              }).catch(function () {});
            });
          });
        })();
      