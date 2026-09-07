import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared-module';
import { ProjectsRoutingModule } from './projects-routing-module';
import { ProjectCardComponent } from './components/project-card/project-card';
import { ProjectFormComponent } from './pages/project-form/project-form';
import { ProjectsHomeComponent } from './pages/projects-home/projects-home';
import { ProjectDetailComponent } from './pages/project-detail/project-detail';

@NgModule({
  declarations: [
    ProjectsHomeComponent,
    ProjectCardComponent,
    ProjectFormComponent,
    ProjectDetailComponent,
  ],
  imports: [
    SharedModule,
    ProjectsRoutingModule,
  ],
})
export class ProjectsModule {}