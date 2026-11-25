import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Candidato } from '../models/candidato.model';
import { CandidatoRequest } from '../models/candidato-request';

@Injectable({ providedIn: 'root' })
export class CandidatoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/candidatos';

  listar(): Observable<Candidato[]> {
    return this.http.get<Candidato[]>(this.apiUrl).pipe(catchError(this.tratarErro));
  }

  buscarPorId(id: number): Observable<Candidato> {
    return this.http.get<Candidato>(`${this.apiUrl}/${id}`).pipe(catchError(this.tratarErro));
  }

  cadastrar(dados: CandidatoRequest): Observable<Candidato> {
    return this.http.post<Candidato>(this.apiUrl, dados).pipe(catchError(this.tratarErro));
  }

  atualizar(id: number, dados: CandidatoRequest): Observable<Candidato> {
    return this.http.put<Candidato>(`${this.apiUrl}/${id}`, dados).pipe(catchError(this.tratarErro));
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(catchError(this.tratarErro));
  }

  executarRegra(id: number): Observable<Candidato> {
    return this.http.post<Candidato>(`${this.apiUrl}/${id}/votar`, {}).pipe(catchError(this.tratarErro));
  }

  private tratarErro(erro: HttpErrorResponse): Observable<never> {
    let mensagem = 'Nao foi possivel realizar a operacao.';
    if (erro.status === 0) mensagem = 'Nao foi possivel conectar ao servidor.';
    else if (erro.status === 400) mensagem = 'Dados invalidos. Confira os campos.';
    else if (erro.status === 404) mensagem = 'Candidato nao encontrado.';
    else if (erro.status === 409) mensagem = 'Operacao nao permitida.';
    if ([400, 404, 409].includes(erro.status)) {
      if (typeof erro.error === 'string' && erro.error.trim()) mensagem = erro.error;
      else if (typeof erro.error?.message === 'string' && erro.error.message.trim()) mensagem = erro.error.message;
    }
    return throwError(() => new Error(mensagem));
  }
}
