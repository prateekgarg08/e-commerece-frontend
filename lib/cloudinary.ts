import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "deb6ctgzv",
  api_key: "247651647742876",
  api_secret: "fnTHp6HhHJHhU6GIqtY5EOtU_FY", // Click 'View API Keys' above to copy your API secret
});

async function uploadImage(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const image = await cloudinary.uploader.upload(arrayBuffer.toString());

  return image.url;
}

export { uploadImage };
