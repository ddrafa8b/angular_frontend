import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { Location } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-information',
  templateUrl: './information.page.html',
  styleUrls: ['./information.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonContent]
})
export class InformationPage implements OnInit {

  constructor(private location: Location, private router: Router) {}

  ngOnInit() {
    const fragment = window.location.hash.substring(1);
    if (fragment) {
      setTimeout(() => this.scrollTo(fragment), 100);
    }
  }

  volver() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/home']);
    }
  }

  scrollTo(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
