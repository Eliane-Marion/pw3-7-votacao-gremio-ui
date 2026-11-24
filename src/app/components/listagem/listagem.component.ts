import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Candidato } from '../../models/candidato.model';
import { CandidatoService } from '../../services/candidato.service';

@Component({
  selector: 'app-listagem',
  imports: [RouterLink],
  templateUrl: './listagem.component.html',
  styleUrl: './listagem.component.css'
})
export class ListagemComponent implements OnInit {
  private service = inject(CandidatoService);
  private router = inject(Router);
  candidatos = signal<Candidato[]>([]);
  carregando = signal(true);
  mensagem = signal('');
  erro = signal('');

  ngOnInit(): void {
    this.mensagem.set(this.router.currentNavigation()?.extras.state?.['mensagem'] ?? '');
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.service.listar().subscribe({
      next: dados => {
        this.candidatos.set(dados);
        this.carregando.set(false);
      },
      error: (erro: Error) => {
        this.erro.set(erro.message);
        this.carregando.set(false);
      }
    });
  }

  votar(id: number): void {
    this.erro.set('');
    this.mensagem.set('');
    this.carregando.set(true);
    this.service.executarRegra(id).subscribe({
      next: () => {
        this.mensagem.set('Voto registrado!');
        this.carregar();
      },
      error: (erro: Error) => {
        this.erro.set(erro.message);
        this.carregando.set(false);
      }
    });
  }

  excluir(id: number): void {
    if (!confirm('Deseja excluir este candidato?')) return;
    this.erro.set('');
    this.mensagem.set('');
    this.carregando.set(true);
    this.service.excluir(id).subscribe({
      next: () => {
        this.mensagem.set('Candidato excluido!');
        this.carregar();
      },
      error: (erro: Error) => {
        this.erro.set(erro.message);
        this.carregando.set(false);
      }
    });
  }
}
