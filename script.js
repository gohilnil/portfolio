document.addEventListener("DOMContentLoaded", () => {
    // 1. NAVBAR TOGGLE
    const ham = document.getElementById('hamburger-btn');
    const drop = document.getElementById('nav-dropdown');
    if (ham && drop) {
        ham.addEventListener('click', (e) => {
            e.stopPropagation();
            drop.classList.toggle('nav-open');
            ham.setAttribute('aria-expanded', drop.classList.contains('nav-open'));
        });
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#navbar')) {
                drop.classList.remove('nav-open');
                ham.setAttribute('aria-expanded', 'false');
            }
        });
        drop.querySelectorAll('a').forEach(l => {
            l.addEventListener('click', () => {
                drop.classList.remove('nav-open');
                ham.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // 2. HERO ENTRANCE ANIMATIONS
    const heroEls = [
        { selector: '.hero-eyebrow', delay: 120 },
        { selector: '.hero-name', delay: 280 },
        { selector: '.hero-tw-row', delay: 440 },
        { selector: '.hero-bio', delay: 580 },
        { selector: '.hero-btns', delay: 720 },
        { selector: '.hero-stats', delay: 860 },
        { selector: '.hero-right', delay: 350 }
    ];
    heroEls.forEach(item => {
        const el = document.querySelector(item.selector);
        if (el) {
            setTimeout(() => el.classList.add('hero-visible'), item.delay);
        }
    });

    // 3. TYPEWRITER
    const phrases = ["fast, modern websites.", "sites that win clients.", "web apps businesses love."];
    let pIdx = 0, cIdx = 0, del = false;
    const twText = document.getElementById('tw-text');
    if (twText) {
        const tick = () => {
            const current = phrases[pIdx];
            if (del) {
                cIdx--;
                twText.textContent = current.substring(0, cIdx);
            } else {
                cIdx++;
                twText.textContent = current.substring(0, cIdx);
            }
            if (!del && cIdx === current.length) {
                del = true;
                setTimeout(tick, 1500);
            } else if (del && cIdx === 0) {
                del = false;
                pIdx = (pIdx + 1) % phrases.length;
                setTimeout(tick, 350);
            } else {
                setTimeout(tick, del ? 35 : 65);
            }
        };
        setTimeout(tick, 1300);
    }

    // 4. SCROLL REVEAL (IntersectionObserver)
    const obsOpts = { threshold: 0.12, rootMargin: "0px 0px -48px 0px" };
    const revObs = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const parent = entry.target.parentElement;
                if (parent) {
                    const siblings = Array.from(parent.querySelectorAll('.reveal'));
                    const i = siblings.indexOf(entry.target);
                    if (i > -1) entry.target.style.transitionDelay = (i * 90) + "ms";
                }
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, obsOpts);
    document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

    // 5. GITHUB FETCH
    const ghGrid = document.getElementById('gh-repo-grid');
    const skels = document.getElementById('gh-skeletons');
    const ghErr = document.getElementById('gh-error');
    if (ghGrid && skels) {
        fetch("https://api.github.com/users/gohilnil/repos?sort=updated&per_page=10")
            .then(res => {
                if (!res.ok) throw new Error("API error");
                return res.json();
            })
            .then(data => {
                skels.style.display = 'none';
                const filtered = data.filter(r => !r.name.toLowerCase().includes("arogya")).slice(0, 6);
                filtered.forEach(r => {
                    const col = document.createElement('div');
                    col.className = 'col-md-6 col-lg-4 reveal';

                    let ic = 'fas fa-layer-group';
                    if (r.language === 'Python') ic = 'fab fa-python';
                    if (r.language === 'JavaScript') ic = 'fab fa-js';
                    if (r.language === 'HTML') ic = 'fab fa-html5';
                    if (r.language === 'CSS') ic = 'fab fa-css3-alt';

                    col.innerHTML = `
                    <div class="repo-card">
                       <div class="repo-header">
                           <div class="repo-ic"><i class="${ic}"></i></div>
                           <a href="${r.html_url}" class="repo-arr" target="_blank"><i class="fas fa-arrow-right"></i></a>
                       </div>
                       <h4 class="repo-name">${r.name}</h4>
                       <p class="repo-desc">${r.description || 'View repository on GitHub.'}</p>
                       <div class="repo-foot">
                           <span class="repo-lang">${r.language || 'Code'}</span>
                           <span class="repo-star"><i class="fas fa-star" style="color:#CCCCCC; margin-right:0.3rem;"></i>${r.stargazers_count}</span>
                       </div>
                    </div>`;
                    ghGrid.appendChild(col);
                    revObs.observe(col);
                });
            })
            .catch(() => {
                skels.style.display = 'none';
                if (ghErr) ghErr.style.display = 'block';
            });
    }

    // 6. CONTACT FORM — live via Formspree
    const cForm = document.getElementById("contact-form");
    const submitBtn = document.getElementById("form-submit-btn");
    if (cForm) {
        cForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const originalText = submitBtn ? submitBtn.textContent : "Send Message →";
            if (submitBtn) {
                submitBtn.textContent = "Sending…";
                submitBtn.disabled = true;
                submitBtn.style.opacity = "0.7";
            }
            try {
                const data = new FormData(cForm);
                const res = await fetch(cForm.action, {
                    method: "POST",
                    body: data,
                    headers: { Accept: "application/json" }
                });
                if (res.ok) {
                    cForm.style.display = "none";
                    const succ = document.getElementById("form-success");
                    if (succ) succ.style.display = "block";
                } else {
                    const json = await res.json().catch(() => ({}));
                    const msg = (json.errors || []).map(e => e.message).join(", ") || "Something went wrong. Please try again.";
                    alert("⚠️ " + msg);
                    if (submitBtn) {
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                        submitBtn.style.opacity = "1";
                    }
                }
            } catch (err) {
                alert("⚠️ Network error. Please check your connection and try again.");
                if (submitBtn) {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = "1";
                }
            }
        });
    }

    // 7. SMOOTH SCROLL
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function (e) {
            const t = this.getAttribute('href');
            if (t.length > 1) {
                e.preventDefault();
                const tg = document.querySelector(t);
                if (tg) {
                    window.scrollTo({
                        top: tg.getBoundingClientRect().top + window.scrollY,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // 8. FOOTER YEAR
    const yr = document.getElementById("current-year");
    if (yr) yr.textContent = new Date().getFullYear();

    // 9. SCROLL TO TOP
    const stBtn = document.getElementById("scrollTopBtn");
    const dBlock = document.getElementById("cta");
    if (stBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                stBtn.classList.add('show');
            } else {
                stBtn.classList.remove('show');
            }
            
            if (dBlock) {
                const fRect = dBlock.getBoundingClientRect();
                const bRect = stBtn.getBoundingClientRect();
                if (fRect.top <= bRect.bottom + 10) {
                    stBtn.classList.add('in-footer');
                } else {
                    stBtn.classList.remove('in-footer');
                }
            }
        });
        stBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
