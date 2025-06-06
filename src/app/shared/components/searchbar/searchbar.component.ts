import { Component, Input, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { CuadroService } from '../../services/cuadro.service';
import { ArtistaDetalleComponent } from '../../components/artista-detalle/artista-detalle.component';
import { ModalController } from '@ionic/angular';
import { CuadroDetalleComponent } from '../cuadro-detalle/cuadro-detalle.component';
import { EventoDetalleComponent } from '../evento-detalle/evento-detalle.component';
import { environment } from 'src/environments/environment.prod';


@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss'],
})
export class SearchBarComponent implements OnInit {
  @Input() modo: 'eventos' | 'gallery' = 'gallery';

  private apiUrl = environment.apiUrl;

  servicio = inject(CuadroService);
  modalCtrl = inject(ModalController);
  http = inject(HttpClient);

  segmentValue: 'cuadros' | 'artistas' = 'cuadros';

  query: string = '';
  resultados: any[] = [];
  artistasSeguidos: number[] = [];
  id_usuario: number | null = null;
  esArtista = false;
  esUsuario = false;
  esAdmin = false;
  usuarioId: number | null = null;


  ngOnInit() {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      try {
        const usuario = JSON.parse(userStr);
        this.usuarioId = usuario.id_usuario;
        switch (usuario?.tipo) {
          case 'artista':
            this.esArtista = true;
            break;
          case 'usuario':
            this.esUsuario = true;
            break;
          case 'admin':
            this.esAdmin = true;
            break;
        }
      } catch (err) {
        console.error('Error parsing usuario from localStorage', err);
      }
    }
    if (this.modo === 'eventos') {
      this.segmentValue = 'eventos' as any;
    }
    this.id_usuario = this.getUsuarioId();
    if (this.segmentValue === 'artistas' && this.id_usuario) {
      this.cargarArtistasSeguidos();
    }
  }

  async abrirDetalleCuadro(cuadro: any) {
    const modal = await this.modalCtrl.create({
      component: CuadroDetalleComponent,
      componentProps: cuadro.id ? { id_cuadro: cuadro.id } : { cuadro }
    });
    await modal.present();
  }

  setSearchMode(tipo: 'cuadros' | 'artistas') {
    this.segmentValue = tipo;
    this.query = '';
    this.resultados = [];
    if (tipo === 'artistas') {
      this.cargarArtistasSeguidos();
    }
  }

  getUsuarioId(): number | null {
    const userStr = localStorage.getItem('usuario');
    if (!userStr) return null;
    try {
      const usuario = JSON.parse(userStr);
      return usuario.id_usuario || null;
    } catch {
      return null;
    }
  }

  getApiKey(): string {
    const keysStr = localStorage.getItem('api_keys');
    const keys = keysStr ? JSON.parse(keysStr) : [];
    return keys[0] || '';
  }

  cargarArtistasSeguidos() {
    if (!this.id_usuario) return;
    this.servicio.getArtistasSeguidos(this.id_usuario).subscribe({
      next: artistas => {
        this.artistasSeguidos = artistas.map(a => a.id);
        this.marcarSeguidosEnResultados();
      },
      error: err => console.error('Error al obtener artistas seguidos:', err)
    });
  }

  buscar(event?: any) {
    if (event) {
      this.query = event.detail.value;
    }

    if (!this.query.trim()) return;

    let endpoint = '';

    if (this.modo === 'eventos') {
      endpoint = `${this.apiUrl}/buscar/eventos?q=${this.query}`;
    } else {
      switch (this.segmentValue) {
        case 'cuadros':
          endpoint = `${this.apiUrl}/buscar/cuadros?q=${this.query}`;
          break;
        case 'artistas':
          endpoint = `${this.apiUrl}/buscar/artistas?q=${this.query}`;
          break;
      }
    }

    this.http.get<any[]>(endpoint).subscribe({
      next: res => {
        if (this.segmentValue === 'cuadros' || this.modo === 'eventos') {
          this.resultados = res.map(item => ({
            ...item,
            imagen: item.imagen_base64 ? `data:image/webp;base64,${item.imagen_base64}` : null
          }))
          .sort((a, b) => a.titulo?.localeCompare(b.titulo || '') || 0);
        } else {
          this.resultados = res;
          this.marcarSeguidosEnResultados();
        }
      },
      error: err => console.error('Error al buscar:', err)
    });
  }

  marcarSeguidosEnResultados() {
    if (this.segmentValue !== 'artistas') return;
    this.resultados = this.resultados.map(artista => ({
      ...artista,
      estaSeguido: this.artistasSeguidos.includes(artista.id_usuario)
    })).sort((a, b) => a.nombre_usuario?.localeCompare(b.nombre_usuario || '') || 0);;
  }

  seguirArtista(id_artista: number) {
    if (!this.id_usuario) return;
    this.servicio.seguirArtista(this.id_usuario, id_artista).subscribe({
      next: () => {
        const artista = this.resultados.find(a => a.id_usuario === id_artista);
        if (artista) artista.estaSeguido = true;
        this.artistasSeguidos.push(id_artista);
      },
      error: err => console.error('Error al seguir artista:', err)
    });
  }

  dejarDeSeguirArtista(id_artista: number) {
    if (!this.id_usuario) return;
    this.servicio.dejarDeSeguirArtista(this.id_usuario, id_artista).subscribe({
      next: () => {
        const artista = this.resultados.find(a => a.id_usuario === id_artista);
        if (artista) artista.estaSeguido = false;
        this.artistasSeguidos = this.artistasSeguidos.filter(id => id !== id_artista);
      },
      error: err => console.error('Error al dejar de seguir artista:', err)
    });
  }

  abrirModalArtista(artista: any) {
    this.modalCtrl.create({
      component: ArtistaDetalleComponent,
      componentProps: {
        artista: artista
      }
    }).then(modal => modal.present());
  }

  abrirDetalleEvento(evento: any) {
    this.modalCtrl.create({
      component: EventoDetalleComponent,
      componentProps: { evento }
    }).then(modal => modal.present());
  }
}
