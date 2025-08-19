export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  processed: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  typing?: boolean;
}

export interface UploadResult {
  filename: string;
  filepath: string;
  fileId: string;
}

export interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

export interface User {
  name: string;
  email: string;
  avatar?: string;
}