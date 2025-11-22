/**
 * Chat API Service
 * Handles all chat-related API calls
 */

import { api } from './client';

// Types for API requests and responses
export interface ChatMessageRequest {
  message: string;
  chatId?: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ChatMessageResponse {
  response: string;
  chatId?: string;
  messageId?: string;
  timestamp?: string;
}

export interface StreamChatMessageRequest extends ChatMessageRequest {
  stream?: boolean;
}

/**
 * Send a chat message and get response
 * @param message - User's message
 * @param chatId - Optional chat ID (node_id) for context
 * @param conversationHistory - Optional conversation history for context (ignored by backend)
 */
export const sendChatMessage = async (
  message: string,
  chatId?: string,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<ChatMessageResponse> => {
  try {
    const response = await api.post<any>('/api/chat', {
      message,
      node_id: chatId, // Backend uses node_id instead of chatId
    });

    // Transform backend response to match frontend expectations
    return {
      response: response.data.response,
      chatId: response.data.node_id,
      messageId: response.data.node_id,
    };
  } catch (error: any) {
    // Handle specific errors
    if (error.response?.status === 429) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    } else if (error.response?.status === 503) {
      throw new Error('Service temporarily unavailable. Please try again later.');
    }

    throw new Error(error.response?.data?.error || error.message || 'Failed to send message');
  }
};

/**
 * Send a chat message with streaming response
 * @param message - User's message
 * @param onChunk - Callback for each chunk of the response
 * @param chatId - Optional chat ID
 */
export const sendChatMessageStream = async (
  message: string,
  onChunk: (chunk: string) => void,
  chatId?: string
): Promise<void> => {
  try {
    const response = await api.post('/chat/stream', {
      message,
      chatId,
      stream: true,
    }, {
      responseType: 'stream',
      onDownloadProgress: (progressEvent) => {
        const chunk = progressEvent.event.target.response;
        if (chunk) {
          onChunk(chunk);
        }
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to stream message');
  }
};

/**
 * Get chat history
 * @param chatId - Chat ID to retrieve history for
 */
export const getChatHistory = async (chatId: string): Promise<any> => {
  try {
    const response = await api.get(`/chat/history/${chatId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get chat history');
  }
};

/**
 * Delete a chat
 * @param chatId - Chat ID to delete
 */
export const deleteChat = async (chatId: string): Promise<void> => {
  try {
    await api.delete(`/chat/${chatId}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete chat');
  }
};

/**
 * Merge a source node into a target node
 * @param targetId - Target node ID to merge into
 * @param sourceId - Source node ID to merge from
 */
export const mergeChatNodes = async (
  targetId: string,
  sourceId: string
): Promise<{ mergedId: string }> => {
  try {
    const response = await api.post<any>('/api/merge', {
      target_id: targetId,
      source_id: sourceId,
    });

    return {
      mergedId: response.data.merged_id,
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to merge nodes');
  }
};

/**
 * Health check - verify backend connection
 */
export const healthCheck = async (): Promise<{ status: string }> => {
  try {
    await api.get('/api/nodes');
    return { status: 'healthy' };
  } catch (error: any) {
    throw new Error('Backend server is not responding');
  }
};
