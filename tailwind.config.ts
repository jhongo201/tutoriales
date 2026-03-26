import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        'primary-hover': 'rgb(var(--color-primary-hover) / <alpha-value>)',
        'primary-soft': 'rgb(var(--color-primary-soft) / <alpha-value>)',

        'app-bg': 'rgb(var(--color-app-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',

        'app-text': 'rgb(var(--color-text) / <alpha-value>)',
        'app-text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',

        'admin-sidebar-bg': 'rgb(var(--color-admin-sidebar-bg) / <alpha-value>)',
        'admin-sidebar-bg-2': 'rgb(var(--color-admin-sidebar-bg-2) / <alpha-value>)',
        'admin-sidebar-border': 'rgb(var(--color-admin-sidebar-border) / <alpha-value>)',
        'admin-sidebar-text': 'rgb(var(--color-admin-sidebar-text) / <alpha-value>)',
        'admin-sidebar-text-muted': 'rgb(var(--color-admin-sidebar-text-muted) / <alpha-value>)',
        'admin-sidebar-nav': 'rgb(var(--color-admin-sidebar-nav) / <alpha-value>)',
        'admin-sidebar-active-bg': 'rgb(var(--color-admin-sidebar-active-bg) / <alpha-value>)',

        'badge-video-bg': 'rgb(var(--color-badge-video-bg) / <alpha-value>)',
        'badge-video-fg': 'rgb(var(--color-badge-video-fg) / <alpha-value>)',
        'badge-pdf-bg': 'rgb(var(--color-badge-pdf-bg) / <alpha-value>)',
        'badge-pdf-fg': 'rgb(var(--color-badge-pdf-fg) / <alpha-value>)',
        'badge-faq-bg': 'rgb(var(--color-badge-faq-bg) / <alpha-value>)',
        'badge-faq-fg': 'rgb(var(--color-badge-faq-fg) / <alpha-value>)',
        'badge-infografia-bg': 'rgb(var(--color-badge-infografia-bg) / <alpha-value>)',
        'badge-infografia-fg': 'rgb(var(--color-badge-infografia-fg) / <alpha-value>)',

        'badge-agente': 'rgb(var(--color-badge-agente) / <alpha-value>)',
        'badge-agencia': 'rgb(var(--color-badge-agencia) / <alpha-value>)',
        'badge-corredor': 'rgb(var(--color-badge-corredor) / <alpha-value>)',
        'badge-todos': 'rgb(var(--color-badge-todos) / <alpha-value>)',

        'badge-active-bg': 'rgb(var(--color-badge-active-bg) / <alpha-value>)',
        'badge-active-fg': 'rgb(var(--color-badge-active-fg) / <alpha-value>)',
        'badge-active-hover': 'rgb(var(--color-badge-active-hover) / <alpha-value>)',
        'badge-inactive-bg': 'rgb(var(--color-badge-inactive-bg) / <alpha-value>)',
        'badge-inactive-fg': 'rgb(var(--color-badge-inactive-fg) / <alpha-value>)',
        'badge-inactive-hover': 'rgb(var(--color-badge-inactive-hover) / <alpha-value>)',

        'public-video-from': 'rgb(var(--color-public-video-from) / <alpha-value>)',
        'public-video-via': 'rgb(var(--color-public-video-via) / <alpha-value>)',
        'public-video-to': 'rgb(var(--color-public-video-to) / <alpha-value>)',
        'public-pdf-from': 'rgb(var(--color-public-pdf-from) / <alpha-value>)',
        'public-pdf-via': 'rgb(var(--color-public-pdf-via) / <alpha-value>)',
        'public-pdf-to': 'rgb(var(--color-public-pdf-to) / <alpha-value>)',
        'public-faq-from': 'rgb(var(--color-public-faq-from) / <alpha-value>)',
        'public-faq-via': 'rgb(var(--color-public-faq-via) / <alpha-value>)',
        'public-faq-to': 'rgb(var(--color-public-faq-to) / <alpha-value>)',
        'public-infografia-from': 'rgb(var(--color-public-infografia-from) / <alpha-value>)',
        'public-infografia-via': 'rgb(var(--color-public-infografia-via) / <alpha-value>)',
        'public-infografia-to': 'rgb(var(--color-public-infografia-to) / <alpha-value>)',

        'public-header-from': 'rgb(var(--color-public-header-from) / <alpha-value>)',
        'public-header-to': 'rgb(var(--color-public-header-to) / <alpha-value>)',
        'public-header-subtitle': 'rgb(var(--color-public-header-subtitle) / <alpha-value>)',

        'public-detail-header-from': 'rgb(var(--color-public-detail-header-from) / <alpha-value>)',
        'public-detail-header-to': 'rgb(var(--color-public-detail-header-to) / <alpha-value>)',
        'public-detail-overlay': 'rgb(var(--color-public-detail-overlay) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },

  plugins: [],
}

export default config