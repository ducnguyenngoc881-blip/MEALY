const googleTTS = require('google-tts-api');
const fs = require('fs');

async function downloadTTS(text, filename) {
  try {
    const results = await googleTTS.getAllAudioBase64(text, {
      lang: 'vi',
      slow: false,
      host: 'https://translate.google.com',
      splitPunct: ',.?'
    });

    const buffers = results.map(res => Buffer.from(res.base64, 'base64'));
    const finalBuffer = Buffer.concat(buffers);
    fs.writeFileSync(filename, finalBuffer);
    console.log(`Saved ${filename}`);
  } catch (err) {
    console.error(err);
  }
}

async function run() {
  await downloadTTS("Chào mừng quý vị đến với Hồ sơ Năng lực Doanh nghiệp năm 2026 của Tập đoàn Công nghệ và Giải pháp Nhân lực Xây dựng NEXS. Nền tảng công nghệ và chuỗi cung ứng nhân lực xây dựng hàng đầu Việt Nam.", "public/slide1.mp3");
  await downloadTTS("Tiếp theo là Mục lục Tổng quan. Chương một và hai sẽ tập trung vào Hồ sơ pháp lý và Bối cảnh thị trường. Chương ba, bốn và năm sẽ đi sâu vào Giải pháp hệ sinh thái công nghệ, Mô hình trạm cơ sở và Hạ tầng đối tác chiến lược.", "public/slide2.mp3");
  await downloadTTS("Hơn hai thập kỷ gắn bó với ngành xây dựng, tôi nhận thức sâu sắc rằng nguồn lực cốt lõi trước hết nằm ở con người. Đó là lý do NEXS ra đời, nhằm kiến tạo một hệ sinh thái nhân lực minh bạch, công bằng và phát triển bền vững.", "public/slide3.mp3");
}

run();
