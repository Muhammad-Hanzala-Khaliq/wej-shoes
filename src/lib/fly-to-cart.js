export function flyToCart({ imageUrl, sourceEl, duration = 800 } = {}) {
  if (typeof window === "undefined") return;

  const target = document.querySelector("[data-cart-target]");
  if (!target || !sourceEl) {
    window.dispatchEvent(new CustomEvent("cart:bump"));
    return;
  }

  const sourceRect = sourceEl.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  const startX = sourceRect.left + sourceRect.width / 2;
  const startY = sourceRect.top + sourceRect.height / 2;
  const endX = targetRect.left + targetRect.width / 2;
  const endY = targetRect.top + targetRect.height / 2;

  const dx = endX - startX;
  const dy = endY - startY;

  const flyer = document.createElement("div");
  flyer.style.cssText = `
    position: fixed;
    left: ${startX}px;
    top: ${startY}px;
    width: 56px;
    height: 56px;
    margin-left: -28px;
    margin-top: -28px;
    z-index: 9999;
    pointer-events: none;
    border-radius: 9999px;
    overflow: hidden;
    border: 2px solid white;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  `;

  if (imageUrl) {
    const img = document.createElement("img");
    img.src = imageUrl;
    img.style.cssText = "width: 100%; height: 100%; object-fit: cover;";
    flyer.appendChild(img);
  }

  document.body.appendChild(flyer);

  const animation = flyer.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 90}px) scale(0.7)`, opacity: 0.95 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.15)`, opacity: 0.5 },
    ],
    {
      duration,
      easing: "cubic-bezier(0.3, 0.7, 0.4, 1)",
      fill: "forwards",
    }
  );

  animation.onfinish = () => {
    flyer.remove();
    window.dispatchEvent(new CustomEvent("cart:bump"));
  };
}
