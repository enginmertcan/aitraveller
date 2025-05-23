"use client";

import { useEffect, useRef, useState } from "react";
import { useThemeContext } from "@/app/context/ThemeContext";
import { addComment, deleteComment, fetchCommentsByTravelPlanId, updateComment } from "@/app/Services/travel-plans";
import { CommentPhoto, TripComment } from "@/app/types/travel";
import StorageService from "@/app/Service/StorageService";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Image as ImageIcon,
  LocationOn as LocationIcon,
  Send as SendIcon,
  ArrowBackIos as ArrowBackIcon,
  ArrowForwardIos as ArrowForwardIcon,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Modal,
  Paper,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface TripCommentsProps {
  travelPlanId: string;
}

// Styled components
const CommentImage = styled("img")(({ theme }) => ({
  width: "100%",
  maxHeight: 220, // Daha büyük boyut
  objectFit: "cover",
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(2),
  cursor: "pointer",
  transition: "all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  filter: "brightness(0.97)",
  "&:hover": {
    transform: "scale(1.03) translateY(-4px)",
    boxShadow: "0 12px 24px rgba(0,0,0,0.2)",
    filter: "brightness(1.03)",
  },
}));

const PhotoLocationBadge = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: theme.spacing(1),
  left: theme.spacing(1),
  backgroundColor: "rgba(76, 102, 159, 0.8)",
  padding: "4px 8px",
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  color: "white",
}));

// ModalImage styled component'ini kaldırdık, doğrudan Box ve img kullanacağız

export default function TripComments({ travelPlanId }: TripCommentsProps) {
  const { userId } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [comments, setComments] = useState<TripComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<{commentId: string, photoIndex: number, url: string} | null>(null);
  const [photoDeleteDialogOpen, setPhotoDeleteDialogOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<{file: File, location: string}[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPhotoForModal, setSelectedPhotoForModal] = useState<{ url: string; location?: string; index?: number } | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  const [photoGallery, setPhotoGallery] = useState<{ url: string; location?: string }[]>([]);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [tempPhotoLocation, setTempPhotoLocation] = useState("");
  const [tempSelectedFiles, setTempSelectedFiles] = useState<File[]>([]);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const { isDarkMode } = useThemeContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Yorumları yükle
  useEffect(() => {
    loadComments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travelPlanId]);

  const loadComments = async () => {
    if (!travelPlanId) return;

    setLoading(true);
    try {
      const commentsData = await fetchCommentsByTravelPlanId(travelPlanId);
      setComments(commentsData);
    } catch (error) {
      console.error("Yorumları yükleme hatası:", error);
      // Toast yerine console.error kullanıyoruz
    } finally {
      setLoading(false);
    }
  };

  // Yeni yorum ekle
  const handleAddComment = async () => {
    if ((!newComment.trim() && selectedImages.length === 0) || !userId || !isUserLoaded || !user) return;

    setSubmitting(true);
    try {
      // Temel yorum verisi
      const commentData: Omit<TripComment, "id" | "createdAt" | "updatedAt"> = {
        travelPlanId,
        userId,
        userName: user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Misafir",
        userPhotoUrl: user.imageUrl || undefined,
        content: newComment.trim(),
      };

      // Eğer fotoğraflar varsa
      if (selectedImages.length > 0) {
        try {
          // Önce yorumu ekle ve ID'sini al (fotoğrafları Storage'a yüklemek için)
          const commentId = await addComment(commentData);

          if (!commentId) {
            throw new Error("Yorum eklenirken bir hata oluştu");
          }

          // Tüm fotoğrafları işle
          const photoUploadPromises = selectedImages.map(async (img) => {
            // Base64'e dönüştür
            const reader = new FileReader();
            const base64Promise = new Promise<string>(resolve => {
              reader.onload = () => {
                const base64 = reader.result as string;
                resolve(base64);
              };
            });

            reader.readAsDataURL(img.file);
            const photoData = await base64Promise;

            return {
              data: photoData,
              location: img.location && img.location.trim() !== "" ? img.location.trim() : undefined
            };
          });

          // Tüm fotoğrafları base64'e dönüştür
          const photoDataArray = await Promise.all(photoUploadPromises);

          // Fotoğrafları Storage'a yükle
          const uploadPath = `comments/${travelPlanId}/${commentId}`;
          const uploadedPhotos = await StorageService.uploadMultipleImages(photoDataArray, uploadPath);

          // Yüklenen fotoğrafların URL'lerini ve konum bilgilerini içeren JSON'ı oluştur
          const photosJson = JSON.stringify(uploadedPhotos);

          // Yorumu güncelle, fotoğraf URL'lerini ekle
          await updateComment(commentId, {
            photosJson,
            // Geriye uyumluluk için ilk fotoğrafı da eski alanlara ekle
            photoUrl: uploadedPhotos.length > 0 ? uploadedPhotos[0].url : undefined,
            photoLocation: uploadedPhotos.length > 0 ? uploadedPhotos[0].location : undefined
          });

          console.log(`${uploadedPhotos.length} fotoğraf başarıyla yüklendi ve yoruma eklendi`);
        } catch (error) {
          console.error("Fotoğraf yükleme hatası:", error);
          alert("Fotoğraflar yüklenirken bir hata oluştu.");
          setSubmitting(false);
          return;
        }
      } else {
        // Fotoğraf yoksa sadece yorumu ekle
        await addComment(commentData);
      }

      // Formu temizle
      setNewComment("");
      setSelectedImages([]);
      await loadComments(); // Yorumları yeniden yükle
    } catch (error) {
      console.error("Yorum ekleme hatası:", error);
      alert("Yorum eklenirken bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  // Yorumu düzenlemeye başla
  const startEditing = (comment: TripComment) => {
    setEditingComment(comment.id);
    setEditText(comment.content);

    // Eğer yorumda fotoğraflar varsa, düzenleme için hazırla
    if (comment.photosJson) {
      try {
        const photos = JSON.parse(comment.photosJson);
        if (Array.isArray(photos) && photos.length > 0) {
          // Mevcut fotoğrafları düzenleme için hazırla
          // Burada sadece URL'leri gösteriyoruz, gerçek dosyaları değil
          // Bu nedenle düzenleme sırasında yeni fotoğraflar eklenebilir
          setSelectedImages([]);
        }
      } catch (e) {
        console.error("JSON parse error:", e);
      }
    }
  };

  // Yorumu güncelle
  const handleUpdateComment = async (commentId: string) => {
    if (!editText.trim() && selectedImages.length === 0) return;

    setSubmitting(true);
    try {
      // Önce içeriği güncelle
      const updateData: Partial<TripComment> = {
        content: editText.trim(),
      };

      // Eğer yeni fotoğraflar eklendiyse
      if (selectedImages.length > 0) {
        // Mevcut yorumu bul
        const comment = comments.find(c => c.id === commentId);
        if (!comment) {
          throw new Error("Yorum bulunamadı");
        }

        // Mevcut fotoğrafları al (eğer varsa)
        let existingPhotos: CommentPhoto[] = [];
        if (comment.photosJson) {
          try {
            existingPhotos = JSON.parse(comment.photosJson);
            if (!Array.isArray(existingPhotos)) {
              existingPhotos = [];
            }
          } catch (e) {
            console.error("JSON parse error:", e);
          }
        }

        // Yeni fotoğrafları yükle
        const uploadPath = `comments/${comment.travelPlanId}/${commentId}`;

        // Tüm fotoğrafları işle
        const photoUploadPromises = selectedImages.map(async (img) => {
          // Base64'e dönüştür
          const reader = new FileReader();
          const base64Promise = new Promise<string>(resolve => {
            reader.onload = () => {
              const base64 = reader.result as string;
              resolve(base64);
            };
          });

          reader.readAsDataURL(img.file);
          const photoData = await base64Promise;

          return {
            data: photoData,
            location: img.location && img.location.trim() !== "" ? img.location.trim() : undefined
          };
        });

        // Tüm fotoğrafları base64'e dönüştür
        const photoDataArray = await Promise.all(photoUploadPromises);

        // Fotoğrafları Storage'a yükle
        const uploadedPhotos = await StorageService.uploadMultipleImages(photoDataArray, uploadPath);

        // Mevcut fotoğraflarla yeni fotoğrafları birleştir
        const allPhotos = [...existingPhotos, ...uploadedPhotos];

        // Yüklenen fotoğrafların URL'lerini ve konum bilgilerini içeren JSON'ı oluştur
        updateData.photosJson = JSON.stringify(allPhotos);

        // Geriye uyumluluk için ilk fotoğrafı da eski alanlara ekle
        if (allPhotos.length > 0) {
          updateData.photoUrl = allPhotos[0].url;
          updateData.photoLocation = allPhotos[0].location;
        }
      }

      await updateComment(commentId, updateData);
      setEditingComment(null);
      setSelectedImages([]); // Seçili fotoğrafları temizle
      await loadComments(); // Yorumları yeniden yükle
    } catch (error) {
      console.error("Yorum güncelleme hatası:", error);
      alert("Yorum güncellenirken bir hata oluştu.");
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
      // Silinecek yorumu bul
      const commentToDeleteObj = comments.find(c => c.id === commentToDelete);

      // Eğer yorumda fotoğraflar varsa, Storage'dan da sil
      if (commentToDeleteObj?.photosJson) {
        try {
          const photos = JSON.parse(commentToDeleteObj.photosJson);
          if (Array.isArray(photos) && photos.length > 0) {
            // Her fotoğrafı Storage'dan sil
            for (const photo of photos) {
              if (photo.url) {
                try {
                  await StorageService.deleteFile(photo.url);
                  console.log(`Fotoğraf silindi: ${photo.url}`);
                } catch (photoError) {
                  console.error(`Fotoğraf silme hatası:`, photoError);
                  // Fotoğraf silinemese bile yorumu silmeye devam et
                }
              }
            }
          }
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
        }
      }

      // Yorumu sil
      const success = await deleteComment(commentToDelete);

      if (success) {
        // Yerel state'i güncelle - silinen yorumu kaldır
        setComments(prevComments => prevComments.filter(c => c.id !== commentToDelete));
      }

      setDeleteDialogOpen(false);
      setCommentToDelete(null);
      // await loadComments(); // Yorumları yeniden yükleme kaldırıldı
    } catch (error) {
      console.error("Yorum silme hatası:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Fotoğraf silme dialogunu aç
  const openPhotoDeleteDialog = (commentId: string, photoIndex: number, photoUrl: string) => {
    setPhotoToDelete({ commentId, photoIndex, url: photoUrl });
    setPhotoDeleteDialogOpen(true);
  };

  // Bireysel fotoğrafı sil
  const handleDeletePhoto = async () => {
    if (!photoToDelete) return;

    setSubmitting(true);
    try {
      // Yorumu bul
      const comment = comments.find(c => c.id === photoToDelete.commentId);
      if (!comment || !comment.photosJson) {
        throw new Error("Yorum veya fotoğraf bulunamadı");
      }

      // Fotoğrafları parse et
      const photos = JSON.parse(comment.photosJson);
      if (!Array.isArray(photos) || photos.length <= photoToDelete.photoIndex) {
        throw new Error("Fotoğraf bulunamadı");
      }

      // Silinecek fotoğrafı al
      const photoToRemove = photos[photoToDelete.photoIndex];

      // Fotoğrafı Storage'dan sil
      if (photoToRemove.url) {
        try {
          await StorageService.deleteFile(photoToRemove.url);
          console.log(`Fotoğraf silindi: ${photoToRemove.url}`);
        } catch (deleteError) {
          console.error("Fotoğraf silme hatası:", deleteError);
          // Silme hatası olsa bile devam et
        }
      }

      // Fotoğrafı diziden çıkar
      photos.splice(photoToDelete.photoIndex, 1);

      // Yorumu güncelle
      const updateData: Partial<TripComment> = {
        photosJson: photos.length > 0 ? JSON.stringify(photos) : "",
      };

      // Eğer tüm fotoğraflar silindiyse, eski alanları da temizle
      if (photos.length === 0) {
        updateData.photoUrl = "";
        updateData.photoLocation = "";
      } else {
        // İlk fotoğrafı eski alanlara ekle (geriye uyumluluk için)
        updateData.photoUrl = photos[0].url;
        updateData.photoLocation = photos[0].location;
      }

      const success = await updateComment(photoToDelete.commentId, updateData);

      if (success) {
        // Yerel state'i güncelle - yorumu güncelle
        setComments(prevComments => prevComments.map(c => {
          if (c.id === photoToDelete.commentId) {
            // Güncellenmiş yorumu döndür
            return {
              ...c,
              photosJson: photos.length > 0 ? JSON.stringify(photos) : "",
              photoUrl: photos.length > 0 ? photos[0].url : "",
              photoLocation: photos.length > 0 ? photos[0].location : ""
            };
          }
          return c;
        }));
      }

      // Dialogu kapat ve state'i temizle
      setPhotoDeleteDialogOpen(false);
      setPhotoToDelete(null);

      // Yorumları yeniden yükleme kaldırıldı
      // await loadComments();
    } catch (error) {
      console.error("Fotoğraf silme hatası:", error);
      alert("Fotoğraf silinirken bir hata oluştu.");
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
    if (e.target.files && e.target.files.length > 0) {
      // Tüm seçilen fotoğrafları bir dizi olarak sakla
      const selectedFiles: File[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        selectedFiles.push(e.target.files[i]);
      }

      // Seçilen fotoğrafları state'e kaydet
      setTempSelectedFiles(selectedFiles);

      // Konum bilgisi için dialog aç
      setLocationDialogOpen(true);
    }
  };

  // Konum bilgisi onaylandığında
  const handleLocationConfirm = () => {
    if (tempSelectedFiles.length > 0) {
      const newImages: {file: File, location: string}[] = [];

      // Tüm seçilen fotoğrafları aynı konum bilgisiyle ekle
      for (const file of tempSelectedFiles) {
        newImages.push({
          file,
          location: tempPhotoLocation.trim()
        });
      }

      // Mevcut fotoğraflara ekle
      setSelectedImages(prev => [...prev, ...newImages]);
      setLocationDialogOpen(false);

      // Temizle
      setTempPhotoLocation("");
      setTempSelectedFiles([]);
    }
  };

  // Konum bilgisi iptal edildiğinde
  const handleLocationCancel = () => {
    setLocationDialogOpen(false);
    setTempPhotoLocation("");
    setTempSelectedFiles([]);
    // Input'u temizle
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Fotoğrafları temizle
  const handleClearImages = () => {
    setSelectedImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Fotoğrafa tıklama işlemi - Geliştirilmiş versiyon
  const handlePhotoClick = (photoUrl: string, photoLocation?: string, photos?: Array<{url: string, location?: string}>, index?: number) => {
    console.log(`Fotoğrafa tıklandı: ${photoUrl.substring(0, 30)}...`);

    // URL'nin geçerli olup olmadığını kontrol et
    if (!photoUrl || photoUrl.trim() === '') {
      console.error('Geçersiz fotoğraf URL\'si');
      return;
    }

    // URL formatını düzelt
    let finalUrl = photoUrl;

    // 1. Data URI formatı kontrolü
    if (!photoUrl.startsWith('data:image')) {
      // Base64 verisi içeren URL
      if (photoUrl.includes('base64')) {
        console.log('URL içinde base64 verisi bulundu, düzeltiliyor...');
        const base64Part = photoUrl.split('base64,')[1];
        if (base64Part) {
          finalUrl = `data:image/jpeg;base64,${base64Part}`;
        }
      }
      // Doğrudan base64 verisi (uzun string)
      else if (photoUrl.length > 100 && /^[A-Za-z0-9+/=]+$/.test(photoUrl.substring(0, 20))) {
        console.log('URL doğrudan base64 verisi içeriyor, düzeltiliyor...');
        finalUrl = `data:image/jpeg;base64,${photoUrl}`;
      }
      // Firebase Storage URL'i
      else if (photoUrl.includes('firebasestorage.googleapis.com')) {
        console.log('Firebase Storage URL\'i kullanılıyor');
        // URL'nin geçerli olduğundan emin ol
        if (!photoUrl.includes('alt=media')) {
          // alt=media parametresi ekle
          finalUrl = photoUrl.includes('?')
            ? `${photoUrl}&alt=media`
            : `${photoUrl}?alt=media`;
        }
      }
    }

    console.log(`İşlenmiş URL: ${finalUrl.substring(0, 30)}...`);

    // Durumları sıfırla
    setIsImageZoomed(false);
    setIsImageLoading(true);

    // Galeri fotoğraflarını işle
    let processedPhotos = photos;
    if (photos && photos.length > 0) {
      // Her fotoğraf URL'sini düzelt
      processedPhotos = photos.map(photo => {
        let url = photo.url;

        // URL formatını düzelt
        if (url && !url.startsWith('data:image')) {
          // Base64 verisi içeren URL
          if (url.includes('base64')) {
            const base64Part = url.split('base64,')[1];
            if (base64Part) {
              url = `data:image/jpeg;base64,${base64Part}`;
            }
          }
          // Doğrudan base64 verisi
          else if (url.length > 100 && /^[A-Za-z0-9+/=]+$/.test(url.substring(0, 20))) {
            url = `data:image/jpeg;base64,${url}`;
          }
          // Firebase Storage URL'i
          else if (url.includes('firebasestorage.googleapis.com') && !url.includes('alt=media')) {
            url = url.includes('?') ? `${url}&alt=media` : `${url}?alt=media`;
          }
        }

        return {
          url,
          location: photo.location
        };
      });
    }

    // Eğer fotoğraf galerisi varsa, galeriyi ve mevcut indeksi ayarla
    if (processedPhotos && processedPhotos.length > 0 && typeof index === 'number') {
      setPhotoGallery(processedPhotos);
      setCurrentPhotoIndex(index);
      setSelectedPhotoForModal({ url: finalUrl, location: photoLocation, index });
    } else {
      // Tek fotoğraf için
      setPhotoGallery([{ url: finalUrl, location: photoLocation }]);
      setCurrentPhotoIndex(0);
      setSelectedPhotoForModal({ url: finalUrl, location: photoLocation, index: 0 });
    }

    setModalOpen(true);
  };

  // Önceki fotoğrafa geç
  const handlePreviousPhoto = () => {
    if (photoGallery.length <= 1) return;

    const newIndex = (currentPhotoIndex - 1 + photoGallery.length) % photoGallery.length;
    setCurrentPhotoIndex(newIndex);

    const prevPhoto = photoGallery[newIndex];
    setIsImageLoading(true);
    setSelectedPhotoForModal({
      url: prevPhoto.url,
      location: prevPhoto.location,
      index: newIndex
    });
  };

  // Sonraki fotoğrafa geç
  const handleNextPhoto = () => {
    if (photoGallery.length <= 1) return;

    const newIndex = (currentPhotoIndex + 1) % photoGallery.length;
    setCurrentPhotoIndex(newIndex);

    const nextPhoto = photoGallery[newIndex];
    setIsImageLoading(true);
    setSelectedPhotoForModal({
      url: nextPhoto.url,
      location: nextPhoto.location,
      index: newIndex
    });
  };

  // Modal içindeki fotoğrafa tıklayınca zoom yap/kaldır
  const handleModalImageClick = () => {
    setIsImageZoomed(prev => !prev);

    // Zoom yapıldığında scroll özelliğini aktifleştir/deaktifleştir
    const modalBox = document.querySelector('.modal-photo-container');
    if (modalBox) {
      if (!isImageZoomed) {
        // Zoom yapılıyorsa overflow'u auto yap
        modalBox.setAttribute('style', 'overflow: auto !important');
      } else {
        // Zoom kaldırılıyorsa overflow'u hidden yap
        modalBox.setAttribute('style', 'overflow: hidden !important');
      }
    }
  };

  // Tarih formatı
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: tr,
      });
    } catch {
      return "bilinmeyen tarih";
    }
  };

  // Fotoğraf verisi için doğru URL formatını oluştur - Geliştirilmiş versiyon
  const getPhotoUrl = (photoUrl?: string, photoData?: string) => {
    try {
      // 1. Önce photoUrl'i kontrol et
      if (photoUrl && photoUrl.trim() !== '') {
        // Firebase Storage URL'i
        if (photoUrl.includes('firebasestorage.googleapis.com')) {
          console.log('Firebase Storage URL kullanılıyor');
          // URL'nin geçerli olduğundan emin ol
          if (!photoUrl.includes('alt=media')) {
            // alt=media parametresi ekle
            return photoUrl.includes('?')
              ? `${photoUrl}&alt=media`
              : `${photoUrl}?alt=media`;
          }
          return photoUrl;
        }

        // HTTP/HTTPS URL
        if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
          console.log('HTTP/HTTPS URL kullanılıyor');
          return photoUrl;
        }

        // Data URI (base64)
        if (photoUrl.startsWith('data:image')) {
          console.log('Data URI kullanılıyor');
          return photoUrl;
        }

        // Base64 verisi içeren URL (prefix olmadan)
        if (photoUrl.length > 100) {
          console.log('Base64 verisi prefix eklenerek kullanılıyor');

          // Önce mevcut formatı temizle
          let cleanBase64 = photoUrl;

          // Data URI prefix'i varsa kaldır
          if (cleanBase64.includes('data:image')) {
            cleanBase64 = cleanBase64.split('base64,')[1] || cleanBase64;
          }

          // Base64 olmayan karakterleri temizle
          cleanBase64 = cleanBase64.replace(/[^A-Za-z0-9+/=]/g, '');

          // Doğrudan base64 verisi
          return `data:image/jpeg;base64,${cleanBase64}`;
        }

        // Diğer URL formatları
        return photoUrl;
      }

      // 2. photoData'yı kontrol et
      if (photoData && photoData.trim() !== '') {
        console.log('photoData kullanılıyor');

        // Data URI (base64)
        if (photoData.startsWith('data:image')) {
          return photoData;
        }

        // Base64 verisi (prefix olmadan)
        if (photoData.length > 100) {
          // Önce mevcut formatı temizle
          let cleanBase64 = photoData;

          // Data URI prefix'i varsa kaldır
          if (cleanBase64.includes('data:image')) {
            cleanBase64 = cleanBase64.split('base64,')[1] || cleanBase64;
          }

          // Base64 olmayan karakterleri temizle
          cleanBase64 = cleanBase64.replace(/[^A-Za-z0-9+/=]/g, '');

          return `data:image/jpeg;base64,${cleanBase64}`;
        }

        // Diğer formatlar
        return photoData;
      }

      return '';
    } catch (error) {
      console.error('getPhotoUrl hatası:', error);

      // Hata durumunda en basit yaklaşımı dene
      if (photoUrl && photoUrl.trim() !== '') {
        if (photoUrl.length > 100 && !photoUrl.startsWith('data:image') && !photoUrl.startsWith('http')) {
          return `data:image/jpeg;base64,${photoUrl}`;
        }
        return photoUrl;
      }

      if (photoData && photoData.trim() !== '') {
        if (photoData.length > 100 && !photoData.startsWith('data:image')) {
          return `data:image/jpeg;base64,${photoData}`;
        }
        return photoData;
      }

      return '';
    }
  };

  // Kullanıcı avatarı için baş harfler
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Yorumlar
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
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
                  border: "1px solid",
                  borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                  background: isDarkMode ? "rgba(17, 24, 39, 0.6)" : "white",
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar
                      src={comment.userPhotoUrl}
                      alt={comment.userName}
                      sx={{ bgcolor: isDarkMode ? "#3b82f6" : "#2563eb" }}
                    >
                      {getInitials(comment.userName)}
                    </Avatar>
                  }
                  title={comment.userName}
                  subheader={formatDate(comment.createdAt)}
                  titleTypographyProps={{ variant: "subtitle1" }}
                  subheaderTypographyProps={{
                    variant: "caption",
                    sx: { color: isDarkMode ? "rgba(255, 255, 255, 0.6)" : "text.secondary" },
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
                        onChange={e => setEditText(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{ mb: 2 }}
                      />

                      {/* Düzenleme modunda fotoğraf ekleme bölümü */}
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ImageIcon />}
                          onClick={handleSelectImage}
                        >
                          Fotoğraf Ekle
                        </Button>

                        {/* Mevcut fotoğrafları göster */}
                        {comment.photosJson && (() => {
                          try {
                            const photos = JSON.parse(comment.photosJson);
                            if (Array.isArray(photos) && photos.length > 0) {
                              return (
                                <Typography variant="caption" color="text.secondary">
                                  Mevcut Fotoğraflar: {photos.length}
                                </Typography>
                              );
                            }
                          } catch (e) {
                            console.error("JSON parse error:", e);
                          }
                          return null;
                        })()}
                      </Box>

                      {/* Seçilen yeni fotoğrafları göster */}
                      {selectedImages.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <span>Eklenecek Fotoğraflar ({selectedImages.length})</span>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<CloseIcon />}
                              onClick={handleClearImages}
                              sx={{ fontSize: '0.75rem' }}
                            >
                              Temizle
                            </Button>
                          </Typography>

                          <Box sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1,
                            justifyContent: 'flex-start'
                          }}>
                            {selectedImages.map((img, index) => (
                              <Box
                                key={index}
                                sx={{
                                  position: "relative",
                                  borderRadius: 1,
                                  overflow: "hidden",
                                  width: { xs: "calc(33.33% - 8px)", sm: "calc(25% - 8px)" },
                                  height: 100,
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                }}
                              >
                                <img
                                  src={URL.createObjectURL(img.file)}
                                  alt={`Seçilen fotoğraf ${index + 1}`}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                                <IconButton
                                  size="small"
                                  sx={{
                                    position: "absolute",
                                    top: 2,
                                    right: 2,
                                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                                    width: 20,
                                    height: 20,
                                    padding: 0,
                                  }}
                                  onClick={() => {
                                    setSelectedImages(prev => prev.filter((_, i) => i !== index));
                                  }}
                                >
                                  <CloseIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}

                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setEditingComment(null);
                            setSelectedImages([]);
                          }}
                        >
                          İptal
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleUpdateComment(comment.id)}
                          disabled={submitting}
                        >
                          {submitting ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
                          Kaydet
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <>
                      <Typography variant="body2" color={isDarkMode ? "white" : "text.primary"}>
                        {comment.content}
                      </Typography>

                      {/* Fotoğraflar varsa göster */}
                      {/* Önce photosJson'ı kontrol et, sonra photos dizisini, yoksa eski yöntemi kullan */}
                      {comment.photosJson ? (
                        // JSON string'i parse ederek fotoğrafları göster
                        (() => {
                          try {
                            const photos = JSON.parse(comment.photosJson);
                            if (Array.isArray(photos) && photos.length > 0) {
                              return (
                        <Box sx={{ mt: 2 }}>
                          {/* Birden fazla fotoğraf varsa grid olarak göster */}
                          <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: photos.length > 1
                              ? { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' }
                              : { xs: '1fr', sm: '350px' },
                            gap: 2,
                            justifyContent: photos.length === 1 ? 'center' : 'flex-start',
                            width: '100%'
                          }}>
                            {photos.map((photo, index) => (
                              <Box
                                key={index}
                                sx={{
                                  position: "relative",
                                  borderRadius: 2,
                                  overflow: "hidden",
                                  width: '100%',
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                                  transition: "all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)",
                                  transform: "translateZ(0)",
                                  backfaceVisibility: "hidden",
                                  "&:hover": {
                                    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                                    transform: "translateY(-6px)",
                                  },
                                  "&::after": {
                                    content: '""',
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    background: "linear-gradient(to bottom, rgba(0,0,0,0) 70%, rgba(0,0,0,0.4) 100%)",
                                    opacity: 0,
                                    transition: "opacity 0.4s ease",
                                  },
                                  "&:hover::after": {
                                    opacity: 1,
                                  }
                                }}
                              >
                                <CommentImage
                                  src={photo.url || ''}
                                  alt={`Yorum fotoğrafı ${index + 1}`}
                                  onClick={() => {
                                    // Tüm fotoğrafları galeri olarak hazırla
                                    const photoGalleryItems = photos.map(p => ({
                                      url: p.url || '',
                                      location: p.location
                                    }));
                                    // Tıklanan fotoğrafla başlayarak galeriyi göster
                                    handlePhotoClick(photo.url || '', photo.location, photoGalleryItems, index);
                                  }}
                                  onLoad={() => {
                                    console.log(`Fotoğraf başarıyla yüklendi: ${comment.id}`);
                                  }}
                                  onError={(e) => {
                                    console.error(`Fotoğraf yükleme hatası: ${comment.id}`);

                                    // Detaylı hata ayıklama bilgisi
                                    if (photo.url) {
                                      console.log(`URL: ${photo.url.substring(0, 50)}${photo.url.length > 50 ? '...' : ''}`);
                                      console.log(`URL uzunluğu: ${photo.url.length}`);
                                      console.log(`URL tipi: ${typeof photo.url}`);

                                      if (photo.url.startsWith('http')) {
                                        console.log('URL tipi: HTTP/HTTPS');
                                      } else if (photo.url.startsWith('data:image')) {
                                        console.log('URL tipi: Data URI');
                                      } else if (photo.url.length > 100) {
                                        console.log('URL tipi: Muhtemelen base64 verisi');
                                      }
                                    } else {
                                      console.log('URL değeri yok veya boş');
                                    }

                                    // Hata durumunda URL'yi düzeltmeyi dene
                                    const img = e.target as HTMLImageElement;

                                    // 1. Mobil uygulamadan gelen base64 verisi için özel düzeltme
                                    if (photo.url && photo.url.length > 100) {
                                      // Base64 verisi olabilecek uzun string
                                      try {
                                        // Önce mevcut formatı temizle
                                        let cleanBase64 = photo.url;

                                        // Data URI prefix'i varsa kaldır
                                        if (cleanBase64.includes('data:image')) {
                                          cleanBase64 = cleanBase64.split('base64,')[1] || cleanBase64;
                                        }

                                        // Base64 olmayan karakterleri temizle
                                        cleanBase64 = cleanBase64.replace(/[^A-Za-z0-9+/=]/g, '');

                                        console.log('Temizlenmiş base64 verisi ile yeniden deneniyor...');
                                        img.src = `data:image/jpeg;base64,${cleanBase64}`;
                                        return;
                                      } catch (cleanError) {
                                        console.error('Base64 temizleme hatası:', cleanError);
                                      }
                                    }

                                    // 2. Firebase Storage URL'i düzeltmeyi dene
                                    if (photo.url && photo.url.includes('firebasestorage.googleapis.com')) {
                                      try {
                                        // Token ekle veya yenile
                                        const urlParts = photo.url.split('?');
                                        if (urlParts.length > 0) {
                                          const baseUrl = urlParts[0];
                                          const newUrl = `${baseUrl}?alt=media&token=${Date.now()}`;
                                          console.log('Firebase URL yenilendi:', newUrl);
                                          img.src = newUrl;
                                          return;
                                        }
                                      } catch (urlError) {
                                        console.error('URL düzeltme hatası:', urlError);
                                      }
                                    }

                                    // 3. Yedek görüntü kullan - güvenilir bir CDN kullan
                                    console.log('Yedek görüntü kullanılıyor...');
                                    img.src = 'https://placehold.co/300x200/4c669f/ffffff?text=Resim+Yuklenemedi';
                                  }}
                                  sx={{
                                    height: photos.length > 1 ? 180 : 220,
                                  }}
                                />
                                {photo.location && (
                                  <PhotoLocationBadge>
                                    <LocationIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        maxWidth: "calc(100% - 25px)",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        display: "block"
                                      }}
                                    >
                                      {photo.location}
                                    </Typography>
                                  </PhotoLocationBadge>
                                )}

                                {/* Fotoğraf silme butonu - sadece yorum sahibi görebilir */}
                                {userId === comment.userId && (
                                  <IconButton
                                    size="small"
                                    sx={{
                                      position: "absolute",
                                      top: 4,
                                      right: 4,
                                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                                      width: 24,
                                      height: 24,
                                      "&:hover": {
                                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                                        color: "red"
                                      },
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation(); // Fotoğrafa tıklama olayını engelle
                                      openPhotoDeleteDialog(comment.id, index, photo.url || '');
                                    }}
                                  >
                                    <CloseIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                )}
                              </Box>
                            ))}
                          </Box>
                        </Box>
                              );
                            }
                          } catch (e) {
                            console.error("JSON parse error:", e);
                          }
                          return null;
                        })()
                      ) : (comment.photoUrl || comment.photoData) && (
                        // Eski yöntem - geriye uyumluluk için
                        <Box
                          sx={{
                            position: "relative",
                            mt: 2,
                            maxWidth: "350px", // Daha büyük genişlik sınırlaması
                            mx: "auto", // Yatayda ortalama
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            borderRadius: 1,
                            overflow: "hidden",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          <CommentImage
                            src={getPhotoUrl(comment.photoUrl, comment.photoData)}
                            alt="Yorum fotoğrafı"
                            onClick={() => {
                              // Tek fotoğraf için galeri oluştur
                              const photoUrl = getPhotoUrl(comment.photoUrl, comment.photoData);
                              handlePhotoClick(photoUrl, comment.photoLocation);
                            }}
                            onLoad={() => {
                              console.log(`Fotoğraf başarıyla yüklendi: ${comment.id}`);
                            }}
                            onError={(e) => {
                              console.error(`Fotoğraf yükleme hatası: ${comment.id}`);

                              // Detaylı hata ayıklama bilgisi
                              console.log('Mevcut veri:');
                              if (comment.photoUrl) {
                                console.log(`photoUrl: ${comment.photoUrl.substring(0, 50)}${comment.photoUrl.length > 50 ? '...' : ''}`);
                                console.log(`photoUrl uzunluğu: ${comment.photoUrl.length}`);
                              } else {
                                console.log('photoUrl değeri yok');
                              }

                              if (comment.photoData) {
                                console.log(`photoData: ${comment.photoData.substring(0, 50)}${comment.photoData.length > 50 ? '...' : ''}`);
                                console.log(`photoData uzunluğu: ${comment.photoData.length}`);
                              } else {
                                console.log('photoData değeri yok');
                              }

                              if (comment.photosJson) {
                                console.log('photosJson mevcut');
                              }

                              // Hata durumunda URL'yi düzeltmeyi dene
                              const img = e.target as HTMLImageElement;

                              // 1. Önce photoData ile düzeltmeyi dene
                              if (comment.photoData && comment.photoData.trim() !== '') {
                                console.log('photoData ile düzeltme deneniyor');
                                try {
                                  // Önce mevcut formatı temizle
                                  let cleanBase64 = comment.photoData;

                                  // Data URI prefix'i varsa kaldır
                                  if (cleanBase64.includes('data:image')) {
                                    cleanBase64 = cleanBase64.split('base64,')[1] || cleanBase64;
                                  }

                                  // Base64 olmayan karakterleri temizle
                                  cleanBase64 = cleanBase64.replace(/[^A-Za-z0-9+/=]/g, '');

                                  console.log('Temizlenmiş photoData ile yeniden deneniyor...');
                                  img.src = `data:image/jpeg;base64,${cleanBase64}`;
                                  return;
                                } catch (cleanError) {
                                  console.error('photoData temizleme hatası:', cleanError);
                                }
                              }

                              // 2. photoUrl ile düzeltmeyi dene
                              if (comment.photoUrl && comment.photoUrl.trim() !== '') {
                                console.log('photoUrl ile düzeltme deneniyor');
                                try {
                                  // Base64 verisi içeren URL
                                  if (comment.photoUrl.length > 100 && !comment.photoUrl.startsWith('data:image')) {
                                    // Önce mevcut formatı temizle
                                    let cleanBase64 = comment.photoUrl;

                                    // Data URI prefix'i varsa kaldır
                                    if (cleanBase64.includes('data:image')) {
                                      cleanBase64 = cleanBase64.split('base64,')[1] || cleanBase64;
                                    }

                                    // Base64 olmayan karakterleri temizle
                                    cleanBase64 = cleanBase64.replace(/[^A-Za-z0-9+/=]/g, '');

                                    console.log('Temizlenmiş photoUrl ile yeniden deneniyor...');
                                    img.src = `data:image/jpeg;base64,${cleanBase64}`;
                                    return;
                                  }

                                  // Firebase Storage URL'i düzeltmeyi dene
                                  if (comment.photoUrl.includes('firebasestorage.googleapis.com')) {
                                    // Token ekle veya yenile
                                    const urlParts = comment.photoUrl.split('?');
                                    if (urlParts.length > 0) {
                                      const baseUrl = urlParts[0];
                                      const newUrl = `${baseUrl}?alt=media&token=${Date.now()}`;
                                      console.log('Firebase URL yenilendi:', newUrl);
                                      img.src = newUrl;
                                      return;
                                    }
                                  }
                                } catch (urlError) {
                                  console.error('photoUrl düzeltme hatası:', urlError);
                                }
                              }

                              // 3. photosJson'dan veri çıkarmayı dene
                              if (comment.photosJson) {
                                console.log('photosJson ile düzeltme deneniyor');
                                try {
                                  const photos = JSON.parse(comment.photosJson);
                                  if (Array.isArray(photos) && photos.length > 0 && photos[0].url) {
                                    console.log('photosJson içinden ilk fotoğraf URL\'si kullanılıyor');
                                    img.src = photos[0].url;
                                    return;
                                  }
                                } catch (jsonError) {
                                  console.error('photosJson parse hatası:', jsonError);
                                }
                              }

                              // 4. Yedek görüntü kullan - güvenilir bir CDN kullan
                              console.log('Yedek görüntü kullanılıyor...');
                              img.src = 'https://placehold.co/300x200/4c669f/ffffff?text=Resim+Yuklenemedi';
                            }}
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
                  <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
                    <IconButton size="small" onClick={() => startEditing(comment)} color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => openDeleteDialog(comment.id)} color="error">
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
                textAlign: "center",
                background: isDarkMode ? "rgba(17, 24, 39, 0.6)" : "rgba(255, 255, 255, 0.8)",
                border: "1px solid",
                borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
              }}
            >
              <Typography
                variant="body2"
                color={isDarkMode ? "rgba(255, 255, 255, 0.7)" : "text.secondary"}
                sx={{ fontStyle: "italic" }}
              >
                Henüz yorum yapılmamış. İlk yorumu siz yapın!
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mt: 2 }}>
        {/* Fotoğraf önizleme */}
        {selectedImages.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Seçilen Fotoğraflar ({selectedImages.length})</span>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<CloseIcon />}
                onClick={handleClearImages}
                sx={{ fontSize: '0.75rem' }}
              >
                Tümünü Temizle
              </Button>
            </Typography>

            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              justifyContent: 'flex-start'
            }}>
              {selectedImages.map((img, index) => (
                <Box
                  key={index}
                  sx={{
                    position: "relative",
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                    width: { xs: "calc(50% - 8px)", sm: "calc(33.33% - 8px)", md: "calc(25% - 8px)" },
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  <img
                    src={URL.createObjectURL(img.file)}
                    alt={`Seçilen fotoğraf ${index + 1}`}
                    style={{
                      width: "100%",
                      height: 150,
                      objectFit: "cover",
                      transition: "transform 0.3s ease",
                      borderRadius: "8px",
                    }}
                    onClick={() => {
                      // Tüm seçilen fotoğrafları galeri olarak hazırla
                      const photoGalleryItems = selectedImages.map(image => ({
                        url: URL.createObjectURL(image.file),
                        location: image.location
                      }));
                      // Tıklanan fotoğrafla başlayarak galeriyi göster
                      handlePhotoClick(
                        URL.createObjectURL(img.file),
                        img.location,
                        photoGalleryItems,
                        index
                      );
                    }}
                  />
                  {img.location && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 8,
                        left: 8,
                        backgroundColor: "rgba(76, 102, 159, 0.85)",
                        color: "white",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        maxWidth: "calc(100% - 40px)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <LocationIcon sx={{ fontSize: 16, mr: 0.5, flexShrink: 0 }} />
                      <Typography
                        variant="caption"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {img.location}
                      </Typography>
                    </Box>
                  )}
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      width: 24,
                      height: 24,
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                      },
                    }}
                    onClick={() => {
                      setSelectedImages(prev => prev.filter((_, i) => i !== index));
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <TextField
          fullWidth
          multiline
          minRows={4}
          placeholder="Yorum yazın..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button variant="outlined" startIcon={<ImageIcon />} onClick={handleSelectImage}>
            Fotoğraf Ekle
          </Button>

          <Button
            variant="contained"
            color="primary"
            endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            onClick={handleAddComment}
            disabled={(!newComment.trim() && selectedImages.length === 0) || submitting}
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
          multiple
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleImageChange}
        />
      </Box>

      {/* Yorum Silme Onay Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Yorumu Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>Bu yorumu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            İptal
          </Button>
          <Button onClick={handleDeleteComment} color="error" disabled={submitting} autoFocus>
            {submitting ? <CircularProgress size={20} /> : "Sil"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fotoğraf Silme Onay Dialog */}
      <Dialog open={photoDeleteDialogOpen} onClose={() => setPhotoDeleteDialogOpen(false)}>
        <DialogTitle>Fotoğrafı Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>Bu fotoğrafı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhotoDeleteDialogOpen(false)} color="primary">
            İptal
          </Button>
          <Button onClick={handleDeletePhoto} color="error" disabled={submitting} autoFocus>
            {submitting ? <CircularProgress size={20} /> : "Sil"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fotoğraf Modalı */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setIsImageZoomed(false);
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(8px)",
        }}
      >
        <Box
          sx={{
            position: "relative",
            maxWidth: "95%",
            maxHeight: "95%",
            outline: "none",
            bgcolor: "rgba(0, 0, 0, 0.85)",
            p: 3,
            borderRadius: 4,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
            animation: "fadeIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)",
            overflow: "hidden",
            "@keyframes fadeIn": {
              "0%": {
                opacity: 0,
                transform: "scale(0.92)",
              },
              "100%": {
                opacity: 1,
                transform: "scale(1)",
              },
            },
          }}
        >
          {selectedPhotoForModal && (
            <Box
              className="modal-photo-container"
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              {isImageLoading && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 5
                  }}
                >
                  <CircularProgress size={60} sx={{ color: "white" }} />
                </Box>
              )}
              <Box
                component="img"
                src={selectedPhotoForModal.url}
                alt="Büyütülmüş fotoğraf"
                onClick={handleModalImageClick}
                sx={{
                  maxWidth: isImageZoomed ? "none" : "100%",
                  maxHeight: isImageZoomed ? "none" : "85vh",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: "12px",
                  boxShadow: "0 16px 40px rgba(0, 0, 0, 0.5)",
                  transition: "all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)",
                  cursor: isImageZoomed ? "zoom-out" : "zoom-in",
                  transform: isImageZoomed ? "scale(1.8)" : "scale(1)",
                  opacity: isImageLoading ? 0.3 : 1,
                  filter: "brightness(1.05)",
                  "&:hover": {
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
                    filter: "brightness(1.1)",
                  },
                }}
                onLoad={() => setIsImageLoading(false)}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  console.error('Modal image loading error');
                  setIsImageLoading(false);
                  // Try to fix the URL if it's a base64 image
                  const img = e.target as HTMLImageElement;
                  if (img.src && !img.src.startsWith('data:image')) {
                    console.log('Attempting to fix image URL format');
                    const base64Part = img.src.split('base64,')[1];
                    if (base64Part) {
                      img.src = `data:image/jpeg;base64,${base64Part}`;
                    } else {
                      img.src = `data:image/jpeg;base64,${img.src}`;
                    }
                  }
                }}
              />

              {selectedPhotoForModal.location && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 20,
                    left: 20,
                    background: "linear-gradient(135deg, rgba(76, 102, 159, 0.85), rgba(59, 130, 246, 0.85))",
                    color: "white",
                    px: 2.5,
                    py: 1.5,
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    transition: "all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 12px 24px rgba(0,0,0,0.4)",
                      background: "linear-gradient(135deg, rgba(76, 102, 159, 0.9), rgba(59, 130, 246, 0.9))",
                    },
                    zIndex: 10,
                  }}
                >
                  <LocationIcon sx={{ fontSize: 22, mr: 1.5, filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.2))" }} />
                  <Typography variant="body1" sx={{ fontWeight: 600, textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>{selectedPhotoForModal.location}</Typography>
                </Box>
              )}

              {/* Fotoğraf sayısı göstergesi */}
              {photoGallery.length > 1 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 20,
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    color: "white",
                    px: 2.5,
                    py: 0.8,
                    borderRadius: 20,
                    fontSize: 14,
                    fontWeight: 500,
                    zIndex: 10,
                    backdropFilter: "blur(4px)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <ImageIcon sx={{ fontSize: 16 }} />
                  {currentPhotoIndex + 1} / {photoGallery.length}
                </Box>
              )}

              {/* Önceki/Sonraki butonları */}
              {photoGallery.length > 1 && (
                <>
                  {/* Önceki buton */}
                  <IconButton
                    onClick={handlePreviousPhoto}
                    sx={{
                      position: "absolute",
                      left: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      backdropFilter: "blur(4px)",
                      color: "white",
                      width: 48,
                      height: 48,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.25)",
                        transform: "translateY(-50%) scale(1.1)",
                        boxShadow: "0 0 20px rgba(255, 255, 255, 0.2)",
                      },
                      zIndex: 10,
                    }}
                  >
                    <ArrowBackIcon fontSize="medium" />
                  </IconButton>

                  {/* Sonraki buton */}
                  <IconButton
                    onClick={handleNextPhoto}
                    sx={{
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      backdropFilter: "blur(4px)",
                      color: "white",
                      width: 48,
                      height: 48,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.25)",
                        transform: "translateY(-50%) scale(1.1)",
                        boxShadow: "0 0 20px rgba(255, 255, 255, 0.2)",
                      },
                      zIndex: 10,
                    }}
                  >
                    <ArrowForwardIcon fontSize="medium" />
                  </IconButton>
                </>
              )}
            </Box>
          )}
          <IconButton
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                transform: "rotate(90deg)",
                transition: "transform 0.3s ease",
              },
            }}
            onClick={() => {
              setModalOpen(false);
              setIsImageZoomed(false);
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Modal>

      {/* Fotoğraf Konum Bilgisi Dialog */}
      <Dialog
        open={locationDialogOpen}
        onClose={handleLocationCancel}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            width: "100%",
            maxWidth: 400,
            mx: 2,
            background: isDarkMode ? "rgba(17, 24, 39, 0.95)" : "white",
          }
        }}
      >
        <DialogTitle sx={{
          pb: 1,
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        }}>
          <LocationIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" component="div">
            Fotoğraf Konumu
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <DialogContentText sx={{ mb: 2, color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "text.secondary" }}>
            Fotoğrafın çekildiği yeri belirtebilirsiniz (opsiyonel).
          </DialogContentText>
          <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
            <LocationIcon sx={{ mt: 2, mr: 1, color: "primary.main" }} />
            <TextField
              autoFocus
              fullWidth
              label="Konum"
              placeholder="Örn: İstanbul, Kapadokya, Antalya Plajı..."
              value={tempPhotoLocation}
              onChange={(e) => setTempPhotoLocation(e.target.value)}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />
          </Box>
          {tempSelectedFiles.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <span>Seçilen Fotoğraflar ({tempSelectedFiles.length}):</span>
                {tempSelectedFiles.length > 1 && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<CloseIcon />}
                    onClick={() => setTempSelectedFiles([])}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Tümünü Temizle
                  </Button>
                )}
              </Typography>

              <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1.5,
                justifyContent: 'center'
              }}>
                {tempSelectedFiles.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: "relative",
                      borderRadius: 1,
                      overflow: "hidden",
                      width: { xs: "calc(50% - 8px)", sm: "calc(33.33% - 8px)" },
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={URL.createObjectURL(file)}
                      alt={`Seçilen fotoğraf ${index + 1}`}
                      onClick={() => {
                        // Tüm seçilen fotoğrafları galeri olarak hazırla
                        const photoGalleryItems = tempSelectedFiles.map(f => ({
                          url: URL.createObjectURL(f),
                          location: tempPhotoLocation
                        }));
                        // Tıklanan fotoğrafla başlayarak galeriyi göster
                        handlePhotoClick(
                          URL.createObjectURL(file),
                          tempPhotoLocation,
                          photoGalleryItems,
                          index
                        );
                      }}
                      sx={{
                        width: "100%",
                        height: 120,
                        objectFit: "cover",
                        cursor: "pointer",
                        transition: "all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)",
                        filter: "brightness(0.97)",
                        borderRadius: 1,
                        "&:hover": {
                          transform: "scale(1.05) translateY(-2px)",
                          filter: "brightness(1.03)",
                          boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
                        },
                      }}
                    />
                    {/* Fotoğraf silme butonu */}
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        backgroundColor: "rgba(255, 255, 255, 0.85)",
                        backdropFilter: "blur(4px)",
                        width: 28,
                        height: 28,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        transition: "all 0.3s ease",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          color: "#e53935",
                          transform: "rotate(90deg)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation(); // Fotoğrafa tıklama olayını engelle
                        // Bu fotoğrafı tempSelectedFiles dizisinden kaldır
                        setTempSelectedFiles(prev => prev.filter((_, i) => i !== index));
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button
            onClick={handleLocationCancel}
            variant="outlined"
            startIcon={<CloseIcon />}
          >
            İptal
          </Button>
          <Button
            onClick={handleLocationConfirm}
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            sx={{
              background: "linear-gradient(45deg, #2563eb, #7c3aed)",
              "&:hover": {
                background: "linear-gradient(45deg, #1d4ed8, #6d28d9)",
              },
            }}
          >
            Tamam
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
