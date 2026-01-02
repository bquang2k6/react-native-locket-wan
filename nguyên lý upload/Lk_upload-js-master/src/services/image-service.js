const sharp = require('sharp');
const fs = require('fs');
const { logInfo, logError } = require("./logger.service.js");

const compressImageSharp = async (imagePath, outputPath, maxSize = 1024 * 1024) => {

    let imageSize = fs.statSync(imagePath).size;
    logInfo("compressImageSharp", "Nén ảnh bắt đầu");
    logInfo("compressImageSharp", `Dung lượng ảnh trước khi nén: ${(imageSize / 1024 / 1024).toFixed(2)} MB`);
    let quality = 80;
    
    if (imageSize < maxSize) {
        logInfo("compressImageSharp", "Ảnh đã nhỏ hơn 1MB, không cần nén");
        return imagePath;
    }

    let buffer = await sharp(imagePath)
        .webp({ quality })
        .toBuffer();

    while (buffer.length > maxSize && quality > 30) {
        quality -= 10;
        buffer = await sharp(imagePath)
            .webp({ quality })
            .toBuffer();
    }

    if (buffer.length > maxSize) {
        logError("compressImageSharp", "Không thể nén ảnh xuống dưới 1MB.");
        throw new Error("Không thể nén ảnh xuống dưới 1MB.");
    }

    fs.writeFileSync(outputPath, buffer);
    logInfo("compressImageSharp", "Nén ảnh thành công");
    logInfo("compressImageSharp", `Dung lượng ảnh sau khi nén: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
    fs.unlinkSync(imagePath);
    return outputPath;
};


module.exports = compressImageSharp;
