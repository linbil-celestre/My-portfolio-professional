 /* Contact form feedback */
        function handleContactForm(e) {
            e.preventDefault();
            var btn = document.getElementById('contact-submit-btn');
            var success = document.getElementById('contact-form-success');
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sendingâ€¦';
            setTimeout(function () {
                btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
                btn.disabled = false;
                success.classList.add('visible');
                e.target.reset();
                setTimeout(function () { success.classList.remove('visible'); }, 4000);
            }, 1200);
        }

        /* Tooltip Handler */
        document.querySelectorAll('.project-card-button[title]').forEach(function (button) {
            button.dataset.tooltip = button.getAttribute('title');
            button.removeAttribute('title');
        });

        /* Single Page Application (SPA) Routing & Titles */
        var pageTitles = {
            home: 'Portfolio',
            about: 'About',
            services: 'Services',
            project: 'Projects',
            contact: 'Contact',
            certificate: 'Certificate'
        };

        var loadingBar = document.getElementById('pageLoadingBar');
        var contentSpinnerOverlay = document.getElementById('contentSpinnerOverlay');
        var loadingTimeout;
        var spinnerTimeout;

        function triggerPageLoading() {
            // Top bar
            if (loadingBar) {
                clearTimeout(loadingTimeout);
                loadingBar.classList.remove('is-finished', 'is-loading');
                void loadingBar.offsetWidth;
                loadingBar.classList.add('is-loading');
                loadingTimeout = setTimeout(function () {
                    loadingBar.classList.remove('is-loading');
                    loadingBar.classList.add('is-finished');
                    setTimeout(function () {
                        loadingBar.classList.remove('is-finished');
                    }, 350);
                }, 260);
            }
            // Center circular spinner
            if (contentSpinnerOverlay) {
                clearTimeout(spinnerTimeout);
                contentSpinnerOverlay.classList.add('is-visible');
                spinnerTimeout = setTimeout(function () {
                    contentSpinnerOverlay.classList.remove('is-visible');
                }, 380);
            }
        }

        function showPage(target) {
            triggerPageLoading();

            document.querySelectorAll('.page').forEach(function (p) {
                p.classList.toggle('active', p.id === 'page-' + target);
            });

            document.querySelectorAll('nav li').forEach(function (li) {
                var link = li.querySelector('a[data-page]');
                li.classList.toggle('active', Boolean(link && link.dataset.page === target));
            });

            // Update browser tab title
            document.title = pageTitles[target] || 'Portfolio | Lin Bil Celestre';

            if (target && target !== 'home') {
                history.replaceState(null, '', '#' + target);
            } else {
                history.replaceState(null, '', window.location.pathname);
            }
        }

        function initPageFromHash() {
            var hash = (location.hash || '').replace('#', '').trim();
            var page = hash || 'home';
            var valid = document.getElementById('page-' + page);
            if (!valid) page = 'home';
            showPage(page);
        }

        document.querySelectorAll('a[data-page]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                var target = this.dataset.page;
                showPage(target);
            });
        });

        /* ============================================================
           SERVICES CAROUSEL LOGIC
           ============================================================ */
        (function initServicesCarousel() {
            var track = document.getElementById('srvTrack');
            var prevBtn = document.getElementById('srvPrev');
            var nextBtn = document.getElementById('srvNext');
            var dotsWrap = document.getElementById('srvDots');
            if (!track || !prevBtn || !nextBtn) return;

            var cards = Array.from(track.querySelectorAll('.service-card'));
            var total = cards.length;
            var current = 0;
            var perView = 3; // cards visible at once

            // Determine perView from viewport
            function getPerView() {
                if (window.innerWidth <= 580) return 1;
                if (window.innerWidth <= 900) return 2;
                return 3;
            }

            // Number of slides = total - perView
            function maxIndex() { return Math.max(0, total - perView); }

            // Build dots
            function buildDots() {
                dotsWrap.innerHTML = '';
                var steps = maxIndex() + 1;
                for (var i = 0; i < steps; i++) {
                    (function (idx) {
                        var dot = document.createElement('button');
                        dot.className = 'srv-dot' + (idx === current ? ' active' : '');
                        dot.type = 'button';
                        dot.setAttribute('aria-label', 'Go to slide ' + (idx + 1));
                        dot.addEventListener('click', function () { goTo(idx); });
                        dotsWrap.appendChild(dot);
                    })(i);
                }
            }

            // Update dots highlight
            function updateDots() {
                var dots = dotsWrap.querySelectorAll('.srv-dot');
                dots.forEach(function (d, i) {
                    d.classList.toggle('active', i === current);
                });
            }

            // Calculate card width including gap
            function getOffset() {
                if (!cards[0]) return 0;
                var card = cards[0];
                var gap = parseInt(getComputedStyle(track).gap) || 18;
                return (card.offsetWidth + gap) * current;
            }

            // Slide to index
            function goTo(idx) {
                current = Math.max(0, Math.min(idx, maxIndex()));
                track.style.transform = 'translateX(-' + getOffset() + 'px)';
                prevBtn.disabled = current === 0;
                nextBtn.disabled = current >= maxIndex();
                updateDots();
            }

            // Recalculate on resize
            function onResize() {
                perView = getPerView();
                current = Math.min(current, maxIndex());
                buildDots();
                goTo(current);
            }

            prevBtn.addEventListener('click', function () { goTo(current - 1); });
            nextBtn.addEventListener('click', function () { goTo(current + 1); });

            // Keyboard support
            document.getElementById('srvCarousel') && document.getElementById('srvCarousel').addEventListener('keydown', function (e) {
                if (e.key === 'ArrowRight') goTo(current + 1);
                if (e.key === 'ArrowLeft') goTo(current - 1);
            });

            // Touch / swipe
            var touchStartX = 0;
            track.addEventListener('touchstart', function (e) {
                touchStartX = e.touches[0].clientX;
            }, { passive: true });
            track.addEventListener('touchend', function (e) {
                var diff = touchStartX - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 40) { diff > 0 ? goTo(current + 1) : goTo(current - 1); }
            }, { passive: true });

            window.addEventListener('resize', onResize);

            // Init
            perView = getPerView();
            buildDots();
            goTo(0);
        })();

        /* CERTIFICATE GRID & CAROUSEL TOGGLE LOGIC */
        /* TOGGLE BETWEEN CAROUSEL AND GRID LAYOUT */
        var certificateGridBtn = document.getElementById('certificateGridBtn');
        var certSectionContainer = document.getElementById('certSectionContainer');

        if (certificateGridBtn && certSectionContainer) {
            certificateGridBtn.addEventListener('click', function () {
                var isGrid = certSectionContainer.classList.toggle('is-grid');

                this.classList.toggle('active', isGrid);
                this.setAttribute('aria-pressed', String(isGrid));

                if (isGrid) {
                    this.innerHTML = '<i class="fa-solid fa-rotate"></i> CAROUSEL LAYOUT';
                } else {
                    this.innerHTML = '<i class="fa-solid fa-border-all"></i> GRID LAYOUT';
                }
            });
        }

        window.addEventListener('hashchange', function () {
            initPageFromHash();
        });

        // QR Code Frame click handler
        var contactQrFrame = document.querySelector('.contact-qr-frame');
        if (contactQrFrame) {
            contactQrFrame.addEventListener('click', function (e) {
                if (e.target.closest('a')) return;
                window.open('https://mail.google.com/mail/?view=cm&fs=1&to=linbilcelestre3@gmail.com', '_blank', 'noopener');
            });
        }

        // Initialize page display
        initPageFromHash();

        /* ============================================================
           PROJECTS INTERACTIVE CONTROLLER (PAUSE / STOP ON CARD CLICK)
           ============================================================ */
        (function initProjectsController() {
            var wrapper = document.getElementById('projectsShowcaseWrapper');
            var container = document.getElementById('projectsContainer');
            if (!container) return;

            var allCards = Array.from(container.querySelectorAll('.project-card'));
            var isPaused = false;

            function setPaused(paused) {
                isPaused = paused;
                if (wrapper) wrapper.classList.toggle('is-paused', isPaused);
                if (container) container.classList.toggle('is-paused', isPaused);
            }

            // Click any card to stop / resume animation
            allCards.forEach(function (card) {
                card.addEventListener('click', function (e) {
                    // If user clicked directly on an action link (GitHub, Image, Live), allow opening while pausing
                    if (e.target.closest('a')) {
                        setPaused(true);
                        return;
                    }

                    var wasActive = card.classList.contains('is-active');

                    if (wasActive && isPaused) {
                        // Click again on the stopped card to resume
                        allCards.forEach(function (c) { c.classList.remove('is-active'); });
                        setPaused(false);
                    } else {
                        // Stop animation and highlight this card!
                        allCards.forEach(function (c) { c.classList.remove('is-active'); });
                        card.classList.add('is-active');
                        setPaused(true);

                        // Smoothly center the card in view
                        card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    }
                });
            });
        })();

        /* ============================================================
           OTHER CERTIFICATES - 3D COVERFLOW CARD SLIDER LOGIC
           ============================================================ */
        (function initOtherCert3DSlider() {
            var slider = document.getElementById('cert3dSlider');
            if (!slider) return;

            var stage = document.getElementById('cert3dStage');
            var cards = Array.from(stage.querySelectorAll('.cert-3d-card'));
            var prevBtn = document.getElementById('cert3dPrev');
            var nextBtn = document.getElementById('cert3dNext');
            var dotsContainer = document.getElementById('cert3dDots');
            var activeTitle = document.getElementById('cert3dActiveTitle');
            var activeIssuer = document.getElementById('cert3dActiveIssuer');
            var activeLink = document.getElementById('cert3dActiveLink');
            var viewport = document.getElementById('cert3dViewport');

            var totalCards = cards.length;
            var uniqueCount = 4; // 4 unique certificates
            var currentIndex = 0;
            var autoplayTimer = null;
            var isPointerDown = false;
            var pointerStartX = 0;
            var pointerMoveX = 0;

            // Generate pagination dots for unique certificates
            dotsContainer.innerHTML = '';
            for (var d = 0; d < uniqueCount; d++) {
                var dot = document.createElement('button');
                dot.className = 'cert-3d-dot' + (d === 0 ? ' active' : '');
                dot.type = 'button';
                dot.setAttribute('aria-label', 'Go to certificate ' + (d + 1));
                (function (dotIndex) {
                    dot.addEventListener('click', function () {
                        goToUnique(dotIndex);
                        restartAutoplay();
                    });
                })(d);
                dotsContainer.appendChild(dot);
            }
            var dots = Array.from(dotsContainer.querySelectorAll('.cert-3d-dot'));

            function updateSlider(animateText) {
                cards.forEach(function (card, idx) {
                    // Calculate shortest circular difference
                    var diff = (idx - currentIndex) % totalCards;
                    if (diff > totalCards / 2) diff -= totalCards;
                    if (diff < -totalCards / 2) diff += totalCards;

                    // Reset position classes
                    card.classList.remove('pos-center', 'pos-prev-1', 'pos-next-1', 'pos-prev-2', 'pos-next-2', 'pos-hidden');

                    if (diff === 0) {
                        card.classList.add('pos-center');
                        card.setAttribute('aria-hidden', 'false');
                    } else if (diff === -1) {
                        card.classList.add('pos-prev-1');
                        card.setAttribute('aria-hidden', 'true');
                    } else if (diff === 1) {
                        card.classList.add('pos-next-1');
                        card.setAttribute('aria-hidden', 'true');
                    } else if (diff === -2) {
                        card.classList.add('pos-prev-2');
                        card.setAttribute('aria-hidden', 'true');
                    } else if (diff === 2) {
                        card.classList.add('pos-next-2');
                        card.setAttribute('aria-hidden', 'true');
                    } else {
                        card.classList.add('pos-hidden');
                        card.setAttribute('aria-hidden', 'true');
                    }
                });

                // Update active info
                var currentCard = cards[currentIndex];
                var title = currentCard.dataset.title || '';
                var issuer = currentCard.dataset.issuer || '';
                var link = currentCard.dataset.link || '#';

                if (activeTitle && activeIssuer && activeLink) {
                    if (animateText) {
                        activeTitle.style.opacity = '0';
                        activeTitle.style.transform = 'translateY(6px)';
                        activeIssuer.style.opacity = '0';
                        activeIssuer.style.transform = 'translateY(4px)';

                        setTimeout(function () {
                            activeTitle.textContent = title;
                            activeIssuer.textContent = issuer;
                            activeLink.href = link;
                            activeTitle.style.opacity = '1';
                            activeTitle.style.transform = 'translateY(0)';
                            activeIssuer.style.opacity = '1';
                            activeIssuer.style.transform = 'translateY(0)';
                        }, 180);
                    } else {
                        activeTitle.textContent = title;
                        activeIssuer.textContent = issuer;
                        activeLink.href = link;
                    }
                }

                // Update dots
                var activeDotIndex = currentIndex % uniqueCount;
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('active', i === activeDotIndex);
                });
            }

            function next() {
                currentIndex = (currentIndex + 1) % totalCards;
                updateSlider(true);
            }

            function prev() {
                currentIndex = (currentIndex - 1 + totalCards) % totalCards;
                updateSlider(true);
            }

            function goToUnique(targetUnique) {
                var currentUnique = currentIndex % uniqueCount;
                var diff = targetUnique - currentUnique;
                if (diff > uniqueCount / 2) diff -= uniqueCount;
                if (diff < -uniqueCount / 2) diff += uniqueCount;

                currentIndex = (currentIndex + diff + totalCards) % totalCards;
                updateSlider(true);
            }

            // Card click events
            cards.forEach(function (card, idx) {
                card.addEventListener('click', function (e) {
                    if (idx === currentIndex) {
                        var link = card.dataset.link;
                        if (link) window.open(link, '_blank');
                    } else {
                        currentIndex = idx;
                        updateSlider(true);
                        restartAutoplay();
                    }
                });
            });

            if (nextBtn) {
                nextBtn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    next();
                    restartAutoplay();
                });
            }

            if (prevBtn) {
                prevBtn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    prev();
                    restartAutoplay();
                });
            }

            // Keyboard navigation when slider is focused
            slider.addEventListener('keydown', function (e) {
                if (e.key === 'ArrowRight') {
                    next();
                    restartAutoplay();
                } else if (e.key === 'ArrowLeft') {
                    prev();
                    restartAutoplay();
                }
            });

            // Touch and mouse drag gestures
            viewport.addEventListener('mousedown', function (e) {
                isPointerDown = true;
                pointerStartX = e.clientX;
                pointerMoveX = e.clientX;
            });

            window.addEventListener('mousemove', function (e) {
                if (!isPointerDown) return;
                pointerMoveX = e.clientX;
            });

            window.addEventListener('mouseup', function (e) {
                if (!isPointerDown) return;
                isPointerDown = false;
                var diff = pointerMoveX - pointerStartX;
                if (Math.abs(diff) > 40) {
                    if (diff < 0) {
                        next();
                    } else {
                        prev();
                    }
                    restartAutoplay();
                }
            });

            viewport.addEventListener('touchstart', function (e) {
                if (e.touches.length > 0) {
                    pointerStartX = e.touches[0].clientX;
                    pointerMoveX = e.touches[0].clientX;
                }
            }, { passive: true });

            viewport.addEventListener('touchmove', function (e) {
                if (e.touches.length > 0) {
                    pointerMoveX = e.touches[0].clientX;
                }
            }, { passive: true });

            viewport.addEventListener('touchend', function () {
                var diff = pointerMoveX - pointerStartX;
                if (Math.abs(diff) > 40) {
                    if (diff < 0) {
                        next();
                    } else {
                        prev();
                    }
                    restartAutoplay();
                }
            });

            // Gentle autoplay
            function startAutoplay() {
                stopAutoplay();
                autoplayTimer = setInterval(function () {
                    next();
                }, 4000);
            }

            function stopAutoplay() {
                if (autoplayTimer) {
                    clearInterval(autoplayTimer);
                    autoplayTimer = null;
                }
            }

            function restartAutoplay() {
                stopAutoplay();
                startAutoplay();
            }

            slider.addEventListener('mouseenter', stopAutoplay);
            slider.addEventListener('mouseleave', startAutoplay);
            slider.addEventListener('focusin', stopAutoplay);
            slider.addEventListener('focusout', startAutoplay);

            // Initial render without text animation jump
            updateSlider(false);
            startAutoplay();
        })();

        /* -- Sidebar Skeleton Loading Screen Dismiss -- */
        (function () {
            var overlay = document.getElementById('sidebarLoadingOverlay');
            if (!overlay) return;
            var navItems = overlay.querySelectorAll('.sk-nav-item');
            navItems.forEach(function (el, i) {
                el.style.setProperty('--i', i);
            });
            setTimeout(function () {
                overlay.classList.add('is-hidden');
                setTimeout(function () {
                    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                }, 700);
            }, 900);
        })();

        /* ============================================================
           PROJECT VIEW TOGGLE & CONTINUOUS INFINITE VIDEO CAROUSEL
           ============================================================ */
        (function initProjViewToggle() {
            var btnProjects   = document.getElementById('toggleProjects');
            var btnVideo      = document.getElementById('toggleVideo');
            var showcase      = document.getElementById('projectsShowcaseWrapper');
            var videoPanel    = document.getElementById('projVideoPanel');
            var h1            = document.getElementById('projH1');
            var sub           = document.getElementById('projSubtitle');
            var viewAllBtn    = document.getElementById('pvideoViewAllBtn');

            var carouselWrap  = document.getElementById('pvideoCarouselWrap');
            var viewport      = document.getElementById('pvideoCarouselViewport');
            var track         = document.getElementById('pvideoCarouselTrack');
            var dots          = document.querySelectorAll('.pvideo-dot');

            var prevButtons   = [document.getElementById('pvideoPrevBtn'), document.getElementById('pvideoArrowPrev')];
            var nextButtons   = [document.getElementById('pvideoNextBtn'), document.getElementById('pvideoArrowNext')];

            if (!btnProjects || !btnVideo) return;

            /* Continuous Animation & Interaction States */
            var isGlideActive      = false;
            var isHovered          = false;
            var isDragging         = false;
            var isManualAnimating  = false;
            var hasDragged         = false;
            var scrollPos          = 0;
            var glideSpeed         = 0.85; /* pixels per frame at 60fps for silky smooth motion */
            var dragStartX         = 0;
            var dragCurrentX       = 0;
            var dragStartScrollPos = 0;
            var animFrameId        = null;

            function activateProjects() {
                btnProjects.classList.add('active');
                btnVideo.classList.remove('active');
                btnProjects.setAttribute('aria-pressed', 'true');
                btnVideo.setAttribute('aria-pressed', 'false');
                if (showcase) showcase.style.display = '';
                if (videoPanel) { videoPanel.classList.remove('is-visible'); }
                if (h1) h1.textContent = 'Projects';
                if (sub) sub.textContent = 'OJT, Capstone, And Client Projects';
                isGlideActive = false;
            }

            function activateVideo() {
                btnVideo.classList.add('active');
                btnProjects.classList.remove('active');
                btnVideo.setAttribute('aria-pressed', 'true');
                btnProjects.setAttribute('aria-pressed', 'false');
                if (showcase) showcase.style.display = 'none';
                if (videoPanel) { videoPanel.classList.add('is-visible'); }
                if (h1) h1.textContent = 'Project Videos';
                if (sub) sub.textContent = "Here are some of my recent video editing projects. Each one showcases different styles and skills I've developed.";
                updateDots();
                isGlideActive = true;
                startGlideLoop();
            }

            btnProjects.addEventListener('click', activateProjects);
            btnVideo.addEventListener('click', activateVideo);

            if (viewAllBtn) {
                viewAllBtn.addEventListener('click', activateProjects);
            }

            // Video Preview Modal Handler
            var modal = document.getElementById('pvideoModal');
            var modalClose = document.getElementById('pvideoModalClose');
            var modalTitle = document.getElementById('pvideoModalTitle');
            var modalSub = document.getElementById('pvideoModalSub');
            var modalDesc = document.getElementById('pvideoModalDesc');
            var modalPreviewTitle = document.getElementById('pvideoModalPreviewTitle');
            var modalPreviewTag = document.getElementById('pvideoModalPreviewTag');
            var modalTime = document.getElementById('pvideoModalTime');
            var cinemaBg = document.getElementById('pvideoCinemaBg');

            function openVideoModal(card) {
                if (!modal) return;
                var title = card.getAttribute('data-video-title') || 'Video Project';
                var subText = card.getAttribute('data-video-sub') || 'Video Demo';
                var dur = card.getAttribute('data-video-dur') || '02:30';
                var desc = card.getAttribute('data-video-desc') || '';
                var img = card.querySelector('.pvideo-thumb-img');

                if (modalTitle) modalTitle.textContent = title;
                if (modalPreviewTitle) modalPreviewTitle.textContent = title;
                if (modalSub) modalSub.textContent = subText;
                if (modalPreviewTag) modalPreviewTag.textContent = subText + ' • ' + dur;
                if (modalDesc) modalDesc.textContent = desc;
                if (modalTime) modalTime.textContent = '00:00 / ' + dur;

                if (cinemaBg && img) {
                    cinemaBg.style.backgroundImage = 'url(' + img.src + ')';
                }

                modal.classList.add('is-open');
                document.body.style.overflow = 'hidden';
            }

            function closeVideoModal() {
                if (!modal) return;
                modal.classList.remove('is-open');
                document.body.style.overflow = '';
            }

            if (modalClose) {
                modalClose.addEventListener('click', closeVideoModal);
            }

            if (modal) {
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        closeVideoModal();
                    }
                });
            }

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
                    closeVideoModal();
                }
            });

            /* ============================================================
               CONTINUOUS INFINITE CAROUSEL ANIMATION (0 Duplicate Cards)
               Pure dynamic node cycling ensures an endless seamless loop
               with ZERO duplicates in HTML or DOM.
               ============================================================ */
            if (!track || !viewport) return;

            function getStepWidth() {
                var first = track.firstElementChild;
                if (!first) return 360;
                var gap = parseFloat(window.getComputedStyle(track).gap) || 18;
                return first.getBoundingClientRect().width + gap;
            }

            function updateDots() {
                if (!track.firstElementChild) return;
                var activeIdx = track.firstElementChild.getAttribute('data-video-index');
                dots.forEach(function(dot) {
                    var dotIdx = dot.getAttribute('data-dot-index');
                    dot.classList.toggle('active', dotIdx === activeIdx);
                });
            }

            // Main 60fps Continuous Infinite Glide Animation Loop
            function startGlideLoop() {
                if (animFrameId) cancelAnimationFrame(animFrameId);

                function glideStep() {
                    var isModalOpen = modal && modal.classList.contains('is-open');

                    if (isGlideActive && !isHovered && !isDragging && !isManualAnimating && !isModalOpen) {
                        scrollPos += glideSpeed;
                        var step = getStepWidth();

                        if (scrollPos >= step) {
                            scrollPos -= step;
                            var first = track.firstElementChild;
                            if (first) {
                                track.appendChild(first);
                                updateDots();
                            }
                        }

                        track.style.transform = 'translate3d(-' + scrollPos + 'px, 0, 0)';
                    }

                    if (isGlideActive) {
                        animFrameId = requestAnimationFrame(glideStep);
                    }
                }

                animFrameId = requestAnimationFrame(glideStep);
            }

            // Manual step forward (animated via requestAnimationFrame)
            function manualSlideNext() {
                if (isManualAnimating) return;
                isManualAnimating = true;

                var first = track.firstElementChild;
                if (!first) { isManualAnimating = false; return; }

                var step = getStepWidth();
                var startPos = scrollPos;
                var target = step;
                var startTime = performance.now();
                var duration = 380; // ms

                function animateNext(now) {
                    var elapsed = now - startTime;
                    var progress = Math.min(elapsed / duration, 1);
                    var ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
                    var cur = startPos + (target - startPos) * ease;
                    track.style.transform = 'translate3d(-' + cur + 'px, 0, 0)';

                    if (progress < 1) {
                        requestAnimationFrame(animateNext);
                    } else {
                        track.appendChild(first);
                        scrollPos = 0;
                        track.style.transform = 'translate3d(0, 0, 0)';
                        updateDots();
                        isManualAnimating = false;
                    }
                }

                requestAnimationFrame(animateNext);
            }

            // Manual step backward (animated via requestAnimationFrame)
            function manualSlidePrev() {
                if (isManualAnimating) return;
                isManualAnimating = true;

                var last = track.lastElementChild;
                if (!last) { isManualAnimating = false; return; }

                var step = getStepWidth();
                track.insertBefore(last, track.firstElementChild);
                scrollPos += step;
                track.style.transform = 'translate3d(-' + scrollPos + 'px, 0, 0)';

                var startPos = scrollPos;
                var target = 0;
                var startTime = performance.now();
                var duration = 380; // ms

                function animatePrev(now) {
                    var elapsed = now - startTime;
                    var progress = Math.min(elapsed / duration, 1);
                    var ease = 1 - Math.pow(1 - progress, 3);
                    var cur = startPos + (target - startPos) * ease;
                    track.style.transform = 'translate3d(-' + cur + 'px, 0, 0)';

                    if (progress < 1) {
                        requestAnimationFrame(animatePrev);
                    } else {
                        scrollPos = 0;
                        track.style.transform = 'translate3d(0, 0, 0)';
                        updateDots();
                        isManualAnimating = false;
                    }
                }

                requestAnimationFrame(animatePrev);
            }

            // Arrow buttons event listeners
            prevButtons.forEach(function(btn) {
                if (btn) {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        manualSlidePrev();
                    });
                }
            });

            nextButtons.forEach(function(btn) {
                if (btn) {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        manualSlideNext();
                    });
                }
            });

            // Dots click navigation
            dots.forEach(function(dot) {
                dot.addEventListener('click', function() {
                    if (isManualAnimating) return;
                    var targetIdx = dot.getAttribute('data-dot-index');
                    var currentIdx = track.firstElementChild.getAttribute('data-video-index');
                    if (targetIdx === currentIdx) return;

                    var children = Array.prototype.slice.call(track.children);
                    var targetPos = children.findIndex(function(c) {
                        return c.getAttribute('data-video-index') === targetIdx;
                    });

                    if (targetPos > 0) {
                        manualSlideNext();
                    }
                });
            });

            // Card click via event delegation (ensures cycled nodes always respond)
            track.addEventListener('click', function(e) {
                if (hasDragged) return;
                var card = e.target.closest('.pvideo-card');
                if (card) {
                    openVideoModal(card);
                }
            });

            // Pause continuous glide on hover so users can easily read & click
            if (carouselWrap) {
                carouselWrap.addEventListener('mouseenter', function() {
                    isHovered = true;
                });
                carouselWrap.addEventListener('mouseleave', function() {
                    isHovered = false;
                });
            }

            // Touch / Mouse Drag Gestures
            function onPointerDown(clientX) {
                if (isManualAnimating) return;
                isDragging = true;
                hasDragged = false;
                dragStartX = clientX;
                dragCurrentX = clientX;
                dragStartScrollPos = scrollPos;
                viewport.classList.add('is-dragging');
            }

            function onPointerMove(clientX) {
                if (!isDragging) return;
                dragCurrentX = clientX;
                var diff = dragCurrentX - dragStartX;
                if (Math.abs(diff) > 8) {
                    hasDragged = true;
                }
                var step = getStepWidth();
                var current = dragStartScrollPos - diff;

                while (current >= step) {
                    current -= step;
                    dragStartScrollPos -= step;
                    var first = track.firstElementChild;
                    if (first) {
                        track.appendChild(first);
                        updateDots();
                    }
                }

                while (current < 0) {
                    current += step;
                    dragStartScrollPos += step;
                    var last = track.lastElementChild;
                    if (last) {
                        track.insertBefore(last, track.firstElementChild);
                        updateDots();
                    }
                }

                scrollPos = current;
                track.style.transform = 'translate3d(-' + scrollPos + 'px, 0, 0)';
            }

            function onPointerUp() {
                if (!isDragging) return;
                isDragging = false;
                viewport.classList.remove('is-dragging');
                setTimeout(function() {
                    hasDragged = false;
                }, 80);
            }

            viewport.addEventListener('mousedown', function(e) {
                onPointerDown(e.clientX);
            });

            window.addEventListener('mousemove', function(e) {
                if (isDragging) onPointerMove(e.clientX);
            });

            window.addEventListener('mouseup', function() {
                if (isDragging) onPointerUp();
            });

            viewport.addEventListener('touchstart', function(e) {
                if (e.touches.length > 0) {
                    onPointerDown(e.touches[0].clientX);
                }
            }, { passive: true });

            viewport.addEventListener('touchmove', function(e) {
                if (e.touches.length > 0) {
                    onPointerMove(e.touches[0].clientX);
                }
            }, { passive: true });

            viewport.addEventListener('touchend', function() {
                onPointerUp();
            });

            // Keyboard navigation
            document.addEventListener('keydown', function(e) {
                if (!videoPanel || !videoPanel.classList.contains('is-visible')) return;
                if (modal && modal.classList.contains('is-open')) return;

                if (e.key === 'ArrowRight') {
                    manualSlideNext();
                } else if (e.key === 'ArrowLeft') {
                    manualSlidePrev();
                }
            });

            updateDots();
        })();

        /* ============================================================
           ABOUT ME — Tech Skills / Video Editing Skills Swap
           ============================================================ */
        (function initSkillsSwap() {
            var swapBtn = document.getElementById('skillsSwapBtn');
            var btnText = document.getElementById('skillsSwapBtnText');
            var btnIcon = document.getElementById('skillsSwapIcon');
            var titleText = document.getElementById('skillsTitleText');
            var techPanel = document.getElementById('techSkillsPanel');
            var videoPanel = document.getElementById('videoSkillsPanel');

            if (!swapBtn || !techPanel || !videoPanel) return;

            var currentView = 'tech'; // 'tech' or 'video'

            function animateBars(panel) {
                var bars = panel.querySelectorAll('.skill-bar span');
                bars.forEach(function(bar) {
                    bar.style.animation = 'none';
                    bar.offsetHeight; /* force reflow */
                    bar.style.animation = '';
                });
            }

            swapBtn.addEventListener('click', function() {
                if (currentView === 'tech') {
                    currentView = 'video';
                    techPanel.classList.remove('is-active');
                    techPanel.classList.add('is-hidden');
                    videoPanel.classList.remove('is-hidden');
                    videoPanel.classList.add('is-active');

                    if (titleText) titleText.textContent = 'VIDEO EDITING SKILLS';
                    if (btnText) btnText.textContent = 'WEB DEVELOPMENT SKILLS';
                    if (btnIcon) {
                        btnIcon.className = 'fa-solid fa-chevron-left';
                    }
                    animateBars(videoPanel);
                } else {
                    currentView = 'tech';
                    videoPanel.classList.remove('is-active');
                    videoPanel.classList.add('is-hidden');
                    techPanel.classList.remove('is-hidden');
                    techPanel.classList.add('is-active');

                    if (titleText) titleText.textContent = 'WEB DEVELOPMENT SKIILS';
                    if (btnText) btnText.textContent = 'VIDEO EDITING SKILLS';
                    if (btnIcon) {
                        btnIcon.className = 'fa-solid fa-chevron-right';
                    }
                    animateBars(techPanel);
                }
            });
        })();