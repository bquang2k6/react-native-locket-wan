export const buildMediaFile = (
  uri: string,
  type: "image" | "video"
) => {
  const fileExt = type === "image" ? "jpg" : "mp4";

  return {
    uri,
    name: `media_${Date.now()}.${fileExt}`,
    type: type === "image" ? "image/jpeg" : "video/mp4",
  };
};
