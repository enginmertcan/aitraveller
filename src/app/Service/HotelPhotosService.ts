/**
 * HotelPhotosService.ts
 * 
 * This service handles fetching and displaying hotel photos.
 * It provides methods to fetch hotel photos from external APIs and display them in the UI.
 */

// API key for Google Places API
const GOOGLE_PLACES_API_KEY = "AIzaSyCuywyLDcnyRENGnIHnit-ym2rhQBnXMJw";

// Maximum number of photos to fetch (no fixed limit)
const MAX_PHOTOS = 50;

/**
 * Hotel Photos Service
 * Provides methods to fetch and display hotel photos
 */
const HotelPhotosService = {
  /**
   * Fetches hotel photos from Google Places API
   * @param hotelName - The name of the hotel
   * @param city - The city where the hotel is located
   * @returns Promise<string[]> - Array of photo URLs
   */
  async fetchHotelPhotos(hotelName: string, city: string): Promise<string[]> {
    try {
      console.log(`Fetching hotel photos for: ${hotelName} in ${city}`);
      
      // Step 1: Find the hotel using Places API Text Search
      const searchQuery = `${hotelName} hotel ${city}`;
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        searchQuery
      )}&key=${GOOGLE_PLACES_API_KEY}`;
      
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (!searchData.results || searchData.results.length === 0) {
        console.warn(`No results found for hotel: ${hotelName}`);
        return [];
      }
      
      // Get the first result (most relevant)
      const placeId = searchData.results[0].place_id;
      
      // Step 2: Get place details including photos
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${GOOGLE_PLACES_API_KEY}`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();
      
      if (!detailsData.result || !detailsData.result.photos || detailsData.result.photos.length === 0) {
        console.warn(`No photos found for hotel: ${hotelName}`);
        return [];
      }
      
      // Get all available photos (up to MAX_PHOTOS)
      const photoReferences = detailsData.result.photos
        .slice(0, MAX_PHOTOS)
        .map((photo: any) => photo.photo_reference);
      
      // Step 3: Get photo URLs for each reference
      const photoUrls = photoReferences.map(
        (reference: string) =>
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${reference}&key=${GOOGLE_PLACES_API_KEY}`
      );
      
      console.log(`Found ${photoUrls.length} photos for hotel: ${hotelName}`);
      return photoUrls;
    } catch (error) {
      console.error("Error fetching hotel photos:", error);
      return [];
    }
  },
  
  /**
   * Displays hotel photos in a container element
   * @param hotelName - The name of the hotel
   * @param city - The city where the hotel is located
   * @param containerId - The ID of the container element
   * @param isDarkMode - Whether dark mode is enabled
   */
  async displayHotelPhotos(
    hotelName: string,
    city: string,
    containerId: string,
    isDarkMode: boolean = false
  ): Promise<void> {
    try {
      const container = document.getElementById(containerId);
      if (!container) {
        console.error(`Container element not found: ${containerId}`);
        return;
      }
      
      // Clear container
      container.innerHTML = "";
      
      // Add loading indicator
      const loadingElement = document.createElement("div");
      loadingElement.className = "hotel-photos-loading";
      loadingElement.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 200px;">
          <div style="
            border: 4px solid ${isDarkMode ? "#1f2937" : "#f3f4f6"}; 
            border-top: 4px solid ${isDarkMode ? "#93c5fd" : "#2563eb"}; 
            border-radius: 50%; 
            width: 40px; 
            height: 40px; 
            animation: spin 1s linear infinite;"
          ></div>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;
      container.appendChild(loadingElement);
      
      // Fetch hotel photos
      const photoUrls = await this.fetchHotelPhotos(hotelName, city);
      
      // Remove loading indicator
      container.innerHTML = "";
      
      if (photoUrls.length === 0) {
        // Display no photos message
        const noPhotosElement = document.createElement("div");
        noPhotosElement.className = "hotel-photos-empty";
        noPhotosElement.innerHTML = `
          <div style="
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 200px; 
            color: ${isDarkMode ? "#9ca3af" : "#6b7280"}; 
            text-align: center;
            font-style: italic;
          ">
            No photos available for this hotel
          </div>
        `;
        container.appendChild(noPhotosElement);
        return;
      }
      
      // Create photo gallery container
      const galleryElement = document.createElement("div");
      galleryElement.className = "hotel-photos-gallery";
      galleryElement.style.display = "flex";
      galleryElement.style.flexWrap = "wrap";
      galleryElement.style.gap = "8px";
      
      // Add photos to gallery
      photoUrls.forEach((url, index) => {
        const photoElement = document.createElement("div");
        photoElement.className = "hotel-photo-item";
        photoElement.style.position = "relative";
        photoElement.style.width = "calc(33.333% - 6px)";
        photoElement.style.aspectRatio = "1";
        photoElement.style.overflow = "hidden";
        photoElement.style.borderRadius = "8px";
        photoElement.style.cursor = "pointer";
        
        const imgElement = document.createElement("img");
        imgElement.src = url;
        imgElement.alt = `${hotelName} - Photo ${index + 1}`;
        imgElement.style.width = "100%";
        imgElement.style.height = "100%";
        imgElement.style.objectFit = "cover";
        imgElement.style.transition = "transform 0.3s ease";
        
        photoElement.appendChild(imgElement);
        
        // Add hover effect
        photoElement.addEventListener("mouseenter", () => {
          imgElement.style.transform = "scale(1.05)";
        });
        
        photoElement.addEventListener("mouseleave", () => {
          imgElement.style.transform = "scale(1)";
        });
        
        // Add click handler to open full-size image
        photoElement.addEventListener("click", () => {
          this.openFullSizeImage(url, hotelName, index, photoUrls, isDarkMode);
        });
        
        galleryElement.appendChild(photoElement);
      });
      
      container.appendChild(galleryElement);
    } catch (error) {
      console.error("Error displaying hotel photos:", error);
    }
  },
  
  /**
   * Opens a full-size image in a modal
   * @param url - The URL of the image
   * @param hotelName - The name of the hotel
   * @param index - The index of the image in the gallery
   * @param allPhotos - Array of all photo URLs
   * @param isDarkMode - Whether dark mode is enabled
   */
  openFullSizeImage(
    url: string,
    hotelName: string,
    index: number,
    allPhotos: string[],
    isDarkMode: boolean = false
  ): void {
    // Create modal container
    const modalContainer = document.createElement("div");
    modalContainer.className = "hotel-photo-modal";
    modalContainer.style.position = "fixed";
    modalContainer.style.top = "0";
    modalContainer.style.left = "0";
    modalContainer.style.width = "100%";
    modalContainer.style.height = "100%";
    modalContainer.style.backgroundColor = isDarkMode ? "rgba(0, 0, 0, 0.9)" : "rgba(0, 0, 0, 0.8)";
    modalContainer.style.display = "flex";
    modalContainer.style.flexDirection = "column";
    modalContainer.style.justifyContent = "center";
    modalContainer.style.alignItems = "center";
    modalContainer.style.zIndex = "9999";
    
    // Create image container
    const imageContainer = document.createElement("div");
    imageContainer.style.position = "relative";
    imageContainer.style.maxWidth = "90%";
    imageContainer.style.maxHeight = "80%";
    imageContainer.style.display = "flex";
    imageContainer.style.justifyContent = "center";
    imageContainer.style.alignItems = "center";
    
    // Create image element
    const imgElement = document.createElement("img");
    imgElement.src = url;
    imgElement.alt = `${hotelName} - Photo ${index + 1}`;
    imgElement.style.maxWidth = "100%";
    imgElement.style.maxHeight = "80vh";
    imgElement.style.objectFit = "contain";
    imgElement.style.borderRadius = "4px";
    imgElement.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.3)";
    
    imageContainer.appendChild(imgElement);
    
    // Create close button
    const closeButton = document.createElement("button");
    closeButton.innerHTML = "×";
    closeButton.style.position = "absolute";
    closeButton.style.top = "20px";
    closeButton.style.right = "20px";
    closeButton.style.width = "40px";
    closeButton.style.height = "40px";
    closeButton.style.borderRadius = "50%";
    closeButton.style.backgroundColor = isDarkMode ? "rgba(31, 41, 55, 0.8)" : "rgba(255, 255, 255, 0.8)";
    closeButton.style.color = isDarkMode ? "#ffffff" : "#000000";
    closeButton.style.fontSize = "24px";
    closeButton.style.border = "none";
    closeButton.style.cursor = "pointer";
    closeButton.style.display = "flex";
    closeButton.style.justifyContent = "center";
    closeButton.style.alignItems = "center";
    
    // Add navigation buttons if there are multiple photos
    if (allPhotos.length > 1) {
      // Create counter
      const counter = document.createElement("div");
      counter.textContent = `${index + 1} / ${allPhotos.length}`;
      counter.style.position = "absolute";
      counter.style.bottom = "20px";
      counter.style.left = "50%";
      counter.style.transform = "translateX(-50%)";
      counter.style.backgroundColor = isDarkMode ? "rgba(31, 41, 55, 0.8)" : "rgba(255, 255, 255, 0.8)";
      counter.style.color = isDarkMode ? "#ffffff" : "#000000";
      counter.style.padding = "8px 16px";
      counter.style.borderRadius = "20px";
      counter.style.fontSize = "14px";
      
      modalContainer.appendChild(counter);
      
      // Create previous button
      const prevButton = document.createElement("button");
      prevButton.innerHTML = "❮";
      prevButton.style.position = "absolute";
      prevButton.style.top = "50%";
      prevButton.style.left = "20px";
      prevButton.style.transform = "translateY(-50%)";
      prevButton.style.width = "40px";
      prevButton.style.height = "40px";
      prevButton.style.borderRadius = "50%";
      prevButton.style.backgroundColor = isDarkMode ? "rgba(31, 41, 55, 0.8)" : "rgba(255, 255, 255, 0.8)";
      prevButton.style.color = isDarkMode ? "#ffffff" : "#000000";
      prevButton.style.fontSize = "18px";
      prevButton.style.border = "none";
      prevButton.style.cursor = "pointer";
      prevButton.style.display = "flex";
      prevButton.style.justifyContent = "center";
      prevButton.style.alignItems = "center";
      
      prevButton.addEventListener("click", (e) => {
        e.stopPropagation();
        const newIndex = (index - 1 + allPhotos.length) % allPhotos.length;
        modalContainer.remove();
        this.openFullSizeImage(allPhotos[newIndex], hotelName, newIndex, allPhotos, isDarkMode);
      });
      
      // Create next button
      const nextButton = document.createElement("button");
      nextButton.innerHTML = "❯";
      nextButton.style.position = "absolute";
      nextButton.style.top = "50%";
      nextButton.style.right = "20px";
      nextButton.style.transform = "translateY(-50%)";
      nextButton.style.width = "40px";
      nextButton.style.height = "40px";
      nextButton.style.borderRadius = "50%";
      nextButton.style.backgroundColor = isDarkMode ? "rgba(31, 41, 55, 0.8)" : "rgba(255, 255, 255, 0.8)";
      nextButton.style.color = isDarkMode ? "#ffffff" : "#000000";
      nextButton.style.fontSize = "18px";
      nextButton.style.border = "none";
      nextButton.style.cursor = "pointer";
      nextButton.style.display = "flex";
      nextButton.style.justifyContent = "center";
      nextButton.style.alignItems = "center";
      
      nextButton.addEventListener("click", (e) => {
        e.stopPropagation();
        const newIndex = (index + 1) % allPhotos.length;
        modalContainer.remove();
        this.openFullSizeImage(allPhotos[newIndex], hotelName, newIndex, allPhotos, isDarkMode);
      });
      
      modalContainer.appendChild(prevButton);
      modalContainer.appendChild(nextButton);
    }
    
    // Close modal when clicking outside the image
    modalContainer.addEventListener("click", () => {
      modalContainer.remove();
    });
    
    // Prevent closing when clicking on the image
    imageContainer.addEventListener("click", (e) => {
      e.stopPropagation();
    });
    
    // Close modal when clicking the close button
    closeButton.addEventListener("click", () => {
      modalContainer.remove();
    });
    
    modalContainer.appendChild(imageContainer);
    modalContainer.appendChild(closeButton);
    
    // Add modal to body
    document.body.appendChild(modalContainer);
  }
};

export default HotelPhotosService;
