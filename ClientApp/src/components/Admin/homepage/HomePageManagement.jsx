import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, Eye, Settings, Image, 
  Layers, CheckSquare, Home, Star, 
  BookOpen, Mail, Target, Grid3X3, Monitor, Tablet, Smartphone, Package
} from 'lucide-react';
import { 
  Card, Tabs, Tab, Button, Fab, CircularProgress
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import Header from '../common/Header';
import homePageService from '../../../services/homePageService';

// Import components directly
import ImageUploadManager from './ImageUploadManager';
import ProductSelector from './ProductSelector';
import CategorySelector from './CategorySelector';
import ContentPreview from './ContentPreview';
import PromotionalCampaignManager from './PromotionalCampaignManager';
import DragDropManager from './DragDropManager';
import BulkOperationsManager from './BulkOperationsManager';

// Enhanced animations
const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 5px rgba(102, 126, 234, 0.2);
  }
  50% {
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.4), 0 0 30px rgba(102, 126, 234, 0.3);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

// Enhanced Styled Components
const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: '1px solid rgba(0,0,0,0.06)',
  '& .MuiTabs-indicator': {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    height: 4,
    borderRadius: '4px 4px 0 0',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
  },
  '& .MuiTabs-scrollButtons': {
    color: '#667eea',
    '&:hover': {
      backgroundColor: 'rgba(102, 126, 234, 0.08)',
    }
  }
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 140,
  fontWeight: 500,
  fontSize: '0.9rem',
  color: '#64748b',
  padding: '16px 20px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  '&.Mui-selected': {
    color: '#667eea',
    fontWeight: 600,
    '& .tab-icon': {
      animation: `${pulse} 2s infinite`,
    }
  },
  '&:hover': {
    color: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    transform: 'translateY(-2px)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.5), transparent)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover::before': {
    opacity: 1,
  }
}));

const ModernCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  borderRadius: 20,
  boxShadow: '0 4px 25px rgba(0,0,0,0.08), 0 0 0 1px rgba(102, 126, 234, 0.05)',
  border: 'none',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px) scale(1.01)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(102, 126, 234, 0.1)',
    '&::before': {
      opacity: 1,
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
    transition: 'left 0.6s ease',
    opacity: 0,
  },
  '&:hover::before': {
    left: '100%',
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: 30,
  color: 'white',
  padding: '12px 32px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'left 0.6s ease',
  },
  '&:hover::before': {
    left: '100%',
  }
}));

const FloatingFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 32,
  right: 32,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  width: 64,
  height: 64,
  animation: `${glow} 3s ease-in-out infinite`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
    transform: 'scale(1.1) rotate(5deg)',
    animation: 'none',
    boxShadow: '0 8px 30px rgba(102, 126, 234, 0.5)',
  },
}));

const EnhancedInput = styled('input')(({ theme }) => ({
  width: '100%',
  padding: '16px 20px',
  border: '2px solid #e2e8f0',
  borderRadius: '12px',
  fontSize: '0.95rem',
  fontWeight: '500',
  color: '#334155',
  backgroundColor: '#ffffff',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:focus': {
    outline: 'none',
    borderColor: '#667eea',
    backgroundColor: '#f8fafc',
    boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.1)',
    transform: 'translateY(-1px)',
  },
  '&:hover': {
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  '&::placeholder': {
    color: '#94a3b8',
    fontWeight: '400',
  }
}));

const HomePageManagement = () => {  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [previewMode, setPreviewMode] = useState('desktop');

  // Advanced management states
  const [showImageManager, setShowImageManager] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showContentPreview, setShowContentPreview] = useState(false);
  const [showCampaignManager, setShowCampaignManager] = useState(false);
  const [showDragDropManager, setShowDragDropManager] = useState(false);
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const [currentImageSection, setCurrentImageSection] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [bulkOperationType] = useState('products');

  // Enhanced tab configuration with better visual hierarchy
  const tabs = [
    { 
      id: 'hero', 
      label: 'Hero Section', 
      icon: Home, 
      color: '#667eea',
      darkColor: '#5a67d8',
      rgb: '102, 126, 234',
      description: 'Banner chính và slides',
      status: 'active'
    },
    { 
      id: 'categories', 
      label: 'Danh mục', 
      icon: Grid3X3, 
      color: '#38B2AC',
      darkColor: '#319795',
      rgb: '56, 178, 172',
      description: 'Danh mục nổi bật',
      status: 'active'
    },
    { 
      id: 'banners', 
      label: 'Banner KM', 
      icon: Image, 
      color: '#F56565',
      darkColor: '#E53E3E',
      rgb: '245, 101, 101',
      description: 'Banner khuyến mãi',
      status: 'coming-soon'
    },
    { 
      id: 'products', 
      label: 'Sản phẩm', 
      icon: Package, 
      color: '#ED8936',
      darkColor: '#DD6B20',
      rgb: '237, 137, 54',
      description: 'Sản phẩm nổi bật',
      status: 'active'
    },
    { 
      id: 'testimonials', 
      label: 'Đánh giá', 
      icon: Star, 
      color: '#D69E2E',
      darkColor: '#B7791F',
      rgb: '214, 158, 46',
      description: 'Phản hồi khách hàng',
      status: 'coming-soon'
    },
    { 
      id: 'brandstory', 
      label: 'Thương hiệu', 
      icon: BookOpen,
      color: '#9F7AEA',
      darkColor: '#805AD5',
      rgb: '159, 122, 234',
      description: 'Câu chuyện thương hiệu',
      status: 'coming-soon'
    },
    { 
      id: 'newsletter', 
      label: 'Newsletter', 
      icon: Mail, 
      color: '#48BB78',
      darkColor: '#38A169',
      rgb: '72, 187, 120',
      description: 'Đăng ký nhận tin',
      status: 'coming-soon'
    },
    { 
      id: 'campaigns', 
      label: 'Campaign', 
      icon: Target, 
      color: '#E53E3E',
      darkColor: '#C53030',
      rgb: '229, 62, 62',
      description: 'Chiến dịch marketing',
      status: 'coming-soon'
    },
    { 
      id: 'advanced', 
      label: 'Nâng cao', 
      icon: Settings, 
      color: '#718096',
      darkColor: '#4A5568',
      rgb: '113, 128, 150',
      description: 'Tính năng nâng cao',
      status: 'active'
    },
    { 
      id: 'preview', 
      label: 'Xem trước', 
      icon: Eye, 
      color: '#319795',
      darkColor: '#2C7A7B',
      rgb: '49, 151, 149',
      description: 'Preview homepage',
      status: 'active'
    }  ];

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await homePageService.getHomePageSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Không thể tải cài đặt trang chủ' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSettings = (path, value) => {
    setSettings(prev => {
      if (!prev) return prev;
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const handleInputChange = (path) => {
    return (e) => {
      const value = e.target.value;
      updateSettings(path, value);
    };
  };
  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      if (settings.id) {
        await homePageService.updateHomePageSettings(settings.id, settings);
      } else {
        await homePageService.createHomePageSettings(settings);
      }
      setMessage({ type: 'success', text: '✨ Cập nhật thành công!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi lưu cài đặt' });
    } finally {
      setSaving(false);
    }
  };

  const openImageManager = (section) => {
    setCurrentImageSection(section);
    setSelectedImages(settings?.[`${section}Images`] || []);
    setShowImageManager(true);
  };

  const openProductSelector = () => {
    setSelectedProducts(settings?.featuredProducts || []);
    setShowProductSelector(true);
  };

  const openCategorySelector = () => {
    setSelectedCategories(settings?.featuredCategoryIds || []);
    setShowCategorySelector(true);
  };

  const handleImageSelect = (images) => {
    updateSettings(`${currentImageSection}Images`, images);
    setSelectedImages(images);
    setShowImageManager(false);
  };

  const handleProductSelect = (products) => {
    updateSettings('featuredProducts', products);
    setSelectedProducts(products);
    setShowProductSelector(false);
  };

  const handleCategorySelect = (categories) => {
    updateSettings('featuredCategoryIds', categories);
    setSelectedCategories(categories);
    setShowCategorySelector(false);
  };

  const renderHeroSection = () => (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <ModernCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
            <Home size={24} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Cài đặt Hero Section</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề chính
            </label>
            <EnhancedInput
              type="text"
              value={settings?.heroTitle || ''}
              onChange={handleInputChange('heroTitle')}
              placeholder="Nhập tiêu đề chính..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả phụ
            </label>
            <EnhancedInput
              type="text"
              value={settings?.heroSubtitle || ''}
              onChange={handleInputChange('heroSubtitle')}
              placeholder="Nhập mô tả phụ..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh Hero
            </label>
            <button
              onClick={() => openImageManager('hero')}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
            >
              <Image size={24} className="mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600">Chọn hình ảnh cho Hero Section</p>
            </button>
          </div>
        </div>
      </ModernCard>
    </motion.div>
  );

  const renderCategoriesSection = () => (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <ModernCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl">
            <Grid3X3 size={24} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Danh mục nổi bật</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề section
            </label>
            <EnhancedInput
              type="text"
              value={settings?.categoriesSectionTitle || ''}
              onChange={handleInputChange('categoriesSectionTitle')}
              placeholder="Nhập tiêu đề danh mục..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={openCategorySelector}
              className="p-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Grid3X3 size={16} className="inline mr-2" />
              Chọn danh mục nổi bật
            </button>

            <button
              onClick={() => openImageManager('categories')}
              className="p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Image size={16} className="inline mr-2" />
              Quản lý hình ảnh
            </button>
          </div>
        </div>
      </ModernCard>
    </motion.div>
  );

  const renderBannersSection = () => (
    <ModernCard className="p-6">
      <h3 className="text-xl font-bold mb-4">Banner Khuyến Mãi</h3>
      <p>Quản lý banner khuyến mãi sẽ được triển khai...</p>
    </ModernCard>
  );

  const renderProductsSection = () => (
    <ModernCard className="p-6">
      <h3 className="text-xl font-bold mb-4">Sản phẩm nổi bật</h3>
      <button
        onClick={openProductSelector}
        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
      >
        <Package size={16} className="inline mr-2" />
        Chọn sản phẩm
      </button>
    </ModernCard>
  );

  const renderTestimonialsSection = () => (
    <ModernCard className="p-6">
      <h3 className="text-xl font-bold mb-4">Đánh giá khách hàng</h3>
      <p>Quản lý testimonials sẽ được triển khai...</p>
    </ModernCard>
  );

  const renderBrandStorySection = () => (
    <ModernCard className="p-6">
      <h3 className="text-xl font-bold mb-4">Câu chuyện thương hiệu</h3>
      <p>Quản lý brand story sẽ được triển khai...</p>
    </ModernCard>
  );

  const renderNewsletterSection = () => (
    <ModernCard className="p-6">
      <h3 className="text-xl font-bold mb-4">Newsletter</h3>
      <p>Quản lý newsletter sẽ được triển khai...</p>
    </ModernCard>
  );

  const renderCampaignsSection = () => (
    <ModernCard className="p-6">
      <h3 className="text-xl font-bold mb-4">Chiến dịch Marketing</h3>
      <p>Quản lý campaigns sẽ được triển khai...</p>
    </ModernCard>
  );

  const renderAdvancedSection = () => (
    <ModernCard className="p-6">
      <h3 className="text-xl font-bold mb-4">Tính năng nâng cao</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setShowDragDropManager(true)}
          className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Layers size={24} className="mx-auto mb-2" />
          <p className="text-sm font-medium">Drag & Drop</p>
        </button>
        <button
          onClick={() => setShowBulkOperations(true)}
          className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <CheckSquare size={24} className="mx-auto mb-2" />
          <p className="text-sm font-medium">Bulk Operations</p>
        </button>
        <button
          onClick={() => setShowCampaignManager(true)}
          className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Target size={24} className="mx-auto mb-2" />
          <p className="text-sm font-medium">Campaign Manager</p>
        </button>
      </div>
    </ModernCard>
  );

  const renderPreviewSection = () => (
    <ModernCard className="p-6">
      <h3 className="text-xl font-bold mb-4">Preview Homepage</h3>
      
      <div className="flex gap-2 mb-4">
        <div className="flex bg-gray-200 rounded-lg p-1">
          <button
            onClick={() => setPreviewMode('desktop')}
            className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            <Monitor size={20} />
          </button>
          <button
            onClick={() => setPreviewMode('tablet')}
            className={`p-2 rounded ${previewMode === 'tablet' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            <Tablet size={20} />
          </button>
          <button
            onClick={() => setPreviewMode('mobile')}
            className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            <Smartphone size={20} />
          </button>
        </div>
      </div>
      
      <div className="border-2 border-gray-200 rounded-lg p-4 min-h-[400px] bg-gray-50">
        <p className="text-gray-600 text-center py-20">
          Preview sẽ hiển thị ở đây với chế độ {previewMode}
        </p>
      </div>
    </ModernCard>
  );

  const renderTabContent = () => {
    if (!settings) return null;

    switch (activeTab) {
      case 'hero':
        return renderHeroSection();
      case 'categories':
        return renderCategoriesSection();
      case 'banners':
        return renderBannersSection();
      case 'products':
        return renderProductsSection();
      case 'testimonials':
        return renderTestimonialsSection();
      case 'brandstory':
        return renderBrandStorySection();
      case 'newsletter':
        return renderNewsletterSection();
      case 'campaigns':
        return renderCampaignsSection();
      case 'advanced':
        return renderAdvancedSection();
      case 'preview':
        return renderPreviewSection();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircularProgress size={60} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Quản lý Trang chủ" />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Homepage</h1>
            <p className="text-gray-600 mt-2">Tùy chỉnh giao diện và nội dung trang chủ</p>
          </div>
          
          <GradientButton
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save size={20} />}
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </GradientButton>
        </div>

        {/* Message Alert */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 mb-6 rounded-lg font-medium ${
                message.type === 'error' 
                  ? 'bg-red-50 text-red-800 border-b border-red-200' 
                  : 'bg-green-50 text-green-800 border-b border-green-200'
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <StyledTabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <StyledTab
                    key={tab.id}
                    value={tab.id}
                    label={
                      <div className="flex items-center gap-2">
                        <IconComponent size={18} style={{ color: tab.color }} />
                        <span>{tab.label}</span>
                      </div>
                    }
                  />
                );
              })}
            </StyledTabs>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <div key={activeTab}>
                {renderTabContent()}
              </div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Floating Preview Button */}
        <FloatingFab
          onClick={() => setShowContentPreview(true)}
          aria-label="preview"
        >
          <Eye size={24} />
        </FloatingFab>
      </main>

      {/* Modals */}
      <ImageUploadManager
        open={showImageManager}
        onClose={() => setShowImageManager(false)}
        onImageSelect={handleImageSelect}
        allowMultiple={true}
        selectedImages={selectedImages}
        title={`Quản lý hình ảnh - ${currentImageSection}`}
      />

      <ProductSelector
        open={showProductSelector}
        onClose={() => setShowProductSelector(false)}
        onProductSelect={handleProductSelect}
        allowMultiple={true}
        selectedProducts={selectedProducts}
        title="Chọn sản phẩm nổi bật"
      />

      <CategorySelector
        open={showCategorySelector}
        onClose={() => setShowCategorySelector(false)}
        onCategorySelect={handleCategorySelect}
        allowMultiple={true}
        selectedCategories={selectedCategories}
        title="Chọn danh mục nổi bật"
      />

      <ContentPreview
        open={showContentPreview}
        onClose={() => setShowContentPreview(false)}
        settings={settings}
        previewMode={previewMode}
      />

      <PromotionalCampaignManager
        open={showCampaignManager}
        onClose={() => setShowCampaignManager(false)}
        settings={settings}
        onSettingsUpdate={updateSettings}
      />

      <DragDropManager
        open={showDragDropManager}
        onClose={() => setShowDragDropManager(false)}
        settings={settings}
        onSettingsUpdate={updateSettings}
      />

      <BulkOperationsManager
        open={showBulkOperations}
        onClose={() => setShowBulkOperations(false)}
        items={[]}
        operationType={bulkOperationType}
        onBulkOperation={() => {}}
      />
    </div>
  );
};

export default HomePageManagement;
