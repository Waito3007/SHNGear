import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Edit, Trash2, Loader, CirclePlus } from "lucide-react";
import AddBannerDrawer from "./AddBannerDrawer";
import EditBannerDrawer from "./EditBannerDrawer";
import { TextField as Box, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import useDebounce from 'utils/useDebounce';
import MuiPagination from "@mui/material/Pagination"; 

const BannersTable = () => {
  const [masterBanners, setMasterBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingInitialData, setIsFetchingInitialData] = useState(true);

  const [searchInput, setSearchInput] = useState(""); // Input tìm kiếm tức thời
  const debouncedSearchTerm = useDebounce(searchInput, 500); // Debounce giá trị tìm kiếm
  
  const [filteredBanners, setFilteredBanners] = useState([]); 

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);

  const [page, setPage] = useState(1);
  const bannersPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      setIsFetchingInitialData(true);
      try{
        const[bannersRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_BASE_URL}/api/Banner`),
        ]);
        if(!bannersRes.ok){
          throw new Error('');
        }
        const bannersData = await bannersRes.json();

        setMasterBanners(bannersData);
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
    setFilteredBanners(
      masterBanners.filter(banner =>
        banner.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    );
  } else {
    setFilteredBanners(masterBanners);
  }
}, [masterBanners, debouncedSearchTerm]);

  const handleAddBanner = useCallback((newBanner) => {
    const newMasterBanners = [newBanner, ...masterBanners];
    setMasterBanners(newMasterBanners);
    setPage(1);
  }, [masterBanners]);

  const handleUpdateBanner = (updatedBanner) => {
    setMasterBanners((prev) =>
      prev.map((banner) =>
        banner.id === updatedBanner.id ? { ...banner, ...updatedBanner } : banner
      )
    );
  };
  

  const confirmDeleteBanner = useCallback(async() => {
    if(!bannerToDelete) return;
    setIsLoading(true);
    try{
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/Banner/${bannerToDelete.id}`, {
        method: 'DELETE',
      });
      if(response.ok) {
        const updatedMaster = masterBanners.filter((p) => p.id !== bannerToDelete.id);
        setMasterBanners(updatedMaster);
      } else {
        
      }
    } catch (error) {} finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setBannerToDelete(null);
    }
  }, [bannerToDelete, masterBanners]);

  const handlePageChange = useCallback((event, value) => setPage(value), []);
  const handleEditBanner = useCallback((banner) => { setSelectedBanner(banner); setIsEditDrawerOpen(true); }, []);
  const handleDeleteBanner = useCallback((banner) => { setBannerToDelete(banner); setIsDeleteDialogOpen(true); }, []);
  

  const currentBanners = useMemo(() => {
    const indexOfLastBanner = page * bannersPerPage;
    const indexOfFirstBanner = indexOfLastBanner - bannersPerPage;
    return filteredBanners.slice(indexOfFirstBanner, indexOfLastBanner);
  }, [filteredBanners, page, bannersPerPage]);

  const totalPages = useMemo(() => Math.ceil(filteredBanners.length / bannersPerPage), [filteredBanners.length, bannersPerPage]);

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
          Danh sách Banner
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="contained" startIcon={<CirclePlus size={18}/>} onClick={() => toggleDrawer(setIsDrawerOpen, true)} sx={{bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' }}}>Thêm Banner</Button>
        </div>
      </div>

      {/* Bảng hiển thị banner */}
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
            {isLoading && currentBanners.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10"><Loader size={30} sx={{color: 'white'}}/></td></tr>
            )}
            {!isLoading && currentBanners.length === 0 && !isFetchingInitialData && (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400 italic">Không tìm thấy Banner.</td></tr>
            )}
            {currentBanners.map((banner) => (
              <motion.tr
                key={banner.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="hover:bg-gray-700/60"
              >
            {/* Tiêu đề */}
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 text-left">
              <span className="truncate max-w-xs" title={banner.title}>{banner.title || "Chưa có tên"}</span>
            </td>

            {/* Hình ảnh */}
            <td className="px-6 py-4 text-sm text-gray-100 text-center align-middle">
              {banner.images && banner.images[0] && banner.images[0].imageUrl ? (
                <img
                  src={banner.images[0].imageUrl.startsWith("http") ? banner.images[0].imageUrl : `${process.env.REACT_APP_API_BASE_URL}/${banner.images[0].imageUrl}`}
                  alt={banner.title || "banner image"}
                  className="w-16 h-16 rounded-md object-cover border border-gray-600"
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/100?text=Error"; }}
                />
              ) : (
                <span className="italic text-gray-400">Không có ảnh</span>
              )}
          </td>


            {/* Trạng thái */}
            <td className="px-6 py-4 whitespace-nowrap text-center">
              <span
                className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-md shadow-sm ${
                  !banner.status
                    ? "bg-green-600 text-green-100 shadow-green-500/30"
                    : "bg-rose-600 text-rose-100 shadow-rose-500/30"
                  }`}
                  title={!banner.status ? "Đang hiển thị" : "Đã ẩn"}
                >
                {!banner.status ? "Hiển thị" : "Ẩn"}
              </span>
            </td>
            
            {/* Hành động */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">
              <button onClick={() => handleEditBanner(banner)} className="text-sky-400 hover:text-sky-300 p-1.5 rounded-full hover:bg-gray-600/50" title="Sửa Banner"><Edit size={18} /></button>
              <button onClick={() => handleDeleteBanner(banner)} className="text-rose-400 hover:text-rose-300 p-1.5 ml-1.5 rounded-full hover:bg-gray-600/50" title="Xóa Banner"><Trash2 size={18} /></button>
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
      <AddBannerDrawer isOpen={isDrawerOpen} onClose={() => toggleDrawer(setIsDrawerOpen, false)} onAddBanner={handleAddBanner} />
      <EditBannerDrawer isOpen={isEditDrawerOpen} onClose={() => toggleDrawer(setIsEditDrawerOpen, false)} banner={selectedBanner} onUpdateBanner={handleUpdateBanner} />
        <Dialog open={isDeleteDialogOpen} onClose={() => toggleDrawer(setIsDeleteDialogOpen, false)}>
          <DialogTitle sx={{bgcolor: 'rgb(31,41,55)', color: 'white'}}>{"Xác nhận xóa Banner"}</DialogTitle>
          <DialogContent sx={{bgcolor: 'rgb(31,41,55)', color: 'rgb(209,213,219)'}}>
          <DialogContentText sx={{color: 'rgb(209,213,219)'}}>
            Bạn có chắc chắn muốn xóa Banner "{bannerToDelete?.title}" không? Hành động này không thể hoàn tác.
          </DialogContentText>
          </DialogContent>
          <DialogActions sx={{bgcolor: 'rgb(31,41,55)'}}>
          <Button onClick={() => toggleDrawer(setIsDeleteDialogOpen, false)} sx={{color: '#A5B4FC'}}>Hủy</Button>
          <Button onClick={confirmDeleteBanner} sx={{color: '#F87171'}} autoFocus disabled={isLoading}>
            {isLoading ? <Loader  size={20} color="inherit"/> : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default BannersTable;
