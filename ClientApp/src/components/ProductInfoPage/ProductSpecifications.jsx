import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  CircularProgress,
  Alert,
  Button,
  Divider,
} from '@mui/material';
import {
  Smartphone,
  Laptop,
  Headphones,
  Monitor,
  Cpu,
  MemoryStick,
  Battery,
  Nfc,
  Weight,
  HardDrive,
  Camera,
  Wifi,
  Plug,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Tablet,
  Image,
  Speaker,
  Mic,
  Bluetooth,
  Usb,
  Globe,
  Clock,
  Zap,
  Ruler,
  Palette,
  Fingerprint,
  Thermometer,
  Cloud,
  Shield,
  HeadphonesIcon,
  Volume2,
  BatteryCharging,
  Cable,
  Mic2,
  Music,
  Headset,
  UsbIcon,
  BluetoothIcon,
  WeightIcon,
  RulerIcon,
  BatteryFull,
  CpuIcon,
  MemoryStickIcon,
  HardDriveIcon,
  MonitorIcon,
  CameraIcon,
  WifiIcon,
  PlugIcon,
  GlobeIcon,
  ClockIcon,
  ZapIcon,
  PaletteIcon,
  FingerprintIcon,
  ThermometerIcon,
  CloudIcon,
  ShieldIcon,
  SpeakerIcon,
  MicIcon,
  BluetoothConnectedIcon,
} from 'lucide-react';

const SpecificationDisplay = ({ productType, productId }) => {
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

        let endpoint;
        switch (productType) {
          case 'phone':
            endpoint = 'PhoneSpecifications';
            break;
          case 'laptop':
            endpoint = 'LaptopSpecifications';
            break;
          case 'headphone':
            endpoint = 'HeadphoneSpecifications';
            break;
          default:
            throw new Error('Loại sản phẩm không hợp lệ');
        }

        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/Specifications/${endpoint}/product/${productId}`
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

    if (productId && productType) {
      fetchSpecifications();
    }
  }, [productId, productType]);

  const renderPhoneSpecs = () => {
    const allSpecs = [
      { icon: CpuIcon, label: "Bộ xử lý", value: `${specs.cpuModel} (${specs.cpuCores} nhân)` },
      { icon: MemoryStickIcon, label: "RAM", value: `${specs.ram}GB` },
      { icon: HardDriveIcon, label: "Bộ nhớ trong", value: `${specs.internalStorage}` },
      { icon: MonitorIcon, label: "Màn hình", value: `${specs.screenSize}" ${specs.screenType}` },
      { icon: CameraIcon, label: "Camera sau", value: specs.rearCamera },
      { icon: CameraIcon, label: "Camera trước", value: specs.frontCamera },
      { icon: BatteryFull, label: "Pin", value: `${specs.batteryCapacity} mAh` },
      { icon: PlugIcon, label: "Sạc nhanh", value: specs.fastChargingSupport ? 'Có' : 'Không' },
      { icon: WifiIcon, label: "Kết nối", value: specs.connectivity },
      { icon: BluetoothConnectedIcon, label: "Bluetooth", value: specs.bluetoothVersion },
      { icon: Usb, label: "Cổng sạc", value: specs.chargingPort },
      { icon: FingerprintIcon, label: "Bảo mật", value: specs.securityFeatures },
      { icon: RulerIcon, label: "Kích thước", value: specs.dimensions },
      { icon: WeightIcon, label: "Trọng lượng", value: specs.weight },
      { icon: PaletteIcon, label: "Màu sắc", value: specs.availableColors },
      { icon: ShieldIcon, label: "Chống nước, bụi", value: specs.waterDustResistance },
      { icon: SpeakerIcon, label: "Loa", value: specs.speakerType },
      { icon: MicIcon, label: "Microphone", value: specs.microphoneType },
      { icon: GlobeIcon, label: "Hệ điều hành", value: specs.operatingSystem },
      { icon: ClockIcon, label: "Thời gian ra mắt", value: specs.releaseDate },
    ];

    const basicSpecs = allSpecs.slice(0, 4); // Show first 4 specs by default
    const displaySpecs = showAllSpecs ? allSpecs : basicSpecs;

    return (
      <List>
        {displaySpecs.map((spec, index) => (
          <ListItem key={index} sx={{ py: 1.5, px: 2 }}>
            <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
              <spec.icon size={20} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography variant="body2" color="text.secondary">{spec.label}</Typography>}
              secondary={<Typography variant="body1" fontWeight="medium">{spec.value || 'Đang cập nhật'}</Typography>}
            />
          </ListItem>
        ))}
        {allSpecs.length > basicSpecs.length && (
          <ListItem sx={{ justifyContent: 'center', pt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setShowAllSpecs(!showAllSpecs)}
              endIcon={showAllSpecs ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            >
              {showAllSpecs ? 'Thu gọn' : 'Xem thêm thông số'}
            </Button>
          </ListItem>
        )}
      </List>
    );
  };

  const renderLaptopSpecs = () => {
    const allSpecs = [
      { icon: CpuIcon, label: "Bộ xử lý", value: specs.processor },
      { icon: MemoryStickIcon, label: "RAM", value: specs.ram },
      { icon: HardDriveIcon, label: "Ổ cứng", value: specs.storage },
      { icon: MonitorIcon, label: "Màn hình", value: `${specs.screenSize}" ${specs.screenResolution}` },
      { icon: CameraIcon, label: "Card đồ họa", value: specs.graphicsCard },
      { icon: BatteryFull, label: "Pin", value: specs.battery },
      { icon: WifiIcon, label: "Kết nối", value: specs.connectivity },
      { icon: BluetoothConnectedIcon, label: "Bluetooth", value: specs.bluetoothVersion },
      { icon: Usb, label: "Cổng kết nối", value: specs.ports },
      { icon: RulerIcon, label: "Kích thước", value: specs.dimensions },
      { icon: WeightIcon, label: "Trọng lượng", value: specs.weight },
      { icon: PaletteIcon, label: "Màu sắc", value: specs.availableColors },
      { icon: GlobeIcon, label: "Hệ điều hành", value: specs.operatingSystem },
      { icon: ClockIcon, label: "Thời gian ra mắt", value: specs.releaseDate },
    ];

    const basicSpecs = allSpecs.slice(0, 4);
    const displaySpecs = showAllSpecs ? allSpecs : basicSpecs;

    return (
      <List>
        {displaySpecs.map((spec, index) => (
          <ListItem key={index} sx={{ py: 1.5, px: 2 }}>
            <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
              <spec.icon size={20} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography variant="body2" color="text.secondary">{spec.label}</Typography>}
              secondary={<Typography variant="body1" fontWeight="medium">{spec.value || 'Đang cập nhật'}</Typography>}
            />
          </ListItem>
        ))}
        {allSpecs.length > basicSpecs.length && (
          <ListItem sx={{ justifyContent: 'center', pt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setShowAllSpecs(!showAllSpecs)}
              endIcon={showAllSpecs ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            >
              {showAllSpecs ? 'Thu gọn' : 'Xem thêm thông số'}
            </Button>
          </ListItem>
        )}
      </List>
    );
  };

  const renderHeadphoneSpecs = () => {
    const allSpecs = [
      { icon: HeadphonesIcon, label: "Loại tai nghe", value: specs.headphoneType },
      { icon: Music, label: "Chất lượng âm thanh", value: specs.audioQuality },
      { icon: Mic2, label: "Microphone", value: specs.microphone },
      { icon: BluetoothConnectedIcon, label: "Kết nối", value: specs.connectivity },
      { icon: BatteryFull, label: "Thời lượng pin", value: specs.batteryLife },
      { icon: BatteryCharging, label: "Sạc nhanh", value: specs.fastChargingSupport ? 'Có' : 'Không' },
      { icon: Usb, label: "Cổng sạc", value: specs.chargingPort },
      { icon: RulerIcon, label: "Kích thước", value: specs.dimensions },
      { icon: WeightIcon, label: "Trọng lượng", value: specs.weight },
      { icon: PaletteIcon, label: "Màu sắc", value: specs.availableColors },
      { icon: ShieldIcon, label: "Chống nước, bụi", value: specs.waterDustResistance },
      { icon: Headphones, label: "Tính năng đặc biệt", value: specs.specialFeatures },
    ];

    const basicSpecs = allSpecs.slice(0, 4);
    const displaySpecs = showAllSpecs ? allSpecs : basicSpecs;

    return (
      <List>
        {displaySpecs.map((spec, index) => (
          <ListItem key={index} sx={{ py: 1.5, px: 2 }}>
            <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
              <spec.icon size={20} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography variant="body2" color="text.secondary">{spec.label}</Typography>}
              secondary={<Typography variant="body1" fontWeight="medium">{spec.value || 'Đang cập nhật'}</Typography>}
            />
          </ListItem>
        ))}
        {allSpecs.length > basicSpecs.length && (
          <ListItem sx={{ justifyContent: 'center', pt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setShowAllSpecs(!showAllSpecs)}
              endIcon={showAllSpecs ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
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
    <Box sx={{ bgcolor: 'white', borderRadius: 2, overflow: 'hidden', boxShadow: 1 }}>
      <Button
        onClick={() => setExpanded(!expanded)}
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          textTransform: 'none',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ bgcolor: 'primary.light', p: 1, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main' }}>
            {productType === 'phone' && <Smartphone size={20} />}
            {productType === 'laptop' && <Laptop size={20} />}
            {productType === 'headphone' && <Headphones size={20} />}
          </Box>
          <Typography variant="h6" fontWeight="bold" color="text.primary">
            Thông số kỹ thuật
          </Typography>
        </Box>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </Button>
      <Collapse in={expanded}>
        <Divider />
        <Box sx={{ p: 2 }}>
          {productType === 'phone' && renderPhoneSpecs()}
          {productType === 'laptop' && renderLaptopSpecs()}
          {productType === 'headphone' && renderHeadphoneSpecs()}
        </Box>
      </Collapse>
    </Box>
  );
};

export default SpecificationDisplay;