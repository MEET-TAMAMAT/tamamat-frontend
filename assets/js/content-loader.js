/**
 * TAMAMAT Content Loader
 * Integrates with existing HTML structure and loads content from Directus
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize content loading
    loadSiteContent();
});

async function loadSiteContent() {
    try {
        // Show loading state
        showLoadingState();

        // Load content sections
        await Promise.all([
            loadHeroSection(),
            loadNavigationMenu(),
            loadSiteSettings()
        ]);

        // Hide loading state
        hideLoadingState();

        console.log('✅ Content loaded successfully from Directus');
    } catch (error) {
        console.error('❌ Error loading content from Directus:', error);
        // Fall back to default content
        loadDefaultContent();
    }
}

async function loadHeroSection() {
    try {
        // Try to get hero content from Directus
        const heroData = await window.directus.getItems('hero_content', {
            fields: '*',
            filter: { status: { _eq: 'published' } },
            limit: 1
        });

        if (heroData && heroData.length > 0) {
            const hero = heroData[0];
            updateHeroContent(hero);
        } else {
            // If no hero collection, try general content collection
            const content = await window.directus.getItems('content', {
                fields: '*',
                filter: {
                    type: { _eq: 'hero' },
                    status: { _eq: 'published' }
                },
                limit: 1
            });

            if (content && content.length > 0) {
                updateHeroContent(content[0]);
            }
        }
    } catch (error) {
        console.warn('Hero content not available in Directus, using defaults');
    }
}

function updateHeroContent(hero) {
    // Update hero title
    const titleEl = document.getElementById('hero-title');
    if (titleEl && hero.title) {
        titleEl.textContent = hero.title;
    }

    // Update hero subtitle
    const subtitleEl = document.getElementById('hero-subtitle');
    if (subtitleEl && hero.subtitle) {
        subtitleEl.textContent = hero.subtitle;
    }

    // Update hero image
    const imageEl = document.getElementById('hero-image');
    if (imageEl && hero.image) {
        // Handle Directus file URLs
        const imageUrl = hero.image.startsWith('http')
            ? hero.image
            : `${window.directus.baseUrl}/assets/${hero.image}`;
        imageEl.src = imageUrl;
        if (hero.image_alt) {
            imageEl.alt = hero.image_alt;
        }
    }

    // Update primary button
    const primaryBtnEl = document.getElementById('hero-btn-primary');
    if (primaryBtnEl && hero.primary_button_text) {
        const span = primaryBtnEl.querySelector('span') || primaryBtnEl;
        span.textContent = hero.primary_button_text;
        if (hero.primary_button_link) {
            primaryBtnEl.href = hero.primary_button_link;
        }
    }

    // Update secondary button
    const secondaryBtnEl = document.getElementById('hero-btn-secondary');
    if (secondaryBtnEl && hero.secondary_button_text) {
        const span = secondaryBtnEl.querySelector('span');
        if (span) {
            span.textContent = hero.secondary_button_text;
        }
        if (hero.secondary_button_link) {
            secondaryBtnEl.href = hero.secondary_button_link;
        }
    }
}

async function loadNavigationMenu() {
    try {
        const navItems = await window.directus.getItems('navigation', {
            fields: '*',
            filter: { status: { _eq: 'published' } },
            sort: ['sort']
        });

        if (navItems && navItems.length > 0) {
            updateNavigation(navItems);
        }
    } catch (error) {
        console.warn('Navigation not available in Directus');
    }
}

function updateNavigation(navItems) {
    const navContainer = document.querySelector('.navbar-nav, .nav, #navmenu');
    if (!navContainer) return;

    // Create navigation HTML
    const navHTML = navItems.map(item => `
        <li class="nav-item">
            <a class="nav-link ${item.active ? 'active' : ''}"
               href="${item.url || '#' + (item.anchor || item.title.toLowerCase().replace(/\s+/g, '-'))}">
                ${item.icon ? `<i class="${item.icon}"></i> ` : ''}
                ${item.title}
            </a>
        </li>
    `).join('');

    // Only update if we have a different structure
    if (navContainer.innerHTML.trim() !== navHTML.trim()) {
        navContainer.innerHTML = navHTML;
    }
}

async function loadSiteSettings() {
    try {
        const settings = await window.directus.getItems('site_settings', {
            fields: '*',
            limit: 1
        });

        if (settings && settings.length > 0) {
            updateSiteSettings(settings[0]);
        }
    } catch (error) {
        console.warn('Site settings not available in Directus');
    }
}

function updateSiteSettings(settings) {
    // Update document title
    if (settings.site_title) {
        document.title = settings.site_title;
    }

    // Update meta description
    if (settings.meta_description) {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', settings.meta_description);
        }
    }

    // Update logo if present
    if (settings.logo) {
        const logoElements = document.querySelectorAll('.logo img, .navbar-brand img');
        logoElements.forEach(logo => {
            const logoUrl = settings.logo.startsWith('http')
                ? settings.logo
                : `${window.directus.baseUrl}/assets/${settings.logo}`;
            logo.src = logoUrl;
        });
    }
}

function showLoadingState() {
    // Add subtle loading indicators
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');

    if (heroTitle) heroTitle.textContent = 'Loading...';
    if (heroSubtitle) heroSubtitle.textContent = 'Getting the latest content...';
}

function hideLoadingState() {
    // Remove any loading classes if needed
    document.body.classList.remove('loading');
}

function loadDefaultContent() {
    // Fallback content in case Directus is unavailable
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    const heroImage = document.getElementById('hero-image');

    if (heroTitle && !heroTitle.textContent.trim()) {
        heroTitle.textContent = 'Online Teaching Platform for Small Groups';
    }

    if (heroSubtitle && !heroSubtitle.textContent.trim()) {
        heroSubtitle.textContent = 'Run live small-group lessons with full teacher control. Video classrooms designed for focused learning.';
    }

    if (heroImage && !heroImage.src) {
        heroImage.src = 'assets/img/hero-img.png';
        heroImage.alt = 'TAMAMAT Platform Interface';
    }
}

// Utility function to refresh content
window.refreshContent = function() {
    console.log('🔄 Refreshing content from Directus...');
    window.directus.clearCache();
    loadSiteContent();
};

// Auto-refresh content every 10 minutes if the page is active
let refreshInterval;
function startAutoRefresh() {
    refreshInterval = setInterval(() => {
        if (!document.hidden) {
            window.refreshContent();
        }
    }, 10 * 60 * 1000); // 10 minutes
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
}

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        stopAutoRefresh();
    } else {
        startAutoRefresh();
    }
});

// Start auto-refresh when page loads
startAutoRefresh();