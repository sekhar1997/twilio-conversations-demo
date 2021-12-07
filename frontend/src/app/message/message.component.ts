import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Message } from '@twilio/conversations';
import { LocalStorageService } from '../local-storage.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css'],
})
export class MessageComponent implements OnInit {
  @Input() message: Message;
  buyerName = '';
  mediaUrl = '';
  mediaFileName = '';
  type = 'text';

  constructor(private localStorage: LocalStorageService) {}

  ngOnInit(): void {
    this.type = this.message.type;
    this.buyerName = this.localStorage.getItem('buyerName') || '';
    if (this.type === 'media') {
      if (!this.message.attachedMedia) {
        return;
      }
      for (const m of this.message.attachedMedia) {
        m.getContentTemporaryUrl().then((url) => {
          this.mediaUrl = url;
          this.mediaFileName = m.filename;
        });
      }
    }
  }
}
