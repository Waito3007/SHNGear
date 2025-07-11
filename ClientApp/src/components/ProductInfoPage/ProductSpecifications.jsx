import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Collapse,
  CircularProgress,
  Alert,
  Button,
  Divider,
} from '@mui/material';
import {
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
} from 'lucide-react';

const SpecificationDisplay = ({ productId }) => {
  const [specs, setSpecs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(true);
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  useEffect(() => {
    const fetchSpecifications = async () => {
      try {
        setLoading(true);
        setError(null);


        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/Specifications/by-product/${productId}`
        );

        if (!response.ok) {
          throw new Error('Không tìm thấy thông số kỹ thuật');
        }

        const data = await response.json();
        setSpecs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId ) {
      fetchSpecifications();
    }
  }, [productId]);



  // Render specs from API array
  const renderSpecs = () => {
    if (!Array.isArray(specs)) return null;
    // Sort by displayOrder
    const sortedSpecs = [...specs].sort((a, b) => a.displayOrder - b.displayOrder);
    const basicSpecs = sortedSpecs.slice(0, 4);
    const displaySpecs = showAllSpecs ? sortedSpecs : basicSpecs;

    return (
      <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
        {displaySpecs.map((spec, index) => (
          <ListItem
            key={spec.id || index}
            sx={{
              py: 1.5,
              px: { xs: 1, sm: 2 },
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderRadius: 2,
              transition: 'background 0.2s',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            {/* Icon for spec (example: use Maximize2 for demo, can customize per spec type) */}
            <Box sx={{ minWidth: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Maximize2 size={20} color="#1976d2" />
            </Box>
            <ListItemText
              primary={
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  {spec.name}
                </Typography>
              }
              secondary={
                spec.value ? (
                  <Typography variant="body1" fontWeight="medium" color="text.primary">
                    {spec.value}{spec.unit ? ` ${spec.unit}` : ''}
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" color="warning.main" fontWeight="medium">
                      Đang cập nhật
                    </Typography>
                    {/* Tooltip for updating */}
                    <Box component="span" sx={{ cursor: 'pointer' }} title="Thông số này sẽ được cập nhật sớm.">
                      <Minimize2 size={16} color="#ffa726" />
                    </Box>
                  </Box>
                )
              }
            />
          </ListItem>
        ))}
        {sortedSpecs.length > basicSpecs.length && (
          <ListItem sx={{ justifyContent: 'center', pt: 2, bgcolor: 'transparent' }}>
            <Button
              variant="outlined"
              onClick={() => setShowAllSpecs(!showAllSpecs)}
              endIcon={showAllSpecs ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
                bgcolor: 'white',
                boxShadow: 1,
                textTransform: 'none',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              {showAllSpecs ? 'Thu gọn' : 'Xem thêm thông số'}
            </Button>
          </ListItem>
        )}
      </List>
    );
  };


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 4, py: 4 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 4 }}>
        {error}
      </Alert>
    );
  }

  if (!specs) {
    return null;
  }

  return (
    <Box
      sx={{
        bgcolor: 'white',
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: 2,
        maxWidth: 600,
        mx: 'auto',
        my: { xs: 2, sm: 4 },
        p: 0,
      }}
    >
      <Button
        onClick={() => setExpanded(!expanded)}
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: { xs: 1.5, sm: 2 },
          textTransform: 'none',
          bgcolor: 'white',
          borderBottom: '1px solid #eee',
          borderRadius: 0,
          fontWeight: 700,
          fontSize: { xs: 16, sm: 20 },
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" fontWeight="bold" color="text.primary">
            Thông số kỹ thuật
          </Typography>
        </Box>
        {expanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
      </Button>
      <Collapse in={expanded}>
        <Divider />
        <Box sx={{ p: { xs: 1, sm: 2 } }}>
          {renderSpecs()}
        </Box>
      </Collapse>
    </Box>
  );
};

export default SpecificationDisplay;