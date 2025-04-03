import React from 'react';
import './notification.css'; // Đảm bảo bạn import file CSS nếu chưa

const Notification = () => {
  return (
    <div className="notification-container">
      <nav>
        <ul className="items-center pc:flex">
          <li className="pr-4">
            <div className="flex cursor-pointer items-center b2-medium">
              <img 
                alt="Deal chớp nhoáng" 
                loading="lazy" 
                width="32" 
                height="32" 
                decoding="async" 
                data-nimg="1" 
                className="mr-2" 
                srcSet="https://cdn2.fptshop.com.vn/unsafe/32x0/filters:quality(100)/7_Deal_Chong_Deal_652fe1f961.png 1x, https://cdn2.fptshop.com.vn/unsafe/64x0/filters:quality(100)/7_Deal_Chong_Deal_652fe1f961.png 2x" 
                src="https://cdn2.fptshop.com.vn/unsafe/64x0/filters:quality(100)/7_Deal_Chong_Deal_652fe1f961.png"
              />
              Deal chớp nhoáng
            </div>
          </li>
          <li className="pr-4">
            <a className="flex items-center b2-medium" href="https://localhost:44479/ProductList?brandId=1">
              <img 
                alt="Xả kho giá sốc, số lượng có hạn!" 
                loading="lazy" 
                width="32" 
                height="32" 
                decoding="async" 
                data-nimg="1" 
                className="mr-2" 
                srcSet="https://cdn2.fptshop.com.vn/unsafe/32x0/filters:quality(100)/soc_2f6cbf28ff.png 1x, https://cdn2.fptshop.com.vn/unsafe/64x0/filters:quality(100)/soc_2f6cbf28ff.png 2x" 
                src="https://cdn2.fptshop.com.vn/unsafe/64x0/filters:quality(100)/soc_2f6cbf28ff.png"
              />
              Xả kho giá sốc, số lượng có hạn!
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Notification;
