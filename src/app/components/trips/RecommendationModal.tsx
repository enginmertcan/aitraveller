"use client";

import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  IconButton,
  CircularProgress,
  Fade,
  Paper,
} from '@mui/material';
import { X, Star, StarOff, Check } from 'lucide-react';
import { useThemeContext } from '@/app/context/ThemeContext';

interface RecommendationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
  isCurrentlyRecommended: boolean;
  planTitle: string;
}

const RecommendationModal: React.FC<RecommendationModalProps> = ({
  open,
  onClose,
  onConfirm,
  isCurrentlyRecommended,
  planTitle,
}) => {
  const { isDarkMode } = useThemeContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newRecommendationStatus, setNewRecommendationStatus] = useState(!isCurrentlyRecommended);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const success = await onConfirm();
      if (success) {
        // İşlem başarılı olduğunda, yeni durumu güncelle
        setNewRecommendationStatus(!isCurrentlyRecommended);
        setIsSuccess(true);
        // 1.5 saniye sonra modalı kapat
        setTimeout(() => {
          setIsSuccess(false);
          setIsSubmitting(false);
          onClose();
        }, 1500);
      } else {
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Öneri durumu değiştirme hatası:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        },
      }}
    >
      {!isSuccess ? (
        <>
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 3,
              borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {isCurrentlyRecommended ? 'Öneriyi Kaldır' : 'Seyahat Planını Öner'}
            </Typography>
            {!isSubmitting && (
              <IconButton onClick={onClose} size="small" sx={{ color: isDarkMode ? 'grey.400' : 'grey.600' }}>
                <X size={20} />
              </IconButton>
            )}
          </DialogTitle>

          <DialogContent sx={{ p: 4, pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isCurrentlyRecommended
                    ? 'linear-gradient(45deg, #ef4444, #b91c1c)'
                    : 'linear-gradient(45deg, #f59e0b, #d97706)',
                  mb: 3,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                }}
              >
                {isCurrentlyRecommended ? <StarOff size={40} color="white" /> : <Star size={40} color="white" />}
              </Box>

              <Typography variant="h6" align="center" gutterBottom>
                {isCurrentlyRecommended
                  ? 'Bu seyahat planını önerilerden kaldırmak istediğinize emin misiniz?'
                  : 'Bu seyahat planını diğer kullanıcılara önermek istiyor musunuz?'}
              </Typography>

              <Typography variant="body1" align="center" color="text.secondary" sx={{ mt: 1 }}>
                <strong>{planTitle}</strong>
                {isCurrentlyRecommended
                  ? ' artık önerilen seyahatler listesinde görünmeyecek.'
                  : ' önerilen seyahatler listesinde görünecek ve diğer kullanıcılar tarafından görüntülenebilecek.'}
              </Typography>
            </Box>
          </DialogContent>

          <DialogActions
            sx={{
              p: 3,
              borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Button
              onClick={onClose}
              disabled={isSubmitting}
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                color: isDarkMode ? 'white' : 'rgba(0, 0, 0, 0.7)',
              }}
            >
              İptal
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isSubmitting}
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                background: isCurrentlyRecommended
                  ? 'linear-gradient(45deg, #ef4444, #b91c1c)'
                  : 'linear-gradient(45deg, #f59e0b, #d97706)',
                '&:hover': {
                  background: isCurrentlyRecommended
                    ? 'linear-gradient(45deg, #dc2626, #991b1b)'
                    : 'linear-gradient(45deg, #d97706, #b45309)',
                },
              }}
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : isCurrentlyRecommended ? (
                  <StarOff size={18} />
                ) : (
                  <Star size={18} />
                )
              }
            >
              {isSubmitting
                ? 'İşleniyor...'
                : isCurrentlyRecommended
                ? 'Öneriyi Kaldır'
                : 'Öner'}
            </Button>
          </DialogActions>
        </>
      ) : (
        <Fade in={isSuccess}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 5,
              minHeight: '250px',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(45deg, #10b981, #059669)',
                mb: 3,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              }}
            >
              <Check size={40} color="white" />
            </Paper>
            <Typography variant="h6" align="center" gutterBottom>
              {newRecommendationStatus
                ? 'Seyahat planı başarıyla önerildi'
                : 'Seyahat planı önerilerden kaldırıldı'}
            </Typography>
            <Typography variant="body1" align="center" color="text.secondary" sx={{ mt: 1 }}>
              {newRecommendationStatus
                ? 'Artık diğer kullanıcılar tarafından görüntülenebilecek.'
                : 'Artık önerilen seyahatler listesinde görünmeyecek.'}
            </Typography>
          </Box>
        </Fade>
      )}
    </Dialog>
  );
};

export default RecommendationModal;
