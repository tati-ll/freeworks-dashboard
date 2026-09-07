import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProjectFormComponent } from './pages/project-form/project-form';
import { ProjectsHomeComponent } from './pages/projects-home/projects-home';

const routes: Routes = [
  {
    path: '',
    component: ProjectsHomeComponent,
  },
  {
    path: 'proyectos/nuevo',
    component: ProjectFormComponent,
  },
  {
    path: 'proyectos/:id/editar',
    component: ProjectFormComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class ProjectsRoutingModule {}