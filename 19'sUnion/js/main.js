

// ===== ACCURATE HIJRI (UMM AL-QURA) CALENDAR VIA INTL API =====
    // Intl.DateTimeFormat with the 'islamic-umalqura' calendar gives the
    // authoritative, real-world Islamic date used across Saudi-Arabia & most
    // of the world (fixes the wrong-month issue of the previous tabular math).
    const hijriMonthNamesEn = [
      "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
      "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
      "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
    ];

    const hijriDayNamesEn = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];

    // Build once (reused every second without re-creating the formatter)
    const hijriFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    const gregFormatter = new Intl.DateTimeFormat('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });

    // Extract the correct Hijri day / month / year from the formatted string
    function getHijriDate(date) {
      const parts = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
        day: 'numeric', month: 'numeric', year: 'numeric'
      }).formatToParts(date);

      let day = 0, month = 0, year = 0;
      parts.forEach(p => {
        if (p.type === 'day') day = parseInt(p.value, 10);
        if (p.type === 'month') month = parseInt(p.value, 10);
        if (p.type === 'year') year = parseInt(p.value, 10);
      });
      return { day, month, year };
    }

// Bangla Digit Conversion Utility (kept for the Bangla calendar row)
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    function toBanglaNumerals(num) {
      return num.toString().replace(/\d/g, digit => banglaDigits[parseInt(digit)]);
    }

    // Bangla Calendar Calculation Algorithm
    function getBanglaDate(date) {
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();

      const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

      const banglaMonths = [
        "বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", 
        "ভাদ্র", "আশ্বিন", "কার্তিক", "অগ্রহায়ণ", 
        "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র"
      ];

      let bYear = month < 3 || (month === 3 && day < 14) ? year - 594 : year - 593;
      let bMonth, bDay;

      if (month === 3) {
        if (day >= 14) { bMonth = 0; bDay = day - 13; }
        else { bMonth = 11; bDay = day + 17; }
      } else if (month === 4) {
        if (day >= 15) { bMonth = 1; bDay = day - 14; }
        else { bMonth = 0; bDay = day + 17; }
      } else if (month === 5) {
        if (day >= 15) { bMonth = 2; bDay = day - 14; }
        else { bMonth = 1; bDay = day + 17; }
      } else if (month === 6) {
        if (day >= 16) { bMonth = 3; bDay = day - 15; }
        else { bMonth = 2; bDay = day + 16; }
      } else if (month === 7) {
        if (day >= 17) { bMonth = 4; bDay = day - 16; }
        else { bMonth = 3; bDay = day + 15; }
      } else if (month === 8) {
        if (day >= 17) { bMonth = 5; bDay = day - 16; }
        else { bMonth = 4; bDay = day + 15; }
      } else if (month === 9) {
        if (day >= 18) { bMonth = 6; bDay = day - 17; }
        else { bMonth = 5; bDay = day + 15; }
      } else if (month === 10) {
        if (day >= 17) { bMonth = 7; bDay = day - 16; }
        else { bMonth = 6; bDay = day + 14; }
      } else if (month === 11) {
        if (day >= 16) { bMonth = 8; bDay = day - 15; }
        else { bMonth = 7; bDay = day + 15; }
      } else if (month === 0) {
        if (day >= 15) { bMonth = 9; bDay = day - 14; }
        else { bMonth = 8; bDay = day + 16; }
      } else if (month === 1) {
        if (day >= 14) { bMonth = 10; bDay = day - 13; }
        else { bMonth = 9; bDay = day + 17; }
      } else if (month === 2) {
        const leapOffset = isLeapYear ? 1 : 0;
        if (day >= (15 - leapOffset)) { bMonth = 11; bDay = day - (14 - leapOffset); }
        else { bMonth = 10; bDay = day + 15; }
      }

return `${toBanglaNumerals(bDay)}${banglaMonths[bMonth]}, ${toBanglaNumerals(bYear)}`;
    }

// Real-Time Update Controller
    function updateClock() {
      const now = new Date();

      // 1. Digital Clock Time — English digits
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedHours = String(hours).padStart(2, '0');

      document.getElementById('clock-time').textContent = `${formattedHours}:${minutes}:${seconds} `;
      document.getElementById('ampm').textContent = ampm;

      // 2. English (Gregorian) Calendar — all English text & digits
      const gregDate = gregFormatter.format(now);
      document.getElementById('gregorian-date').textContent = gregDate;

      // 3. Hijri (Umm al-Qura) Calendar — accurate & all English text
      const hijri = getHijriDate(now);
      const hijriMonthName = hijriMonthNamesEn[hijri.month - 1];
      const englishHijriFormatted = `${hijri.day} ${hijriMonthName} ${hijri.year} AH`;
      document.getElementById('hijri-english').textContent = englishHijriFormatted;

      // English Hijri day name
      document.getElementById('arabic-day').textContent = hijriDayNamesEn[now.getDay()];

      // 4. Bangla Date Calculation (unchanged — Bangla numerals & names)
      const banglaDays = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
      document.getElementById('bangla-date').textContent = getBanglaDate(now);
      document.getElementById('bangla-day').textContent = banglaDays[now.getDay()];
    }

    // Initialize and run interval
    updateClock();
    setInterval(updateClock, 1000);

// 1. Page Switch Logic (4 Pages) — with smooth exit & enter transition
    function switchPage(pageId) {
      // Remember the last-visited page so a refresh can return to it
      try { localStorage.setItem('unionLastPage', pageId); } catch (err) { /* storage unavailable - ignore */ }

      const current = document.querySelector('.page-content.active');
      const target = document.getElementById(`page-${pageId}`);

      // If clicking the currently active page, just scroll to top / no-op
      if (current === target) {
        window.scrollTo(0, 0);
        return;
      }

      // Update nav highlight + slide the dock indicator
      document.querySelectorAll('.nav-btn').forEach(btn => { btn.classList.remove('active-link'); btn.removeAttribute('aria-current'); });
      const navBtn = document.getElementById(`nav-${pageId}`);
      if (navBtn) { navBtn.classList.add('active-link'); navBtn.setAttribute('aria-current', 'page'); }
      if (typeof window.moveDockIndicator === 'function') window.moveDockIndicator();
const finishTransition = () => {
        // Deactivate all pages
        document.querySelectorAll('.page-content').forEach(page => {
          page.classList.remove('active', 'leaving');
        });
        // Activate the target page (plays pageEnter animation)
        target.classList.add('active');
        // Scroll to top
        window.scrollTo(0, 0);

        // If the Accounts page just became visible, re-render charts at correct size
        if (pageId === 'accounts' && typeof window.refreshAccountsCharts === 'function') {
          setTimeout(() => window.refreshAccountsCharts(), 80);
        }

        };

      if (current) {
        // Play the exit animation first, then swap pages
        current.classList.add('leaving');
        current.addEventListener('animationend', function handler(e) {
          if (e.animationName === 'pageExit') {
            current.removeEventListener('animationend', handler);
            finishTransition();
          }
        });
      } else {
        finishTransition();
      }
    }

    // ============================================================
// DOCK INDICATOR - slides the pill under the active nav item
// ============================================================
    window.moveDockIndicator = function () {
      var wrap = document.getElementById('dock-items');
      var ind = document.getElementById('dock-indicator');
      if (!wrap || !ind) return;
      var active = wrap.querySelector('.nav-btn.active-link');
      if (!active) { ind.style.opacity = '0'; return; }
      ind.style.opacity = '1';
      ind.style.width = active.offsetWidth + 'px';
      ind.style.transform = 'translateX(' + active.offsetLeft + 'px)';
    };
    window.addEventListener('resize', window.moveDockIndicator);
    window.addEventListener('load', window.moveDockIndicator);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { window.moveDockIndicator(); });
    }
    setTimeout(window.moveDockIndicator, 80);
// ============================================================
    // 2. Unlimited Typing Animation for the Motto (Infinite Loop)
    // ============================================================
    (function initTypewriter() {
      const el = document.getElementById('typewriter-text');
      if (!el) return;

      // Unlimited motto phrases to cycle through
      const phrases = [
        '"United Today, Stronger Tomorrow"',
        '"Building Trust, Securing Futures"',
        '"Together We Grow, Together We Prosper"',
        '"Discipline • Savings • Unity"'
      ];

      let phraseIndex = 0;
      let charIndex = 0;
      let deleting = false;
const typeSpeed = 75;      // ms per character while typing
      const deleteSpeed = 40;    // ms per character while deleting
      const pauseEnd = 5000;     // keep the full text stable & readable for 5 seconds
      const pauseStart = 500;    // pause before typing the next phrase

      function type() {
        const current = phrases[phraseIndex];
        // Update displayed text based on current character index
        el.textContent = current.substring(0, charIndex);

        if (!deleting) {
          // Typing forward
          charIndex++;
          if (charIndex > current.length) {
            deleting = true;
            setTimeout(type, pauseEnd);
            return;
          }
          setTimeout(type, typeSpeed);
        } else {
          // Deleting backward
          charIndex--;
          if (charIndex < 0) {
            deleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length; // loop forever
            setTimeout(type, pauseStart);
            return;
          }
          setTimeout(type, deleteSpeed);
        }
      }

      type();
    })();

    
    function getDirectDriveLink(url) {
      if (!url) return "";

      if (url.includes("drive.google.com")) {
        const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          return `https://lh3.googleusercontent.com/d/${match[1]}`;
        }
      }
      return url; 
    }

    // XSS guard — escapes anything that goes into innerHTML templates.
    // Sheet data (member names, notes, etc.) must always pass through this.
    function escapeHtml(v) {
      return String(v === null || v === undefined ? '' : v)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // Only https: URLs are allowed in <img src> — blocks javascript:/data: URIs
    function safeImgSrc(url) {
      const u = String(url || '').trim();
      return /^https:\/\//i.test(u) ? escapeHtml(u) : '';
    }

    const membersData = [
      {
        photo: "https://drive.google.com/file/d/1AzzoTf-mtGGbcdM5fx8-UVGhkKOpi9wf/view?usp=drive_link", 
        name: "Mohammed Shaker Hossen",
        member_id: "M001",
        pass: "19sunion@Shaker",
        phone: "+880 1872-952812",
        email: "shakerhosen176@gmail.com",
        Mother: "Mina Begum",
        Father: "Mustafa Ahmed",
        NidBirth_No : "3769354584",
        nominee: "Burhan Uddin [Brother]",
        address: "Purba-Veruakhali para, 7no Ward Badarkhali,Matamuhuri,Cox's Bazar"
      },
      {
        photo: "https://drive.google.com/file/d/1ChX2ZMHGL_Op0jLxofSljKf5hP260Vg-/view?usp=drive_link", 
        name: "Abu Naim Bin Habib",
        member_id: "M002",
        pass: "19sunion@Naim",
        phone: "+880 1832-200627",
        email: "abunaimbinhabib2164@gmail.com",
        Mother: "Estafa khanam",
        Father: "Habibur Rahman",
        NidBirth_No : "20032211610036387 ",
        nominee: "Estafa khanam [Mother]",
        address: "Shariya para, 3no Ward Badarkhali, Matamuhuri,Cox's Bazar"
      },
      {
        photo: "https://drive.google.com/file/d/1B-Zrh3YdNBmXFDfvz-dcAfBTTwCskI-g/view?usp=drive_link", 
        name: "Mohammed Walid Ehasan",
        member_id: "M003",
        pass: "19sunion@Walid",
        phone: "+880 1611-835976",
        email: "walidahsanmohim@gmail.com",
        Mother: "Nasima Begum",
        Father: "Muslim Uddin",
        NidBirth_No : "1974157156",
        nominee: "Nasima Begum [Mother]",
        address: "Shariya para, 3no Ward, Badarkhali, Matamuhuri,Cox's Bazar"
      },
      {
        photo: "https://drive.google.com/file/d/14vyxQM6CQlr6yQaEucIkI2C-pKRfEamW/view?usp=drive_link", 
        name: "Sajjatul Islam",
        member_id: "M004",
        pass: "19sunion@Sajjad",
        phone: "+880 1891-695765",
        email: "sajjatul71@gmail.com",
        Mother: "Rabea Begum",
        Father: "Safikul Islam",
        NidBirth_No : "3310957495",
        nominee: "Rabea Begum [Mother]",
        address: "Ishak karbari Para,7no ward Alikodm.Bandarban"
      },
      {
        photo: "https://drive.google.com/file/d/1kJvOW6Lg2E4zxczpbjI0L_ECmj1PVplr/view?usp=drive_link", 
        name: "Atiqul Islam Noman",
        member_id: "M005",
        pass: "19sunion@Atiqul",
        phone: "+966 50 672 3783",
        email: "atikulislamnoman@gmail.com",
        Mother: "Saheda Begum",
        Father: "Nazir Ahmed",
        NidBirth_No : "2412391530",
        nominee: "Sarmin Akter [Sister]",
        address: "Tessi Para, 2no Ward Badarkali, Matamuhuri,Cox's Bazar"
      },
      {
        photo: "https://drive.google.com/file/d/1vSs4VvG6R8IjcmxkcUaJrrq2skNto5ap/view?usp=drive_link", 
        name: "Salah Uddin ",
        member_id: "M006",
        pass: "19sunion@Salah",
        phone: "+880 1880-959149",
        email: "mdsalah3062000@gmail.com",
        Mother: "Monuara Begum",
        Father: "Babu Miya",
        NidBirth_No : "8724604452",
        nominee: "Monuara Begum [Mother]",
        address: "Kuch Para,8no Ward Chiringa, Chakaria, Cox's Bazar"
      },
      {
        photo: "https://drive.google.com/file/d/1A9VRS5GRTCun4oACg_Pepx5SwYORBVJy/view?usp=drive_link", 
        name: "Mohammed Humayon Karim",
        member_id: "M007",
        pass: "19sunion@Humayun",
        phone: "+880 1837-577621",
        email: "mdhumayunkarim555666@gmail.com",
        Mother: "Shabekunnahar",
        Father: "Mohammed Iliyas",
        NidBirth_No : "1525881031",
        nominee: "Riduanul Hakim Rimon [Brother]",
        address: "Sanua Para, 9no Ward Badarkhali, Matamuhuri, Cox's Bazar"
      },
      {
        photo: "https://drive.google.com/file/d/1hXXvEbrRIuuJO0YXW8VdrNvZseostB7l/view?usp=drive_link", 
        name: "Shahed Mohammed Jala Uddin",
        member_id: "M008",
        pass: "19sunion@Shahed",
        phone: "+880 1921-407345",
        email: "walkershahed@gmail.com",
        Mother: "Nesera Begum",
        Father: "Fayez Ahmed",
        NidBirth_No : "4672432624",
        nominee: "Nesera Begum [Mother]",
        address: "Veruakhali Para, 7no Ward Badarkhali, Matamuhuri, Cox's Bazar"
      },
      {
        photo: "https://drive.google.com/file/d/1q-94yWQ0scc0d6MbTZD8eeqE_-muWZmO/view?usp=drive_link", 
        name: "Abdul Mannan",
        member_id: "M009",
        pass: "19sunion@Mannan",
        phone: "+971 54 795 2750",
        email: "mannanctg0214@gmail.com",
        Mother: "Joynab Ara",
        Father: "Golam Quader",
        NidBirth_No : "6923299603",
        nominee: "Joynab Ara [Mother]",
        address: "Sanua Para, 9no Ward Badarkhali, Matamuhuri,Cox's Bazar"
      },
      {
        photo: "https://drive.google.com/file/d/1QsZ6w51xXAr9jSuShYA2_csbykTNSbhz/view?usp=drive_link", 
        name: "Abdu Shukkur",
        member_id: "M010",
        pass: "19sunion@Sukkur",
        phone: "+966 50 386 2897",
        email: "abdushukkur903@gmail.com",
        Mother: "Lotfunnesa",
        Father: "Abul Bashar",
        NidBirth_No : "5574174768",
        nominee: "Mohammed Labib [Son]",
        address: " Sanua Para, 9no Ward Badarkhali, Matamuhuri, Cox's Bazar"
      },
      {
        photo: "https://drive.google.com/file/d/1SXCiYQ61yrB8jRsiwJAovId5bUUVDVDG/view?usp=drive_link", 
        name: "Muhammed Khukan",
        member_id: "M011",
        pass: "19sunion@Khukan",
        phone: "+966 55 317 3290",
        email: "mommadhossin785@gmail.com",
        Mother: "Rokeya Begum",
        Father: "Joynal Abedin",
        NidBirth_No : "2572076343",
        nominee: "Rokeya Begum [Mother]",
        address: "Kutob-Nogor Para, 3no Ward Badarkhali, Matamuhuri, Cox's Bazar"
      }
    ];

    // 🛠️ Member card generator + 🔐 PER-CARD PASS LOCK
    // ============================================================
    // The directory is ALWAYS VISIBLE to the public, but only as
    // photos + names (with member ID). Every other detail (phone,
    // email, parents, NID, nominee, address) stays locked on each
    // card behind that member's own pass entry field.
    // A pass typed into a card unlocks exactly that card.
    //
    // ⚠️ SECURITY NOTE: this is client-side gating. The passes and
    // member data still travel inside the HTML source and can be
    // read from "View Source". For TRUE privacy this check belongs
    // on a server (e.g. the Google Apps Script endpoint).
    // ============================================================

    const memberGrid = document.getElementById('member-grid');

    // Builds one card. Public sees photo + name + ID only — the card
    // always starts in the "locked" state (phone/email blurred,
    // full details hidden) until its dedicated pass is entered.
    function renderMemberCard(member, index) {
      const card = document.createElement('div');
      card.className = 'member-card locked';
      card.dataset.memberId = member.member_id;
      card.style.animationDelay = `${index * 0.05}s`;
      const photoUrl = safeImgSrc(getDirectDriveLink(member.photo));
      const imgContent = photoUrl ? `<img src="${photoUrl}" alt="${escapeHtml(member.name)}">` : `<i class="fa-solid fa-user"></i>`;

card.innerHTML = `
        <div class="member-img-box">${imgContent}</div>
        <div class="member-name">${escapeHtml(member.name)}</div>
        <div class="member-id-wrap"><span class="member_id">ID: ${escapeHtml(member.member_id)}</span></div>
        <span class="lock-tag"><i class="fa-solid fa-lock"></i> Pass Protected</span>

        <div class="primary-info">
          <div class="info-item"><i class="fa-solid fa-phone"></i> ${escapeHtml(member.phone)}</div>
          <div class="info-item"><i class="fa-solid fa-envelope"></i> ${escapeHtml(member.email)}</div>
        </div>

        <div class="full-details">
          <div class="fd-inner">
            <div class="detail-row"><span class="detail-label">Mother:</span><span class="detail-value">${escapeHtml(member.Mother)}</span></div>
            <div class="detail-row"><span class="detail-label">Father:</span><span class="detail-value">${escapeHtml(member.Father)}</span></div>
            <div class="detail-row"><span class="detail-label">NID/Birth Certificate No:</span><span class="detail-value">${escapeHtml(member.NidBirth_No)}</span></div>
            <div class="detail-row"><span class="detail-label">Nominee:</span><span class="detail-value">${escapeHtml(member.nominee)}</span></div>
            <div class="detail-row"><span class="detail-label">Address:</span><span class="detail-value">${escapeHtml(member.address)}</span></div>
          </div>
        </div>

        <div class="member-pass-row">
          <input type="password" class="member-pass-input" placeholder="Enter pass" autocomplete="off" spellcheck="false" onkeydown="if(event.key==='Enter'){event.preventDefault();unlockCardPass(this);}">
          <button type="button" class="member-unlock-btn" onclick="unlockCardPass(this)"><i class="fa-solid fa-lock-open"></i> Unlock</button>
        </div>
        <p class="member-pass-msg" role="status" aria-live="polite"></p>

        <button class="view-profile-btn details-toggle" onclick="toggleProfile(this)" style="display:none">
          <span>View Full Profile</span> <i class="fa-solid fa-chevron-down"></i>
        </button>
      `;
      memberGrid.appendChild(card);

      // If a member's Drive photo 404s (file not shared "Anyone with the link"),
      // swap the broken image for the styled user icon instead.
      const cardImg = card.querySelector('.member-img-box img');
      if (cardImg) {
        cardImg.onerror = function () {
          if (!this.nextElementSibling || this.nextElementSibling.className !== 'fa-solid fa-user') {
            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-user';
            this.replaceWith(icon);
          }
        };
      }
    }

    // Always render the full public directory — photos + names for everyone
    function renderMembers(list) {
      memberGrid.innerHTML = "";
      list.forEach((member, index) => renderMemberCard(member, index));
    }

    // Finds a member record by member_id (case-insensitive)
    function findMemberById(idValue) {
      const key = String(idValue || "").trim().toUpperCase();
      if (!key) return null;
      return membersData.find(m => String(m.member_id).trim().toUpperCase() === key) || null;
    }

    // Per-card feedback line (empty / wrong / correct pass)
    function setCardMsg(card, text, type) {
      const msg = card.querySelector('.member-pass-msg');
      if (!msg) return;
      msg.textContent = text || "";
      msg.dataset.type = type || "info";
    }

    // Unlock ONE member card by its member_id
    function unlockMemberCard(memberId) {
      const card = memberGrid.querySelector(`.member-card[data-member-id="${memberId}"]`);
      if (!card) return;
      card.classList.remove('locked');
      card.classList.add('member-unlocked', 'active');
      const tag = card.querySelector('.lock-tag');
      if (tag) tag.innerHTML = '<i class="fa-solid fa-lock-open"></i> Unlocked';
      const passRow = card.querySelector('.member-pass-row');
      if (passRow) passRow.style.display = 'none';
      setCardMsg(card, "");
      const toggleBtn = card.querySelector('.details-toggle');
      if (toggleBtn) toggleBtn.style.display = 'flex';
      const details = card.querySelector('.full-details');
      if (details) details.classList.add('open');
    }

    // Called from each card's unlock button or Enter key.
    // The pass typed into a card can only open that member's card.
    function unlockCardPass(buttonOrInput) {
      const card = buttonOrInput.closest('.member-card');
      const input = card.querySelector('.member-pass-input');
      const member = findMemberById(card.dataset.memberId);
      const pass = String(input.value || "").trim().toLowerCase();
      if (!pass) {
        setCardMsg(card, "Enter the pass.", "error");
        input.focus();
        return;
      }
      if (member && String(member.pass || "").trim().toLowerCase() === pass) {
        unlockMemberCard(member.member_id);
      } else {
        input.value = "";
        setCardMsg(card, "Incorrect pass.", "error");
        input.focus();
      }
    }

    // Kick off: everyone sees the public directory (photos + names) immediately
    renderMembers(membersData);

    // Manual-constant sync: member DIRECTORY count comes from membersData (live);
    // monthly ৳1,500 target + 2026–2030 duration are POLICY constants (not in the
    // sheet) — marked as MANUAL POLICY CONSTANT in Index.html; update by hand.
    (function syncMemberCounts() {
      const n = membersData.length;
      const stat = document.getElementById('memberCountStat');
      if (stat) stat.textContent = String(n);
      const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
      const bn = String(n).replace(/\d/g, d => bnDigits[Number(d)]);
      const badge = document.getElementById('memberCountBadge');
      if (badge) badge.textContent = 'সদস্য সংখ্যা - ' + bn + ' জন';
    })();

function toggleProfile(button) {
      const card = button.closest('.member-card');
      if (card.classList.contains('locked')) return;   // safety — button is hidden until unlocked
      const details = card.querySelector('.full-details');
      const span = button.querySelector('span');
      const isOpening = !details.classList.contains('open');

      details.classList.toggle('open');
      card.classList.toggle('active', isOpening);
      span.innerText = isOpening ? "Hide Profile" : "View Full Profile";
    }

// Reveal on scroll for rule boxes (IntersectionObserver)
(function initRuleReveal() {
  const targets = document.querySelectorAll('.rule-box');
  if (!('IntersectionObserver' in window) || targets.length === 0) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('rule-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  targets.forEach((t) => obs.observe(t));
})();

// ============================================================
    // 3. ACCOUNTS DASHBOARD — LIVE DATA FROM GOOGLE SHEETS API
    // ============================================================
    (function initAccounts() {
      // Only proceed if the accounts page element exists
      if (!document.getElementById('page-accounts')) return;

      const API_URL = "https://script.google.com/macros/s/AKfycby0Lg7YD5o-_bpxzZeF-YuSVXYvcDqiB3zc7AVulx_XTWFD0jndXgsAmW_rcJijUu-LCQ/exec";

      let currentStatusChartInstance = null;
      let advanceChartInstance = null;
      let investmentChartInstance = null;
      let profitChartInstance = null;
      let depositChartInstance = null;
      let paidTickerTimer = null;

      // Chart defaults for the green theme
      Chart.defaults.color = '#B7FF72';
      Chart.defaults.borderColor = 'rgba(183,255,114,0.14)';

      let cachedData = null;

      // ---- Performance: client-side cache + change detection ----
      let fetchInFlight = false;
      let lastSuccessAt = 0;
      let hasInitialData = false;
      let lastRenderedFingerprint = '';
      const CACHE_KEY = 'unionAccountsCache_v1';
      const CACHE_MAX_AGE = 10 * 60 * 1000; // accept a cache up to 10 minutes old

      // localStorage cache: instantly paint the dashboard on reload, then refresh
      // from Google Apps Script in the background so its latency is invisible.
      function readCache() {
        try {
          const raw = localStorage.getItem(CACHE_KEY);
          if (!raw) return null;
          const entry = JSON.parse(raw);
          if (!entry || !entry.data || !entry.savedAt) return null;
          if (Date.now() - entry.savedAt > CACHE_MAX_AGE) return null;
          return entry;
        } catch (err) { return null; } // private mode / storage blocked — fetch live instead
      }
      function writeCache(data) {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data }));
        } catch (err) { /* quota exceeded / storage blocked — ignore */ }
      }
      function dataFingerprint(data) {
        try { return JSON.stringify(data); } catch (err) { return ''; }
      }

      // Fades out the chart loading shimmer once charts are drawn (or known empty).
      function markAllChartsLoaded() {
        document.querySelectorAll('.chart-box').forEach(b => b.classList.add('is-loaded'));
      }

      // Shows a friendly empty note inside a chart box when a dataset has no rows.
      // Call with message=null to clear it before drawing a real chart.
      function setChartEmpty(canvasId, message) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const box = canvas.closest('.chart-box');
        if (!box) return;
        let note = box.querySelector('.chart-empty');
        if (!message) { if (note) note.remove(); return; }
        if (!note) {
          note = document.createElement('div');
          note.className = 'chart-empty';
          box.appendChild(note);
        }
        note.textContent = message;
      }

      // Freshness pill under the dashboard header: Live vs Cached vs stale.
      function updateFreshness(mode, ts) {
        const el = document.getElementById('acc-fresh-text');
        const dot = document.getElementById('acc-fresh-dot');
        if (!el) return;
        const time = new Date(ts || Date.now())
          .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
        if (mode === 'live') {
          el.textContent = 'Live · updated ' + time;
          if (dot) dot.className = 'fresh-dot live';
        } else if (mode === 'cached') {
          el.textContent = 'Cached · showing data from ' + time;
          if (dot) dot.className = 'fresh-dot cached';
        } else {
          el.textContent = 'Could not refresh — showing last known data';
          if (dot) dot.className = 'fresh-dot stale';
        }
      }

      // instant = snap to final values + skip chart/count animations (re-entry,
      // silent background updates). Animated = only the first real data load.
      // ---- Dashboard extras: month/year filter + member search ----
      // The toolbar filters Payments-driven views (deposits, feed, CSV) and
      // member search narrows per-member views. Re-render from cachedData so
      // no extra Apps Script call happens while typing/selecting.
      const accFilter = { month: '', year: '', q: '' };

      function getPaymentDate(p) {
        // Tabs may spell it differently; accept Payment Date / Date / Month+Year.
        const raw = p["Payment Date"] || p["Date"] || p["date"] || '';
        let d = parseProfitDate(raw);
        if (!d || isNaN(d.getTime())) {
          // Fallback to Year + Month if Payment Date is missing/invalid
          const y = Number(p["Year"] || p["year"]);
          const monStr = String(p["Month"] || p["month"] || '').trim().toLowerCase();
          const mon = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(monStr.slice(0, 3));
          if (y && mon >= 0) d = new Date(y, mon, 1);
        }
        return d || null;
      }

      function paymentInFilter(p) {
        const m = accFilter.month ? Number(accFilter.month) : 0;
        const y = accFilter.year ? Number(accFilter.year) : 0;
        if (!m && !y) return true;
        const d = getPaymentDate(p);
        if (!d) return false;
        if (m && (d.getMonth() + 1) !== m) return false;
        if (y && d.getFullYear() !== y) return false;
        return true;
      }

      function memberMatches(name) {
        const q = accFilter.q.trim().toLowerCase();
        if (!q) return true;
        return String(name || '').toLowerCase().includes(q);
      }

      function refreshAccountViews(instant) {
        if (!cachedData) return;
        populateSummary(cachedData.Summary, instant);
        const memberTotalsByName = {};
        (cachedData.MemberStatus || []).forEach(r => {
          const n = String(r["Member Name"] || "").trim();
          if (!n) return;
          memberTotalsByName[n] = {
            paid: parseDepositAmount(r["Total Paid"]),
            expected: parseDepositAmount(r["Expected payments"])
          };
        });
        renderCurrentStatusChart(cachedData.CurrentStatus, memberTotalsByName, instant);
        renderAdvanceChart(cachedData.Advances, instant);
        renderInvestmentChart(cachedData.Investment, instant);
        renderProfitChart(cachedData.NetProfit || cachedData.Investment, instant);
        renderDepositChart(cachedData, instant);
        populateMemberStatusTable((cachedData.MemberStatus || []).filter(r => memberMatches(r["Member Name"])), instant);
        renderRecentPayments(cachedData.Payments || []);
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(markAllChartsLoaded);
        else markAllChartsLoaded();
      }
      function renderDashboard(data, instant) {
        if (!data) return;
        populateSummary(data.Summary, instant);
        // MemberName -> { paid, expected } from MemberStatus for the Partial remaining-amount bars
        const memberTotalsByName = {};
        (data.MemberStatus || []).forEach(r => {
          const n = String(r["Member Name"] || "").trim();
          if (!n) return;
          memberTotalsByName[n] = {
            paid: parseDepositAmount(r["Total Paid"]),
            expected: parseDepositAmount(r["Expected payments"])
          };
        });
        renderCurrentStatusChart(data.CurrentStatus, memberTotalsByName, instant);
        renderAdvanceChart(data.Advances, instant);
        renderInvestmentChart(data.Investment, instant);
        renderProfitChart(data.NetProfit || data.Investment, instant);
        renderDepositChart(data, instant);
        populateMemberStatusTable(data.MemberStatus, instant);
        // Charts (re)built above — fade the loading shimmer out.
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(markAllChartsLoaded);
        else markAllChartsLoaded();
      }

      async function fetchDashboardData() {
        if (fetchInFlight) return;              // never stack overlapping requests
        fetchInFlight = true;
        const banner = document.getElementById('acc-status-banner');
        const bannerMsg = document.getElementById('acc-status-msg');
        try {
          if (banner) banner.style.display = 'none';

          // Cache-buster: Apps Script may cache responses briefly — a unique
          // query param guarantees your latest sheet edits appear immediately.
          const response = await fetch(API_URL + '?_=' + Date.now());
          if (!response.ok) throw new Error('Google Apps Script responded with HTTP ' + response.status);

          const data = await response.json();
          cachedData = data;
          writeCache(data);
          lastSuccessAt = Date.now();
          updateFreshness('live');

          // Identical payload → charts already show it; skip destroy/rebuild + animations
          if (hasInitialData && dataFingerprint(data) === lastRenderedFingerprint) return;

          hasInitialData = true;
          lastRenderedFingerprint = dataFingerprint(data);
          renderDashboard(data);

          // Valid response but missing the keys the page expects → warn the user
          if (banner && bannerMsg && !data.Summary && !data.MemberStatus && !data.Advances) {
            bannerMsg.textContent = 'Apps Script responded, but the expected keys (Summary / CurrentStatus / Advances / Investment / NetProfit / MemberStatus / Payments) were missing. Check the sheet tab names in the script.';
            banner.style.display = 'block';
            markAllChartsLoaded();
          }
        } catch (error) {
          console.error("Data Fetching Error:", error);
          lastSuccessAt = 0;
          updateFreshness('error');
          markAllChartsLoaded(); // stop shimmer — charts can't draw without data
          if (banner && bannerMsg) {
            bannerMsg.textContent = 'Accounts data could not load — Google Apps Script unreachable or returning an error. Redeploy it as a public web app, then press Retry.';
            banner.style.display = 'block';
          }
        } finally {
          fetchInFlight = false;
        }
      }

      // ===== Animated counting stat cards =====
      const ACCOUNT_VALUE_IDS = ['totalAmount', 'monthlyDeposit', 'advance', 'profit', 'activeInvestment', 'remainingCash'];
      const summaryTargets = {};

      // Formats a number as BDT currency (whole taka, thousands separators)
      function formatCurrency(n) {
        return '৳' + Math.round(Number(n)).toLocaleString('en-US');
      }

      // Counts an element from 0 → target with an ease-out effect
      function animateValue(el, target, duration) {
        if (duration <= 0) { el.innerText = formatCurrency(target); return; }
        const startTime = performance.now();
        function step(now) {
          const p = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic (fast start, slow finish)
          el.innerText = formatCurrency(target * eased);
          if (p < 1) requestAnimationFrame(step);
          else el.innerText = formatCurrency(target);
        }
        requestAnimationFrame(step);
      }

      // Counts up all 6 cards once (5s) — numbers freeze at their final
      // value until a data refresh or re-entering the Accounts page
      function runSummaryCountAnimation() {
        ACCOUNT_VALUE_IDS.forEach(id => {
          const el = document.getElementById(id);
          if (!el) return;
          animateValue(el, summaryTargets[id] || 0, 5000);
        });
      }

      // Summary Helper — stores numeric targets, then fires the counting animation
      function populateSummary(summaryData, instant) {
        if (!summaryData) return;

        const map = {
          'Total Amounts': 'totalAmount',
          'Monthly Deposit': 'monthlyDeposit',
          'Advances': 'advance',
          'Profits': 'profit',
          'Active Investment': 'activeInvestment',
          'Remainning Cash': 'remainingCash',
          'Remaining Cash': 'remainingCash'
        };

        summaryData.forEach(row => {
          const desc = String(row["Description"]).trim();
          const targetId = map[desc];
          if (!targetId) return;
          const num = parseFloat(String(row["Context"]).replace(/[^\d.\-]/g, ''));
          if (!isNaN(num)) summaryTargets[targetId] = num;
        });

        if (instant) {
          // Re-entry / silent refresh → snap to final values (no 5s count-up)
          ACCOUNT_VALUE_IDS.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = formatCurrency(summaryTargets[id] || 0);
          });
        } else {
          runSummaryCountAnimation();
        }
      }

// Current Status Horizontal Bar Chart (Paid / Partial) — Members on Y-axis, Status bars
      function renderCurrentStatusChart(statusData, memberTotalsByName, instant) {
        if (!statusData || !statusData.length) { setChartEmpty('currentStatusChart', 'No member status rows yet — check the CurrentStatus tab.'); return; }
        if (typeof Chart === 'undefined') return; // CDN blocked/offline — skip, don't break the page
        setChartEmpty('currentStatusChart', null);

        const memberTotals = memberTotalsByName || {};
        const labels = statusData.map(m => m["Member Name"]);
        // Real sheet amounts — no hardcoded 1500 fallback (0 means "no amount recorded").
        const paidData = statusData.map(m => m["Status"] === "Paid" ? parseDepositAmount(m["Amount"]) : 0);
        // Plot the actual remaining amount so Partial shares the same ৳ scale as Paid.
        const partialData = statusData.map(m => {
          if (String(m["Status"]).trim() !== "Partial") return 0;
          const t = memberTotals[String(m["Member Name"] || "").trim()];
          if (t && (t.expected > 0 || t.paid > 0)) return Math.max(t.expected - t.paid, 0);
          return 1; // no MemberStatus row matched — keep a visible 1-unit marker
        });

        // Fit ALL member names on the chart — size the box to the row count.
        // The fixed .chart-box heights (300–400px + max-height caps) only fit
        // ~5–6 Y-axis labels, so on small phones most members were cut off.
        // Each member now gets its own row of px, adapted to screen width.
        const box = document.getElementById('currentStatusChart').closest('.chart-box');
        if (box) {
          const vw = window.innerWidth || document.documentElement.clientWidth;
          let rowH = 44;                 // px per member row (desktop / tablet)
          if (vw <= 380) rowH = 30;      // Galaxy Fold / tiny phones
          else if (vw <= 480) rowH = 32; // iPhone SE / small Androids
          else if (vw <= 640) rowH = 36; // regular phones
          else if (vw <= 768) rowH = 40; // phablets / small tablets
          box.style.height = Math.min(2400, Math.max(220, labels.length * rowH + 95)) + 'px';
          box.style.maxHeight = 'none';    // override stylesheet caps (340px / 300px / 260px)
          box.style.aspectRatio = 'auto';  // fixed height wins over aspect-ratio
        }

        const ctx = document.getElementById('currentStatusChart').getContext('2d');

        if (currentStatusChartInstance) currentStatusChartInstance.destroy();

        currentStatusChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Paid',
                data: paidData,
                backgroundColor: (c) => {
                  const area = c.chart.chartArea;
                  if (!area) return '#18251D';
                  const g = c.chart.ctx.createLinearGradient(0, area.bottom, 0, area.top);
                  g.addColorStop(0, '#18251D');
                  g.addColorStop(1, 'rgba(24,37,29,0.85)');
                  return g;
                },
                hoverBackgroundColor: '#2E4A35',
                borderColor: '#FFFCF4',
                borderWidth: 3,
                borderRadius: 12,
                barPercentage: 0.85,
                categoryPercentage: 0.95,
                maxBarThickness: 44
              },
              {
                label: 'Partial',
                data: partialData,
                backgroundColor: (c) => {
                  const area = c.chart.chartArea;
                  if (!area) return '#FFC107';
                  const g = c.chart.ctx.createLinearGradient(0, area.bottom, 0, area.top);
                  g.addColorStop(0, '#FFC107');
                  g.addColorStop(1, 'rgba(255,193,7,0.45)');
                  return g;
                },
                hoverBackgroundColor: '#FFD54F',
                borderColor: '#FFF3C4',
                borderWidth: 3,
                borderRadius: 12,
                barPercentage: 0.85,
                categoryPercentage: 0.95,
                maxBarThickness: 44
              }
            ]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: instant ? 0 : 1100,
              easing: 'easeOutQuart',
              delay(context) {
                // Bars pop in one-by-one (staggered, professional feel)
                if (instant) return 0;
                return context.type === 'data' ? context.dataIndex * 90 : 0;
              }
            },
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } },
              tooltip: {
                callbacks: {
                  label: (tc) => {
                    // Horizontal bars: value lives on parsed.x
                    const v = (tc.parsed && typeof tc.parsed.x === 'number')
                      ? tc.parsed.x
                      : Number(tc.raw);
                    return ' ' + tc.dataset.label + ': ৳' +
                      (isNaN(v) ? '0' : Math.round(v).toLocaleString('en-US'));
                  }
                }
              }
            },
            scales: {
              x: { beginAtZero: true, ticks: { color: themeTick(), callback: (v) => '৳' + Math.round(Number(v)).toLocaleString('en-US') } },
              y: {
                grid: { display: false },
                ticks: {
                  autoSkip: false, // show EVERY member name on small screens
                  maxRotation: 0,
                  color: '#B7FF72',
                  font: { size: (window.innerWidth || document.documentElement.clientWidth) <= 480 ? 11 : 12, weight: '600' }
                }
              }
            }
          }
        });

        // Live "who just paid" ticker — pops up a paid member's name every second
        startPaidTicker(statusData);

        // Bars animate once on load — no replay loop
      }

      // Paid-members ticker — every second a "who paid" name pops up
      function startPaidTicker(statusData) {
        const el = document.getElementById('paidTickerText');
        if (!el) return;
        if (paidTickerTimer) clearInterval(paidTickerTimer);

        const paidNames = (statusData || [])
          .filter(m => String(m["Status"]).trim() === "Paid")
          .map(m => String(m["Member Name"]).trim())
          .filter(Boolean);

        if (paidNames.length === 0) {
          el.innerText = 'No payments recorded this month yet';
          return;
        }

        let idx = 0;
        const showNext = () => {
          const name = paidNames[idx % paidNames.length];
          idx++;
          el.innerText = '✓ ' + name + '  just paid';
          el.classList.remove('paid-pop');
          void el.offsetWidth; // restart the CSS pop animation
          el.classList.add('paid-pop');
        };

        showNext();
        paidTickerTimer = setInterval(showNext, 1000);
      }

      // Advances Chart — Members on X-axis, 1st & 2nd advance amounts (paid/remaining)
      function renderAdvanceChart(advData, instant) {
        if (!advData || !advData.length) { setChartEmpty('advanceChart', 'No advance rows yet — check the Advances tab.'); return; }
        if (typeof Chart === 'undefined') return; // CDN blocked/offline — skip, don't break the page
        setChartEmpty('advanceChart', null);

        const labels = advData.map(m => m["Name"]);
        const firstAdv = advData.map(m => m["Advance 1st"] ? Number(m["Advance 1st"]) : 0);
        const secondAdv = advData.map(m => m["Advance 2nd"] ? Number(m["Advance 2nd"]) : 0);

        const ctx = document.getElementById('advanceChart').getContext('2d');

        if (advanceChartInstance) advanceChartInstance.destroy();

        advanceChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: '1st Advance',
                data: firstAdv,
                backgroundColor: (c) => {
                  const area = c.chart.chartArea;
                  if (!area) return '#3b82f6';
                  const g = c.chart.ctx.createLinearGradient(0, area.bottom, 0, area.top);
                  g.addColorStop(0, 'rgba(59,130,246,0.35)');
                  g.addColorStop(1, '#3b82f6');
                  return g;
                },
                hoverBackgroundColor: '#60a5fa',
                borderColor: '#bfdbfe',
                borderWidth: 2,
                borderRadius: 10,
                barPercentage: 0.65,
                categoryPercentage: 0.85,
                maxBarThickness: 34
              },
              {
                label: '2nd Advance',
                data: secondAdv,
                backgroundColor: (c) => {
                  const area = c.chart.chartArea;
                  if (!area) return '#f59e0b';
                  const g = c.chart.ctx.createLinearGradient(0, area.bottom, 0, area.top);
                  g.addColorStop(0, 'rgba(245,158,11,0.35)');
                  g.addColorStop(1, '#f59e0b');
                  return g;
                },
                hoverBackgroundColor: '#fbbf24',
                borderColor: '#fde68a',
                borderWidth: 2,
                borderRadius: 10,
                barPercentage: 0.65,
                categoryPercentage: 0.85,
                maxBarThickness: 34
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: instant ? 0 : 1200,
              easing: 'easeOutQuart',
              delay(context) {
                // Bars rise up one-by-one (staggered)
                if (instant) return 0;
                return context.type === 'data' ? context.dataIndex * 100 : 0;
              }
            },
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } }
            },
            scales: {
              y: { beginAtZero: true },
              x: { grid: { display: false } }
            }
          }
        });

        // Bars animate once on load — no replay loop
      }

      // ===== Investment doughnut center-text plugin =====
      // Draws "TOTAL RUNNING / ৳X" directly on the canvas at the exact
      // geometric center of the doughnut hole. Canvas-native = always
      // centered on iOS / Android / iPad / Mac / Windows, at any width,
      // zoom level, or devicePixelRatio — no overlay div to drift.
      let invCenterTotal = 0;
      const invCenterTextPlugin = {
        id: 'invCenterText',
        afterDraw(chart) {
          const meta = chart.getDatasetMeta(0);
          const arc = meta && meta.data && meta.data[0];
          if (!arc || typeof arc.x !== 'number' || typeof arc.y !== 'number') return;
          const hole = Math.max((arc.innerRadius || 0) * 2, 0);
          if (!hole) return;
          const ctx = chart.ctx;
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const labelSize = Math.max(8, Math.min(11, hole * 0.10));
          ctx.fillStyle = '#94a3b8';
          ctx.font = '700 ' + labelSize + 'px Inter, system-ui, sans-serif';
          ctx.fillText('TOTAL RUNNING', arc.x, arc.y - hole * 0.12);
          const valSize = Math.max(11, Math.min(22, hole * 0.17));
          ctx.fillStyle = '#05cd99';
          ctx.shadowColor = 'rgba(5,205,153,0.55)';
          ctx.shadowBlur = 14;
          ctx.font = '800 ' + valSize + 'px Inter, system-ui, sans-serif';
          ctx.fillText(formatCurrency(invCenterTotal), arc.x, arc.y + hole * 0.13);
          ctx.restore();
        }
      };

      // Counts the center "Total Running" amount up (reuses the card counter)
      function animateCenterValue(target) {
        const el = document.getElementById('invCenterValue');
        if (!el) return;
        animateValue(el, target, 10000);
      }

      // Positions the inner text exactly on the doughnut's hole (centers on any screen)
      // NOTE: center total is canvas-drawn by invCenterTextPlugin; this only
      // hides the legacy HTML overlay once the chart exists, and keeps the
      // overlay as a static fallback if the chart ever fails to render.
      function alignInvCenter() {
        const centerEl = document.querySelector('.inv-center');
        if (!centerEl) return;
        centerEl.style.display = investmentChartInstance ? 'none' : '';
      }

      // Investment Pie Chart — only Running investments
      function renderInvestmentChart(invData, instant) {
        if (!invData || !invData.length) { setChartEmpty('investmentPieChart', 'No investment rows yet — check the Investment tab.'); return; }
        if (typeof Chart === 'undefined') return; // CDN blocked/offline — skip, don't break the page
        setChartEmpty('investmentPieChart', null);

        const runningInvestments = invData.filter(i => i["Description"] && i["Status"] === "Running" && i["Amount"] > 0);
        const labels = runningInvestments.map(i => i["Description"]);
        const amounts = runningInvestments.map(i => i["Amount"]);
        const total = amounts.reduce((sum, v) => sum + Number(v || 0), 0);

        const PALETTE = ['#4318ff', '#05cd99', '#ffb547', '#2b3674', '#ee5d50'];

        const ctx = document.getElementById('investmentPieChart').getContext('2d');

        if (investmentChartInstance) investmentChartInstance.destroy();

        investmentChartInstance = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: amounts,
              backgroundColor: (ctx) => {
                // Bkash gets its official brand red; other sectors keep the palette
                const label = String(labels[ctx.dataIndex] || '').toLowerCase();
                return label === 'bkash' ? '#d6093a' : PALETTE[ctx.dataIndex % PALETTE.length];
              },
              borderColor: themeInk(),
              borderWidth: 3,
              hoverOffset: 12
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              animateRotate: true,
              animateScale: true,
              duration: instant ? 0 : 1600,
              easing: 'easeOutQuart'
            },
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } }
            },
            layout: { padding: { top: 6 } }
          },
          plugins: [invCenterTextPlugin]
        });

        // Center total: freeze the shared value, animate the visible label once,
        // then redraw so the canvas text lands exactly on the final number.
        invCenterTotal = total;

        // Align the center text exactly on the doughnut hole (after layout settles)
        setTimeout(alignInvCenter, 100);
      }

      // Parses a profit-tab date (ISO, partial, or text month) into a Date
      function parseProfitDate(d) {
        const s = String(d || '').trim();
        if (!s) return null;
        // "2026-02-15", "2026-2", "2026-02-15T07:00:00.000Z"
        const iso = s.match(/^(\d{4})[-/](\d{1,2})(?:[-/](\d{1,2}))?/);
        if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, iso[3] ? Number(iso[3]) : 1);
        // "Feb 2026", "February 2026", "Feb-2026"
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const mon = s.match(/^([A-Za-z]{3,9})[-\s]+(\d{4})$/i);
        if (mon) {
          const idx = months.findIndex(l => l.toLowerCase() === mon[1].toLowerCase().slice(0, 3));
          if (idx >= 0) return new Date(Number(mon[2]), idx, 1);
        }
        const t = Date.parse(s);
        return isNaN(t) ? null : new Date(t);
      }

      // Formats a year-month key like "2026-9" into a short "Mon YY" label
      function formatProfitDate(d) {
        if (!d) return '';
        const s = String(d).trim();
        const m = s.match(/^(\d{4})-(\d{1,2})/);
        if (m) {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthIdx = parseInt(m[2], 10);
          const mon = (monthIdx >= 1 && monthIdx <= 12) ? months[monthIdx - 1] : m[2];
          return mon + "'" + m[1].slice(2);
        }
        return s.slice(0, 7);
      }

      // Reads the profit value whatever the header is spelled:
      // "Net Profit", "NetProfit", "Netprofit", or the older "Total Profit"
      function readProfitField(i) {
        if (!i) return 0;
        if (i["Net Profit"] !== undefined) return i["Net Profit"];
        if (i["NetProfit"] !== undefined) return i["NetProfit"];
        if (i["Netprofit"] !== undefined) return i["Netprofit"];
        if (i["Total Profit"] !== undefined) return i["Total Profit"];
        return 0;
      }

      // Profit Graph — live Net Profit from the "Netprofit" sheet tab (Date | Net Profit)
      function renderProfitChart(profitData, instant) {
        const canvasEl = document.getElementById('profitChart');
        if (!profitData || !profitData.length || !canvasEl) { setChartEmpty('profitChart', 'No profit rows yet — check the NetProfit tab.'); return; }
        if (typeof Chart === 'undefined') return; // CDN blocked/offline — skip, don't break the page
        setChartEmpty('profitChart', null);

        // Keep only rows carrying a Date, parse them, drop unparseable junk
        const entries = profitData
          .map(i => ({
            date: parseProfitDate(i && i["Date"]),
            profit: readProfitField(i)
          }))
          .filter(e => e.date && !isNaN(e.profit))
          .sort((a, b) => a.date - b.date);

        // Roll rows that fall on the same month into one monthly net-profit point
        const monthly = new Map();
        entries.forEach(e => {
          const key = e.date.getFullYear() + '-' + (e.date.getMonth() + 1);
          monthly.set(key, (monthly.get(key) || 0) + e.profit);
        });

        const labels = Array.from(monthly.keys()).map(formatProfitDate);
        const profits = Array.from(monthly.values());

        const ctx = canvasEl.getContext('2d');
        if (profitChartInstance) profitChartInstance.destroy();

        profitChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'Net Profit',
              data: profits,
              borderColor: '#a78bfa',
              backgroundColor: (c) => {
                const area = c.chart.chartArea;
                if (!area) return 'rgba(167,139,250,0.25)';
                const g = c.chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
                g.addColorStop(0, 'rgba(167,139,250,0.55)');
                g.addColorStop(1, 'rgba(167,139,250,0.03)');
                return g;
              },
              fill: 'start',
              tension: 0.4,
              borderWidth: 3,
              pointBackgroundColor: '#a78bfa',
              pointBorderColor: themeInk(),
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: instant ? 0 : 1200, easing: 'easeOutQuart' },
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } },
              tooltip: {
                callbacks: {
                  label: (tc) => {
                    // Chart.js v4: tooltip items expose the y value at tc.parsed.y
                    const v = (tc.parsed && typeof tc.parsed.y === 'number')
                      ? tc.parsed.y
                      : Number(tc.raw);
                    return ' ' + tc.dataset.label + ': ৳' +
                      (isNaN(v) ? '0' : Math.round(v).toLocaleString('en-US'));
                  }
                }
              }
            },
            scales: {
              x: { grid: { display: false }, ticks: { color: themeTick() } },
              y: {
                beginAtZero: true,
                grid: { color: themeGrid() },
                ticks: { color: themeTick(), callback: (v) => '৳' + Math.round(Number(v)).toLocaleString('en-US') }
              }
            }
          }
        });
      }

      // Parses a cell that may be a number, a BDT string ("৳1,500", "1,500"), or text.
      function parseDepositAmount(v) {
        if (v === null || v === undefined || v === '') return 0;
        if (typeof v === 'number') return isNaN(v) ? 0 : v;
        const cleaned = String(v).replace(/[৳,\s]/g, '');
        const n = parseFloat(cleaned);
        return isNaN(n) ? 0 : n;
      }

      // Deposits Chart — per-member total deposit (ranked bar chart)
      // Each member's lifetime total = sum of their "Ammount" payment rows
      // (falls back to MemberStatus "Total Paid" when Payments is empty).
      function renderDepositChart(dashboardData, instant) {
        if (!dashboardData) return;
        if (typeof Chart === 'undefined') return; // CDN blocked/offline — skip, don't break the page

        // Sum each member's payment rows: the Payments tab holds one row per payment
        // (Member Name + "Ammount"), so adding them equals that member's exact total
        // in the sheet. Falls back to the MemberStatus "Total Paid" cell when Payments
        // is empty.
        const paymentRows = dashboardData.Payments || [];
        const usePayments = paymentRows.length > 0;
        const source = usePayments ? paymentRows : (dashboardData.MemberStatus || []);
        if (!source.length) { setChartEmpty('depositChart', 'No deposit rows yet — check the Payments tab.'); return; }

        const byMember = new Map();
        source.forEach(m => {
          if (!m) return;
          const name = String(m["Member Name"] || m["Name"] || m["Member"] || "").trim();
          if (!name) return;
          const raw = usePayments
            ? (m["Ammount"] !== undefined ? m["Ammount"] :
               m["Amount"] !== undefined ? m["Amount"] :
               m["Total Paid"] !== undefined ? m["Total Paid"] :
               m["TotalPaid"] !== undefined ? m["TotalPaid"] : 0)
            : (m["Total Paid"] !== undefined ? m["Total Paid"] :
               m["TotalPaid"] !== undefined ? m["TotalPaid"] :
               m["Total Deposit"] !== undefined ? m["Total Deposit"] :
               m["Deposit"] !== undefined ? m["Deposit"] : 0);
          const total = parseDepositAmount(raw);
          if (!usePayments && byMember.has(name)) return; // one total row per member
          byMember.set(name, (byMember.get(name) || 0) + total);
        });

        const rows = Array.from(byMember.entries())
          .map(([name, total]) => ({ name, total }))
          .filter(r => r.name)
          // Rank biggest depositors first for a clean bar chart
          .sort((a, b) => b.total - a.total);

        if (!rows.length) { setChartEmpty('depositChart', 'No deposit rows yet — check the Payments tab.'); return; }
        setChartEmpty('depositChart', null);

        const labels = rows.map(r => r.name);
        const totals = rows.map(r => r.total);

        const ctx = document.getElementById('depositChart').getContext('2d');

        if (depositChartInstance) depositChartInstance.destroy();

        depositChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Total Deposit',
              data: totals,
              backgroundColor: (c) => {
                const area = c.chart.chartArea;
                if (!area) return '#FF6115';
                const g = c.chart.ctx.createLinearGradient(0, area.bottom, 0, area.top);
                g.addColorStop(0, 'rgba(255,97,21,0.35)');
                g.addColorStop(1, '#FF6115');
                return g;
              },
              hoverBackgroundColor: '#FF6115',
              borderColor: '#FFFCF4',
              borderWidth: 2,
              borderRadius: 8,
              barPercentage: 0.7,
              categoryPercentage: 0.9,
              maxBarThickness: 30
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: instant ? 0 : 1200,
              easing: 'easeOutQuart',
              delay(context) {
                if (instant) return 0;
                return context.type === 'data' ? context.dataIndex * 80 : 0;
              }
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (tc) => {
                    const v = (tc.parsed && typeof tc.parsed.y === 'number')
                      ? tc.parsed.y
                      : Number(tc.raw);
                    return ' ' + tc.dataset.label + ': ৳' +
                      (isNaN(v) ? '0' : Math.round(v).toLocaleString('en-US'));
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: themeGrid() },
                ticks: { color: themeTick(), callback: (v) => '৳' + Math.round(Number(v)).toLocaleString('en-US') }
              },
              x: {
                grid: { display: false },
                ticks: { color: themeTick(), maxRotation: 45, minRotation: 35, autoSkip: false, font: { size: 11 } }
              }
            }
          }
        });
      }

      // Count-up helper for table numbers
      function animateTableCount(el, target, duration) {
        const start = performance.now();
        function step(now) {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased);
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }

      // Member Status List — staggered rows, animated progress bars, pulsing badges
      // Sorted defaulters-first (highest unpaid on top) with a Status badge + Total Paid column.
      function renderCollectionRate(statusData) {
        const text = document.getElementById('acc-collect-text');
        const fill = document.getElementById('acc-collect-fill');
        if (!text && !fill) return;
        let paidSum = 0, expectedSum = 0;
        (statusData || []).forEach(row => {
          paidSum += parseDepositAmount(row["Total Paid"]);
          expectedSum += parseDepositAmount(row["Expected payments"]);
        });
        const pct = expectedSum > 0 ? Math.min(Math.round((paidSum / expectedSum) * 100), 100) : 0;
        if (text) text.textContent = pct + '% · ' + formatCurrency(paidSum) + ' of ' + formatCurrency(expectedSum);
        if (fill) fill.style.width = pct + '%';
      }

      function populateMemberStatusTable(statusData, instant) {
        const tbody = document.getElementById("memberStatusTable");
        tbody.innerHTML = "";

        if (!statusData) return;
        renderCollectionRate(statusData);

        const sorted = statusData.slice().sort((a, b) =>
          parseDepositAmount(b["Total Unpaid"]) - parseDepositAmount(a["Total Unpaid"]));

        sorted.forEach((row, i) => {
          const tr = document.createElement("tr");
          tr.className = "ms-row";
          tr.style.animationDelay = (instant ? 0 : i * 70) + "ms";

          const unpaid = parseDepositAmount(row["Total Unpaid"]);
          const expected = parseDepositAmount(row["Expected payments"]);
          const paid = parseDepositAmount(row["Total Paid"]);
          const pct = expected > 0 ? Math.min(Math.round((paid / expected) * 100), 100) : 0;
          const sheetStatus = String(row["Status"] || "").trim();
          const statusLabel = sheetStatus || (unpaid > 0 ? 'Partial' : 'Paid');
          const statusCls = statusLabel.toLowerCase() === 'paid' ? 'ms-badge-paid'
            : statusLabel.toLowerCase() === 'partial' ? 'ms-badge-unpaid' : 'ms-badge-neutral';

          tr.innerHTML = `
            <td><span class="ms-name">${escapeHtml(row["Member Name"])}</span></td>
            <td><span class="ms-badge ${statusCls}">${escapeHtml(statusLabel)}</span></td>
            <td class="ms-num">0</td>
            <td>
              <span class="ms-bar"><span class="ms-bar-fill ${pct >= 100 ? 'ms-bar-full' : ''}"></span></span>
              <span class="ms-pct">${pct}%</span>
            </td>
            <td><span class="ms-badge ${unpaid > 0 ? 'ms-badge-unpaid' : 'ms-badge-paid'}">${unpaid > 0 ? 'Due ' + unpaid : '✓ Paid Up'}</span></td>
            <td><span class="ms-paid">৳0</span></td>
          `;
          tbody.appendChild(tr);
          const paidEl = tr.querySelector('.ms-paid');
          if (paidEl) paidEl.textContent = formatCurrency(paid);

          // Count the Expected number up
          const numEl = tr.querySelector('.ms-num');
          if (instant) {
            // Snapshot mode: show the number + bar immediately (no per-row anims)
            if (numEl) numEl.textContent = expected;
            const fill = tr.querySelector('.ms-bar-fill');
            if (fill) fill.style.width = pct + '%';
          } else {
            if (numEl) animateTableCount(numEl, expected, 600);

            // Fill the progress bar after the row slides in
            setTimeout(() => {
              const fill = tr.querySelector('.ms-bar-fill');
              if (fill) fill.style.width = pct + '%';
            }, 300 + i * 70);
          }
        });
      }

      // Retry button — manually re-fetch from Google Apps Script
      const retryBtn = document.getElementById('acc-retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          retryBtn.disabled = true;
          fetchDashboardData().finally(() => { retryBtn.disabled = false; });
        });
      }

      // When the Accounts page becomes visible again, re-render everything
      // (charts built while the page was hidden are created at 0 size and stay blank)
      window.refreshAccountsCharts = function () {
        const page = document.getElementById('page-accounts');
        if (page && page.classList.contains('active') && cachedData) {
          // Instant re-render (no replay of 5s counts / chart animations on re-entry)
          renderDashboard(cachedData, true);
          setTimeout(alignInvCenter, 120);
        }
      };

      // Keep the investment center text aligned with the doughnut on window resize
      window.addEventListener('resize', () => setTimeout(alignInvCenter, 60));

      // ===== Initial load: paint cached data instantly, then refresh in the background =====
      // Google Apps Script is slow, so a full reload used to sit on a blank dashboard
      // for seconds. Now the last-known data shows immediately (from localStorage)
      // and the live fetch updates it silently.
      (function initialLoad() {
        const saved = readCache();
        if (saved && saved.data) {
          cachedData = saved.data;
          lastRenderedFingerprint = dataFingerprint(saved.data);
          hasInitialData = true;
          renderDashboard(saved.data, true); // instant — the page is usually hidden at boot
          updateFreshness('cached', saved.savedAt);
        }
        fetchDashboardData(); // background refresh brings any new sheet edits in
      })();

      // Auto-refresh ONLY while the Accounts page is on screen AND the tab is visible —
      // the old global 30s timer hammered Google Apps Script even in background tabs.
      setInterval(() => {
        const page = document.getElementById('page-accounts');
        if (page && page.classList.contains('active') && document.visibilityState === 'visible') {
          fetchDashboardData();
        }
      }, 30000);

      // Returning to the tab: refresh the dashboard if the last live load is stale.
      // The fetchInFlight guard in fetchDashboardData() prevents duplicate requests.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState !== 'visible') return;
        const page = document.getElementById('page-accounts');
        if (!page || !page.classList.contains('active')) return;
        if (Date.now() - lastSuccessAt > 15000) fetchDashboardData();
      });
    })();

    // ============================================================
    // RESTORE LAST-VISITED PAGE AFTER REFRESH
    // switchPage() stores the page in localStorage; here we jump
    // straight back to it (no exit animation) so a browser refresh
    // lands on the SAME page the user was viewing, not the Home
    // page. Placed last so all helpers it needs are defined above.
    // ============================================================
    (function restoreLastPage() {
      try {
        const stored = localStorage.getItem('unionLastPage');
        const valid = ['home', 'rules', 'members', 'accounts'];
        if (!stored || !valid.includes(stored) || stored === 'home') return;

        const target = document.getElementById('page-' + stored);
        if (!target) return;

        // Swap active page straight away (no leave/enter animation)
        document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active', 'leaving'));
        target.classList.add('active');

        // Update the dock / nav highlight
        document.querySelectorAll('.nav-btn').forEach(b => { b.classList.remove('active-link'); b.removeAttribute('aria-current'); });
        const navBtn = document.getElementById('nav-' + stored);
        if (navBtn) { navBtn.classList.add('active-link'); navBtn.setAttribute('aria-current', 'page'); }
        if (typeof window.moveDockIndicator === 'function') window.moveDockIndicator();

        // If the Accounts page was restored, re-render its charts at the right size
        if (stored === 'accounts' && typeof window.refreshAccountsCharts === 'function') {
          setTimeout(() => window.refreshAccountsCharts(), 120);
        }
      } catch (err) { /* localStorage may be unavailable - keep default Home page */ }
    })();

  