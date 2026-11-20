import { useState } from "react";

// Shows the recipe photo, or a plain block with the category if there is no image
// or the image fails to load.
export default function RecipeImage({ src, category }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className="image-placeholder">{category}</div>;
  return <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} />;
}
