import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { FirestoreDateOnlyPipe } from '../../pipes/firestore-timestamp-pipe';
import { TranslateModule } from '@ngx-translate/core';


export interface HelpDeskCompany {
  id: string;
  name: string;
}

export interface Company {
  id: string;
  name: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FirestoreDateOnlyPipe, TranslateModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class Profile implements OnInit {
private auth = inject(AuthService);

loggedUser!: User;

  ngOnInit(): void {
    this.loggedUser = this.auth.currentUser()!;
    console.log('Usuário logado:', this.loggedUser);
  }



  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.loggedUser.imageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  updateProfile(): void {
    // Implementar lógica de atualização do perfil
    console.log('Atualizando perfil...', this.loggedUser);
    // Aqui você pode adicionar a lógica para salvar as alterações
    alert('Perfil atualizado com sucesso!');
  }
}