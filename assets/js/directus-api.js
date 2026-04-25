/**
 * Directus API Integration for TAMAMAT
 * Handles content fetching and management
 */

class DirectusAPI {
    constructor(baseUrl = 'https://admin.tamamat.com') {
        this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Generic API call method
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;

        // Check cache first
        if (options.cache !== false && this.cache.has(url)) {
            const cached = this.cache.get(url);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Cache successful responses
            if (options.cache !== false) {
                this.cache.set(url, { data, timestamp: Date.now() });
            }

            return data;
        } catch (error) {
            console.error('Directus API Error:', error);
            throw error;
        }
    }

    /**
     * Get items from a collection
     */
    async getItems(collection, query = {}) {
        const params = new URLSearchParams();

        // Add query parameters
        if (query.fields) params.append('fields', Array.isArray(query.fields) ? query.fields.join(',') : query.fields);
        if (query.filter) params.append('filter', JSON.stringify(query.filter));
        if (query.sort) params.append('sort', Array.isArray(query.sort) ? query.sort.join(',') : query.sort);
        if (query.limit) params.append('limit', query.limit);
        if (query.offset) params.append('offset', query.offset);

        const endpoint = `/items/${collection}${params.toString() ? '?' + params.toString() : ''}`;
        const response = await this.request(endpoint);
        return response.data || [];
    }

    /**
     * Get a single item by ID
     */
    async getItem(collection, id, fields = '*') {
        const endpoint = `/items/${collection}/${id}?fields=${fields}`;
        const response = await this.request(endpoint);
        return response.data;
    }

    /**
     * Get site configuration/settings
     */
    async getSiteSettings() {
        try {
            return await this.getItems('site_settings', { limit: 1 });
        } catch (error) {
            console.warn('Site settings collection not found');
            return null;
        }
    }

    /**
     * Get page content by slug
     */
    async getPageContent(slug) {
        try {
            const pages = await this.getItems('pages', {
                fields: '*',
                filter: { slug: { _eq: slug } },
                limit: 1
            });
            return pages[0] || null;
        } catch (error) {
            console.warn('Pages collection not found');
            return null;
        }
    }

    /**
     * Get navigation menu
     */
    async getNavigation() {
        try {
            return await this.getItems('navigation', {
                fields: '*',
                sort: ['sort']
            });
        } catch (error) {
            console.warn('Navigation collection not found');
            return [];
        }
    }

    /**
     * Get hero section content
     */
    async getHeroSection() {
        try {
            return await this.getItems('hero_sections', {
                fields: '*',
                filter: { status: { _eq: 'published' } },
                sort: ['-date_created'],
                limit: 1
            });
        } catch (error) {
            console.warn('Hero sections collection not found');
            return [];
        }
    }

    /**
     * Get features/services
     */
    async getFeatures() {
        try {
            return await this.getItems('features', {
                fields: '*',
                filter: { status: { _eq: 'published' } },
                sort: ['sort']
            });
        } catch (error) {
            console.warn('Features collection not found');
            return [];
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }
}

// Global instance
window.directus = new DirectusAPI();

// Helper functions for easy content loading
window.loadContent = {
    async hero(elementId = 'hero-content') {
        const element = document.getElementById(elementId);
        if (!element) return;

        try {
            const heroes = await window.directus.getHeroSection();
            if (heroes.length > 0) {
                const hero = heroes[0];
                element.innerHTML = `
                    <div class="hero-content">
                        ${hero.title ? `<h1>${hero.title}</h1>` : ''}
                        ${hero.subtitle ? `<p class="lead">${hero.subtitle}</p>` : ''}
                        ${hero.cta_text && hero.cta_link ?
                            `<a href="${hero.cta_link}" class="btn btn-primary">${hero.cta_text}</a>` :
                            ''}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading hero content:', error);
        }
    },

    async features(elementId = 'features-content') {
        const element = document.getElementById(elementId);
        if (!element) return;

        try {
            const features = await window.directus.getFeatures();
            if (features.length > 0) {
                element.innerHTML = features.map(feature => `
                    <div class="col-md-4 mb-4">
                        <div class="feature-item">
                            ${feature.icon ? `<i class="${feature.icon} feature-icon"></i>` : ''}
                            ${feature.title ? `<h3>${feature.title}</h3>` : ''}
                            ${feature.description ? `<p>${feature.description}</p>` : ''}
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading features:', error);
        }
    }
};