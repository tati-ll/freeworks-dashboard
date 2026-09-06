import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared-module';
import { ProjectsRoutingModule } from './projects-routing-module';
import { ProjectsHomeComponent } from './pages/projects-home/projects-home';

@NgModule({
  declarations: [
    ProjectsHomeComponent,
  ],
  imports: [
    SharedModule,
    ProjectsRoutingModule,
  ],
})
export class ProjectsModule {}