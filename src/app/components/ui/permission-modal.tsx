"use client";

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { X, AlertTriangle } from 'lucide-react';

interface PermissionModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

/**
 * Yetki hatası durumunda gösterilen modal bileşeni
 */
export default function PermissionModal({
  open,
  onClose,
  title,
  message,
  actionText,
  onAction,
}: PermissionModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="permission-dialog-title"
      aria-describedby="permission-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          maxWidth: '450px',
          width: '100%',
        }
      }}
    >
      <DialogTitle id="permission-dialog-title" sx={{ pr: 6, pt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            bgcolor: 'rgba(245, 158, 11, 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <AlertTriangle size={24} color="#f59e0b" />
          </Box>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: 'text.secondary',
          }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pb: 3 }}>
        <DialogContentText id="permission-dialog-description" sx={{ mb: 2, color: 'text.primary' }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'flex-end' }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '8px' }}>
          Kapat
        </Button>
        {actionText && onAction && (
          <Button 
            onClick={onAction} 
            variant="contained" 
            sx={{ 
              borderRadius: '8px',
              bgcolor: '#2563eb',
              '&:hover': {
                bgcolor: '#1d4ed8',
              }
            }}
          >
            {actionText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
