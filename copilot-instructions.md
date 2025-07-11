# Next.js + Material-UI Project

Đây là một project React sử dụng framework Next.js với Material-UI (MUI) để xây dựng giao diện người dùng.

## Công nghệ sử dụng

- **Next.js 15**: Framework React cho phát triển web full-stack
- **TypeScript**: JavaScript với type safety
- **Material-UI (MUI)**: Thư viện UI component theo Material Design
- **Emotion**: CSS-in-JS styling solution cho MUI

## Cấu trúc Project

```
my-nextjs-mui-app/
├── src/
│   └── app/
│       ├── theme/
│       │   ├── theme.ts          # Cấu hình theme MUI
│       │   └── ThemeProvider.tsx # Component provider cho theme
│       ├── layout.tsx            # Root layout với MUI provider
│       ├── page.tsx              # Trang chính với demo MUI
│       └── globals.css           # Global styles
├── public/                       # Static assets
├── package.json                  # Dependencies và scripts
└── tsconfig.json                 # TypeScript configuration
```

## Cách chạy project

```bash
# Development mode
npm run dev

# Build production
npm run build

# Start production
npm start

# Lint code
npm run lint
```

## Tính năng chính

1. **Server-side Rendering (SSR)** với Next.js
2. **TypeScript** cho type safety
3. **Material-UI Components** đầy đủ
4. **Theme customization** với MUI Theme Provider
5. **Responsive design** với MUI breakpoints
6. **Modern CSS** với CSS-in-JS

## Hướng dẫn phát triển

- Sử dụng MUI components thay vì HTML thuần
- Tận dụng MUI theme system để styling
- Sử dụng TypeScript cho tất cả component
- Theo chuẩn Next.js App Router
- Component nên được đặt trong thư mục phù hợp

## MUI Components có sẵn

- Layout: Container, Box, Grid, Stack
- Navigation: AppBar, Drawer, Tabs
- Input: TextField, Button, Select, Checkbox
- Display: Typography, Card, List, Table
- Feedback: Alert, Dialog, Snackbar
- Surfaces: Paper, Accordion

Xem thêm tại: https://mui.com/components/
