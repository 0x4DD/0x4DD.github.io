        const heroName = document.getElementById('hero-name');
        let charElements = [];
        if (heroName) {
            const text = heroName.innerText;
            heroName.innerHTML = '';
            
            const outlineIndices = new Set([0, 2, 4]);

            text.split('').forEach((char, idx) => {
                const span = document.createElement('span');
                span.classList.add('char');
                if (outlineIndices.has(idx) && char.trim() !== '') {
                    span.classList.add('outline');
                }
                span.innerText = char;
                span.style.setProperty('--char-index', idx);
                span.style.transitionDelay = `${idx * 0.15}s`;
                heroName.appendChild(span);
                charElements.push(span);
            });
        }


        const subheadlineHTML = `I’m a <strong>3rd-year CSE undergraduate</strong> with a strong interest in technology and problem-solving. I’m passionate about <strong>cybersecurity</strong> and enjoy exploring security concepts and playing <strong>CTF</strong>s.
`;

        let revealTimeouts = [];
        let isIntroFinished = false;

        function setupSubtextDOM() {
            const container = document.getElementById('hero-about');
            if (!container) return;

            container.innerHTML = '';
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = subheadlineHTML;

            function wrapChars(node) {
                if (node.nodeType === Node.TEXT_NODE) {
                    const frag = document.createDocumentFragment();
                    const chars = node.textContent.split('');
                    chars.forEach(ch => {
                        const span = document.createElement('span');
                        span.className = 'subtext-char';
                        span.textContent = ch;
                        frag.appendChild(span);
                    });
                    return frag;
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const clone = node.cloneNode(false);
                    Array.from(node.childNodes).forEach(child => {
                        clone.appendChild(wrapChars(child));
                    });
                    return clone;
                }
                return node.cloneNode(true);
            }

            Array.from(tempDiv.childNodes).forEach(child => {
                container.appendChild(wrapChars(child));
            });
        }

        function startAutoRevealSequence() {
            setupSubtextDOM();
            const curtain = document.getElementById('pageCurtain');

            revealTimeouts.push(setTimeout(() => {
                if (curtain) curtain.classList.add('hidden');
                
                revealTimeouts.push(setTimeout(() => {
                    document.body.classList.add('name-revealed');
                    
                    revealTimeouts.push(setTimeout(() => {
                        const allSubChars = document.querySelectorAll('.subtext-char');
                        allSubChars.forEach((span, i) => {
                            revealTimeouts.push(setTimeout(() => {
                                span.classList.add('revealed');
                            }, i * 12));
                        });

                        revealTimeouts.push(setTimeout(() => {
                            document.body.classList.add('nav-visible');
                            isIntroFinished = true;
                        }, allSubChars.length * 12 + 200));

                    }, 600));

                }, 300));

            }, 300));
        }

        function forceCompleteIntro() {
            if (isIntroFinished) return;

            revealTimeouts.forEach(t => clearTimeout(t));
            revealTimeouts = [];

            const curtain = document.getElementById('pageCurtain');
            if (curtain) curtain.classList.add('hidden');
            
            document.body.classList.add('name-revealed');
            document.body.classList.add('nav-visible');

            const allSubChars = document.querySelectorAll('.subtext-char');
            if (allSubChars.length === 0) {
                setupSubtextDOM();
            }
            document.querySelectorAll('.subtext-char').forEach(span => {
                span.classList.add('revealed');
            });

            isIntroFinished = true;
        }

        window.addEventListener('load', () => {
            if (window.scrollY > 20) {
                forceCompleteIntro();
            } else {
                startAutoRevealSequence();
            }
        });

        window.addEventListener('scroll', () => {
            if (!isIntroFinished && window.scrollY > 10) {
                forceCompleteIntro();
            }
        }, { passive: true });


        const dot = document.querySelector('.cursor-dot');
        const outline = document.querySelector('.cursor-outline');
        let currentMouseX = window.innerWidth / 2;
        let currentMouseY = window.innerHeight / 2;
        
        window.addEventListener('mousemove', (e) => {
            currentMouseX = e.clientX;
            currentMouseY = e.clientY;
            dot.style.left = `${currentMouseX}px`;
            dot.style.top = `${currentMouseY}px`;
            
            outline.animate({
                left: `${currentMouseX}px`,
                top: `${currentMouseY}px`
            }, { duration: 400, fill: "forwards" });

            checkCardHoverOnScroll();
        });

        const hoverables = document.querySelectorAll('a, .tilt-card, .cert-flip-card, .hero-name .char, .pure-icon-btn, .marquee-header');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
        });


        function checkCardHoverOnScroll() {
            const certCards = document.querySelectorAll('.cert-flip-card');
            const hoveredEl = document.elementFromPoint(currentMouseX, currentMouseY);

            certCards.forEach(card => {
                if (card.contains(hoveredEl)) {
                    card.classList.add('is-flipped');
                } else {
                    card.classList.remove('is-flipped');
                }
            });
        }

        window.addEventListener('scroll', checkCardHoverOnScroll, { passive: true });


        const canvas = document.getElementById('bg-canvas');
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        let mouse = { x: width / 2, y: height / 2 };
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        class Blob {
            constructor(x, y, radius, color, speedX, speedY) {
                this.x = x;
                this.y = y;
                this.radius = radius;
                this.color = color;
                this.speedX = speedX;
                this.speedY = speedY;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x - this.radius < 0 || this.x + this.radius > width) this.speedX *= -1;
                if (this.y - this.radius < 0 || this.y + this.radius > height) this.speedY *= -1;
            }

            draw() {
                let grad = ctx.createRadialGradient(this.x, this.y, 10, this.x, this.y, this.radius);
                grad.addColorStop(0, this.color);
                grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const blobs = [
            new Blob(width * 0.2, height * 0.3, 350, 'rgba(255, 46, 46, 0.25)', 0.4, 0.3),
            new Blob(width * 0.8, height * 0.7, 400, 'rgba(0, 102, 255, 0.18)', -0.3, -0.4),
            new Blob(width * 0.5, height * 0.5, 300, 'rgba(120, 20, 220, 0.15)', 0.2, -0.3)
        ];

        function animateAurora() {
            ctx.clearRect(0, 0, width, height);

            blobs.forEach(b => {
                b.update();
                b.draw();
            });

            let mouseGrad = ctx.createRadialGradient(mouse.x, mouse.y, 10, mouse.x, mouse.y, 250);
            mouseGrad.addColorStop(0, 'rgba(255, 46, 46, 0.3)');
            mouseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = mouseGrad;
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 250, 0, Math.PI * 2);
            ctx.fill();

            requestAnimationFrame(animateAurora);
        }

        animateAurora();


        const tiltCards = document.querySelectorAll('.tilt-card:not(.sticky-stack-container .tilt-card)');
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 12;
                const rotateY = (centerX - x) / 12;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
            });
        });


        const reveals = document.querySelectorAll('.reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });

        reveals.forEach(el => observer.observe(el));

        const sectionHeaders = document.querySelectorAll('.marquee-header');
        const headerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('header-visible');
                } else {
                    entry.target.classList.remove('header-visible');
                }
            });
        }, { threshold: 0.15 });

        sectionHeaders.forEach(header => headerObserver.observe(header));

        function buildMarquees() {
            document.querySelectorAll('.marquee-track').forEach(track => {
                const label = track.dataset.marqueeText || '';
                track.innerHTML = '';

                let wordCounter = 0;
                const makeWord = () => {
                    const span = document.createElement('span');
                    const variant = wordCounter % 2 === 0 ? 'outline' : 'filled';
                    wordCounter++;
                    span.className = `marquee-word ${variant}`;
                    span.innerHTML = `${label}<span class="sep">&#10022;</span>`;
                    return span;
                };

                const half = document.createElement('div');
                half.style.display = 'flex';
                half.appendChild(makeWord());
                track.appendChild(half);

                const singleWidth = half.getBoundingClientRect().width || 300;
                const targetWidth = window.innerWidth * 2.2;
                let repeats = Math.max(3, Math.ceil(targetWidth / singleWidth));
                if (repeats % 2 !== 0) repeats++;
                for (let i = 1; i < repeats; i++) half.appendChild(makeWord());

                const halfClone = half.cloneNode(true);
                track.innerHTML = '';
                track.appendChild(half);
                track.appendChild(halfClone);

                const totalWidth = track.scrollWidth / 2;
                const pxPerSecond = 90;
                const duration = Math.max(12, totalWidth / pxPerSecond);
                track.style.animation = `marqueeScroll ${duration}s linear infinite`;
            });
        }

        buildMarquees();

        let marqueeResizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(marqueeResizeTimer);
            marqueeResizeTimer = setTimeout(buildMarquees, 250);
        });


        const supportsOffsetPath = CSS && CSS.supports && CSS.supports('offset-path', "path('M0 0')");

        function buildNavPlanePaths() {
            document.querySelectorAll('.nav-links a.fly-link').forEach(a => {
                const icon = a.querySelector('.nav-plane-icon');
                if (!icon) return;
                const w = a.offsetWidth || 90;
                const h = a.offsetHeight || 20;
                const midY = h / 2;
                const d = `M -8 ${midY + 4} Q ${w * 0.5} ${midY - h * 1.5} ${w + 8} ${midY - 2}`;
                if (supportsOffsetPath) {
                    icon.style.offsetPath = `path('${d}')`;
                }
            });
        }

        if (supportsOffsetPath) {
            buildNavPlanePaths();
            window.addEventListener('resize', buildNavPlanePaths);
        } else {
            document.querySelectorAll('.nav-plane-icon').forEach(i => i.style.display = 'none');
        }

        document.querySelectorAll('.nav-links a.fly-link[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                const targetEl = document.querySelector(targetId);
                if (!targetEl) return;
                e.preventDefault();
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                const targetY = targetEl.getBoundingClientRect().top + window.scrollY - 90;
                window.scrollTo({ top: targetY, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            });
        });


        const scTextEls = Array.from(document.querySelectorAll('.sc-text'));
        let scTicking = false;

        function updateScText() {
            const vh = window.innerHeight;
            scTextEls.forEach(el => {
                const rect = el.getBoundingClientRect();
                const raw = (vh - rect.top) / (vh * 0.55);
                let progress = Math.min(Math.max(raw, 0), 1);
                if (rect.bottom < vh * 0.15) {
                    const exit = Math.min(Math.max(rect.bottom / (vh * 0.15), 0), 1);
                    progress = Math.min(progress, exit);
                }
                el.style.setProperty('--sp', progress.toFixed(3));
            });
            scTicking = false;
        }

        function requestScTextUpdate() {
            if (!scTicking) {
                requestAnimationFrame(updateScText);
                scTicking = true;
            }
        }

        window.addEventListener('scroll', requestScTextUpdate, { passive: true });
        window.addEventListener('resize', requestScTextUpdate);
        requestScTextUpdate();

        const prefersReducedMotion2 = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        function clamp01(n) { return Math.min(Math.max(n, 0), 1); }

        function splitIntoWords(root) {
            const words = [];
            function walk(node) {
                Array.from(node.childNodes).forEach(child => {
                    if (child.nodeType === Node.TEXT_NODE) {
                        if (!child.textContent.trim()) return;
                        const frag = document.createDocumentFragment();
                        const parts = child.textContent.split(/(\s+)/);
                        parts.forEach(part => {
                            if (part === '') return;
                            if (/^\s+$/.test(part)) {
                                frag.appendChild(document.createTextNode(part));
                            } else {
                                const span = document.createElement('span');
                                span.className = 'word';
                                span.textContent = part;
                                frag.appendChild(span);
                                words.push(span);
                            }
                        });
                        child.replaceWith(frag);
                    } else if (child.nodeType === Node.ELEMENT_NODE) {
                        walk(child);
                    }
                });
            }
            walk(root);
            return words;
        }

        const wordRevealGroups = Array.from(document.querySelectorAll('.word-reveal')).map(el => ({
            el,
            words: splitIntoWords(el)
        })).filter(g => g.words.length);

        if (prefersReducedMotion2) {
            wordRevealGroups.forEach(g => g.words.forEach(w => w.classList.add('is-lit')));
        }

        const stackGroups = Array.from(document.querySelectorAll('.sticky-stack-container')).map(stack => ({
            cards: Array.from(stack.querySelectorAll(':scope > .tilt-card'))
        }));

        let unrealTicking = false;

        function updateUnrealEngine() {
            const vh = window.innerHeight;

            if (!prefersReducedMotion2) {
                wordRevealGroups.forEach(({ el, words }) => {
                    const rect = el.getBoundingClientRect();
                    const raw = (vh * 0.88 - rect.top) / (vh * 0.55);
                    const progress = clamp01(raw);
                    const n = words.length;
                    words.forEach((w, i) => {
                        const threshold = i / n;
                        if (progress > threshold) {
                            w.classList.add('is-lit');
                        } else {
                            w.classList.remove('is-lit');
                        }
                    });
                });
            }

            stackGroups.forEach(({ cards }) => {
                cards.forEach((card, i) => {
                    const rect = card.getBoundingClientRect();
                    const inRaw = (vh * 0.96 - rect.top) / (vh * 0.4);
                    card.style.setProperty('--stack-in', clamp01(inRaw).toFixed(3));

                    const next = cards[i + 1];
                    let outProg = 0;
                    if (next) {
                        const nRect = next.getBoundingClientRect();
                        const start = vh * 0.92;
                        const end = 110;
                        outProg = (start - nRect.top) / (start - end);
                        outProg = clamp01(outProg);
                    }
                    card.style.setProperty('--stack-out', outProg.toFixed(3));
                });
            });

            unrealTicking = false;
        }

        function requestUnrealUpdate() {
            if (!unrealTicking) {
                requestAnimationFrame(updateUnrealEngine);
                unrealTicking = true;
            }
        }

        if (!prefersReducedMotion2) {
            window.addEventListener('scroll', requestUnrealUpdate, { passive: true });
            window.addEventListener('resize', requestUnrealUpdate);
            requestUnrealUpdate();
        }


        const eduTrack = document.querySelector('.edu-scroll-track');
        const eduCards = eduTrack ? Array.from(eduTrack.querySelectorAll('.edu-card')) : [];
        let eduTicking = false;

        function updateEduStack() {
            const rect = eduTrack.getBoundingClientRect();
            const vh = window.innerHeight;
            const n = eduCards.length;

            let segmentPos;
            if (rect.top > 0) {
                const entryT = Math.min(Math.max((vh - rect.top) / (vh * 0.6), 0), 1);
                segmentPos = -1 + entryT;
            } else {
                segmentPos = Math.min(Math.max(-rect.top / vh, 0), n - 1);
            }

            eduCards.forEach((card, i) => {
                const state = segmentPos - i;
                let x, o;
                if (state <= -1) {
                    x = 100; o = 0;
                } else if (state < 0) {
                    const t = state + 1;
                    x = (1 - t) * 100; o = t;
                } else if (state >= 1) {
                    x = -100; o = 0;
                } else if (state > 0) {
                    x = -state * 100; o = 1 - state;
                } else {
                    x = 0; o = 1;
                }
                card.style.setProperty('--edu-x', x.toFixed(2) + '%');
                card.style.setProperty('--edu-o', o.toFixed(3));
                card.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
            });

            eduTicking = false;
        }

        function requestEduUpdate() {
            if (!eduTicking) {
                requestAnimationFrame(updateEduStack);
                eduTicking = true;
            }
        }

        if (eduTrack && eduCards.length && !prefersReducedMotion2) {
            window.addEventListener('scroll', requestEduUpdate, { passive: true });
            window.addEventListener('resize', requestEduUpdate);
            requestEduUpdate();
        }


        const revealItems = Array.from(document.querySelectorAll('.smooth-reveal-item'));
        let gridTargets = new Array(revealItems.length).fill(0);
        let gridCurrent = new Array(revealItems.length).fill(0);

        function calculateGridTargets() {
            const vh = window.innerHeight;

            revealItems.forEach((item, idx) => {
                const rect = item.getBoundingClientRect();
                const entryProgress = (vh - rect.top) / (vh * 0.3);
                const exitProgress = rect.bottom / (vh * 0.3);

                let p = Math.min(entryProgress, exitProgress);
                gridTargets[idx] = Math.max(0, Math.min(1, p));
            });
        }

        function renderGridTransitions() {
            revealItems.forEach((item, idx) => {
                gridCurrent[idx] += (gridTargets[idx] - gridCurrent[idx]) * 0.085;
                item.style.setProperty('--reveal-p', gridCurrent[idx].toFixed(4));
            });
            requestAnimationFrame(renderGridTransitions);
        }

        if (revealItems.length) {
            if (prefersReducedMotion2) {
                revealItems.forEach(item => item.style.setProperty('--reveal-p', 1));
            } else {
                window.addEventListener('scroll', calculateGridTargets, { passive: true });
                window.addEventListener('resize', calculateGridTargets);
                calculateGridTargets();
                requestAnimationFrame(renderGridTransitions);
            }
        }
