'use client';

import { useState, useEffect, useRef } from 'react';
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
  Paper,
  Modal,
  styled
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useThemeContext } from '@/app/context/ThemeContext';

interface TripCommentsProps {
  travelPlanId: string;
}

// Styled components
const CommentImage = styled('img')(({ theme }) => ({
  width: '100%',
  maxHeight: 150, // Daha küçük boyut
  objectFit: 'cover',
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(2),
  cursor: 'pointer',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.03)',
  },
}));

const PhotoLocationBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(1),
  left: theme.spacing(1),
  backgroundColor: 'rgba(76, 102, 159, 0.8)',
  padding: '4px 8px',
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  color: 'white',
}));

const ModalImage = styled('img')({
  maxWidth: '100%',
  maxHeight: '80vh',
  objectFit: 'contain',
  borderRadius: '4px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
  transition: 'transform 0.3s ease-in-out',
});

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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [photoLocation, setPhotoLocation] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPhotoForModal, setSelectedPhotoForModal] = useState<{ url: string, location?: string } | null>(null);
  const { isDarkMode } = useThemeContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if ((!newComment.trim() && !selectedImage) || !userId || !isUserLoaded || !user) return;

    setSubmitting(true);
    try {
      let photoData = null;
      let photoLocationValue = null;

      // Eğer fotoğraf seçilmişse, base64'e dönüştür
      if (selectedImage) {
        try {
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onload = () => {
              const base64 = reader.result as string;
              resolve(base64.split(',')[1]); // base64 data kısmını al
            };
          });

          reader.readAsDataURL(selectedImage);
          photoData = await base64Promise;

          // Konum bilgisi varsa ekle
          if (photoLocation && photoLocation.trim() !== '') {
            photoLocationValue = photoLocation.trim();
          }
        } catch (error) {
          console.error('Fotoğraf dönüştürme hatası:', error);
          alert('Fotoğraf işlenirken bir hata oluştu.');
          setSubmitting(false);
          return;
        }
      }

      const commentData: Omit<TripComment, 'id' | 'createdAt' | 'updatedAt'> = {
        travelPlanId,
        userId,
        userName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Misafir',
        userPhotoUrl: user.imageUrl || undefined,
        content: newComment.trim(),
      };

      // Sadece değerler varsa ekle (undefined değerleri eklemiyoruz)
      if (photoData) {
        commentData.photoData = photoData;
      }

      if (photoLocationValue) {
        commentData.photoLocation = photoLocationValue;
      }

      await addComment(commentData);
      setNewComment('');
      setSelectedImage(null);
      setPhotoLocation('');
      await loadComments(); // Yorumları yeniden yükle
    } catch (error) {
      console.error('Yorum ekleme hatası:', error);
      alert('Yorum eklenirken bir hata oluştu.');
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

  // Fotoğraf seçme işlemi
  const handleSelectImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Fotoğraf değiştiğinde
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);

      // Konum bilgisi iste
      const location = prompt('Fotoğrafın çekildiği yeri belirtin (opsiyonel):');
      setPhotoLocation(location || '');
    }
  };

  // Fotoğrafı temizle
  const handleClearImage = () => {
    setSelectedImage(null);
    setPhotoLocation('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Fotoğrafa tıklama işlemi
  const handlePhotoClick = (photoUrl: string, photoLocation?: string) => {
    setSelectedPhotoForModal({ url: photoUrl, location: photoLocation });
    setModalOpen(true);
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
                    <>
                      <Typography variant="body2" color={isDarkMode ? 'white' : 'text.primary'}>
                        {comment.content}
                      </Typography>

                      {/* Fotoğraf varsa göster */}
                      {(comment.photoUrl || comment.photoData) && (
                        <Box sx={{
                          position: 'relative',
                          mt: 2,
                          maxWidth: '250px', // Maksimum genişlik sınırlaması
                          mx: 'auto', // Yatayda ortalama
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          borderRadius: 1,
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                            transform: 'translateY(-2px)',
                          }
                        }}>
                          <CommentImage
                            src={comment.photoUrl || `data:image/jpeg;base64,${comment.photoData}`}
                            alt="Yorum fotoğrafı"
                            onClick={() => handlePhotoClick(
                              comment.photoUrl || `data:image/jpeg;base64,${comment.photoData}`,
                              comment.photoLocation
                            )}
                          />
                          {comment.photoLocation && (
                            <PhotoLocationBadge>
                              <LocationIcon sx={{ fontSize: 16, mr: 0.5 }} />
                              <Typography variant="caption">{comment.photoLocation}</Typography>
                            </PhotoLocationBadge>
                          )}
                        </Box>
                      )}
                    </>
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
        {/* Fotoğraf önizleme */}
        {selectedImage && (
          <Box sx={{
            position: 'relative',
            mb: 2,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            maxWidth: '300px', // Maksimum genişlik sınırlaması
            mx: 'auto', // Yatayda ortalama
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Seçilen fotoğraf"
              style={{
                width: '100%',
                maxHeight: 150, // Daha küçük boyut
                objectFit: 'cover',
                transition: 'transform 0.3s ease',
              }}
            />
            {photoLocation && (
              <Box sx={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                backgroundColor: 'rgba(76, 102, 159, 0.85)',
                color: 'white',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}>
                <LocationIcon sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="caption">{photoLocation}</Typography>
              </Box>
            )}
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }
              }}
              onClick={handleClearImage}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<ImageIcon />}
            onClick={handleSelectImage}
          >
            Fotoğraf Ekle
          </Button>

          <Button
            variant="contained"
            color="primary"
            endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            onClick={handleAddComment}
            disabled={(!newComment.trim() && !selectedImage) || submitting}
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

        {/* Gizli dosya input */}
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleImageChange}
        />
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

      {/* Fotoğraf Modalı */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(3px)',
        }}
      >
        <Box sx={{
          position: 'relative',
          maxWidth: '90%',
          maxHeight: '90%',
          outline: 'none',
          bgcolor: 'rgba(0, 0, 0, 0.85)',
          p: 2,
          borderRadius: 2,
          animation: 'fadeIn 0.3s ease-in-out',
          '@keyframes fadeIn': {
            '0%': {
              opacity: 0,
              transform: 'scale(0.95)',
            },
            '100%': {
              opacity: 1,
              transform: 'scale(1)',
            },
          },
        }}>
          {selectedPhotoForModal && (
            <>
              <ModalImage src={selectedPhotoForModal.url} alt="Büyütülmüş fotoğraf" />
              {selectedPhotoForModal.location && (
                <Box sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  backgroundColor: 'rgba(76, 102, 159, 0.85)',
                  color: 'white',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  <LocationIcon sx={{ fontSize: 18, mr: 1 }} />
                  <Typography variant="body2">{selectedPhotoForModal.location}</Typography>
                </Box>
              )}
            </>
          )}
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                transform: 'rotate(90deg)',
                transition: 'transform 0.3s ease',
              }
            }}
            onClick={() => setModalOpen(false)}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Modal>
    </Box>
  );
}
