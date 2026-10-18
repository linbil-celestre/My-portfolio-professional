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

            // Update browser tab title and favicon
            document.title = pageTitles[target] || 'Portfolio | Lin Bil Celestre';
            ensureFavicon();

            if (target && target !== 'home') {
                history.replaceState(null, '', '#' + target);
            } else {
                history.replaceState(null, '', window.location.pathname);
            }
        }

        function ensureFavicon() {
            var icon = document.querySelector("link[rel='icon']");
            if (!icon) {
                icon = document.createElement('link');
                icon.rel = 'icon';
                icon.type = 'image/jpeg';
                document.head.appendChild(icon);
            }
            icon.href = './logo/logo3.jpg';
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
           PROJECTS INTERACTIVE CONTROLLER (CARD HIGHLIGHT ON CLICK)
           ============================================================ */
        (function initProjectsController() {
            var container = document.getElementById('projectsContainer');
            if (!container) return;

            var allCards = Array.from(container.querySelectorAll('.project-card'));

            // Click any card to toggle highlight
            allCards.forEach(function (card) {
                card.addEventListener('click', function (e) {
                    if (e.target.closest('a')) return;

                    var wasActive = card.classList.contains('is-active');
                    allCards.forEach(function (c) { c.classList.remove('is-active'); });

                    if (!wasActive) {
                        card.classList.add('is-active');
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

                    if (titleText) titleText.textContent = 'WEB DEVELOPMENT SKILLS';
                    if (btnText) btnText.textContent = 'VIDEO EDITING SKILLS';
                    if (btnIcon) {
                        btnIcon.className = 'fa-solid fa-chevron-right';
                    }
                    animateBars(techPanel);
                }
            });
        })();

        /* ============================================================
           IMAGE LIGHTBOX MODAL (Freelance & Project Images)
           ============================================================ */
        (function initImageLightbox() {
            var modal = document.getElementById('imageLightboxModal');
            if (!modal) return;

            var modalImg = document.getElementById('imgLightboxImg');
            var modalTitle = document.getElementById('imgLightboxTitle');
            var modalCounter = document.getElementById('imgLightboxCounter');
            var modalExternal = document.getElementById('imgLightboxExternal');
            var modalClose = document.getElementById('imgLightboxClose');
            var modalPrev = document.getElementById('imgLightboxPrev');
            var modalNext = document.getElementById('imgLightboxNext');
            var modalDots = document.getElementById('imgLightboxDots');

            var items = [];
            var currentIndex = 0;
            var currentGroup = 'freelance';

            function decodeHtml(html) {
                if (!html) return '';
                var txt = document.createElement('textarea');
                txt.innerHTML = html;
                return txt.value;
            }

            function collectItems(group) {
                currentGroup = group || 'freelance';
                var links = document.querySelectorAll('a[data-lightbox="' + currentGroup + '"]');
                items = Array.prototype.slice.call(links).map(function(link, idx) {
                    var img = link.querySelector('img');
                    var titleAttr = link.getAttribute('data-title');
                    var fallbackTitle = (currentGroup === 'techno' ? 'Attendance QR ID ' : 'Project ') + (idx + 1);
                    var cleanTitle = titleAttr ? decodeHtml(titleAttr) : (img ? img.getAttribute('alt') : fallbackTitle);
                    return {
                        src: link.getAttribute('href') || (img ? img.getAttribute('src') : ''),
                        title: cleanTitle,
                        alt: (img ? img.getAttribute('alt') : '') || cleanTitle || fallbackTitle
                    };
                });
            }

            function renderDots() {
                if (!modalDots) return;
                modalDots.innerHTML = '';
                items.forEach(function(_, idx) {
                    var dot = document.createElement('button');
                    dot.type = 'button';
                    dot.className = 'img-lightbox-dot' + (idx === currentIndex ? ' is-active' : '');
                    dot.setAttribute('aria-label', 'Go to image ' + (idx + 1));
                    dot.addEventListener('click', function(e) {
                        e.stopPropagation();
                        showSlide(idx);
                    });
                    modalDots.appendChild(dot);
                });
            }

            function showSlide(index) {
                if (!items.length) return;
                if (index < 0) index = items.length - 1;
                if (index >= items.length) index = 0;
                currentIndex = index;

                var current = items[currentIndex];
                if (!current) return;

                if (modalImg) {
                    modalImg.style.opacity = '0';
                    modalImg.style.transform = 'scale(0.97)';
                    setTimeout(function() {
                        modalImg.src = current.src;
                        modalImg.alt = current.alt || current.title;
                        modalImg.style.opacity = '1';
                        modalImg.style.transform = 'scale(1)';
                    }, 120);
                }

                if (modalTitle) modalTitle.textContent = current.title;
                if (modalCounter) modalCounter.textContent = (currentIndex + 1) + ' / ' + items.length;
                if (modalExternal) modalExternal.href = current.src;

                if (modalDots) {
                    var allDots = modalDots.querySelectorAll('.img-lightbox-dot');
                    for (var i = 0; i < allDots.length; i++) {
                        allDots[i].classList.toggle('is-active', i === currentIndex);
                    }
                }
            }

            function openLightbox(group, index) {
                collectItems(group);
                if (modalPrev) modalPrev.style.display = items.length > 1 ? 'flex' : 'none';
                if (modalNext) modalNext.style.display = items.length > 1 ? 'flex' : 'none';
                if (modalCounter) modalCounter.style.display = items.length > 1 ? 'inline-block' : 'none';
                var modalFooter = modal.querySelector('.img-lightbox-footer');
                if (modalFooter) modalFooter.style.display = items.length > 1 ? 'flex' : 'none';

                renderDots();
                showSlide(index);
                modal.classList.add('is-open');
                modal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
            }

            function closeLightbox() {
                modal.classList.remove('is-open');
                modal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }

            // Event delegation for all lightbox triggers across groups
            document.addEventListener('click', function(e) {
                var link = e.target.closest('a[data-lightbox]');
                if (!link) return;

                // Allow normal navigation if Ctrl, Cmd, or middle click was used
                if (e.ctrlKey || e.metaKey || e.button === 1) return;

                e.preventDefault();
                var group = link.getAttribute('data-lightbox') || 'freelance';
                var groupLinks = Array.prototype.slice.call(document.querySelectorAll('a[data-lightbox="' + group + '"]'));
                var index = groupLinks.indexOf(link);
                if (index < 0) index = 0;

                openLightbox(group, index);
            });

            if (modalClose) {
                modalClose.addEventListener('click', function(e) {
                    e.stopPropagation();
                    closeLightbox();
                });
            }

            if (modalPrev) {
                modalPrev.addEventListener('click', function(e) {
                    e.stopPropagation();
                    if (items.length > 1) showSlide(currentIndex - 1);
                });
            }

            if (modalNext) {
                modalNext.addEventListener('click', function(e) {
                    e.stopPropagation();
                    if (items.length > 1) showSlide(currentIndex + 1);
                });
            }

            modal.addEventListener('click', function(e) {
                // If user clicks the backdrop or the staging area (outside the image and header)
                if (e.target === modal || e.target.classList.contains('img-lightbox-dialog') || e.target.classList.contains('img-lightbox-stage') || e.target.classList.contains('img-lightbox-view')) {
                    closeLightbox();
                }
            });

            document.addEventListener('keydown', function(e) {
                if (!modal.classList.contains('is-open')) return;
                if (e.key === 'Escape') {
                    closeLightbox();
                } else if (e.key === 'ArrowLeft' && items.length > 1) {
                    showSlide(currentIndex - 1);
                } else if (e.key === 'ArrowRight' && items.length > 1) {
                    showSlide(currentIndex + 1);
                }
            });
        })();