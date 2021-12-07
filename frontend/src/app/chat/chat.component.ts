import {
  Component,
  ElementRef,
  OnChanges,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from '../local-storage.service';
import {
  Client as ConversationsClient,
  Conversation,
  Message,
  Paginator,
} from '@twilio/conversations';
import { throwIfEmpty } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  conversationsClient: ConversationsClient | undefined;
  newMessage = '';
  token = '';
  buyerName = '';
  statusString = '';
  status = '';
  conversationsReady = false;
  loadingState = 'initializing';
  conversations: Conversation[] = [];
  selectedConvo: Conversation | undefined;
  messages: Message[] = [];
  mediaUrl = '';
  mediaFileName = '';
  paginator: Paginator<Message>;
  type = 'text';
  throttle = 300;
  scrollDistance = 1;
  scrollUpDistance = 2;
  direction = '';
  scrollBottom = false;

  @ViewChild('messageContainer') input: ElementRef;

  constructor(
    private localStorage: LocalStorageService,
    private router: Router
  ) {}
  ngOnInit(): void {
    if (!this.localStorage.getItem(this.localStorage.LS_TOKEN_KEY)) {
      this.router.navigateByUrl('/');
      return;
    }
    this.buyerName = this.localStorage.getItem('buyerName') || '';
    this.token =
      this.localStorage.getItem(this.localStorage.LS_TOKEN_KEY) || '';

    this.initConversations();
  }
  async initConversations() {
    this.conversationsClient = new ConversationsClient(this.token);
    this.statusString = 'Connecting to Twilio...';

    this.conversationsClient.on('connectionStateChanged', (state) => {
      if (state === 'connecting') {
        this.statusString = 'Connecting to Twilio…';
        this.status = 'default';
      }
      if (state === 'connected') {
        this.statusString = 'You are connected.';
        this.status = 'success';
      }
      if (state === 'disconnecting') {
        this.statusString = 'Disconnecting from Twilio…';
        this.conversationsReady = false;
        this.status = 'default';
      }
      if (state === 'disconnected') {
        this.statusString = 'Disconnected.';
        this.conversationsReady = false;
        this.status = 'warning';
      }
      if (state === 'denied') {
        console.log(state);
        this.statusString = 'Failed to connect.';
        this.conversationsReady = false;
        this.status = 'error';
      }
    });

    this.conversationsClient.on('conversationJoined', (conversation) => {
      this.conversations = [...this.conversations, conversation];
      console.log(this.conversations);
    });

    this.conversationsClient.on('conversationLeft', (thisConversation) => {
      this.conversations = [
        ...this.conversations.filter((it) => it !== thisConversation),
      ];
    });
  }
  async onUp() {
    if (this.paginator.hasPrevPage) {
      this.paginator = await this.paginator.prevPage();
      let prevMsg = this.paginator.items;
      this.messages = [...prevMsg, ...this.messages];
    }
  }
  conversationSelectHandler(event: any) {
    this.selectedConvo = this.conversations.find(
      (c) => c.sid === event.target.value
    );
    if (!this.selectedConvo) {
      return;
    }
    this.loadMessagesFor(this.selectedConvo);
  }

  scrollToBottom(): void {
    let element = document.querySelector('.chat-body');
    if (!element) {
      return;
    }
    element.scroll({
      top: element.scrollHeight,
    });
  }
  async loadMessagesFor(convo: Conversation) {
    if (!convo) {
      return;
    }
    this.paginator = await convo.getMessages(5);
    console.log(this.paginator);
    this.messages = this.paginator.items;
    this.loadingState = 'ready';
    console.log('Messages', this.messages);

    convo.on('messageAdded', (m) =>
      this.messageAdded(m, this.selectedConvo as Conversation)
    );
    setTimeout(this.scrollToBottom, 200);
  }

  messageAdded(message: Message, targetConversation: Conversation) {
    if (targetConversation === this.selectedConvo) {
      this.messages = [...this.messages, message];
      debugger;
      let element = document.querySelector('.chat-body');
      if (!element) {
        return;
      }
      if (element.scrollTop + element.clientHeight === element.scrollHeight) {
        setTimeout(this.scrollToBottom, 500);
      }
    }
  }

  sendMessage() {
    if (!this.selectedConvo) {
      return;
    }
    const message = this.newMessage;
    this.newMessage = '';
    this.selectedConvo.sendMessage(message);
    console.log('Sent');
    setTimeout(this.scrollToBottom, 500);
  }

  sendFile(acceptedFiles: any) {
    if (!this.selectedConvo) {
      return;
    }
    this.selectedConvo.sendMessage({
      contentType: acceptedFiles[0].type,
      media: acceptedFiles[0],
      filename: acceptedFiles[0].name,
    });
  }

  fileChangeHandler(event: any) {
    let files = event.target.files;

    this.sendFile(files);
  }

  logout() {
    this.localStorage.clear();
    this.router.navigateByUrl('/');
  }
}
