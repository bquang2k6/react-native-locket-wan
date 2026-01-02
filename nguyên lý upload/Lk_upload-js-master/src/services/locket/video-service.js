const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static").path;
const { logInfo, logError } = require("../logger.service.js");
const { createFolderIfNotExist } = require("../../helpers/utils.js");

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const unlinkFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            logError("unlinkFile", err);
        }
    });
};

const cropVideo = (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        logInfo("cropVideo", "Cropping video...");
        ffmpeg(inputPath)
            .noAudio()
            .videoFilters([
                'crop=min(iw\\,ih):min(iw\\,ih)'
            ])
            .outputOptions([
                "-movflags +faststart",
                "-preset ultrafast",
                "-r 60"
            ])
            .on("end", () => {
                logInfo("cropVideo", "Video cropped successfully");
                unlinkFile(inputPath);
                resolve(outputPath);
            })
            .on("error", (err) => {
                logError("cropVideo", err);
                reject(err);
            })
            .save(outputPath);
    });
}

const encodeVideoToMp4 = (inputPath) => {
    return new Promise((resolve, reject) => {
        logInfo("encodeVideoToMp4", "Encoding video to mp4...");
        const outputPath = inputPath.replace(/\.webm$/, ".mp4");

        ffmpeg(inputPath)
            .outputOptions([
                "-c copy",
                "-movflags +faststart"
            ])
            .on("end", () => {
                logInfo("encodeVideoToMp4", "Video encoded successfully");
                try {
                    unlinkFile(inputPath);
                }
                catch (err) {
                    logError("unlinkFile", err);
                }
                resolve(outputPath);
            })
            .on("error", (err) => {
                logError("encodeVideoToMp4", err);
                reject(err);
            })
            .save(outputPath);
    });
};

const compressVideo = async (inputPath, outputPath) => {
    logInfo("compressVideo", "Compressing video...");
    const videoSize = fs.statSync(inputPath).size;
    logInfo("compressVideo", `Video size: ${(videoSize / 1024 / 1024).toFixed(2)} MB`);
    
    if (videoSize < 5 * 1024 * 1024) {
        logInfo("compressVideo", "Video đã nhỏ hơn 5MB, không cần nén");
        return inputPath;
    }
    
    if (videoSize > 25 * 1024 * 1024) {
        logError("compressVideo", "Video size exceeds 25MB limit");
        throw new Error("Video size exceeds 25MB limit");
    }

    return new Promise((resolve, reject) => {
        try {
            ffmpeg(inputPath)
                .videoCodec('libx264')
                .noAudio() 
                .outputOptions([
                    '-crf 10', 
                    '-preset superfast', 
                    '-tune zerolatency', 
                    '-profile:v baseline', 
                    '-level 3.0',
                    '-maxrate 2.5M', 
                    '-bufsize 3M',
                    '-threads 1', 
                    '-movflags +faststart',
                    '-x264opts no-cabac:ref=1', 
                    '-rc-lookahead 10',
                    '-r 60'
                ])
                .on('start', cmd => logInfo("compressVideo", `Started: ${cmd}`))
                .on('end', () => {
                    const newSize = fs.statSync(outputPath).size / 1024 / 1024;
                    logInfo("compressVideo", `Video size after compression: ${newSize.toFixed(2)} MB`);
                    logInfo("compressVideo", "Finished encoding");
                    unlinkFile(inputPath);
                    
                    if (newSize > 5) {
                        logInfo("compressVideo", "Video size exceeds 5MB after compression");
                        unlinkFile(outputPath);
                        reject(new Error("Video size exceeds 5MB after compression"));
                    } else {
                        resolve(outputPath);
                    }
                })
                .on('error', err => {
                    logError("compressVideo", err);
                    reject(err);
                })
                .save(outputPath);
        } catch (error) {
            logError("compressVideo", error);
            reject(error);
        }
    });
}

const thumbnailData = async (
    videoPath,
    imageFormat = "jpeg",
    maxWidth = 640,
    quality = 75
) => {
    return new Promise((resolve, reject) => {
        try {
            createFolderIfNotExist(path.join(__dirname, "thumbnails"));
            const tempFilePath = path.join(
                __dirname,
                "thumbnails",
                `thumbnail_${Date.now()}.${imageFormat}`
            );

            ffmpeg(videoPath)
                .on("end", () => {
                    fs.readFile(tempFilePath, (err, data) => {
                        if (err) {
                            logError("thumbnailData", err);
                            reject(err);
                        }

                        // Xoá file tạm sau khi đọc xong
                        unlinkFile(tempFilePath);

                        logInfo(
                            "thumbnailData",
                            "Thumbnail created successfully"
                        );
                        resolve(data);
                    });
                })
                .on("error", (err) => {
                    reject(err);
                    logInfo("thumbnailData", err);
                })
                .screenshots({
                    timestamps: ["50%"],
                    filename: path.basename(tempFilePath),
                    folder: path.join(__dirname, "thumbnails"),
                    size: `${maxWidth}x?`,
                    quality: quality,
                });
        } catch (e) {
            logError("thumbnailData", e);
            reject(e);
        }
    });
};

module.exports = {
    thumbnailData,
    encodeVideoToMp4,
    compressVideo,
    cropVideo
};