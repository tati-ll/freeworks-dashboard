import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared-module';
import { ProjectsRoutingModule } from './projects-routing-module';
import { ProjectCardComponent } from './components/project-card/project-card';
import { ProjectsHomeComponent } from './pages/projects-home/projects-home';

@NgModule({
  declarations: [
    ProjectsHomeComponent,
    ProjectCardComponent,
  ],
  imports: [
    SharedModule,
    ProjectsRoutingModule,
  ],
})
export class ProjectsModule {}