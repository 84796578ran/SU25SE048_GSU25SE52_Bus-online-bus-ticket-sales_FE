# Hướng dẫn sử dụng hình ảnh cho Hero Section Slideshow

## 📁 Cách đặt hình ảnh:

1. **Đặt 3 hình ảnh vào thư mục này** với tên:
   - `pic1.jpg` (hoặc .png, .webp)
   - `pic2.jpg` 
   - `pic3.jpg`

2. **Kích thước khuyến nghị:**
   - Độ phân giải: 1920x1080 hoặc cao hơn
   - Tỉ lệ: 16:9 (landscape)
   - Dung lượng: < 1MB mỗi file để tối ưu tốc độ tải

## 🎨 Loại hình ảnh phù hợp:

- **Slide 1**: Hình ảnh xe bus hiện đại, ga xe đẹp
- **Slide 2**: Cảnh quan đẹp, con đường, du lịch
- **Slide 3**: Khách hàng hài lòng, ưu đãi, khuyến mãi

## ⚙️ Thiết kế hiện tại:

- **Không có gradient màu**: Hình ảnh hiển thị thuần túy
- **Overlay đen nhẹ**: `rgba(0, 0, 0, 0.3)` để text đọc được
- **Text shadow mạnh**: Đảm bảo text nổi bật trên mọi hình nền
- **Smooth transition**: 1.5s chuyển đổi mượt mà

## 🔧 Tùy chỉnh overlay:

Nếu muốn điều chỉnh độ trong suốt của overlay, sửa trong `backgroundImages`:

```javascript
overlay: 'rgba(0, 0, 0, 0.3)' // 0.1 = rất nhẹ, 0.5 = đậm hơn
```

## 🌟 Lưu ý:

- Hình ảnh được hiển thị 100% không có filter màu
- Text được tối ưu với shadow đậm để đọc được trên mọi nền
- Hiệu ứng chuyển slide mượt mà 1.5s
- Tự động pause khi hover
- Responsive cho mọi thiết bị

## 🔄 Fallback:

Nếu không có hình ảnh, hệ thống sẽ hiển thị nền trắng với overlay đen.
