import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

export const Slide2: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      background: '#FFFFFF',
      color: '#000000',
      padding: '80px',
      fontFamily: 'sans-serif',
      opacity
    }}>
      <h1 style={{ color: '#0D254C', borderBottom: '3px solid #F59E0B', paddingBottom: '20px' }}>
        MỤC LỤC TỔNG QUAN
      </h1>
      
      <div style={{ display: 'flex', gap: '40px', marginTop: '40px', fontSize: '20px' }}>
        {/* Left Column */}
        <div style={{ flex: 1, padding: '40px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
           <div style={{ background: '#EFF6FF', color: '#1E40AF', padding: '10px 20px', borderRadius: '20px', display: 'inline-block', marginBottom: '20px', fontWeight: 'bold' }}>
             Chương 1 & 2
           </div>
           <h3 style={{ color: '#0D254C' }}>HỒ SƠ PHÁP LÝ & BỐI CẢNH THỊ TRƯỜNG</h3>
           <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.5' }}>
             <li>Thư ngỏ Chủ tịch Hội đồng Quản trị ................... Trang 03</li>
             <li>Chương 1: Tổng quan Doanh nghiệp ................... Trang 04</li>
             <li>Chương 2: Bối cảnh Thị trường & Định vị ........... Trang 11</li>
           </ul>
        </div>

        {/* Right Column */}
        <div style={{ flex: 1, padding: '40px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
           <div style={{ background: '#FEF3C7', color: '#D97706', padding: '10px 20px', borderRadius: '20px', display: 'inline-block', marginBottom: '20px', fontWeight: 'bold' }}>
             Chương 3, 4 & 5
           </div>
           <h3 style={{ color: '#0D254C' }}>GIẢI PHÁP HỆ SINH THÁI, VẬN HÀNH & TẦM NHÌN</h3>
           <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.5' }}>
             <li>Chương 3: Hệ sinh thái Công nghệ .................. Trang 16</li>
             <li>Chương 4: Mô hình Trạm Cơ sở ........................ Trang 25</li>
             <li>Chương 5: Hạ tầng Đối tác ............................... Trang 31</li>
           </ul>
        </div>
      </div>
      
      {/* Footer */}
      <div style={{ position: 'absolute', bottom: '30px', left: '80px', color: '#94A3B8', fontSize: '18px' }}>
        Công ty Cổ phần Tập đoàn Công nghệ và Giải pháp nhân lực xây dựng NEXS
      </div>
      <div style={{ position: 'absolute', bottom: '30px', right: '80px', color: '#94A3B8', fontSize: '18px' }}>
        Trang 02 / 32
      </div>
    </AbsoluteFill>
  );
};
