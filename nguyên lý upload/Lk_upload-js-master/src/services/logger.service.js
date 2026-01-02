const { format } = require("date-fns");
const fs = require("fs");
const path = require("path");

const green = "\x1b[32m";
const blue = "\x1b[34m";
const red = "\x1b[31m";
const reset = "\x1b[0m";
const orange = "\x1b[33m";

// Tạo thư mục logs nếu chưa tồn tại
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Hàm ghi log vào file
const writeToFile = (level, caller, message) => {
    const dateTime = format(new Date(), "dd-MM-yyyy HH:mm:ss");
    const logFileName = "app.log";
    const logFilePath = path.join(logsDir, logFileName);
    
    const logEntry = `${dateTime} ${level}: [${caller}] ${message}\n`;
    
    try {
        fs.appendFileSync(logFilePath, logEntry);
    } catch (error) {
        console.error(`Error writing to log file: ${error.message}`);
    }
};

const logInfo = (caller, message = "Start") => {
    const dateTime = `${format(new Date(), "dd-MM-yyyy HH:mm:ss")}`;
    
    // Ghi vào file
    writeToFile("INFO", caller, message);
    
    // Vẫn hiển thị trên console
    if (message === "Start") {
        console.log(
            `${green}========================================================================${reset}`
        );
    }

    console.log(
        `${orange}${dateTime} ${green}INFO: [${caller}] ${blue} ${message}${reset}`
    );
};

const logError = (caller, message) => {
    const dateTime = `${format(new Date(), "dd-MM-yyyy HH:mm:ss")}`;
    
    // Ghi vào file
    writeToFile("ERROR", caller, message);
    
    // Vẫn hiển thị trên console
    console.log(
        `${orange}${dateTime} ${red}ERROR: [${caller}] ${message}${reset}`
    );
};

module.exports = {
    logInfo,
    logError,
};
