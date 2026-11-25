import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CandidatoService } from '../../services/candidato.service';

@Component({
  selector: 'app-formulario',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './formulario.component.html',
  styleUrl: './formulario.component.css'
})
export class FormularioComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(CandidatoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  id: number | null = null;
  carregando = signal(false);
  enviando = signal(false);
  erro = signal('');
  pronto = signal(true);

  formulario: FormGroup<{ nome: FormControl<string>; categoria: FormControl<string> }> = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120), Validators.pattern(/.*\S.*/)]],
    categoria: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60), Validators.pattern(/.*\S.*/)]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id === null) return;
    this.id = Number(id);
    this.pronto.set(false);
    if (!Number.isSafeInteger(this.id) || this.id <= 0) {
      this.erro.set('Identificador invalido.');
      return;
    }
    this.carregando.set(true);
    this.service.buscarPorId(this.id).subscribe({
      next: candidato => {
        this.formulario.setValue({ nome: candidato.nome, categoria: candidato.categoria });
        this.pronto.set(true);
        this.carregando.set(false);
      },
      error: (erro: Error) => {
        this.erro.set(erro.message);
        this.carregando.set(false);
      }
    });
  }

  salvar(): void {
    if (!this.pronto() || this.enviando()) return;
    const dados = this.formulario.getRawValue();
    const limpos = { nome: dados.nome.trim(), categoria: dados.categoria.trim() };
    this.formulario.setValue(limpos);
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.erro.set('');
    const operacao = this.id === null ? this.service.cadastrar(limpos) : this.service.atualizar(this.id, limpos);
    operacao.subscribe({
      next: () => {
        this.enviando.set(false);
        this.router.navigate(['/candidatos'], { state: { mensagem: this.id === null ? 'Candidato cadastrado!' : 'Candidato atualizado!' } });
      },
      error: (erro: Error) => {
        this.erro.set(erro.message);
        this.enviando.set(false);
      }
    });
  }
}
