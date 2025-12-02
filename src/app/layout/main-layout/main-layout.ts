import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../components/header/header';
import { Footer } from '../components/footer/footer';
import { LayoutScriptService } from '../../core/services/layout-script.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    Header,
    Footer
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout implements OnInit, OnDestroy {

  constructor(private layoutScript: LayoutScriptService) {}

  ngOnInit(): void {
    // Scripts are loaded via angular.json, just initialize them
    this.layoutScript.initLayout('main');
  }

  ngOnDestroy(): void {
    // Cleanup will be handled when switching to another layout
  }
}