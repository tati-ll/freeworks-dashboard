import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared-module';
import { ProjectsRoutingModule } from './projects-routing-module';
import { ProjectCardComponent } from './components/project-card/project-card';
import { ProjectFormComponent } from './pages/project-form/project-form';
import { ProjectsHomeComponent } from './pages/projects-home/projects-home';

@NgModule({
  declarations: [
    ProjectsHomeComponent,
    ProjectCardComponent,
    ProjectFormComponent,
  ],
  imports: [
    SharedModule,
    ProjectsRoutingModule,
  ],
})
export class ProjectsModule {}