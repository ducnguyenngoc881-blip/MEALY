import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

export const Slide3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const yOffset = spring({ frame, fps, config: { damping: 14 } });
  const contentY = interpolate(yOffset, [0, 1], [50, 0]);

  return (
    <AbsoluteFill style={{
      background: '#FFFFFF',
      color: '#000000',
      padding: '80px',
      fontFamily: 'sans-serif',
      opacity
    }}>
      <h1 style={{ color: '#0D254C', borderBottom: '3px solid #F59E0B', paddingBottom: '20px' }}>
        THƯ NGỎ CHỦ TỊCH HỘI ĐỒNG QUẢN TRỊ
      </h1>
      
      <div style={{ display: 'flex', gap: '60px', marginTop: '40px', transform: `translateY(${contentY}px)` }}>
        {/* Left Column: Letter */}
        <div style={{ flex: 0.65, fontSize: '20px', lineHeight: '1.8', color: '#334155' }}>
           <p><strong>Kính gửi:</strong> Quý Đối tác, Quý Doanh nghiệp và Cộng đồng nhân lực ngành Xây dựng.</p>
           <p>
            Hơn hai thập kỷ gắn bó với ngành xây dựng, tôi có cơ hội đồng hành cùng nhiều doanh nghiệp, kỹ sư, 
            kiến trúc sư, nhà quản lý... Tôi nhận thức sâu sắc rằng: nguồn lực cốt lõi của ngành xây dựng 
            trước hết nằm ở con người.
           </p>
           <p>
            Đó là lý do NEXS ra đời. NEXS hướng tới kiến tạo một hệ sinh thái nhân lực ngành xây dựng, 
            nơi mỗi cá nhân có thể xây dựng hồ sơ nghề nghiệp rõ ràng, được ghi nhận năng lực, 
            kinh nghiệm và uy tín...
           </p>
           <p>
            Cùng kết nối – Cùng kiến tạo – Cùng phát triển.
           </p>
           <p style={{ marginTop: '40px', color: '#0D254C' }}>
             <strong>NGUYỄN CẢNH DINH</strong><br/>
             Chủ tịch Tập đoàn NEXS
           </p>
        </div>

        {/* Right Column: Portrait */}
        <div style={{ flex: 0.35, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <div style={{ 
             width: '100%', 
             height: '500px', 
             background: '#E2E8F0', 
             borderRadius: '16px',
             boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
             display: 'flex',
             justifyContent: 'center',
             alignItems: 'center'
           }}>
             <span style={{ color: '#94A3B8' }}>[Portrait Image]</span>
           </div>
           <div style={{ 
             background: '#0D254C', 
             color: '#FBBF24', 
             padding: '15px 30px', 
             borderRadius: '30px', 
             marginTop: '20px', 
             fontWeight: 'bold',
             fontSize: '20px'
           }}>
             Chủ tịch HĐQT – Nhà sáng lập
           </div>
        </div>
      </div>
      
      {/* Footer */}
      <div style={{ position: 'absolute', bottom: '30px', left: '80px', color: '#94A3B8', fontSize: '18px' }}>
        Công ty Cổ phần Tập đoàn Công nghệ và Giải pháp nhân lực xây dựng NEXS
      </div>
      <div style={{ position: 'absolute', bottom: '30px', right: '80px', color: '#94A3B8', fontSize: '18px' }}>
        Trang 03 / 32
      </div>
    </AbsoluteFill>
  );
};
