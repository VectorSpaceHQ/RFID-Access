import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <ul class="breadcrumb">
      <li><a routerLink="/home">Home</a></li>
      <li><a routerLink="/about">About</a></li>
      <li>Add Resource</li>
    </ul>

    <h1>About me</h1>
    <p>
      This is a portfolio site about anything that can be put in a portfolio.
    </p>
  `,
})
export class AboutComponent {}
