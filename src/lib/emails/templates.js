export function passwordResetEmail(resetUrl) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;">
    <div style="background:#000;padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">WEJ Shoes</h1>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#000;margin:0 0 16px;">Password Reset Request</h2>
      <p style="color:#333;line-height:1.6;margin:0 0 24px;">
        We received a request to reset your password for your WEJ Shoes account.
      </p>
      <a href="${resetUrl}" style="display:inline-block;background:#000;color:#fff;padding:14px 28px;text-decoration:none;border-radius:4px;font-weight:600;">
        Reset Password
      </a>
      <p style="margin-top:32px;color:#666;font-size:14px;line-height:1.6;">
        This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
      </p>
    </div>
    <div style="background:#f5f5f5;padding:24px;text-align:center;">
      <p style="color:#999;font-size:12px;margin:0;">© ${new Date().getFullYear()} WEJ Shoes. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

export function orderConfirmationEmail(order) {
  const items = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eee;color:#333;">${item.productName} (${item.color}/${item.size})</td>
        <td style="padding:12px 0;border-bottom:1px solid #eee;color:#333;text-align:center;">${item.quantity}</td>
        <td style="padding:12px 0;border-bottom:1px solid #eee;color:#333;text-align:right;">PKR ${Number(item.totalPrice).toLocaleString("en-PK")}</td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;">
    <div style="background:#000;padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">WEJ Shoes</h1>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#000;margin:0 0 8px;">Order Confirmed!</h2>
      <p style="color:#666;margin:0 0 24px;">Thank you for your order <strong>#${order.orderNumber}</strong></p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="border-bottom:2px solid #000;">
            <th style="padding:12px 0;text-align:left;color:#000;font-weight:600;">Item</th>
            <th style="padding:12px 0;text-align:center;color:#000;font-weight:600;">Qty</th>
            <th style="padding:12px 0;text-align:right;color:#000;font-weight:600;">Total</th>
          </tr>
        </thead>
        <tbody>${items}</tbody>
      </table>

      <div style="border-top:2px solid #000;padding-top:16px;margin-top:8px;">
        <table style="width:100%;">
          <tr>
            <td style="padding:4px 0;color:#666;">Subtotal</td>
            <td style="padding:4px 0;text-align:right;color:#333;">PKR ${Number(order.subtotal).toLocaleString("en-PK")}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#666;">Shipping</td>
            <td style="padding:4px 0;text-align:right;color:${Number(order.shippingFee) === 0 ? "#16a34a" : "#333"};">${Number(order.shippingFee) === 0 ? "Free" : `PKR ${Number(order.shippingFee).toLocaleString("en-PK")}`}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#000;font-weight:700;font-size:18px;">Total</td>
            <td style="padding:8px 0;text-align:right;color:#000;font-weight:700;font-size:18px;">PKR ${Number(order.totalAmount).toLocaleString("en-PK")}</td>
          </tr>
        </table>
      </div>

      <div style="margin-top:24px;padding:16px;background:#f5f5f5;border-radius:4px;">
        <p style="margin:0 0 4px;color:#333;"><strong>Payment:</strong> Cash on Delivery (COD)</p>
        <p style="margin:0;color:#333;"><strong>Delivery:</strong> 3-5 business days</p>
      </div>

      <p style="margin-top:24px;color:#666;font-size:14px;">
        We'll notify you when your order ships. You can track your order using your order number.
      </p>
    </div>
    <div style="background:#f5f5f5;padding:24px;text-align:center;">
      <p style="color:#999;font-size:12px;margin:0;">© ${new Date().getFullYear()} WEJ Shoes. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}
