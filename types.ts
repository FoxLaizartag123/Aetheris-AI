export interface User {
  username: string;
  email: string;
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
}

export interface Attachment {
  file: File;
  previewUrl: string;
  type: 'image' | 'file';
  base64?: string;
  mimeType: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  attachments?: Attachment[];
  isThinking?: boolean; // For investigation mode visualization
}

export interface Chat {
  id: string;
  name: string;
  messages: Message[];
  createdAt: number;
}

export enum AppMode {
  CHAT = 'chat',
  WEB_SEARCH = 'web_search',
  IMAGE_GEN = 'image_gen',
  INVESTIGATE = 'investigate',
}