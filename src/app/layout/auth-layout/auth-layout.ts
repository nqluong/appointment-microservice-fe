import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthHeader } from "../components/auth-header/auth-header";
import { AuthFooter } from "../components/auth-footer/auth-footer";

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, AuthHeader, AuthFooter],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout {


}
