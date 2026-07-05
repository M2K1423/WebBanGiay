export type ChatConversation = {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhotoURL: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadForAdmin: number;
  unreadForCustomer: number;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: "customer" | "admin";
  senderName: string;
  content: string;
  imageUrl: string | null;
  readAt: string | null;
  createdAt: string;
};
