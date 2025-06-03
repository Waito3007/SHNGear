import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Alert,
  Slider
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { 
  X, 
  Plus, 
  Edit, 
  Delete, 
  TrendingUp, 
  Gift, 
  Percent, 
  Target,
  ShoppingCart,
  Users
} from 'lucide-react';

// Animation keyframes
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled Components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 20,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    minWidth: '90vw',
    minHeight: '90vh',
    animation: `${fadeInUp} 0.3s ease-out`,
  }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
  backgroundSize: '200% 200%',
  animation: `${shimmer} 3s ease-in-out infinite`,
  color: '#ffffff',
  borderRadius: '20px 20px 0 0',
  padding: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontWeight: 'bold',
  fontSize: '1.5rem',
  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
}));

const CampaignCard = styled(Card)(({ theme }) => ({
  borderRadius: 15,
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  border: '2px solid transparent',
  backgroundClip: 'padding-box',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  animation: `${fadeInUp} 0.6s ease-out`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    margin: '-2px',
    borderRadius: 'inherit',
    zIndex: -1,
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
    animation: `${pulse} 0.6s ease-in-out`,
  }
}));

const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: 15,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: '#ffffff',
  transition: 'all 0.3s ease',
  animation: `${fadeInUp} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 30px rgba(102, 126, 234, 0.4)',
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  borderRadius: 25,
  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
  color: '#ffffff',
  padding: '12px 30px',
  fontWeight: 'bold',
  textTransform: 'none',
  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
  }
}));

const StyledChip = styled(Chip)(({ theme, variant }) => ({
  borderRadius: 20,
  fontWeight: 'bold',
  ...(variant === 'active' && {
    background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
    color: '#ffffff',
  }),
  ...(variant === 'inactive' && {
    background: 'linear-gradient(45deg, #f44336 30%, #ef5350 90%)',
    color: '#ffffff',
  }),
  ...(variant === 'draft' && {
    background: 'linear-gradient(45deg, #ff9800 30%, #ffb74d 90%)',
    color: '#ffffff',
  }),
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    height: 4,
    borderRadius: 2,
    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
  },
  '& .MuiTab-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 'bold',
    fontSize: '1rem',
    '&.Mui-selected': {
      color: '#ffffff',
    },
  },
}));

const EmptyState = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(6),
  color: 'rgba(255, 255, 255, 0.8)',
  animation: `${fadeInUp} 0.6s ease-out`,
}));

const TypeIcon = styled(Box)(({ theme, type }) => {
  const getTypeColor = (campaignType) => {
    switch (campaignType) {
      case 'discount':
        return '#4caf50';
      case 'bogo':
        return '#2196f3';
      case 'flash':
        return '#ff5722';
      default:
        return '#9c27b0';
    }
  };

  return {
    width: 48,
    height: 48,
    borderRadius: '50%',
    backgroundColor: getTypeColor(type),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '1.5rem',
    marginBottom: theme.spacing(2),
    boxShadow: `0 6px 20px ${getTypeColor(type)}40`,
  };
});

const FormDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 20,
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    border: '2px solid rgba(102, 126, 234, 0.2)',
    minWidth: 600,
  }
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1),
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  }
}));

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`campaign-tabpanel-${index}`}
      aria-labelledby={`campaign-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function PromotionalCampaignManager({ open, onClose }) {
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: 'Summer Sale 2024',
      type: 'discount',
      status: 'active',
      discount: 20,
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      clicks: 1250,
      conversions: 85,
      revenue: 15400
    },
    {
      id: 2,
      name: 'BOGO Flash Deal',
      type: 'bogo',
      status: 'active',
      discount: 50,
      startDate: '2024-07-15',
      endDate: '2024-07-20',
      clicks: 890,
      conversions: 124,
      revenue: 8900
    }
  ]);

  const [editingCampaign, setEditingCampaign] = useState(null);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'discount',
    discount: 10,
    startDate: '',
    endDate: '',
    status: 'draft'
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCreateCampaign = () => {
    if (newCampaign.name && newCampaign.startDate && newCampaign.endDate) {
      const campaign = {
        ...newCampaign,
        id: Date.now(),
        clicks: 0,
        conversions: 0,
        revenue: 0
      };
      setCampaigns([...campaigns, campaign]);
      setNewCampaign({
        name: '',
        type: 'discount',
        discount: 10,
        startDate: '',
        endDate: '',
        status: 'draft'
      });
      setShowCampaignForm(false);
    }
  };

  const handleEditCampaign = (campaign) => {
    setEditingCampaign({ ...campaign });
    setShowCampaignForm(true);
  };

  const handleUpdateCampaign = () => {
    setCampaigns(campaigns.map(c => 
      c.id === editingCampaign.id ? editingCampaign : c
    ));
    setEditingCampaign(null);
    setShowCampaignForm(false);
  };

  const handleDeleteCampaign = (id) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
  };

  const toggleCampaignStatus = (id) => {
    setCampaigns(campaigns.map(c => 
      c.id === id 
        ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' }
        : c
    ));
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'discount': return <Percent />;
      case 'bogo': return <Gift />;
      case 'flash': return <TrendingUp />;
      default: return <Target />;
    }
  };

  const getCampaignStats = () => {
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
    
    return { totalCampaigns, activeCampaigns, totalClicks, totalRevenue };
  };

  const stats = getCampaignStats();

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth={false} fullWidth>
      <StyledDialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Gift size={32} />
          <span>Promotional Campaign Manager</span>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#ffffff' }}>
          <X size={24} />
        </IconButton>
      </StyledDialogTitle>

      <DialogContent sx={{ p: 0, background: 'transparent' }}>
        <StyledTabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
          <Tab label="Campaigns" />
          <Tab label="Statistics" />
          <Tab label="Settings" />
        </StyledTabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
              Campaign Management
            </Typography>
            <GradientButton
              startIcon={<Plus />}
              onClick={() => setShowCampaignForm(true)}
            >
              Create Campaign
            </GradientButton>
          </Box>

          <Grid container spacing={3}>
            {campaigns.map((campaign) => (
              <Grid item xs={12} md={6} lg={4} key={campaign.id}>
                <CampaignCard>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <TypeIcon type={campaign.type}>
                        {getTypeIcon(campaign.type)}
                      </TypeIcon>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <ActionButton onClick={() => handleEditCampaign(campaign)}>
                          <Edit size={16} />
                        </ActionButton>
                        <ActionButton onClick={() => handleDeleteCampaign(campaign.id)}>
                          <Delete size={16} />
                        </ActionButton>
                      </Box>
                    </Box>
                    
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#1a1a1a' }}>
                      {campaign.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <StyledChip 
                        label={campaign.status} 
                        variant={campaign.status}
                        size="small"
                      />
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {campaign.discount}% off
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                      {campaign.startDate} - {campaign.endDate}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#666' }}>Clicks</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
                          {campaign.clicks.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#666' }}>Revenue</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                          ${campaign.revenue.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={campaign.status === 'active'}
                          onChange={() => toggleCampaignStatus(campaign.id)}
                          color="primary"
                        />
                      }
                      label={campaign.status === 'active' ? 'Active' : 'Inactive'}
                      sx={{ '& .MuiFormControlLabel-label': { color: '#666' } }}
                    />
                  </CardContent>
                </CampaignCard>
              </Grid>
            ))}
          </Grid>

          {campaigns.length === 0 && (
            <EmptyState>
              <Gift size={64} style={{ opacity: 0.5, marginBottom: 16 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                No campaigns yet
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Create your first promotional campaign to start driving sales
              </Typography>
              <GradientButton
                startIcon={<Plus />}
                onClick={() => setShowCampaignForm(true)}
              >
                Create First Campaign
              </GradientButton>
            </EmptyState>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 'bold', mb: 3 }}>
            Campaign Statistics
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <StatsCard>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <ShoppingCart size={48} style={{ marginBottom: 16 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {stats.totalCampaigns}
                  </Typography>
                  <Typography variant="body2">Total Campaigns</Typography>
                </CardContent>
              </StatsCard>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <StatsCard>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <TrendingUp size={48} style={{ marginBottom: 16 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {stats.activeCampaigns}
                  </Typography>
                  <Typography variant="body2">Active Campaigns</Typography>
                </CardContent>
              </StatsCard>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <StatsCard>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Users size={48} style={{ marginBottom: 16 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {stats.totalClicks.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">Total Clicks</Typography>
                </CardContent>
              </StatsCard>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <StatsCard>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Target size={48} style={{ marginBottom: 16 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    ${stats.totalRevenue.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">Total Revenue</Typography>
                </CardContent>
              </StatsCard>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 'bold', mb: 3 }}>
            Campaign Settings
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Campaign settings and preferences will be available in the next update.
          </Alert>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', p: 3 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 3 }}>
          Close
        </Button>
      </DialogActions>

      {/* Campaign Form Dialog */}
      <FormDialog 
        open={showCampaignForm} 
        onClose={() => {
          setShowCampaignForm(false);
          setEditingCampaign(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
          color: '#ffffff',
          fontWeight: 'bold'
        }}>
          {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Campaign Name"
                value={editingCampaign ? editingCampaign.name : newCampaign.name}
                onChange={(e) => {
                  if (editingCampaign) {
                    setEditingCampaign({ ...editingCampaign, name: e.target.value });
                  } else {
                    setNewCampaign({ ...newCampaign, name: e.target.value });
                  }
                }}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Campaign Type</InputLabel>
                <Select
                  value={editingCampaign ? editingCampaign.type : newCampaign.type}
                  onChange={(e) => {
                    if (editingCampaign) {
                      setEditingCampaign({ ...editingCampaign, type: e.target.value });
                    } else {
                      setNewCampaign({ ...newCampaign, type: e.target.value });
                    }
                  }}
                  label="Campaign Type"
                >
                  <MenuItem value="discount">Discount</MenuItem>
                  <MenuItem value="bogo">Buy One Get One</MenuItem>
                  <MenuItem value="flash">Flash Sale</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box>
                <Typography gutterBottom>
                  Discount Percentage: {editingCampaign ? editingCampaign.discount : newCampaign.discount}%
                </Typography>
                <Slider
                  value={editingCampaign ? editingCampaign.discount : newCampaign.discount}
                  onChange={(e, value) => {
                    if (editingCampaign) {
                      setEditingCampaign({ ...editingCampaign, discount: value });
                    } else {
                      setNewCampaign({ ...newCampaign, discount: value });
                    }
                  }}
                  min={1}
                  max={90}
                  step={1}
                  marks={[
                    { value: 10, label: '10%' },
                    { value: 50, label: '50%' },
                    { value: 90, label: '90%' }
                  ]}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={editingCampaign ? editingCampaign.startDate : newCampaign.startDate}
                onChange={(e) => {
                  if (editingCampaign) {
                    setEditingCampaign({ ...editingCampaign, startDate: e.target.value });
                  } else {
                    setNewCampaign({ ...newCampaign, startDate: e.target.value });
                  }
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={editingCampaign ? editingCampaign.endDate : newCampaign.endDate}
                onChange={(e) => {
                  if (editingCampaign) {
                    setEditingCampaign({ ...editingCampaign, endDate: e.target.value });
                  } else {
                    setNewCampaign({ ...newCampaign, endDate: e.target.value });
                  }
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => {
              setShowCampaignForm(false);
              setEditingCampaign(null);
            }}
            variant="outlined"
            sx={{ borderRadius: 3 }}
          >
            Cancel
          </Button>
          <GradientButton
            onClick={editingCampaign ? handleUpdateCampaign : handleCreateCampaign}
            startIcon={editingCampaign ? <Edit /> : <Plus />}
          >
            {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
          </GradientButton>
        </DialogActions>
      </FormDialog>
    </StyledDialog>
  );
}

export default PromotionalCampaignManager;
