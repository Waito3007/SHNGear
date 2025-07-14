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
        background: "linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)",
        borderRadius: 3,
        padding: 2,
        border: "1px solid #e0e0e0",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
        "&:hover .image-controls": {
          opacity: 1,
        },
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
        },
        transition: "all 0.3s ease",
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Main Image Slider */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "#ffffff",
          position: "relative",
          border: "2px solid #000000",
          background: "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
            zIndex: 1,
            pointerEvents: "none",
          },
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
              {" "}
              <Box
                sx={{
                  position: "relative",
                  paddingTop: "100%",
                  cursor: "zoom-in",
                  bgcolor: "#ffffff",
                  border: "1px solid #000000",
                  borderRadius: 1,
                  overflow: "hidden",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "radial-gradient(circle at center, transparent 60%, rgba(0,0,0,0.02) 100%)",
                    zIndex: 1,
                  },
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
                      padding: 3,
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      filter: "contrast(1.1) brightness(1.02)",
                      "&:hover": {
                        transform: "scale(1.03)",
                        filter: "contrast(1.15) brightness(1.05)",
                      },
                      zIndex: 2,
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
                color: "#d32f2f", // Added color
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
                color: "#d32f2f", // Added color
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
                color: "#d32f2f", // Added color
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
                    borderColor: "#d32f2f", // Added hover border
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
