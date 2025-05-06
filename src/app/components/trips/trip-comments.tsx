'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { TripComment } from '@/app/types/travel';
import {
  fetchCommentsByTravelPlanId,
  addComment,
  updateComment,
  deleteComment
} from '@/app/Services/travel-plans';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Avatar,
  Button,
  TextField,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Divider,
  Paper
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useThemeContext } from '@/app/context/ThemeContext';

interface TripCommentsProps {
  travelPlanId: string;
}

export default function TripComments({ travelPlanId }: TripCommentsProps) {
  const { userId } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [comments, setComments] = useState<TripComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const { isDarkMode } = useThemeContext();

  // Yorumları yükle
  useEffect(() => {
    loadComments();
  }, [travelPlanId]);

  const loadComments = async () => {
    if (!travelPlanId) return;

    setLoading(true);
    try {
      const commentsData = await fetchCommentsByTravelPlanId(travelPlanId);
      setComments(commentsData);
    } catch (error) {
      console.error('Yorumları yükleme hatası:', error);
      // Toast yerine console.error kullanıyoruz
    } finally {
      setLoading(false);
    }
  };

  // Yeni yorum ekle
  const handleAddComment = async () => {
    if (!newComment.trim() || !userId || !isUserLoaded || !user) return;

    setSubmitting(true);
    try {
      const commentData: Omit<TripComment, 'id' | 'createdAt' | 'updatedAt'> = {
        travelPlanId,
        userId,
        userName: user.fullName || user.firstName + ' ' + user.lastName || 'Misafir',
        userPhotoUrl: user.imageUrl || undefined,
        content: newComment.trim(),
      };

      await addComment(commentData);
      setNewComment('');
      await loadComments(); // Yorumları yeniden yükle
    } catch (error) {
      console.error('Yorum ekleme hatası:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Yorumu düzenlemeye başla
  const startEditing = (comment: TripComment) => {
    setEditingComment(comment.id);
    setEditText(comment.content);
  };

  // Yorumu güncelle
  const handleUpdateComment = async (commentId: string) => {
    if (!editText.trim()) return;

    setSubmitting(true);
    try {
      await updateComment(commentId, {
        content: editText.trim(),
      });
      setEditingComment(null);
      await loadComments(); // Yorumları yeniden yükle
    } catch (error) {
      console.error('Yorum güncelleme hatası:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Silme dialogunu aç
  const openDeleteDialog = (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteDialogOpen(true);
  };

  // Yorumu sil
  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    setSubmitting(true);
    try {
      await deleteComment(commentToDelete);
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
      await loadComments(); // Yorumları yeniden yükle
    } catch (error) {
      console.error('Yorum silme hatası:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Tarih formatı
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: tr
      });
    } catch (error) {
      return 'bilinmeyen tarih';
    }
  };

  // Kullanıcı avatarı için baş harfler
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Yorumlar
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ mb: 4 }}>
          {comments.length > 0 ? (
            comments.map(comment => (
              <Card
                key={comment.id}
                sx={{
                  mb: 2,
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  background: isDarkMode ? 'rgba(17, 24, 39, 0.6)' : 'white',
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar
                      src={comment.userPhotoUrl}
                      alt={comment.userName}
                      sx={{ bgcolor: isDarkMode ? '#3b82f6' : '#2563eb' }}
                    >
                      {getInitials(comment.userName)}
                    </Avatar>
                  }
                  title={comment.userName}
                  subheader={formatDate(comment.createdAt)}
                  titleTypographyProps={{ variant: 'subtitle1' }}
                  subheaderTypographyProps={{
                    variant: 'caption',
                    sx: { color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'text.secondary' }
                  }}
                />

                <CardContent sx={{ pt: 0 }}>
                  {editingComment === comment.id ? (
                    <Box sx={{ mt: 1 }}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{ mb: 2 }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setEditingComment(null)}
                        >
                          İptal
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleUpdateComment(comment.id)}
                          disabled={submitting}
                        >
                          Kaydet
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Typography variant="body2" color={isDarkMode ? 'white' : 'text.primary'}>
                      {comment.content}
                    </Typography>
                  )}
                </CardContent>

                {userId === comment.userId && editingComment !== comment.id && (
                  <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                    <IconButton
                      size="small"
                      onClick={() => startEditing(comment)}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => openDeleteDialog(comment.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                )}
              </Card>
            ))
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                background: isDarkMode ? 'rgba(17, 24, 39, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                border: '1px solid',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              }}
            >
              <Typography variant="body2" color={isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'} sx={{ fontStyle: 'italic' }}>
                Henüz yorum yapılmamış. İlk yorumu siz yapın!
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth
          multiline
          minRows={4}
          placeholder="Yorum yazın..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            onClick={handleAddComment}
            disabled={!newComment.trim() || submitting}
            sx={{
              background: "linear-gradient(45deg, #2563eb, #7c3aed)",
              "&:hover": {
                background: "linear-gradient(45deg, #1d4ed8, #6d28d9)",
              },
            }}
          >
            Gönder
          </Button>
        </Box>
      </Box>

      {/* Silme Onay Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Yorumu Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu yorumu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            İptal
          </Button>
          <Button
            onClick={handleDeleteComment}
            color="error"
            disabled={submitting}
            autoFocus
          >
            {submitting ? <CircularProgress size={20} /> : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
