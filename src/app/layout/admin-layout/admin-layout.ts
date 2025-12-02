import { Component, DOCUMENT, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { AdminHeader } from '../components/admin-header/admin-header';
import { AdminSidebar } from '../components/admin-sidebar/admin-sidebar';
import { Dashbroad } from "../../pages/admin/dashbroad/dashbroad";

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [AdminHeader, AdminSidebar, Dashbroad],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
  host: {
    'class': 'admin-layout'
  }
})
export class AdminLayout implements OnInit , OnDestroy{

  private loadedStyles: HTMLLinkElement[] = [];
  private loadedScripts: HTMLScriptElement[] = [];

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.removeUserStyles();
    this.loadAdminStyles();
    this.loadAdminScripts();
  }

  ngOnDestroy(): void {
    this.removeAdminAssets();
  }

  private removeUserStyles(): void {

    const userStyles = this.document.querySelectorAll('link[href*="assets/css"]');
    userStyles.forEach((style) => {
      if (!style.getAttribute('href')?.includes('admin')) {
        (style as HTMLLinkElement).disabled = true;
      }
    });
  }


   private loadAdminStyles(): void {
    const adminStyles = [
      'assets/admin/assets/css/bootstrap.min.css',
      'assets/admin/assets/plugins/fontawesome/css/fontawesome.min.css',
      'assets/admin/assets/plugins/fontawesome/css/all.min.css',
      'assets/admin/assets/css/feathericon.min.css',
      'assets/admin/assets/plugins/morris/morris.css',
      'assets/admin/assets/css/custom.css'
    ];

    adminStyles.forEach(href => {
      const link = this.renderer.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute('data-admin-style', 'true');
      this.renderer.appendChild(this.document.head, link);
      this.loadedStyles.push(link);
    });
  }


   private loadAdminScripts(): void {
    const adminScripts = [
      'assets/admin/assets/js/jquery-3.7.1.min.js',
      'assets/admin/assets/js/bootstrap.bundle.min.js',
      'assets/admin/assets/plugins/slimscroll/jquery.slimscroll.min.js',
      'assets/admin/assets/plugins/raphael/raphael.min.js',
      'assets/admin/assets/plugins/morris/morris.min.js',
      'assets/admin/assets/js/chart.morris.js',
      'assets/admin/assets/js/script.js'
    ];

    adminScripts.forEach((src, index) => {
      const script = this.renderer.createElement('script');
      script.src = src;
      script.type = 'text/javascript';
      script.setAttribute('data-admin-script', 'true');
      
      // Load scripts tuần tự
      if (index > 0) {
        script.async = false;
      }
      
      this.renderer.appendChild(this.document.body, script);
      this.loadedScripts.push(script);
    });
  }

  private removeAdminAssets(): void {
    // Xóa tất cả CSS admin
    this.loadedStyles.forEach(link => {
      this.renderer.removeChild(this.document.head, link);
    });
    this.loadedStyles = [];

    // Xóa tất cả JS admin
    this.loadedScripts.forEach(script => {
      this.renderer.removeChild(this.document.body, script);
    });
    this.loadedScripts = [];

    // Bật lại CSS user nếu đã disable
    const userStyles = this.document.querySelectorAll('link[href*="assets/css"]');
    userStyles.forEach((style) => {
      if (!style.getAttribute('href')?.includes('admin')) {
        (style as HTMLLinkElement).disabled = false;
      }
    });
  }

}
