import React from "react";

const ProductReviews = ({ reviews }) => {
  return (
    <div className="product-reviews">
      <h3>Đánh giá & Bình luận</h3>
      <div className="reviews">
        {reviews.map((review, index) => (
          <div key={index} className="review">
            <p>
              <strong>{review.user}</strong>: {review.comment}
            </p>
            <p>
              <span>Đánh giá:</span> {review.rating} sao
            </p>
          </div>
        ))}
      </div>
      <button className="leave-review">Đánh giá sản phẩm</button>
    </div>
  );
};

export default ProductReviews;
