module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",  // Chỉ định các thư mục và tệp cần quét
  ],
  theme: {
    extend: {},
  },
  plugins: [require('flowbite/plugin')], // Thêm plugin Flowbite
};
