import React, { useState, useEffect } from 'react';
import {
  Fab,
  Tooltip,
  Zoom,
  Box,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ChloeIcon from './ChloeIcon';
import AIChat from '../ai/AIChat';
import apiService from '../../services/api';

interface FloatingAIAssistantProps {
  applicationId?: string;
}

const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({ applicationId }) => {
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiHealth, setAiHealth] = useState<boolean | null>(null);
  const [isVisible] = useState(true);
  const [isClicked, setIsClicked] = useState(false);
  const theme = useTheme();

  const checkAIHealth = async () => {
    try {
      const response = await apiService.getAIHealth();
      setAiHealth(response.data?.status === 'healthy');
    } catch (error) {
      console.error('Failed to check AI health:', error);
      setAiHealth(false);
    }
  };

  useEffect(() => {
    checkAIHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkAIHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    setIsClicked(true);
    setShowAIChat(true);
  };

  const handleClose = () => {
    setShowAIChat(false);
    // Reset click state after a short delay
    setTimeout(() => setIsClicked(false), 300);
  };

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <Zoom in={isVisible} timeout={300}>
              <Tooltip
                title={aiHealth === false ? "Chloe is offline" : "Chat with Chloe"}
                placement="left"
                arrow
              >
            <span>
                  <Fab
                    color="primary"
                    onClick={handleClick}
                    disabled={aiHealth === false}
                    sx={{
                      width: 64,
                      height: 64,
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid #1976d2',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        transform: 'scale(1.05)',
                        border: '2px solid #1565c0',
                        boxShadow: '0 8px 32px rgba(25, 118, 210, 0.4)',
                      },
                      transition: 'all 0.3s ease-in-out',
                      boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
                      '&:disabled': {
                        backgroundColor: 'rgba(158, 158, 158, 0.3)',
                        color: theme.palette.grey[600],
                        border: '1px solid rgba(158, 158, 158, 0.3)',
                      },
                    }}
                  >
                    <ChloeIcon
                      sx={{
                        fontSize: 32,
                        color: '#1976d2',
                      }}
                    />
                  </Fab>
            </span>
          </Tooltip>
        </Zoom>
      </Box>

      <AIChat
        open={showAIChat}
        onClose={handleClose}
        applicationId={applicationId}
      />
    </>
  );
};

export default FloatingAIAssistant;
