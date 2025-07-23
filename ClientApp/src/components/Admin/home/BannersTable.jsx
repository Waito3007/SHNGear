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
import useDebounce from "utils/useDebounce";
import MuiPagination from "@mui/material/Pagination";
import "@/Assets/styles/admin-responsive.css";
import "@/Assets/styles/admin-tables.css";

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
      try {
        const [bannersRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_BASE_URL}/api/Banner`),
        ]);
        if (!bannersRes.ok) {
          throw new Error("");
        }
        const bannersData = await bannersRes.json();

        setMasterBanners(bannersData);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Lỗi khi tải dữ liệu ban đầu: " + error.message);
      } finally {
        setIsFetchingInitialData(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm) {
      setFilteredBanners(
        masterBanners.filter((banner) =>
          banner.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredBanners(masterBanners);
    }
  }, [masterBanners, debouncedSearchTerm]);

  const handleAddBanner = useCallback(
    (newBanner) => {
      const newMasterBanners = [newBanner, ...masterBanners];
      setMasterBanners(newMasterBanners);
      setPage(1);
    },
    [masterBanners]
  );

  const handleUpdateBanner = (updatedBanner) => {
    setMasterBanners((prev) =>
      prev.map((banner) =>
        banner.id === updatedBanner.id
          ? { ...banner, ...updatedBanner }
          : banner
      )
    );
  };

  const confirmDeleteBanner = useCallback(async () => {
    if (!bannerToDelete) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/Banner/${bannerToDelete.id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        const updatedMaster = masterBanners.filter(
          (p) => p.id !== bannerToDelete.id
        );
        setMasterBanners(updatedMaster);
      } else {
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setBannerToDelete(null);
    }
  }, [bannerToDelete, masterBanners]);

  const handlePageChange = useCallback((event, value) => setPage(value), []);
  const handleEditBanner = useCallback((banner) => {
    setSelectedBanner(banner);
    setIsEditDrawerOpen(true);
  }, []);
  const handleDeleteBanner = useCallback((banner) => {
    setBannerToDelete(banner);
    setIsDeleteDialogOpen(true);
  }, []);

  const currentBanners = useMemo(() => {
    const indexOfLastBanner = page * bannersPerPage;
    const indexOfFirstBanner = indexOfLastBanner - bannersPerPage;
    return filteredBanners.slice(indexOfFirstBanner, indexOfLastBanner);
  }, [filteredBanners, page, bannersPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(filteredBanners.length / bannersPerPage),
    [filteredBanners.length, bannersPerPage]
  );

  const toggleDrawer = useCallback((setter, value) => setter(value), []);

  if (isFetchingInitialData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 200px)",
          color: "white",
          flexDirection: "column",
        }}
      >
        <Loader color="inherit" size={50} />
        <Typography sx={{ mt: 2, fontSize: "1.1rem" }}>
          Đang tải dữ liệu...
        </Typography>
      </Box>
    );
  }

  return (
    <motion.div
      className="admin-card admin-main-content min-h-[calc(100vh-120px)] flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
    >
      {/* Header và các nút actions */}
      <div className="admin-flex-mobile justify-between items-center mb-6 gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-100 tracking-tight">
          Danh sách Banner
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="contained"
            startIcon={<CirclePlus size={18} />}
            onClick={() => toggleDrawer(setIsDrawerOpen, true)}
            className="admin-btn"
            sx={{ bgcolor: "#2563EB", "&:hover": { bgcolor: "#1D4ED8" } }}
          >
            <span className="hidden sm:inline">Thêm Banner</span>
            <span className="sm:hidden">Thêm</span>
          </Button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="admin-hide-mobile admin-table-container flex-grow rounded-lg border border-gray-700/50">
        <table className="admin-table divide-y divide-gray-600">
          <thead className="bg-gray-700 bg-opacity-40 sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Tiêu đề
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Hình ảnh
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {isLoading && currentBanners.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-10">
                  <Loader size={30} sx={{ color: "white" }} />
                </td>
              </tr>
            )}
            {!isLoading &&
              currentBanners.length === 0 &&
              !isFetchingInitialData && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-10 text-gray-400 italic"
                  >
                    Không tìm thấy Banner.
                  </td>
                </tr>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 text-left">
                  <span className="truncate max-w-xs" title={banner.title}>
                    {banner.title || "Chưa có tên"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-100 text-center align-middle">
                  {banner.imageUrl ? (
                    <img
                      src={
                        banner.imageUrl.startsWith("http")
                          ? banner.imageUrl
                          : `${process.env.REACT_APP_API_BASE_URL}/${banner.imageUrl}`
                      }
                      alt={banner.title || "banner image"}
                      className="w-16 h-16 rounded-md object-cover border border-gray-600 mx-auto"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/100?text=Error";
                      }}
                    />
                  ) : (
                    <span className="italic text-gray-400">Không có ảnh</span>
                  )}
                </td>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">
                  <button
                    onClick={() => handleEditBanner(banner)}
                    className="text-sky-400 hover:text-sky-300 p-1.5 rounded-full hover:bg-gray-600/50"
                    title="Sửa Banner"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteBanner(banner)}
                    className="text-rose-400 hover:text-rose-300 p-1.5 ml-1.5 rounded-full hover:bg-gray-600/50"
                    title="Xóa Banner"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="admin-show-mobile flex-grow space-y-4">
        {isLoading && currentBanners.length === 0 && (
          <div className="admin-loading">
            <Loader size={30} sx={{ color: "white" }} />
            <Typography sx={{ mt: 2, color: "white" }}>
              Đang tải dữ liệu...
            </Typography>
          </div>
        )}
        {!isLoading &&
          currentBanners.length === 0 &&
          !isFetchingInitialData && (
            <div className="text-center py-10 text-gray-400 italic">
              Không tìm thấy Banner.
            </div>
          )}
        {currentBanners.map((banner) => (
          <motion.div
            key={banner.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-700 bg-opacity-50 backdrop-blur-md rounded-lg p-4 border border-gray-600 hover:bg-gray-700/70 transition-colors"
          >
            <div className="flex items-start space-x-4">
              {/* Banner Image */}
              <div className="flex-shrink-0">
                {banner.imageUrl ? (
                  <img
                    src={
                      banner.imageUrl.startsWith("http")
                        ? banner.imageUrl
                        : `${process.env.REACT_APP_API_BASE_URL}/${banner.imageUrl}`
                    }
                    alt={banner.title || "banner image"}
                    className="w-20 h-20 rounded-md object-cover border border-gray-600"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/100?text=Error";
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-600 rounded-md flex items-center justify-center">
                    <span className="text-xs text-gray-400">No Image</span>
                  </div>
                )}
              </div>

              {/* Banner Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3
                      className="text-lg font-medium text-gray-100 truncate"
                      title={banner.title}
                    >
                      {banner.title || "Chưa có tên"}
                    </h3>
                    <div className="mt-2 flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          !banner.status
                            ? "bg-green-600 text-green-100"
                            : "bg-rose-600 text-rose-100"
                        }`}
                      >
                        {!banner.status ? "Hiển thị" : "Ẩn"}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => handleEditBanner(banner)}
                      className="text-sky-400 hover:text-sky-300 p-2 rounded-full hover:bg-gray-600/50 transition-colors"
                      title="Sửa Banner"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(banner)}
                      className="text-rose-400 hover:text-rose-300 p-2 rounded-full hover:bg-gray-600/50 transition-colors"
                      title="Xóa Banner"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Phân trang */}
      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 mt-auto border-t border-gray-600">
          <div className="text-sm text-gray-400 order-2 sm:order-1">
            Hiển thị{" "}
            {Math.min((page - 1) * bannersPerPage + 1, filteredBanners.length)}{" "}
            - {Math.min(page * bannersPerPage, filteredBanners.length)} của{" "}
            {filteredBanners.length} banner
          </div>
          <div className="order-1 sm:order-2">
            <MuiPagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="small"
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "#9CA3AF",
                  fontWeight: "medium",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                },
                "& .MuiPaginationItem-root.Mui-selected": {
                  backgroundColor: "rgba(79, 70, 229, 0.9)",
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(79, 70, 229, 1)" },
                },
                "& .MuiPaginationItem-ellipsis": { color: "#9CA3AF" },
                "& .MuiPaginationItem-icon": { color: "#A5B4FC" },
              }}
            />
          </div>
        </div>
      )}

      {/* Các Drawers và Dialogs */}
      <AddBannerDrawer
        isOpen={isDrawerOpen}
        onClose={() => toggleDrawer(setIsDrawerOpen, false)}
        onAddBanner={handleAddBanner}
      />
      <EditBannerDrawer
        isOpen={isEditDrawerOpen}
        onClose={() => toggleDrawer(setIsEditDrawerOpen, false)}
        banner={selectedBanner}
        onUpdateBanner={handleUpdateBanner}
      />
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => toggleDrawer(setIsDeleteDialogOpen, false)}
      >
        <DialogTitle sx={{ bgcolor: "rgb(31,41,55)", color: "white" }}>
          {"Xác nhận xóa Banner"}
        </DialogTitle>
        <DialogContent
          sx={{ bgcolor: "rgb(31,41,55)", color: "rgb(209,213,219)" }}
        >
          <DialogContentText sx={{ color: "rgb(209,213,219)" }}>
            Bạn có chắc chắn muốn xóa Banner "{bannerToDelete?.title}" không?
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ bgcolor: "rgb(31,41,55)" }}>
          <Button
            onClick={() => toggleDrawer(setIsDeleteDialogOpen, false)}
            sx={{ color: "#A5B4FC" }}
          >
            Hủy
          </Button>
          <Button
            onClick={confirmDeleteBanner}
            sx={{ color: "#F87171" }}
            autoFocus
            disabled={isLoading}
          >
            {isLoading ? <Loader size={20} color="inherit" /> : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default BannersTable;
