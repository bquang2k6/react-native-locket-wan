const Router = require("express");
const router = Router();
const handleUpload = require("../middlewares/multipart-upload-support.middleware.js");
const MAX_IMAGE_COUNT = 1;
const MAX_VIDEO_COUNT = 1;

const locketController = require("../controllers/locket.controller.js");
router.post("/login", locketController.login);

router.post(
    "/upload-media",
    handleUpload(MAX_IMAGE_COUNT, MAX_VIDEO_COUNT),
    locketController.uploadMedia
);

router.post("/get-allFriends",
    locketController.getFriends
)

router.post(
    "/refresh-token",
    locketController.refreshToken
)

module.exports = router;
