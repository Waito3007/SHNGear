// homePageService.js - Service for homepage settings API calls
const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;
class HomePageService {
  async getHomePageSettings() {
    try {
      const response = await fetch(`${API_BASE_URL}/homepagesettings`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching homepage settings:', error);
      // Return default data if API fails
      return this.getDefaultSettings();
    }
  }
  async updateHomePageSettings(id, settings) {
    try {
      const response = await fetch(`${API_BASE_URL}/homepagesettings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating homepage settings:', error);
      throw error;
    }
  }
  async createHomePageSettings(settings) {
    try {
      const response = await fetch(`${API_BASE_URL}/homepagesettings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating homepage settings:', error);
      throw error;
    }
  }

  getDefaultSettings() {
    return {
      id: 0,
      heroTitle: "Chào mừng đến với SHN Gear",
      heroSubtitle: "Khám phá những sản phẩm công nghệ hàng đầu",
      heroDescription: "Mang đến cho bạn những trải nghiệm tuyệt vời với các sản phẩm công nghệ chất lượng cao",
      heroCtaText: "Khám phá ngay",
      heroCtaLink: "/products",
      heroBadgeText: "Đáng tin cậy",
      heroIsActive: true,
      heroSlides: [
        {
          id: 1,
          title: "iPhone 15 Pro Max",
          subtitle: "Titanium. So Strong. So Light. So Pro.",
          description: "Được chế tác từ titan chuẩn hàng không vũ trụ với khả năng chụp ảnh chuyên nghiệp đỉnh cao",
          image: "/images/hero/iphone-15-pro.jpg",
          badge: "Mới ra mắt",
          price: "29.990.000",
          originalPrice: "34.990.000",
          discount: "14%",
          ctaText: "Mua ngay",
          ctaLink: "/product/iphone-15-pro-max",
          backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          features: ["Camera 48MP Pro", "Chip A17 Pro", "Titan chuẩn hàng không"]
        }
      ],
      
      featuredCategoriesTitle: "Danh mục nổi bật",
      featuredCategoriesSubtitle: "Khám phá các danh mục sản phẩm công nghệ hàng đầu",
      featuredCategoriesIsActive: true,
      featuredCategories: [
        {
          id: 1,
          name: "Smartphone",
          description: "Điện thoại thông minh",
          productCount: 156,
          image: "/images/categories/smartphones.jpg",
          color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          trending: true
        }
      ],

      productShowcaseTitle: "Sản phẩm đặc sắc",
      productShowcaseSubtitle: "Những sản phẩm được lựa chọn kỹ càng dành cho bạn",
      productShowcaseIsActive: true,

      promotionalBannersTitle: "Ưu đãi đặc biệt",
      promotionalBannersSubtitle: "Những chương trình khuyến mãi hấp dẫn",
      promotionalBannersIsActive: true,
      promotionalBanners: [
        {
          id: 1,
          type: "flash-sale",
          title: "Flash Sale 24H",
          subtitle: "Giảm đến 50% cho tất cả iPhone",
          description: "Cơ hội vàng sở hữu iPhone với giá không thể tốt hơn",
          backgroundImage: "/images/banners/flash-sale-iphone.jpg",
          backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          textColor: "white",
          ctaText: "Mua ngay",
          ctaLink: "/flash-sale",
          badge: "HOT",
          endTime: "2024-12-31T23:59:59",
          features: ["Miễn phí vận chuyển", "Bảo hành 12 tháng", "Đổi trả 7 ngày"]
        }
      ],

      testimonialsTitle: "Khách hàng nói gì",
      testimonialsSubtitle: "Trải nghiệm thực tế từ khách hàng của chúng tôi",
      testimonialsIsActive: true,
      testimonials: [
        {
          id: 1,
          name: "Nguyễn Văn A",
          role: "CEO tại Tech Company",
          avatar: "/images/testimonials/user1.jpg",
          rating: 5,
          comment: "Sản phẩm chất lượng tuyệt vời, dịch vụ hỗ trợ nhiệt tình. Tôi rất hài lòng với SHN Gear.",
          product: "MacBook Pro M3",
          date: "2024-01-15"
        }
      ],

      brandStoryTitle: "Câu chuyện SHN Gear",
      brandStorySubtitle: "Hành trình mang công nghệ đến mọi người",
      brandStoryDescription: "Chúng tôi tin rằng công nghệ có thể thay đổi cuộc sống và làm cho mọi thứ trở nên tốt đẹp hơn. Với sứ mệnh mang những sản phẩm công nghệ hàng đầu đến với mọi người, SHN Gear đã và đang không ngừng nỗ lực để trở thành điểm đến tin cậy cho những ai yêu thích công nghệ.",
      brandStoryImage: "/images/brand/brand-story.jpg",
      brandStoryCtaText: "Tìm hiểu thêm",
      brandStoryCtaLink: "/about",
      brandStoryIsActive: true,
      brandStats: [
        {
          id: 1,
          number: "50K+",
          label: "Khách hàng hài lòng",
          icon: "users"
        },
        {
          id: 2,
          number: "1000+",
          label: "Sản phẩm chất lượng",
          icon: "package"
        },
        {
          id: 3,
          number: "5+",
          label: "Năm kinh nghiệm",
          icon: "award"
        },
        {
          id: 4,
          number: "24/7",
          label: "Hỗ trợ khách hàng",
          icon: "headphones"
        }
      ],

      newsletterTitle: "Đăng ký nhận tin",
      newsletterSubtitle: "Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt",
      newsletterCtaText: "Đăng ký ngay",
      newsletterBackgroundImage: "/images/newsletter/newsletter-bg.jpg",
      newsletterIsActive: true,

      services: [
        {
          id: 1,
          title: "Giao hàng siêu tốc",
          description: "Trong vòng 2 giờ nội thành HN, HCM",
          icon: "zap"
        },
        {
          id: 2,
          title: "Quà tặng hấp dẫn",
          description: "Mỗi đơn hàng trên 10 triệu",
          icon: "gift"
        },
        {
          id: 3,
          title: "Bảo hành vàng",
          description: "Chế độ bảo hành vượt trội",
          icon: "star"
        }
      ],
      servicesIsActive: true,

      metaTitle: "SHN Gear - Cửa hàng công nghệ hàng đầu",
      metaDescription: "Khám phá những sản phẩm công nghệ mới nhất tại SHN Gear",
      metaKeywords: "công nghệ, điện thoại, laptop, tai nghe",
      isActive: true,
      displayOrder: 1
    };
  }
}

const homePageService = new HomePageService();
export default homePageService;
