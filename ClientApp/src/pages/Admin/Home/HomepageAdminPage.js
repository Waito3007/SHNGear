import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import Header from "@/components/Admin/common/Header";

// Import management components
import BannersTable from "@/components/Admin/home/BannersTable";
import SlidersTable from "@/components/Admin/home/SlidersTable";
import PinnedProductKanban from "@/components/Admin/home/PinnedProductKanban";

  import {
  Box,
  Button,
  Switch,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  IconButton,
  Collapse,
  Tabs,
  Tab,
} from '@mui/material';

import {
  DragHandle as DragHandleIcon,
  Visibility as EyeIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

// Import preview components
import HeroBanner from '@/components/HeroBanner/HeroBanner';
import FeaturedCategories from '@/components/FeaturedCategories/FeaturedCategories';
import BestSellerSection from '@/components/BestSellers/BestSellers';
import FlashSale from '@/components/FlashSale/FlashSale';
import Commitment from '@/components/Commitment/Commitment';
import BannerSlider from '@/components/Homepage//HomeBanner';
import HeroSlider from '@/components/HeroSlider/HeroSlider';
import PinnedProducts from '@/components/PinnedProducts/PinnedProducts';

// Custom component for section editing (will be refactored in next step)
const SectionEditor = ({ sectionName, sectionData, onContentChange }) => {
  const [formData, setFormData] = useState(sectionData);

  useEffect(() => {
    setFormData(sectionData);
  }, [sectionData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    onContentChange(sectionName, name, newValue);
  };

  const renderFormItems = () => {
    const inputProps = {
      style: { color: '#e2e8f0' },
      sx: { '& fieldset': { borderColor: '#4a5568' }, '&:hover fieldset': { borderColor: '#63b3ed' }, '&.Mui-focused fieldset': { borderColor: '#63b3ed' } }
    };
    const inputLabelProps = { style: { color: '#a0aec0' } };

    switch (sectionName) {
      case 'hero':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Headline" name="headline" value={formData.headline || ''} onChange={handleInputChange} fullWidth InputProps={inputProps} InputLabelProps={inputLabelProps} />
            <TextField label="Slogan" name="slogan" value={formData.slogan || ''} onChange={handleInputChange} fullWidth InputProps={inputProps} InputLabelProps={inputLabelProps} />
            <TextField label="CTA Text" name="cta_text" value={formData.cta_text || ''} onChange={handleInputChange} fullWidth InputProps={inputProps} InputLabelProps={inputLabelProps} />
            <TextField label="CTA Link" name="cta_link" value={formData.cta_link || ''} onChange={handleInputChange} fullWidth InputProps={inputProps} InputLabelProps={inputLabelProps} />
          </Box>
        );
      case 'hero_slider':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Title" name="title" value={formData.title || ''} onChange={handleInputChange} fullWidth InputProps={inputProps} InputLabelProps={inputLabelProps} />
            <TextField label="Description" name="description" value={formData.description || ''} onChange={handleInputChange} fullWidth InputProps={inputProps} InputLabelProps={inputLabelProps} />
          </Box>
        );
      case 'categories':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Title" name="title" value={formData.title || ''} onChange={handleInputChange} fullWidth InputProps={inputProps} InputLabelProps={inputLabelProps} />
            <TextField label="Description" name="description" value={formData.description || ''} onChange={handleInputChange} fullWidth InputProps={inputProps} InputLabelProps={inputLabelProps} />
          </Box>
        );
      case 'best_seller':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Title" name="title" value={formData.title || ''} onChange={handleInputChange} fullWidth InputProps={inputProps} InputLabelProps={inputLabelProps} />
            <TextField label="Description" name="description" value={formData.description || ''} onChange={handleInputChange} fullWidth InputProps={inputProps} InputLabelProps={inputLabelProps} />
          </Box>
        );
      case 'home_banner':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Title" name="title" value={formData.title || ''} onChange={handleInputChange} fullWidth InputProps={inputProps} InputLabelProps={inputLabelProps} />
            <TextField label="Description" name="description" value={formData.description || ''} onChange={handleInputChange} fullWidth InputProps={inputProps} InputLabelProps={inputLabelProps} />
          </Box>
        );
      case 'pinned_products':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Title" name="title" value={formData.title || ''} onChange={handleInputChange} fullWidth InputProps={inputProps} InputLabelProps={inputLabelProps} />
            <TextField label="Description" name="description" value={formData.description || ''} onChange={handleInputChange} fullWidth InputProps={inputProps} InputLabelProps={inputLabelProps} />
          </Box>
        );

      case 'special_offer':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Headline" name="headline" value={formData.headline || ''} onChange={handleInputChange} fullWidth InputProps={inputProps} InputLabelProps={inputLabelProps} />
            <TextField label="Sub Text" name="sub_text" value={formData.sub_text || ''} onChange={handleInputChange} fullWidth InputProps={inputProps} InputLabelProps={inputLabelProps} />
            <TextField label="CTA Text" name="cta_text" value={formData.cta_text || ''} onChange={handleInputChange} fullWidth InputProps={inputProps} InputLabelProps={inputLabelProps} />
            <TextField label="CTA Link" name="cta_link" value={formData.cta_link || ''} onChange={handleInputChange} fullWidth InputProps={inputProps} InputLabelProps={inputLabelProps} />
            <TextField label="Image URL" name="image_url" value={formData.image_url || ''} onChange={handleInputChange} fullWidth InputProps={inputProps} InputLabelProps={inputLabelProps} />
          </Box>
        );
      case 'brand_trust':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, color: '#e2e8f0' }}>Commitments</Typography>
            <List>
              {formData.commitments?.map((commitment, index) => (
                <ListItem key={index} secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => {
                    const newCommitments = formData.commitments.filter((_, i) => i !== index);
                    onContentChange(sectionName, 'commitments', newCommitments);
                  }} sx={{ color: '#e2e8f0' }}>
                    <DeleteIcon />
                  </IconButton>
                }>
                  <TextField
                    label="Commitment Title"
                    value={commitment.title || ''}
                    onChange={(e) => {
                      const newCommitments = [...formData.commitments];
                      newCommitments[index].title = e.target.value;
                      onContentChange(sectionName, 'commitments', newCommitments);
                    }}
                    fullWidth
                    InputProps={inputProps}
                    InputLabelProps={inputLabelProps}
                  />
                </ListItem>
              ))}
            </List>
            <Button startIcon={<AddIcon />} onClick={() => {
              const newCommitments = [...(formData.commitments || []), { title: '' }];
              onContentChange(sectionName, 'commitments', newCommitments);
            }} sx={{ color: '#63b3ed', borderColor: '#63b3ed' }}>Add Commitment</Button>
          </Box>
        );
      default:
        return <Typography variant="body2" color="text.secondary">No editor available for this section.</Typography>;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {renderFormItems()}
    </Box>
  );
};

// TabPanel component để hiển thị nội dung của từng tab
const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`homepage-tabpanel-${index}`}
      aria-labelledby={`homepage-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const HomepageAdminPage = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewSection, setPreviewSection] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/homepage-config`);
        setConfig(response.data);
      } catch (err) {
        setError('Failed to load homepage configuration.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Function to initialize default layout if not exists
  const initializeDefaultLayout = useCallback(() => {
    const defaultLayout = [
      'hero',
      'hero_slider', 
      'home_banner',
      'categories',
      'best_seller',
      'pinned_products',
      'special_offer',
      'brand_trust'
    ];
    
    if (!config?.layout || config.layout.length === 0) {
      setConfig(prevConfig => ({
        ...prevConfig,
        layout: defaultLayout
      }));
    }
  }, [config]);

  // Initialize default layout when config is loaded
  useEffect(() => {
    if (config) {
      initializeDefaultLayout();
    }
  }, [config, initializeDefaultLayout]);

  const handleSave = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/homepage-config`, config);
      setSnackbarMessage('Homepage configuration saved successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage('Failed to save homepage configuration.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      console.error(err);
    }
  };

  const handleToggleSection = (sectionName) => {
    const currentStatus = config.components[sectionName]?.enabled;
    setConfig(prevConfig => ({
      ...prevConfig,
      components: {
        ...prevConfig.components,
        [sectionName]: {
          ...prevConfig.components[sectionName],
          enabled: !prevConfig.components[sectionName].enabled,
        },
      },
    }));
    
    // Show status message
    const newStatus = !currentStatus;
    const statusText = newStatus ? 'Đã bật' : 'Đã tắt';
    setSnackbarMessage(`${statusText} phần "${sectionName.replace(/_/g, ' ')}"!`);
    setSnackbarSeverity(newStatus ? 'success' : 'warning');
    setSnackbarOpen(true);
  };

  const handleContentChange = (sectionName, field, value) => {
    setConfig(prevConfig => {
      const newConfig = { ...prevConfig };
      if (field) {
        newConfig.components[sectionName] = {
          ...newConfig.components[sectionName],
          [field]: value
        };
      } else {
        // This case is for when a whole object is passed (e.g., from BestSellerManager)
        newConfig.components[sectionName] = { ...newConfig.components[sectionName], ...value };
      }
      return newConfig;
    });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    // Prevent moving if same position
    if (result.destination.index === result.source.index) return;
    
    const newLayout = Array.from(config.layout);
    const [removed] = newLayout.splice(result.source.index, 1);
    newLayout.splice(result.destination.index, 0, removed);
    
    setConfig(prevConfig => ({
      ...prevConfig,
      layout: newLayout
    }));
    
    // Show success message
    setSnackbarMessage(`Đã di chuyển "${removed.replace(/_/g, ' ')}" thành công!`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handlePreview = (sectionName) => {
    setPreviewSection(sectionName);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewSection(null);
  };

  const resetToDefaultLayout = () => {
    const defaultLayout = [
      'hero',
      'hero_slider', 
      'home_banner',
      'categories',
      'best_seller',
      'pinned_products',
      'special_offer',
      'brand_trust'
    ];
    
    setConfig(prevConfig => ({
      ...prevConfig,
      layout: defaultLayout
    }));

    // Show success message
    setSnackbarMessage('Đã khôi phục layout về thứ tự mặc định!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#1a202c' }}>
        <CircularProgress size={60} sx={{ color: '#63b3ed' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2, bgcolor: '#2d3748', color: '#e2e8f0', '& .MuiAlert-icon': { color: '#f56565' } }}>
        {error}
      </Alert>
    );
  }

  if (!config) {
    return (
      <Alert severity="warning" sx={{ m: 2, bgcolor: '#2d3748', color: '#e2e8f0', '& .MuiAlert-icon': { color: '#ecc94b' } }}>
        No configuration found.
      </Alert>
    );
  }

  const componentMap = {
    hero: HeroBanner,
    hero_slider: HeroSlider,
    home_banner: BannerSlider,
    categories: FeaturedCategories,
    best_seller: BestSellerSection,
    pinned_products: PinnedProducts,
    special_offer: FlashSale,
    brand_trust: Commitment,
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#1a202c', minHeight: '100vh', color: '#e2e8f0' }}>
      <Header title="Quản lý Trang chủ" />

      <Box component="main" sx={{ maxWidth: '7xl', mx: 'auto', py: 6, px: { xs: 2, lg: 8 } }}>
        <motion.div
          className="flex justify-between items-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: '#e2e8f0' }}>
            Cấu hình Trang chủ
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={resetToDefaultLayout}
              sx={{ color: '#63b3ed', borderColor: '#63b3ed' }}
            >
              Reset Layout
            </Button>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
              Lưu cấu hình
            </Button>
          </Box>
        </motion.div>

        {/* Tabs Navigation */}
        <Card elevation={0} sx={{ borderRadius: 2, bgcolor: '#2d3748', mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: '#4a5568' }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              textColor="inherit"
              indicatorColor="primary"
              sx={{
                '& .MuiTab-root': {
                  color: '#a0aec0',
                  '&.Mui-selected': {
                    color: '#63b3ed',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#63b3ed',
                },
              }}
            >
              <Tab label="Cấu hình Layout" />
              <Tab label="Quản lý Banner" />
              <Tab label="Quản lý Slider" />
              <Tab label="Sản phẩm nổi bật" />
            </Tabs>
          </Box>
        </Card>

        {/* Tab Content */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card elevation={0} sx={{ borderRadius: 2, bgcolor: '#2d3748', color: '#e2e8f0' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Thứ tự & Hiển thị Bố cục</Typography>
                      <Button 
                        size="small"
                        variant="outlined"
                        onClick={resetToDefaultLayout}
                        sx={{ color: '#63b3ed', borderColor: '#63b3ed', fontSize: '0.75rem' }}
                      >
                        Khôi phục mặc định
                      </Button>
                    </Box>
                    
                    <Alert severity="info" sx={{ mb: 2, bgcolor: '#2a4365', color: '#bee3f8', '& .MuiAlert-icon': { color: '#63b3ed' } }}>
                      Kéo thả để sắp xếp thứ tự các phần trên trang chủ. Bật/tắt hiển thị bằng switch.
                    </Alert>

                    {/* Layout Statistics */}
                    <Box sx={{ mb: 2, p: 2, bgcolor: '#1a202c', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ color: '#a0aec0', mb: 1 }}>
                        Thống kê layout:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ width: 8, height: 8, bgcolor: '#48bb78', borderRadius: '50%' }}></Box>
                          <Typography variant="caption" sx={{ color: '#e2e8f0' }}>
                            Đã bật: {Object.values(config.components).filter(comp => comp.enabled).length}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ width: 8, height: 8, bgcolor: '#f56565', borderRadius: '50%' }}></Box>
                          <Typography variant="caption" sx={{ color: '#e2e8f0' }}>
                            Đã tắt: {Object.values(config.components).filter(comp => !comp.enabled).length}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ width: 8, height: 8, bgcolor: '#ecc94b', borderRadius: '50%' }}></Box>
                          <Typography variant="caption" sx={{ color: '#e2e8f0' }}>
                            Tổng: {config.layout.length}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="layout-order">
                        {(provided) => (
                          <List {...provided.droppableProps} ref={provided.innerRef}>
                            {config.layout.map((sectionName, index) => {
                              const isEnabled = config.components[sectionName]?.enabled || false;
                              const sectionTitle = sectionName.replace(/_/g, ' ');
                              
                              // Define section types
                              const alwaysShownSections = ['hero', 'hero_slider', 'special_offer', 'brand_trust'];
                              const isAlwaysShown = alwaysShownSections.includes(sectionName);
                              
                              return (
                                <Draggable key={sectionName} draggableId={sectionName} index={index}>
                                  {(provided, snapshot) => (
                                    <ListItem
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      sx={{
                                        mb: 1,
                                        bgcolor: snapshot.isDragging ? '#63b3ed' : (isEnabled ? '#4a5568' : '#2d3748'),
                                        borderRadius: 1,
                                        boxShadow: snapshot.isDragging ? 3 : 1,
                                        border: snapshot.isDragging ? '2px solid #63b3ed' : `1px solid ${isEnabled ? '#48bb78' : '#f56565'}`,
                                        transition: 'all 0.2s',
                                        opacity: snapshot.isDragging ? 0.8 : 1,
                                      }}
                                      secondaryAction={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          {isAlwaysShown && (
                                            <Typography variant="caption" sx={{ 
                                              color: '#ecc94b', 
                                              bgcolor: '#2d3748', 
                                              px: 1, 
                                              py: 0.5, 
                                              borderRadius: 1,
                                              fontSize: '0.7rem'
                                            }}>
                                              Luôn hiển thị
                                            </Typography>
                                          )}
                                          <Switch
                                            edge="end"
                                            checked={isEnabled}
                                            onChange={() => handleToggleSection(sectionName)}
                                            size="small"
                                            disabled={isAlwaysShown}
                                            sx={{
                                              '& .MuiSwitch-thumb': {
                                                bgcolor: isEnabled ? '#48bb78' : '#f56565'
                                              }
                                            }}
                                          />
                                        </Box>
                                      }
                                    >
                                      <ListItemIcon sx={{ minWidth: 30 }}>
                                        <DragHandleIcon sx={{ color: '#e2e8f0' }} />
                                      </ListItemIcon>
                                      <Box sx={{ flex: 1 }}>
                                        <Typography 
                                          variant="body2" 
                                          sx={{ 
                                            textTransform: 'capitalize', 
                                            color: '#e2e8f0',
                                            fontWeight: isEnabled ? 'bold' : 'normal'
                                          }}
                                        >
                                          {index + 1}. {sectionTitle}
                                        </Typography>
                                        <Typography 
                                          variant="caption" 
                                          sx={{ 
                                            color: isEnabled ? '#48bb78' : '#f56565',
                                            fontSize: '0.7rem'
                                          }}
                                        >
                                          {isEnabled ? 'Đang hiển thị' : 'Đã ẩn'} • {isAlwaysShown ? 'Cố định' : 'Có thể tùy chỉnh'}
                                        </Typography>
                                      </Box>
                                    </ListItem>
                                  )}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}
                          </List>
                        )}
                      </Droppable>
                    </DragDropContext>

                    {/* Layout Guide */}
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#1a202c', borderRadius: 1, border: '1px solid #4a5568' }}>
                      <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 'bold', mb: 1 }}>
                        📋 Hướng dẫn Layout:
                      </Typography>
                      <Box component="ul" sx={{ margin: 0, pl: 2, color: '#a0aec0', fontSize: '0.8rem' }}>
                        <li>🟡 <strong>Luôn hiển thị:</strong> Hero, Hero Slider, Flash Sale, Commitment</li>
                        <li>🔵 <strong>Có thể tùy chỉnh:</strong> Home Banner, Categories, Best Seller, Pinned Products</li>
                        <li>🟢 <strong>Đang hiển thị:</strong> Phần này sẽ xuất hiện trên trang chủ</li>
                        <li>🔴 <strong>Đã ẩn:</strong> Phần này sẽ bị ẩn khỏi trang chủ</li>
                        <li>↕️ <strong>Kéo thả:</strong> Thay đổi thứ tự hiển thị trên trang chủ</li>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} lg={8}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card elevation={0} sx={{ borderRadius: 2, bgcolor: '#2d3748', color: '#e2e8f0' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Nội dung Phần</Typography>
                    <Box>
                      {Object.entries(config.components).map(([sectionName, sectionData]) => (
                        <Collapse key={sectionName} in={true} timeout="auto" unmountOnExit>
                          <Card variant="outlined" sx={{ mb: 2, borderRadius: 1, borderColor: '#4a5568', bgcolor: '#1a202c' }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textTransform: 'capitalize', color: '#e2e8f0' }}>
                                  {sectionName.replace(/_/g, ' ')}
                                </Typography>
                                <Box>
                                  <Button
                                    size="small"
                                    startIcon={<EyeIcon />}
                                    onClick={() => handlePreview(sectionName)}
                                    sx={{ mr: 1, color: '#63b3ed' }}
                                  >
                                    Xem trước
                                  </Button>
                                  <Switch
                                    checked={sectionData?.enabled || false}
                                    onChange={() => handleToggleSection(sectionName)}
                                    size="small"
                                  />
                                </Box>
                              </Box>
                              <SectionEditor
                                sectionName={sectionName}
                                sectionData={sectionData}
                                onContentChange={handleContentChange}
                              />
                            </CardContent>
                          </Card>
                        </Collapse>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Card elevation={0} sx={{ borderRadius: 2, bgcolor: '#2d3748', color: '#e2e8f0' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>Quản lý Banner</Typography>
              <BannersTable />
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Card elevation={0} sx={{ borderRadius: 2, bgcolor: '#2d3748', color: '#e2e8f0' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>Quản lý Slider</Typography>
              <SlidersTable />
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Card elevation={0} sx={{ borderRadius: 2, bgcolor: '#2d3748', color: '#e2e8f0' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>Sản phẩm nổi bật</Typography>
              <PinnedProductKanban />
            </CardContent>
          </Card>
        </TabPanel>

      

        <Dialog open={isPreviewOpen} onClose={closePreview} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: '#2d3748', color: '#e2e8f0' } }}>
          <DialogTitle sx={{ bgcolor: '#1a202c', color: '#e2e8f0' }}>Xem trước: {previewSection?.replace(/_/g, ' ')}</DialogTitle>
          <DialogContent dividers sx={{ borderColor: '#4a5568' }}>
            {previewSection && componentMap[previewSection] ? (
              React.createElement(componentMap[previewSection], { data: config.components[previewSection] })
            ) : (
              <Typography variant="body1" color="text.secondary">Không có bản xem trước cho phần này.</Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ bgcolor: '#1a202c' }}>
            <Button onClick={closePreview} sx={{ color: '#63b3ed' }}>Đóng</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%', bgcolor: '#2d3748', color: '#e2e8f0', '& .MuiAlert-icon': { color: snackbarSeverity === 'success' ? '#48bb78' : '#f56565' } }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default HomepageAdminPage;
