const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal CRC32 implementation for standard ZIP archives (.docx)
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createZipBuffer(files) {
  const localHeaders = [];
  const centralHeaders = [];
  let offset = 0;

  for (const file of files) {
    const nameBuf = Buffer.from(file.name, 'utf8');
    const uncompressedBuf = Buffer.isBuffer(file.content)
      ? file.content
      : Buffer.from(file.content, 'utf8');
    const compressedBuf = zlib.deflateRawSync(uncompressedBuf);
    const crc = crc32(uncompressedBuf);

    // Local file header (30 bytes + filename)
    const localHeader = Buffer.alloc(30 + nameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // signature
    localHeader.writeUInt16LE(20, 4);         // version needed
    localHeader.writeUInt16LE(0x0800, 6);     // general purpose bit flag (UTF-8)
    localHeader.writeUInt16LE(8, 8);          // compression method: deflate (8)
    localHeader.writeUInt16LE(0, 10);         // mod time
    localHeader.writeUInt16LE(0, 12);         // mod date
    localHeader.writeUInt32LE(crc, 14);       // crc32
    localHeader.writeUInt32LE(compressedBuf.length, 18); // compressed size
    localHeader.writeUInt32LE(uncompressedBuf.length, 22); // uncompressed size
    localHeader.writeUInt16LE(nameBuf.length, 26); // file name length
    localHeader.writeUInt16LE(0, 28);         // extra field length
    nameBuf.copy(localHeader, 30);

    localHeaders.push(localHeader, compressedBuf);

    // Central directory file header (46 bytes + filename)
    const centralHeader = Buffer.alloc(46 + nameBuf.length);
    centralHeader.writeUInt32LE(0x02014b50, 0); // signature
    centralHeader.writeUInt16LE(20, 4);         // version made by
    centralHeader.writeUInt16LE(20, 6);         // version needed
    centralHeader.writeUInt16LE(0x0800, 8);     // general purpose bit flag (UTF-8)
    centralHeader.writeUInt16LE(8, 10);         // compression method: deflate
    centralHeader.writeUInt16LE(0, 12);         // mod time
    centralHeader.writeUInt16LE(0, 14);         // mod date
    centralHeader.writeUInt32LE(crc, 16);       // crc32
    centralHeader.writeUInt32LE(compressedBuf.length, 20); // compressed size
    centralHeader.writeUInt32LE(uncompressedBuf.length, 24); // uncompressed size
    centralHeader.writeUInt16LE(nameBuf.length, 28); // file name length
    centralHeader.writeUInt16LE(0, 30);         // extra field length
    centralHeader.writeUInt16LE(0, 32);         // file comment length
    centralHeader.writeUInt16LE(0, 34);         // disk number start
    centralHeader.writeUInt16LE(0, 36);         // internal file attributes
    centralHeader.writeUInt32LE(0, 38);         // external file attributes
    centralHeader.writeUInt32LE(offset, 42);    // relative offset of local header
    nameBuf.copy(centralHeader, 46);

    centralHeaders.push(centralHeader);
    offset += localHeader.length + compressedBuf.length;
  }

  const centralDirBuf = Buffer.concat(centralHeaders);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // EOCD signature
  eocd.writeUInt16LE(0, 4);          // disk number
  eocd.writeUInt16LE(0, 6);          // start disk
  eocd.writeUInt16LE(files.length, 8); // entries on disk
  eocd.writeUInt16LE(files.length, 10); // total entries
  eocd.writeUInt32LE(centralDirBuf.length, 12); // size of central dir
  eocd.writeUInt32LE(offset, 16);    // offset of central dir
  eocd.writeUInt16LE(0, 20);         // comment length

  return Buffer.concat([...localHeaders, centralDirBuf, eocd]);
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function pTitle(text) {
  return `<w:p>
    <w:pPr>
      <w:spacing w:before="120" w:after="160"/>
      <w:jc w:val="center"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
        <w:b/>
        <w:color w:val="0F172A"/>
        <w:sz w:val="40"/>
        <w:szCs w:val="40"/>
      </w:rPr>
      <w:t>${escapeXml(text)}</w:t>
    </w:r>
  </w:p>`;
}

function pSubtitle(text) {
  return `<w:p>
    <w:pPr>
      <w:spacing w:before="0" w:after="320"/>
      <w:jc w:val="center"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
        <w:i/>
        <w:color w:val="059669"/>
        <w:sz w:val="24"/>
        <w:szCs w:val="24"/>
      </w:rPr>
      <w:t>${escapeXml(text)}</w:t>
    </w:r>
  </w:p>`;
}

function pHeading1(text) {
  return `<w:p>
    <w:pPr>
      <w:pBdr>
        <w:bottom w:val="single" w:sz="8" w:space="4" w:color="10B981"/>
      </w:pBdr>
      <w:spacing w:before="320" w:after="160"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
        <w:b/>
        <w:color w:val="0F172A"/>
        <w:sz w:val="30"/>
        <w:szCs w:val="30"/>
      </w:rPr>
      <w:t>${escapeXml(text)}</w:t>
    </w:r>
  </w:p>`;
}

function pHeading2(text) {
  return `<w:p>
    <w:pPr>
      <w:spacing w:before="220" w:after="100"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
        <w:b/>
        <w:color w:val="1D4ED8"/>
        <w:sz w:val="25"/>
        <w:szCs w:val="25"/>
      </w:rPr>
      <w:t>${escapeXml(text)}</w:t>
    </w:r>
  </w:p>`;
}

function pBody(text) {
  return `<w:p>
    <w:pPr>
      <w:spacing w:before="60" w:after="140" w:line="300" w:lineRule="auto"/>
      <w:jc w:val="both"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
        <w:color w:val="1E293B"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
      </w:rPr>
      <w:t>${escapeXml(text)}</w:t>
    </w:r>
  </w:p>`;
}

function pBullet(boldPrefix, restText) {
  return `<w:p>
    <w:pPr>
      <w:ind w:left="480" w:hanging="240"/>
      <w:spacing w:before="60" w:after="100" w:line="280" w:lineRule="auto"/>
      <w:jc w:val="both"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
        <w:b/>
        <w:color w:val="059669"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
      </w:rPr>
      <w:t>•  </w:t>
    </w:r>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
        <w:b/>
        <w:color w:val="0F172A"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
      </w:rPr>
      <w:t>${escapeXml(boldPrefix)}</w:t>
    </w:r>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
        <w:color w:val="1E293B"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
      </w:rPr>
      <w:t>${escapeXml(restText)}</w:t>
    </w:r>
  </w:p>`;
}

const bodyParagraphs = [
  pTitle('HỒ SƠ GIỚI THIỆU ỨNG DỤNG MEALY'),
  pSubtitle('Giải Pháp Lên Thực Đơn Mâm Cơm Việt, Đi Chợ Chung & Quản Lý Tủ Lạnh Thông Minh'),

  pHeading1('1. Mealy là gì?'),
  pBody('Mealy là ứng dụng di động thông minh được thiết kế chuyên biệt cho văn hóa ẩm thực và thói quen sinh hoạt của các gia đình Việt Nam. Thay vì chỉ là một cuốn sổ tra cứu công thức nấu ăn rời rạc, Mealy đóng vai trò như một "Quản gia bếp Việt" toàn diện trên điện thoại (Android & iOS), kết nối liền mạch từ khâu trả lời câu hỏi "Hôm nay ăn gì?", lên lịch thực đơn 7 ngày, tự động tổng hợp giỏ đi chợ theo từng quầy hàng, cho đến quản lý nguyên liệu tồn trong tủ lạnh và hướng dẫn nấu ăn từng bước.'),
  pBody('Điểm khác biệt cốt lõi của Mealy nằm ở cấu trúc "Mâm Cơm 3 Món Chuẩn Vị Việt" (bao gồm: Món Mặn đậm đà + Món Canh thanh mát + Món Rau cân bằng). Ứng dụng sở hữu cơ sở dữ liệu hơn 2.200+ món ăn truyền thống và hiện đại trải dài khắp 3 miền Bắc - Trung - Nam, cùng các chế độ ăn chuyên biệt như Ăn Chay Thanh Tịnh, Ít Cay cho trẻ nhỏ, Món Âu Đổi Vị và Chế Độ Giàu Đạm cho người tập luyện thể thao.'),

  pHeading1('2. Mealy giải quyết những vấn đề gì?'),
  pBody('Trong nhịp sống đô thị bận rộn, việc duy trì bữa cơm nhà ấm cúng và đủ chất thường xuyên vấp phải 5 rào cản lớn mà Mealy trực tiếp giải quyết triệt để:'),
  pBullet('Áp lực câu hỏi "Hôm nay ăn gì?" mỗi ngày: ', 'Người nội trợ và người đi làm mất từ 20 đến 30 phút mỗi chiều chỉ để suy nghĩ món ăn sao cho không bị trùng lặp với những ngày trước, hợp khẩu vị cả nhà và cân đối giữa món mặn, món canh, món xào.'),
  pBullet('Vượt ngân sách chi tiêu ăn uống hàng tháng: ', 'Khi đi chợ hoặc siêu thị theo cảm hứng mà không có kế hoạch định lượng rõ ràng, các gia đình rất dễ mua thừa thực phẩm hoặc chọn các món vượt quá ngân sách chi tiêu hàng ngày.'),
  pBullet('Quên nguyên liệu và mất thời gian đi lại nhiều vòng ở chợ: ', 'Việc ghi chép thủ công hoặc nhớ đại khái khiến người đi chợ thường xuyên quên các gia vị, hành ngò hoặc mua trùng lặp những món người thân ở nhà đã mua.'),
  pBullet('Lãng phí thực phẩm héo hỏng trong tủ lạnh: ', 'Rau củ, thịt cá mua về cất vào ngăn mát hoặc ngăn đá nhưng không được theo dõi hạn sử dụng, dẫn đến tình trạng để quên tới khi hỏng phải bỏ đi, gây lãng phí hàng trăm nghìn đồng mỗi tháng.'),
  pBullet('Lúng túng khi vào bếp hoặc khi nhà có tiệc tùng, giỗ chạp: ', 'Người mới tập nấu ăn hoặc người trẻ bận rộn thường ngại nấu các món truyền thống vì sợ nêm nếm sai tỉ lệ, không biết sơ chế khử mùi tanh hay ước lượng nguyên liệu khi gia đình tăng/giảm số người ăn.'),

  pHeading1('3. Tại sao người dùng yêu thích và sử dụng Mealy mỗi ngày?'),
  pBody('Mealy chinh phục người dùng nhờ trải nghiệm di động mượt mà, thao tác một chạm bằng một tay và hệ sinh thái 6 tính năng thông minh khép kín:'),

  pHeading2('3.1. Gợi Ý Mâm Cơm 3 Món Chuẩn Vị Chỉ Với 1 Chạm'),
  pBullet('Đổi mâm tức thì: ', 'Ngay tại màn hình Hôm Nay, Mealy gợi ý sẵn các mâm cơm 3 món (Mặn - Canh - Rau) hài hòa về hương vị, màu sắc, lượng calo và chi phí dự kiến.'),
  pBullet('Cá nhân hóa theo vùng miền & lịch sinh hoạt: ', 'Tự động lọc theo khẩu vị Miền Bắc, Miền Trung, Miền Nam và hỗ trợ chế độ "Bữa trưa bán trú / Đi làm" để chỉ lên lịch nấu bữa sáng và bữa tối sum họp từ Thứ Hai đến Thứ Sáu.'),

  pHeading2('3.2. Thực Đơn Cả Tuần Tự Động Cân Đối Ngân Sách & Dinh Dưỡng'),
  pBullet('Lên lịch 7 ngày trong 1 giây: ', 'Thuật toán thông minh tự động xếp 21 bữa ăn trong tuần không trùng lặp món chính, bám sát mức ngân sách gia đình chọn (Tiết kiệm, Vừa phải, Thoải mái).'),
  pBullet('Tự động nhân chia khẩu phần: ', 'Dù bạn sống một mình (1 người) hay đại gia đình (4 - 10 người), Mealy tự động tính toán lại khối lượng từng nguyên liệu, chi phí và lượng đạm tương ứng.'),

  pHeading2('3.3. Danh Sách Đi Chợ Thông Minh & Phòng Đi Chợ Chung Thời Gian Thực'),
  pBullet('Tự động gộp nguyên liệu theo quầy: ', 'Toàn bộ nguyên liệu của cả tuần được cộng dồn chính xác (ví dụ: tổng số quả trứng, số gram thịt heo, số bó rau) và phân loại gọn gàng theo Quầy Thịt Cá, Quầy Rau Củ và Quầy Gia Vị.'),
  pBullet('Đi chợ chung trực tuyến: ', 'Thành viên trong gia đình có thể mở "Phòng Mua Chung" qua mã phòng hoặc mã QR. Khi vợ hoặc chồng tích chọn một bó rau ở siêu thị, màn hình của người kia lập tức cập nhật theo thời gian thực kèm tên người đã nhặt món đó.'),

  pHeading2('3.4. Tủ Lạnh Thông Minh & Cứu Nguy Thực Phẩm Sắp Hết Hạn'),
  pBullet('Chuyển thẳng từ giỏ đi chợ vào tủ lạnh: ', 'Sau khi đi chợ xong, chỉ cần bấm "Cất Vào Tủ Lạnh", mọi thực phẩm vừa mua sẽ tự động được phân vào Ngăn Đá, Ngăn Mát và Ngăn Rau Củ kèm thời hạn bảo quản.'),
  pBullet('Cảnh báo "Ăn Gấp" & Gợi ý món vét tủ: ', 'Mealy ưu tiên nhắc nhở các nguyên liệu còn dưới 2 ngày sử dụng và đề xuất ngay những món ăn tận dụng tối đa thực phẩm sẵn có trong tủ, giúp tiết kiệm chi phí và chống lãng phí.'),

  pHeading2('3.5. Sổ Tay 2.200+ Công Thức & Chế Độ Thực Hành Từng Bước'),
  pBullet('Chuẩn bị nguyên liệu khoa học: ', 'Danh sách sơ chế đánh dấu trực tiếp những nguyên liệu đã "Có sẵn trong tủ lạnh" để bạn lấy ra sơ chế, hoàn toàn chủ động tích chọn từng món khi đã rửa và cắt thái xong.'),
  pBullet('Chế độ Thực Hành rảnh tay: ', 'Trình bày từng bước nấu với chữ lớn dễ đọc từ xa, tích hợp bộ hẹn giờ đếm ngược ngay trong từng công đoạn hầm, kho, chiên, xào và mẹo khử mùi tanh từ đầu bếp.'),

  pHeading2('3.6. Lên Thực Đơn Đãi Tiệc & Giải Trí Bàn Tiệc Gia Đình'),
  pBullet(' hơn 50+ mẫu mâm cỗ truyền thống & hiện đại: ', 'Hỗ trợ lên thực đơn tiệc tân gia, sinh nhật, đám giỗ, họp mặt cuối tuần từ 10 đến 200 khách, tự động tính số bàn, danh sách thiết bị bát đĩa cần chuẩn bị và tổng dự toán chi phí.'),
  pBullet('Khu vực giải trí gắn kết: ', 'Tích hợp các trò chơi vui nhộn như Mở Hòm Bữa Cơm và Vòng Quay Bàn Tiệc để khuấy động không khí sum họp gia đình, bạn bè.'),

  pHeading1('4. Kết luận: Giá trị bền vững của Mealy'),
  pBody('Mealy không chỉ giúp tiết kiệm từ 3 đến 5 giờ suy nghĩ và đi chợ mỗi tuần, giảm thiểu tới 30% lượng thực phẩm lãng phí trong tủ lạnh, mà quan trọng hơn cả là giữ lửa cho gian bếp Việt. Nhờ sự kết hợp giữa dữ liệu ẩm thực truyền thống chuẩn vị và công nghệ đồng bộ đám mây hiện đại, bất kỳ ai — từ người nội trợ dày dặn kinh nghiệm đến các bạn trẻ lần đầu vào bếp — đều có thể tự tin nấu những mâm cơm ngon lành, kinh tế và trọn vẹn yêu thương mỗi ngày.')
];

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyParagraphs.join('\n    ')}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const wordRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

const zipBuf = createZipBuffer([
  { name: '[Content_Types].xml', content: contentTypesXml },
  { name: '_rels/.rels', content: relsXml },
  { name: 'word/_rels/document.xml.rels', content: wordRelsXml },
  { name: 'word/document.xml', content: documentXml }
]);

const outRoot = path.resolve(__dirname, '..', 'Gioi_Thieu_Ung_Dung_Mealy.docx');
const outPublic = path.resolve(__dirname, '..', 'public', 'Gioi_Thieu_Ung_Dung_Mealy.docx');

fs.writeFileSync(outRoot, zipBuf);
fs.writeFileSync(outPublic, zipBuf);

console.log('Generated DOCX successfully:', outRoot, zipBuf.length, 'bytes');
