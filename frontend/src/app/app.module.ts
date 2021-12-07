import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConversationsAppComponent } from './conversations-app/conversations-app.component';
import { ChatComponent } from './chat/chat.component';
import { MessageComponent } from './message/message.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { DownloadDirective } from './download.directive';
@NgModule({
  declarations: [
    AppComponent,
    ConversationsAppComponent,
    ChatComponent,
    MessageComponent,
    DownloadDirective,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    InfiniteScrollModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
