const { logInfo } = require("../logger.service");

const imagePostPayload = ({ imageUrl, optionsData }) => {
  const {
    id,
    theme_caption,
    caption,
    text_color,
    colorTop,
    colorBottom,
    icon,
    recipients,
  } = optionsData;
  return [
    {
      data: {
        text: "caption",
        text_color: text_color,
        type: "static_content",
        icon: {
          type: "image",
          data: "https://ineqe.com/wp-content/uploads/2022/02/locket_app_icon-1024x1024.png",
          source: "url",
        },
        max_lines: {
          "@type": "type.googleapis.com/google.protobuf.Int64Value",
          value: "4",
        },
        background: {
          material_blur: "ultra_thin",
          colors: [colorTop, colorBottom],
        },
      },
      alt_text: "caption",
      overlay_id: "caption:ootd",
      overlay_type: "caption",
    },
  ];
};

const imagePostPayloadV2 = ({ imageUrl, optionsData }) => {
  const { id, theme_caption, text_color, colorTop, colorBottom, icon } =
    optionsData;

  return [
    {
      data: {
        text: "Vip pro chưa nè hehe",
        text_color: text_color,
        type: "static_content",
        icon: {
          type: "image",
          data: "https://firebasestorage.googleapis.com:443/v0/b/locket-img/o/users%2FRCQ94Icmh7fvFr5ycLaHJgyQo8j1%2Fpublic%2Fprofile_pic.webp?alt=media&token=9a3036c7-1341-4317-9d72-d656fccbf060",
          source: "url",
        },
        max_lines: 1,
        background: {
          material_blur: "ultra_thin",
          colors: [colorTop, colorBottom],
        },
      },
      alt_text: "Vip pro chưa nè hehe",
      overlay_id: `caption:${id}`,
      overlay_type: "caption",
    },
  ];
};

const imagePostPayloadDefault = ({ imageUrl, optionsData }) => {
  const { caption, recipients } = optionsData;

  if (!caption || caption.trim() === "") {
    return [];
  }

  return [
    {
      data: {
        text: caption,
        text_color: "#FFFFFFE6",
        type: "standard",
        max_lines: 4,
        background: {
          colors: [],
          material_blur: "ultra_thin",
        },
      },
      alt_text: caption,
      overlay_id: "caption:standard",
      overlay_type: "caption",
    },
  ];
};

const imagePostPayloadImageIcon = ({ imageUrl, optionsData }) => {
  const { caption, text_color, color_top, color_bottom, icon, recipients } =
    optionsData;

  const background = {
    material_blur: "ultra_thin",
    colors: color_top && color_bottom ? [color_top, color_bottom] : [],
  };

  return [
    {
      data: {
        text: caption,
        text_color: text_color,
        type: "static_content",
        icon: {
          type: "image",
          data: icon,
          source: "url",
        },
        max_lines: 1,
        background: background,
      },
      alt_text: caption,
      overlay_id: "caption:ootd",
      overlay_type: "caption",
    },
  ];
};

const imagePostPayloadDecorative = ({ imageUrl, optionsData }) => {
  const {
    overlay_id,
    caption,
    text_color,
    color_top,
    color_bottom,
    icon,
    recipients,
  } = optionsData;
  return [
    {
      data: {
        text: caption,
        text_color: text_color,
        type: "static_content",
        icon: {
          type: "emoji",
          data: icon,
        },
        max_lines: {
          "@type": "type.googleapis.com/google.protobuf.Int64Value",
          value: "4",
        },
        background: {
          material_blur: "ultra_thin",
          colors: [color_top, color_bottom],
        },
      },
      alt_text: caption,
      overlay_id: `caption:${overlay_id}`,
      overlay_type: "caption",
    },
  ];
};

const imagePostPayloadCustome = ({ imageUrl, optionsData }) => {
  const {
    overlay_id,
    caption,
    text_color,
    color_top,
    color_bottom,
    icon,
    recipients,
  } = optionsData;
  return [
    {
      data: {
        text: caption,
        text_color: text_color,
        type: "static_content",
        icon: {
          type: "emoji",
          data: icon,
        },
        max_lines: {
          "@type": "type.googleapis.com/google.protobuf.Int64Value",
          value: "4",
        },
        background: {
          material_blur: "ultra_thin",
          colors: [color_top, color_bottom],
        },
      },
      alt_text: caption,
      overlay_id: `caption:miss_you`,
      overlay_type: "caption",
    },
  ];
};

const imagePostPayloadBackGround = ({ imageUrl, optionsData }) => {
  const {
    overlay_id,
    caption,
    text_color,
    color_top,
    color_bottom,
    recipients,
  } = optionsData;

  if (!caption) {
    return [];
  }

  return [
    {
      data: {
        text: caption,
        text_color: text_color,
        type: "static_content",
        max_lines: {
          "@type": "type.googleapis.com/google.protobuf.Int64Value",
          value: "4",
        },
        background: {
          material_blur: "ultra_thin",
          colors: [color_top, color_bottom],
        },
      },
      alt_text: caption,
      overlay_id: overlay_id || "caption:ootd",
      overlay_type: "caption",
    },
  ];
};

const imagePostPayloadImageLink = ({ imageUrl, optionsData }) => {
  const { caption, text_color, color_top, color_bottom, icon, recipients } =
    optionsData;

  const background = {
    material_blur: "ultra_thin",
    colors: color_top && color_bottom ? [color_top, color_bottom] : [],
  };
  return [
    {
      data: {
        text: caption,
        text_color: text_color,
        type: "music",
        icon: {
          type: "image",
          data: "https://res.cloudinary.com/diocloud/image/upload/v1747406421/icon_locket_default_shiga3.png",
          source: "url",
        },
        max_lines: 1,
        payload: {
          preview_url:
            "https://p.scdn.co/mp3-preview/f12389f941b1e55718b06911ce1768bac91ce0dc?cid=f71c515954d84560944cf58409f374a8",
          spotify_url: "https://www.instagram.com/_am.dio",
          isrc: "KRA402100040",
          song_title: "Bấm nút ở dưới để chuyển trang nhé haha :>",
          artist: "DIO",
        },
        background: background,
      },
      alt_text: caption,
      overlay_id: "caption:music",
      overlay_type: "caption",
    },
  ];
};

const imagePostPayloadTime = ({ imageUrl, optionsData }) => {
  const {
    overlay_id,
    caption,
    text_color,
    color_top,
    color_bottom,
    recipients,
  } = optionsData;
  return [
    {
      data: {
        text: caption,
        text_color: "#FFFFFFE6",
        type: "time",
        max_lines: {
          "@type": "type.googleapis.com/google.protobuf.Int64Value",
          value: "4",
        },
        icon: {
          color: "#FFFFFFCC",
          data: "clock.fill",
          type: "sf_symbol",
        },
        background: {
          material_blur: "regular",
          colors: [],
        },
      },
      alt_text: caption,
      overlay_id: "caption:time",
      overlay_type: "caption",
    },
  ];
};

const imagePostPayloadReview = ({ imageUrl, optionsData }) => {
  const {
    overlay_id,
    caption,
    icon,
    text_color,
    color_top,
    color_bottom,
    recipients,
  } = optionsData;
  return [
    {
      data: {
        text: `★${icon} - "${caption}"`,
        text_color: "#FFFFFFE6",
        type: "review",
        max_lines: 1,
        payload: {
          comment: caption,
          rating: icon,
        },
        background: {
          material_blur: "regular",
          colors: [],
        },
      },
      alt_text: `★${icon} - "${caption}"`,
      overlay_id: "caption:review",
      overlay_type: "caption",
    },
  ];
};

const imagePostPayloadSpotify = ({ imageUrl, optionsData }) => {
  const { caption, text_color = "#FFFFFFE6", color_top, color_bottom, recipients } = optionsData;

  const background = {
    material_blur: "ultra_thin",
    colors: color_top && color_bottom ? [color_top, color_bottom] : [],
  };

  return [
    {
      data: {
        text: caption,
        text_color: text_color,
        type: "music",
        icon: {
          type: "image",
          data: "https://res.cloudinary.com/diocloud/image/upload/v1747406421/icon_locket_default_shiga3.png",
          source: "url",
        },
        max_lines: 1,
        payload: {
          preview_url: caption,
          spotify_url: caption,
          isrc: "SPOTIFY_LINK",
          song_title: "Tap to open Spotify",
          artist: "Spotify Link",
        },
        background: background,
      },
      alt_text: caption,
      overlay_id: "caption:music",
      overlay_type: "caption",
    },
  ];
};

const createImagePostPayload = ({ type, imageUrl, optionsData }) => {
  switch (type?.toLowerCase()) {
    case 'standard':
    case 'default':
      return imagePostPayloadDefault({ imageUrl, optionsData });
    case 'time':
      return imagePostPayloadTime({ imageUrl, optionsData });
    case 'review':
      return imagePostPayloadReview({ imageUrl, optionsData });
    case 'spotify':
    case 'music':
      return imagePostPayloadSpotify({ imageUrl, optionsData });
    case 'image_icon':
      return imagePostPayloadImageIcon({ imageUrl, optionsData });
    case 'image_gif':
      return imagePostPayloadImageIcon({ imageUrl, optionsData });
    case 'decorative':
      return imagePostPayloadDecorative({ imageUrl, optionsData });
    case 'custome':
      return imagePostPayloadCustome({ imageUrl, optionsData });
    case 'background':
      return imagePostPayloadBackGround({ imageUrl, optionsData });
    case 'v2':
      return imagePostPayloadV2({ imageUrl, optionsData });
    case 'v1':
    default:
      return imagePostPayload({ imageUrl, optionsData });
  }
};

module.exports = {
  imagePostPayload,
  imagePostPayloadV2,
  imagePostPayloadDefault,
  imagePostPayloadDecorative,
  imagePostPayloadCustome,
  imagePostPayloadImageIcon,
  imagePostPayloadBackGround,
  imagePostPayloadImageLink,
  imagePostPayloadTime,
  imagePostPayloadReview,
  imagePostPayloadSpotify,
  createImagePostPayload,
};
