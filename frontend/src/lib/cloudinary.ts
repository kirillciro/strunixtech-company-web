type CloudinaryResource = {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
};

type CloudinaryResponse = {
  resources?: CloudinaryResource[];
};

export async function getComPlatImages(
  limit = 6,
): Promise<CloudinaryResource[]> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return [];
  }

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const url = new URL(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload`,
  );

  url.searchParams.set("prefix", "com-plat/");
  url.searchParams.set("max_results", String(limit));
  url.searchParams.set("type", "upload");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as CloudinaryResponse;
    return (data.resources ?? []).filter((item) =>
      item.public_id.startsWith("com-plat/"),
    );
  } catch {
    return [];
  }
}
