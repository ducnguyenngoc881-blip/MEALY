import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Slide1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 15], [50, 0], { extrapolateRight: 'clamp' });
  const cardScale = spring({ frame: frame - 10, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #0B1727 70%, #1E3A8A 100%)',
      color: '#FFFFFF',
      display: 'flex',
      flexDirection: 'row',
      padding: '80px',
      fontFamily: 'sans-serif'
    }}>
      {/* Nửa trái */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h2 style={{ color: '#FBBF24', fontSize: '24px', letterSpacing: '2px', marginBottom: '10px' }}>
          CÔNG TY CỔ PHẦN TẬP ĐOÀN CÔNG NGHỆ VÀ GIẢI PHÁP NHÂN LỰC XÂY DỰNG NEXS
        </h2>
        <h1 style={{ 
          fontSize: '72px', 
          fontWeight: 'bold', 
          lineHeight: '1.2',
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          marginBottom: '20px'
        }}>
          HỒ SƠ NĂNG LỰC<br/>DOANH NGHIỆP 2026
        </h1>
        <h3 style={{ color: '#94A3B8', fontSize: '32px', marginBottom: '40px' }}>
          NỀN TẢNG CÔNG NGHỆ & CHUỖI CUNG ỨNG NHÂN LỰC XÂY DỰNG
        </h3>
        
        <div style={{ marginBottom: '40px', fontSize: '20px', lineHeight: '1.6' }}>
          <p>☑ Workforce Platform (Sàn nhân lực thông minh & Chấm công GPS)</p>
          <p>☑ Social Network (Mạng xã hội nghề nghiệp có cấp phép)</p>
          <p>☑ B2B E-commerce (Sàn thương mại điện tử vật liệu chuẩn ngành)</p>
          <p>☑ Financial Management (Quản trị tài chính VNĐ & Thuế)</p>
        </div>

        <div>
          <div style={{
            background: '#F59E0B',
            color: '#000',
            padding: '20px 40px',
            borderRadius: '50px',
            display: 'inline-block',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            Khám phá Nền tảng →
          </div>
        </div>
      </div>

      {/* Nửa phải */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          width: '80%',
          height: '80%',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.1)',
          transform: `scale(${cardScale})`,
          position: 'relative'
        }}>
           {/* Metric Chips */}
           <div style={{ position: 'absolute', top: '20%', left: '-50px', background: '#F59E0B', color: '#000', padding: '15px 30px', borderRadius: '15px', fontWeight: 'bold' }}>50 Tỷ USD Quy mô</div>
           <div style={{ position: 'absolute', top: '50%', right: '-50px', background: '#1E3A8A', padding: '15px 30px', borderRadius: '15px', fontWeight: 'bold' }}>100% Giao dịch VNĐ</div>
           <div style={{ position: 'absolute', bottom: '20%', left: '-30px', background: '#0D254C', padding: '15px 30px', borderRadius: '15px', fontWeight: 'bold' }}>Định danh eKYC VNPT AI</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: '30px', left: '80px', color: '#94A3B8', fontSize: '18px' }}>
        Công ty Cổ phần Tập đoàn Công nghệ và Giải pháp nhân lực xây dựng NEXS
      </div>
      <div style={{ position: 'absolute', bottom: '30px', right: '80px', color: '#94A3B8', fontSize: '18px' }}>
        Trang 01 / 32
      </div>
    </AbsoluteFill>
  );
};
