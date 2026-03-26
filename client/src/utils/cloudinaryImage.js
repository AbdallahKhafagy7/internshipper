/**
 * High-quality Cloudinary delivery for the internship detail gallery only.
 */
const DETAIL_TRANSFORMS = 'f_auto,q_auto:best,w_2400,c_limit';

export function cloudinaryImageUrl(url, variant = 'original') {
  if (!url || typeof url !== 'string') return url;
  if (variant !== 'detail') return url;
  const re = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/.+)$/i;
  if (re.test(url)) {
    return url.replace(re, `$1${DETAIL_TRANSFORMS}/$2`);
  }
  return url;
}
