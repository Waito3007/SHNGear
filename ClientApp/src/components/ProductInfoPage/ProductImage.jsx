import React, { useState } from "react";
import {
  Box,
  IconButton,
  Dialog,
  Fade,
  Typography,
  Paper,
} from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, Zoom, EffectFade } from "swiper/modules";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/zoom";
import "swiper/css/effect-fade";

const ProductImage = ({ images, name }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);

  const handleFullscreen = () => setIsFullscreen(true);
  const closeFullscreen = () => setIsFullscreen(false);

  return (
    <Box
      sx={{
        position: "relative",
        "&:hover .image-controls": {
          opacity: 1,
        },
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Main Image Slider */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "white",
          position: "relative",
        }}
      >
        <Swiper
          modules={[Navigation, Thumbs, Zoom, EffectFade]}
          effect="fade"
          navigation={{
            prevEl: ".swiper-button-prev",
            nextEl: ".swiper-button-next",
          }}
          thumbs={{ swiper: thumbsSwiper }}
          zoom={true}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="product-main-slider"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <Box
                sx={{
                  position: "relative",
                  paddingTop: "100%",
                  cursor: "zoom-in",
                  bgcolor: "#f8f8f8",
                }}
              >
                <Fade in timeout={500}>
                  <Box
                    component="img"
                    src={
                      image?.imageUrl?.startsWith("http")
                        ? image.imageUrl
                        : `${process.env.REACT_APP_API_BASE_URL}/${image.imageUrl}`
                    }
                    alt={`${name} - Hình ${index + 1}`}
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      padding: 2,
                      transition: "transform 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/400?text=No+Image";
                    }}
                    onClick={handleFullscreen}
                  />
                </Fade>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Image Controls */}
        <Fade in={showControls}>
          <Box
            className="image-controls"
            sx={{ opacity: 0, transition: "opacity 0.3s ease" }}
          >
            <IconButton
              className="swiper-button-prev"
              sx={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 2,
                bgcolor: "rgba(255,255,255,0.9)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,1)",
                  transform: "translateY(-50%) scale(1.1)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              className="swiper-button-next"
              sx={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 2,
                bgcolor: "rgba(255,255,255,0.9)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,1)",
                  transform: "translateY(-50%) scale(1.1)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <ChevronRight />
            </IconButton>
            <IconButton
              onClick={handleFullscreen}
              sx={{
                position: "absolute",
                right: 16,
                top: 16,
                zIndex: 2,
                bgcolor: "rgba(255,255,255,0.9)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,1)",
                  transform: "scale(1.1)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <Maximize2 size={20} />
            </IconButton>
          </Box>
        </Fade>

        {/* Image Counter */}
        <Box
          sx={{
            position: "absolute",
            bottom: 16,
            right: 16,
            zIndex: 2,
            bgcolor: "rgba(0,0,0,0.6)",
            color: "white",
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            fontSize: "0.875rem",
          }}
        >
          {activeIndex + 1}/{images.length}
        </Box>
      </Paper>

      {/* Thumbnail Slider */}
      <Box sx={{ mt: 2 }}>
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={8}
          slidesPerView={4.5}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[Navigation, Thumbs]}
          className="product-thumb-slider"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <Paper
                elevation={0}
                sx={{
                  position: "relative",
                  paddingTop: "100%",
                  borderRadius: 2,
                  overflow: "hidden",
                  border:
                    activeIndex === index
                      ? "2px solid #d32f2f"
                      : "2px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Box
                  component="img"
                  src={
                    image?.imageUrl?.startsWith("http")
                      ? image.imageUrl
                      : `${process.env.REACT_APP_API_BASE_URL}/${image.imageUrl}`
                  }
                  alt={`${name} - Thumbnail ${index + 1}`}
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    p: 1,
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/100?text=No+Image";
                  }}
                />
              </Paper>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      {/* Fullscreen Dialog */}
      <Dialog
        fullScreen
        open={isFullscreen}
        onClose={closeFullscreen}
        TransitionComponent={Fade}
        sx={{
          "& .MuiDialog-paper": {
            bgcolor: "rgba(0,0,0,0.95)",
          },
        }}
      >
        <Box sx={{ position: "relative", height: "100%" }}>
          <IconButton
            onClick={closeFullscreen}
            sx={{
              position: "absolute",
              right: 24,
              top: 24,
              zIndex: 2,
              color: "white",
              bgcolor: "rgba(255,255,255,0.1)",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.2)",
              },
            }}
          >
            <X />
          </IconButton>

          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: 4,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255,255,255,0.7)",
                mb: 2,
                textAlign: "center",
              }}
            >
              {name}
            </Typography>
            <Swiper
              modules={[Navigation, Zoom]}
              navigation
              zoom={{
                maxRatio: 3,
                minRatio: 1,
              }}
              initialSlide={activeIndex}
              className="fullscreen-slider"
            >
              {images.map((image, index) => (
                <SwiperSlide key={index}>
                  <Box
                    className="swiper-zoom-container"
                    sx={{
                      height: "80vh",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      component="img"
                      src={
                        image?.imageUrl?.startsWith("http")
                          ? image.imageUrl
                          : `${process.env.REACT_APP_API_BASE_URL}/${image.imageUrl}`
                      }
                      alt={`${name} - Fullscreen ${index + 1}`}
                      sx={{
                        maxHeight: "90vh",
                        maxWidth: "90vw",
                        objectFit: "contain",
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/800?text=No+Image";
                      }}
                    />
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.5)",
                mt: 2,
              }}
            >
              Cuộn để phóng to • Click để xem chi tiết
            </Typography>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default ProductImage;
