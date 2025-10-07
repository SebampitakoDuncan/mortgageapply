import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Slide,
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import ChloeIcon from '../common/ChloeIcon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import apiService from '../../services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIChatProps {
  open: boolean;
  applicationId?: string;
  onClose?: () => void;
}

const AIChat: React.FC<AIChatProps> = ({ open, applicationId, onClose }) => {
      const [messages, setMessages] = useState<ChatMessage[]>([
        {
          id: '1',
          role: 'assistant',
          content: 'Hello! I\'m Chloe, your mortgage specialist. How can I help you with your home loan application today?',
          timestamp: new Date(),
          suggestions: [
            'What documents do I need?',
            'How long does the process take?',
            'What is my application status?'
          ]
        }
      ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.chatWithAI(inputMessage, applicationId);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data?.response || 'I apologize, but I couldn\'t process your request at the moment.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError('Failed to get response from AI assistant. Please try again.');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const clearChat = () => {
        setMessages([
          {
            id: '1',
            role: 'assistant',
            content: 'Hello! I\'m Chloe, your mortgage specialist. How can I help you with your home loan application today?',
            timestamp: new Date(),
            suggestions: [
              'What documents do I need?',
              'How long does the process take?',
              'What is my application status?'
            ]
          }
        ]);
    setError(null);
  };

  return (
    <Slide direction="up" in={open} mountOnEnter unmountOnExit>
      <Paper
        elevation={12}
        sx={{
          position: 'fixed',
          bottom: 100,
          right: 24,
          width: 400,
          height: 600,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          overflow: 'hidden',
          zIndex: 1300,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 2.5, 
          bgcolor: '#f8f9fa',
          color: '#333',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ 
              bgcolor: 'transparent', 
              width: 36, 
              height: 36,
              border: 'none'
            }}>
              <ChloeIcon sx={{ fontSize: 28, color: '#1976d2' }} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="600" sx={{ fontSize: '1.1rem', color: '#333', fontFamily: '"DM Sans", sans-serif' }}>
                Chloe
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#666', 
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontFamily: '"Inter", sans-serif'
              }}>
                <Box sx={{ 
                  width: 6, 
                  height: 6, 
                  borderRadius: '50%', 
                  bgcolor: '#4caf50',
                  animation: 'pulse 2s infinite'
                }} />
                Online
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton 
              onClick={clearChat} 
              size="small" 
              title="Clear chat"
              sx={{ 
                color: '#666',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
            <IconButton 
              onClick={onClose} 
              size="small" 
              title="Close chat"
              sx={{ 
                color: '#666',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Messages */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto', 
          p: 2,
          bgcolor: '#fafafa',
          background: 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)'
        }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2, 
                borderRadius: 2,
                '& .MuiAlert-message': { fontSize: '0.875rem' }
              }}
            >
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map((message) => (
              <Box key={message.id} sx={{ 
                display: 'flex', 
                gap: 1.5,
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start'
              }}>
                    {message.role === 'assistant' && (
                      <Avatar sx={{ 
                        bgcolor: 'transparent',
                        width: 32,
                        height: 32,
                        mt: 0.5,
                        border: 'none'
                      }}>
                        <ChloeIcon sx={{ fontSize: 24, color: '#1976d2' }} />
                      </Avatar>
                    )}
                
                <Box sx={{ 
                  maxWidth: '75%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5
                }}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: message.role === 'user' 
                        ? '#667eea'
                        : 'white',
                      color: message.role === 'user' ? 'white' : 'text.primary',
                      border: message.role === 'assistant' 
                        ? '1px solid rgba(0,0,0,0.05)' 
                        : 'none',
                      boxShadow: message.role === 'assistant' 
                        ? '0 2px 12px rgba(0,0,0,0.08)' 
                        : '0 4px 16px rgba(102, 126, 234, 0.3)',
                    }}
                  >
                    {message.role === 'assistant' ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                lineHeight: 1.6,
                                fontSize: '0.9rem',
                                mb: 1,
                                '&:last-child': { mb: 0 },
                                fontFamily: '"Inter", sans-serif'
                              }}
                            >
                              {children}
                            </Typography>
                          ),
                          strong: ({ children }) => (
                            <Typography component="span" sx={{ fontWeight: 500, color: '#333', fontFamily: '"Inter", sans-serif' }}>
                              {children}
                            </Typography>
                          ),
                          em: ({ children }) => (
                            <Typography component="span" sx={{ fontStyle: 'italic', color: '#666', fontFamily: '"Inter", sans-serif' }}>
                              {children}
                            </Typography>
                          ),
                          ul: ({ children }) => (
                            <Box component="ul" sx={{ pl: 2, mb: 1, '&:last-child': { mb: 0 } }}>
                              {children}
                            </Box>
                          ),
                          ol: ({ children }) => (
                            <Box component="ol" sx={{ pl: 2, mb: 1, '&:last-child': { mb: 0 } }}>
                              {children}
                            </Box>
                          ),
                          li: ({ children }) => (
                            <Typography 
                              component="li" 
                              variant="body2" 
                              sx={{ 
                                lineHeight: 1.6,
                                fontSize: '0.9rem',
                                mb: 0.5,
                                '&:last-child': { mb: 0 },
                                fontFamily: '"Inter", sans-serif'
                              }}
                            >
                              {children}
                            </Typography>
                          ),
                          code: ({ children }) => (
                            <Box
                              component="code"
                              sx={{
                                bgcolor: '#f5f5f5',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: '0.8rem',
                                fontFamily: 'monospace',
                                color: '#d63384'
                              }}
                            >
                              {children}
                            </Box>
                          ),
                          blockquote: ({ children }) => (
                            <Box
                              sx={{
                                borderLeft: '4px solid #667eea',
                                pl: 2,
                                ml: 1,
                                bgcolor: '#f8f9fa',
                                py: 1,
                                borderRadius: '0 4px 4px 0',
                                mb: 1
                              }}
                            >
                              {children}
                            </Box>
                          ),
                          table: ({ children }) => (
                            <Box
                              component="table"
                              sx={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                mb: 2,
                                border: '1px solid #e0e0e0',
                                borderRadius: 1,
                                overflow: 'hidden',
                                fontSize: '0.85rem'
                              }}
                            >
                              {children}
                            </Box>
                          ),
                          thead: ({ children }) => (
                            <Box component="thead" sx={{ bgcolor: '#f5f5f5' }}>
                              {children}
                            </Box>
                          ),
                          tbody: ({ children }) => (
                            <Box component="tbody">
                              {children}
                            </Box>
                          ),
                          tr: ({ children }) => (
                            <Box component="tr" sx={{ '&:nth-of-type(even)': { bgcolor: '#fafafa' } }}>
                              {children}
                            </Box>
                          ),
                          th: ({ children }) => (
                            <Box
                              component="th"
                              sx={{
                                p: 1.5,
                                textAlign: 'left',
                                fontWeight: 600,
                                borderBottom: '1px solid #e0e0e0',
                                borderRight: '1px solid #e0e0e0',
                                '&:last-child': { borderRight: 'none' },
                                fontSize: '0.8rem',
                                color: '#333'
                              }}
                            >
                              {children}
                            </Box>
                          ),
                          td: ({ children }) => (
                            <Box
                              component="td"
                              sx={{
                                p: 1.5,
                                borderBottom: '1px solid #e0e0e0',
                                borderRight: '1px solid #e0e0e0',
                                '&:last-child': { borderRight: 'none' },
                                fontSize: '0.8rem',
                                lineHeight: 1.4
                              }}
                            >
                              {children}
                            </Box>
                          ),
                          hr: () => (
                            <Box
                              sx={{
                                width: '100%',
                                height: '1px',
                                bgcolor: '#e0e0e0',
                                my: 2,
                                border: 'none'
                              }}
                            />
                          )
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          lineHeight: 1.5,
                          fontSize: '0.9rem',
                          color: 'white',
                          fontFamily: '"Inter", sans-serif'
                        }}
                      >
                        {message.content}
                      </Typography>
                    )}
                  </Paper>
                  
                  {message.suggestions && message.suggestions.length > 0 && (
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 0.75, 
                      mt: 1,
                      justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
                    }}>
                      {message.suggestions.map((suggestion, index) => (
                        <Chip
                          key={index}
                          label={suggestion}
                          size="small"
                          variant="outlined"
                          onClick={() => handleSuggestionClick(suggestion)}
                          sx={{ 
                            cursor: 'pointer', 
                            fontSize: '0.8rem',
                            height: 28,
                            borderRadius: 2,
                            borderColor: '#e0e0e0',
                            color: 'text.secondary',
                            '&:hover': { 
                              bgcolor: '#f0f0f0',
                              borderColor: '#667eea',
                              color: '#667eea'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        />
                      ))}
                    </Box>
                  )}
                  
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.7rem',
                          alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                          mt: 0.5,
                          fontFamily: '"Inter", sans-serif'
                        }}
                      >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
                
                {message.role === 'user' && (
                  <Avatar sx={{ 
                    bgcolor: '#667eea',
                    width: 32,
                    height: 32,
                    mt: 0.5,
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                  }}>
                    <PersonIcon fontSize="small" sx={{ color: 'white' }} />
                  </Avatar>
                )}
              </Box>
            ))}
            
                {isLoading && (
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1.5,
                    alignItems: 'flex-start'
                  }}>
                    <Avatar sx={{ 
                      bgcolor: 'transparent',
                      width: 32,
                      height: 32,
                      mt: 0.5,
                      border: 'none'
                    }}>
                      <ChloeIcon sx={{ fontSize: 24, color: '#1976d2' }} />
                    </Avatar>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: 'white',
                    border: '1px solid rgba(0,0,0,0.05)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CircularProgress size={16} sx={{ color: '#667eea' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem', fontFamily: '"Inter", sans-serif' }}>
                          Chloe is thinking...
                        </Typography>
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>
          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Box sx={{ 
          p: 2.5, 
          borderTop: '1px solid rgba(0,0,0,0.08)',
          bgcolor: 'white',
          background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)'
        }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 1.5, 
            alignItems: 'flex-end',
            bgcolor: '#f5f5f5',
            borderRadius: 3,
            p: 1,
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
                  placeholder="Ask Chloe anything about your mortgage..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              variant="standard"
              InputProps={{
                disableUnderline: true,
                sx: {
                  fontSize: '0.9rem',
                  '& input': {
                    padding: '8px 12px',
                  },
                  '& textarea': {
                    padding: '8px 12px',
                  }
                }
              }}
              sx={{
                '& .MuiInputBase-root': {
                  bgcolor: 'transparent',
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              sx={{ 
                minWidth: 'auto', 
                px: 0,
                py: 0,
                borderRadius: '50%',
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  background: '#e0e0e0',
                  boxShadow: 'none',
                  transform: 'none'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <SendIcon fontSize="small" />
            </Button>
          </Box>
        </Box>
      </Paper>
    </Slide>
  );
};

export default AIChat;