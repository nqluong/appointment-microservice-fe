import { Injectable, Renderer2, RendererFactory2, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare var $: any;
declare var AOS: any;

export interface LayoutAssets {
  css: string[];
  js: string[];
}

@Injectable({
  providedIn: 'root'
})
export class LayoutScriptService {
  private renderer: Renderer2;
  private loadedScripts: Set<string> = new Set();
  private loadedStyles: Set<string> = new Set();
  private currentLayout: string | null = null;
  private scriptsInitialized: Set<string> = new Set();

  constructor(
    rendererFactory: RendererFactory2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  loadLayoutAssets(layoutName: string, assets: LayoutAssets): Promise<void> {
    // Skip if not in browser
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve();
    }

    // If same layout and already initialized, do nothing
    if (this.currentLayout === layoutName && this.scriptsInitialized.has(layoutName)) {
      console.log(`${layoutName} layout already loaded and initialized`);
      return Promise.resolve();
    }

    // Cleanup previous layout only if switching to different layout
    if (this.currentLayout && this.currentLayout !== layoutName) {
      this.cleanupLayout(this.currentLayout);
    }

    this.currentLayout = layoutName;

    // Load CSS and JS
    const cssPromises = assets.css.map(url => this.loadStyle(url, layoutName));
    const jsPromises = assets.js.map(url => this.loadScript(url, layoutName));

    return Promise.all([...cssPromises, ...jsPromises]).then(() => {
      // Only initialize if not already initialized
      if (!this.scriptsInitialized.has(layoutName)) {
        this.reinitializeScripts(layoutName);
      }
    });
  }

  private loadStyle(url: string, layoutName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.loadedStyles.has(url)) {
        resolve();
        return;
      }

      const link = this.renderer.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.setAttribute('data-layout', layoutName);
      
      link.onload = () => {
        this.loadedStyles.add(url);
        resolve();
      };
      
      link.onerror = () => reject(`Failed to load CSS: ${url}`);
      
      this.renderer.appendChild(document.head, link);
    });
  }

  private loadScript(url: string, layoutName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script already exists in DOM
      const existingScript = document.querySelector(`script[src="${url}"]`);
      if (existingScript || this.loadedScripts.has(url)) {
        this.loadedScripts.add(url);
        resolve();
        return;
      }

      const script = this.renderer.createElement('script');
      script.src = url;
      script.setAttribute('data-layout', layoutName);
      
      script.onload = () => {
        this.loadedScripts.add(url);
        resolve();
      };
      
      script.onerror = () => reject(`Failed to load script: ${url}`);
      
      this.renderer.appendChild(document.body, script);
    });
  }

  private cleanupLayout(layoutName: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Remove layout-specific styles (but keep CSS from angular.json)
    const styles = document.querySelectorAll(`link[data-layout="${layoutName}"]`);
    styles.forEach(style => {
      style.remove();
      this.loadedStyles.delete(style.getAttribute('href') || '');
    });

    // Don't remove scripts, just cleanup event listeners
    // Scripts can be reused across navigation

    // Cleanup jQuery event listeners
    if (typeof $ !== 'undefined') {
      $(document).off(`.${layoutName}`);
      $('*').off(`.${layoutName}`);
    }

    // Mark as not initialized so it can be re-initialized
    this.scriptsInitialized.delete(layoutName);
  }

  private reinitializeScripts(layoutName: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    setTimeout(() => {
      if (layoutName === 'main') {
        this.initMainLayoutScripts();
      } else if (layoutName === 'admin') {
        this.initAdminLayoutScripts();
      }
      this.scriptsInitialized.add(layoutName);
      console.log(`${layoutName} layout scripts initialized`);
    }, 100);
  }

  private initMainLayoutScripts(): void {
    if (typeof $ === 'undefined') return;

    // Wait for DOM to be fully ready
    $(document).ready(() => {
      // AOS
      if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 1000, once: true });
        AOS.refresh();
      }

      // Owl Carousel
      if (typeof $.fn.owlCarousel !== 'undefined') {
        $('.owl-carousel').each(function(this: any) {
          const $carousel = $(this);
          if (!$carousel.hasClass('owl-loaded')) {
            $carousel.owlCarousel({
              loop: true,
              margin: 24,
              nav: true,
              dots: false,
              autoplay: false,
              responsive: {
                0: { items: 1 },
                768: { items: 2 },
                1024: { items: 3 }
              }
            });
          }
        });
      }

      // Mobile menu
      $('#mobile_btn').off('click.main').on('click.main', function() {
        $('body').toggleClass('menu-opened');
        $('.main-menu-wrapper').slideToggle();
      });

      $('#menu_close').off('click.main').on('click.main', function() {
        $('body').removeClass('menu-opened');
        $('.main-menu-wrapper').slideUp();
      });

      // Submenu
      $('.has-submenu > a').off('click.main').on('click.main', function(this: any, e: any) {
        if ($(window).width() < 992) {
          e.preventDefault();
          $(this).next('.submenu').slideToggle();
        }
      });

      console.log('Main layout scripts initialized');
    });
  }

  private initAdminLayoutScripts(): void {
    if (typeof $ === 'undefined') return;

    console.log('Admin layout scripts initialized');
  }

  destroyCurrentLayout(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.currentLayout) {
      this.cleanupLayout(this.currentLayout);
      this.currentLayout = null;
    }
  }

  // Simplified method for when scripts are already loaded via index.html
  initLayout(layoutName: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // If already initialized, skip
    if (this.currentLayout === layoutName && this.scriptsInitialized.has(layoutName)) {
      console.log(`${layoutName} layout already initialized`);
      return;
    }

    // Cleanup previous layout if switching
    if (this.currentLayout && this.currentLayout !== layoutName) {
      this.cleanupLayout(this.currentLayout);
    }

    this.currentLayout = layoutName;

    // Wait for scripts to load (they have defer attribute)
    if (!this.scriptsInitialized.has(layoutName)) {
      // Check if jQuery is loaded, if not wait
      const checkAndInit = () => {
        if (typeof (window as any).$ !== 'undefined') {
          this.reinitializeScripts(layoutName);
        } else {
          // Retry after 100ms
          setTimeout(checkAndInit, 100);
        }
      };
      checkAndInit();
    }
  }
}
