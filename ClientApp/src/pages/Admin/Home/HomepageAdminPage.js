import React, { useState, useEffect } from 'react';
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
  ListItemText,
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
// import BestSellerSection from '@/components/BestSellers/BestSellers';
import FlashSale from '@/components/FlashSale/FlashSale';
import Commitment from '@/components/Commitment/Commitment';
import BannerSlider from '@/components/Homepage/BannerSlider';
// import BestSellerManager from '@/components/BestSellerManager/BestSellerManager';

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
      // case 'featured_products':
      // case 'best_seller':
      //   return <BestSellerManager sectionData={sectionData} onContentChange={onContentChange} />;

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
    const newLayout = Array.from(config.layout);
    const [removed] = newLayout.splice(result.source.index, 1);
    newLayout.splice(result.destination.index, 0, removed);
    setConfig(prevConfig => ({
      ...prevConfig,
      layout: newLayout
    }));
  };

  const handlePreview = (sectionName) => {
    setPreviewSection(sectionName);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewSection(null);
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
    categories: FeaturedCategories,
    special_offer: FlashSale,
    brand_trust: Commitment,
    banner_slider: BannerSlider,
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
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
            Lưu cấu hình
          </Button>
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
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Thứ tự & Hiển thị Bố cục</Typography>
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="layout-order">
                        {(provided) => (
                          <List {...provided.droppableProps} ref={provided.innerRef}>
                            {config.layout.map((sectionName, index) => (
                              <Draggable key={sectionName} draggableId={sectionName} index={index}>
                                {(provided, snapshot) => (
                                  <ListItem
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    sx={{
                                      mb: 1,
                                      bgcolor: '#4a5568',
                                      borderRadius: 1,
                                      boxShadow: 1,
                                      border: snapshot.isDragging ? '1px solid #63b3ed' : '1px solid transparent',
                                      transition: 'border 0.2s',
                                    }}
                                    secondaryAction={
                                      <Switch
                                        edge="end"
                                        checked={config.components[sectionName]?.enabled || false}
                                        onChange={() => handleToggleSection(sectionName)}
                                        size="small"
                                      />
                                    }
                                  >
                                    <ListItemIcon sx={{ minWidth: 30 }}>
                                      <DragHandleIcon sx={{ color: '#e2e8f0' }} />
                                    </ListItemIcon>
                                    <ListItemText primary={sectionName.replace(/_/g, ' ')} sx={{ textTransform: 'capitalize', color: '#e2e8f0' }} />
                                  </ListItem>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </List>
                        )}
                      </Droppable>
                    </DragDropContext>
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
