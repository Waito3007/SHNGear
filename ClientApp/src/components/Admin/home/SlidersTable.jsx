import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Edit, Trash2, Loader, CirclePlus } from "lucide-react";
import AddSliderDrawer from "./AddSliderDrawer";
import EditSliderDrawer from "./EditSliderDrawer";
import { TextField as Box, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import useDebounce from 'utils/useDebounce';
import MuiPagination from "@mui/material/Pagination"; 

const SlidersTable = () => {
  const [masterSliders, setMasterSliders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingInitialData, setIsFetchingInitialData] = useState(true);

  const [searchInput, setSearchInput] = useState(""); // Input tìm kiếm tức thời
  const debouncedSearchTerm = useDebounce(searchInput, 500); // Debounce giá trị tìm kiếm
  
  const [filteredSliders, setFilteredSliders] = useState([]); 

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedSlider, setSelectedSlider] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sliderToDelete, setSliderToDelete] = useState(null);

  const [page, setPage] = useState(1);
  const slidersPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      setIsFetchingInitialData(true);
      try{
        const[slidersRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_BASE_URL}/api/Slider`),
        ]);
        if(!slidersRes.ok){
          throw new Error('');
        }
        const slidersData = await slidersRes.json();

        setMasterSliders(slidersData);
      } catch(error){
        console.error("Fetch error:", error);
        toast.error("Lỗi khi tải dữ liệu ban đầu: " + error.message);
      } finally{
        setIsFetchingInitialData(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
  if (debouncedSearchTerm) {
    setFilteredSliders(
      masterSliders.filter(slider =>
        slider.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    );
  } else {
    setFilteredSliders(masterSliders);
  }
}, [masterSliders, debouncedSearchTerm]);

  const handleAddSlider = useCallback((newSlider) => {
    const newMasterSliders = [newSlider, ...masterSliders];
    setMasterSliders(newMasterSliders);
    setPage(1);
  }, [masterSliders]);

  const handleUpdateSlider = (updatedSlider) => {
    setMasterSliders((prev) =>
      prev.map((slider) =>
        slider.id === updatedSlider.id ? { ...slider, ...updatedSlider } : slider
      )
    );
  };
  

  const confirmDeleteSlider = useCallback(async() => {
    if(!sliderToDelete) return;
    setIsLoading(true);
    try{
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/Slider/${sliderToDelete.id}`, {
        method: 'DELETE',
      });
      if(response.ok) {
        const updatedMaster = masterSliders.filter((p) => p.id !== sliderToDelete.id);
        setMasterSliders(updatedMaster);
      } else {
        
      }
    } catch (error) {} finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setSliderToDelete(null);
    }
  }, [sliderToDelete, masterSliders]);

  const handlePageChange = useCallback((event, value) => setPage(value), []);
  const handleEditSlider = useCallback((slider) => { setSelectedSlider(slider); setIsEditDrawerOpen(true); }, []);
  const handleDeleteSlider = useCallback((slider) => { setSliderToDelete(slider); setIsDeleteDialogOpen(true); }, []);
  

  const currentSliders = useMemo(() => {
    const indexOfLastSlider = page * slidersPerPage;
    const indexOfFirstSlider = indexOfLastSlider - slidersPerPage;
    return filteredSliders.slice(indexOfFirstSlider, indexOfLastSlider);
  }, [filteredSliders, page, slidersPerPage]);

  const totalPages = useMemo(() => Math.ceil(filteredSliders.length / slidersPerPage), [filteredSliders.length, slidersPerPage]);

  const toggleDrawer = useCallback((setter, value) => setter(value), []);

  if (isFetchingInitialData) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)', color: 'white', flexDirection: 'column' }}>
          <Loader  color="inherit" size={50} />
          <Typography sx={{ mt: 2, fontSize: '1.1rem' }}>Đang tải dữ liệu...</Typography>
      </Box>
    );
  };

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-70 backdrop-blur-xl shadow-2xl rounded-xl p-4 md:p-6 border border-gray-700 min-h-[calc(100vh-120px)] flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      >
      {/* Header và các nút actions */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold text-gray-100 tracking-tight">
          Danh sách Slider
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="contained" startIcon={<CirclePlus size={18}/>} onClick={() => toggleDrawer(setIsDrawerOpen, true)} sx={{bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' }}}>Thêm Slider</Button>
        </div>
      </div>

      {/* Bảng hiển thị slider */}
      <div className="overflow-x-auto custom-scrollbar flex-grow rounded-lg border border-gray-700/50">
        <table className="min-w-full divide-y divide-gray-600">
          <thead className="bg-gray-700 bg-opacity-40 sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Tiêu đề</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Hình ảnh</th>
              <th className='px-6 py-3 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider'>Trạng thái</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {isLoading && currentSliders.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10"><Loader size={30} sx={{color: 'white'}}/></td></tr>
            )}
            {!isLoading && currentSliders.length === 0 && !isFetchingInitialData && (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400 italic">Không tìm thấy Slider.</td></tr>
            )}
            {currentSliders.map((slider) => (
              <motion.tr
                key={slider.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="hover:bg-gray-700/60"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 text-left">
                  <span className="truncate max-w-xs" title={slider.title}>{slider.title || "Chưa có tên"}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-100 text-center align-middle">
                  {slider.imageUrl ? (
                    <img
                      src={slider.imageUrl.startsWith("http") ? slider.imageUrl : `${process.env.REACT_APP_API_BASE_URL}/${slider.imageUrl}`}
                      alt={slider.title || "slider image"}
                      className="w-16 h-16 rounded-md object-cover border border-gray-600"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/100?text=Error"; }}
                    />
                  ) : (
                    <span className="italic text-gray-400">Không có ảnh</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-md shadow-sm ${
                      !slider.status
                        ? "bg-green-600 text-green-100 shadow-green-500/30"
                        : "bg-rose-600 text-rose-100 shadow-rose-500/30"
                      }`}
                      title={!slider.status ? "Đang hiển thị" : "Đã ẩn"}
                    >
                    {!slider.status ? "Hiển thị" : "Ẩn"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">
                  <button onClick={() => handleEditSlider(slider)} className="text-sky-400 hover:text-sky-300 p-1.5 rounded-full hover:bg-gray-600/50" title="Sửa Slider"><Edit size={18} /></button>
                  <button onClick={() => handleDeleteSlider(slider)} className="text-rose-400 hover:text-rose-300 p-1.5 ml-1.5 rounded-full hover:bg-gray-600/50" title="Xóa Slider"><Trash2 size={18} /></button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {totalPages > 0 && (
        <div className="flex justify-center p-2 mt-auto border-t border-gray-600 pt-4">
          <MuiPagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="small"
            sx={{ '& .MuiPaginationItem-root': { color: '#9CA3AF', fontWeight:'medium' }, '& .MuiPaginationItem-root.Mui-selected': { backgroundColor: 'rgba(79, 70, 229, 0.9)', color: 'white', '&:hover': { backgroundColor: 'rgba(79, 70, 229, 1)'}}, '& .MuiPaginationItem-ellipsis': { color: '#9CA3AF' }, '& .MuiPaginationItem-icon': {color: '#A5B4FC'} }}
          />
        </div>
      )}

      {/* Các Drawers và Dialogs */}
      <AddSliderDrawer isOpen={isDrawerOpen} onClose={() => toggleDrawer(setIsDrawerOpen, false)} onAddSlider={handleAddSlider} />
      <EditSliderDrawer isOpen={isEditDrawerOpen} onClose={() => toggleDrawer(setIsEditDrawerOpen, false)} slider={selectedSlider} onUpdateSlider={handleUpdateSlider} />
        <Dialog open={isDeleteDialogOpen} onClose={() => toggleDrawer(setIsDeleteDialogOpen, false)}>
          <DialogTitle sx={{bgcolor: 'rgb(31,41,55)', color: 'white'}}>{"Xác nhận xóa Slider"}</DialogTitle>
          <DialogContent sx={{bgcolor: 'rgb(31,41,55)', color: 'rgb(209,213,219)'}}>
          <DialogContentText sx={{color: 'rgb(209,213,219)'}}>
            Bạn có chắc chắn muốn xóa Slider "{sliderToDelete?.title}" không? Hành động này không thể hoàn tác.
          </DialogContentText>
          </DialogContent>
          <DialogActions sx={{bgcolor: 'rgb(31,41,55)'}}>
          <Button onClick={() => toggleDrawer(setIsDeleteDialogOpen, false)} sx={{color: '#A5B4FC'}}>Hủy</Button>
          <Button onClick={confirmDeleteSlider} sx={{color: '#F87171'}} autoFocus disabled={isLoading}>
            {isLoading ? <Loader  size={20} color="inherit"/> : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default SlidersTable;
