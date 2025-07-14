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
      <List sx={{ width: '100%', bgcolor: 'transparent', p: 0 }}>
        {displaySpecs.map((spec, index) => (
          <ListItem
            key={spec.id || index}
            sx={{
              py: 2,
              px: { xs: 2, sm: 3 },
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              borderRadius: 2,
              mb: 1,
              transition: 'all 0.3s ease',
              border: '1px solid #e0e0e0',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              '&:hover': { 
                bgcolor: '#f0f0f0',
                borderColor: '#000000',
                transform: 'translateX(4px)',
              },
            }}
          >
            {/* Tech Icon */}
            <Box 
              sx={{ 
                minWidth: 40, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: '#000000',
                color: '#ffffff',
                border: '2px solid #333333',
              }}
            >
              <Maximize2 size={20} />
            </Box>
            <ListItemText
              primary={
                <Typography 
                  variant="body1" 
                  color="#666666" 
                  fontWeight={700}
                  sx={{
                    fontFamily: "'Roboto Mono', monospace",
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontSize: '0.875rem',
                  }}
                >
                  {spec.name}
                </Typography>
              }
              secondary={
                spec.value ? (
                  <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    color="#000000"
                    sx={{
                      fontFamily: "'Roboto Mono', monospace",
                      letterSpacing: '0.5px',
                      mt: 0.5,
                    }}
                  >
                    {spec.value}{spec.unit ? ` ${spec.unit}` : ''}
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Typography 
                      variant="body1" 
                      color="#999999" 
                      fontWeight="medium"
                      sx={{
                        fontFamily: "'Roboto Mono', monospace",
                        fontStyle: 'italic',
                      }}
                    >
                      Updating...
                    </Typography>
                    <Box component="span" sx={{ cursor: 'pointer' }} title="This specification will be updated soon.">
                      <Minimize2 size={16} color="#999999" />
                    </Box>
                  </Box>
                )
              }
            />
          </ListItem>
        ))}
        {sortedSpecs.length > basicSpecs.length && (
          <ListItem sx={{ justifyContent: 'center', pt: 3, bgcolor: 'transparent' }}>
            <Button
              variant="outlined"
              onClick={() => setShowAllSpecs(!showAllSpecs)}
              endIcon={showAllSpecs ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 700,
                bgcolor: '#ffffff',
                borderColor: '#000000',
                color: '#000000',
                borderWidth: 2,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontFamily: "'Roboto Mono', monospace",
                '&:hover': { 
                  bgcolor: '#f0f0f0',
                  borderColor: '#000000',
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {showAllSpecs ? 'Show Less' : 'Show More Specs'}
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
        bgcolor: '#ffffff',
        borderRadius: 2,
        overflow: 'hidden',
        border: '2px solid #000000',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        maxWidth: 700,
        mx: 'auto',
        my: { xs: 2, sm: 4 },
        p: 0,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #000000 0%, #333333 50%, #000000 100%)',
          zIndex: 1,
        },
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.12)',
        },
        transition: 'all 0.3s ease',
      }}
    >
      <Button
        onClick={() => setExpanded(!expanded)}
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: { xs: 2, sm: 3 },
          textTransform: 'none',
          bgcolor: '#ffffff',
          borderBottom: '2px solid #000000',
          borderRadius: 0,
          fontWeight: 700,
          fontSize: { xs: 18, sm: 22 },
          color: '#000000',
          fontFamily: "'Roboto Mono', monospace",
          letterSpacing: '1px',
          '&:hover': {
            bgcolor: '#f8f9fa',
          },
          transition: 'all 0.3s ease',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 6,
              height: 30,
              bgcolor: '#000000',
              borderRadius: 1,
            }}
          />
          <Typography 
            variant="h6" 
            fontWeight="bold" 
            color="#000000"
            sx={{
              fontFamily: "'Roboto Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            # Technical Specifications
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 1,
            bgcolor: '#000000',
            color: '#ffffff',
            transition: 'all 0.3s ease',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          {expanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </Box>
      </Button>
      <Collapse in={expanded}>
        <Divider sx={{ borderColor: '#000000', borderWidth: '1px' }} />
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {renderSpecs()}
        </Box>
      </Collapse>
    </Box>
  );
};

export default SpecificationDisplay;