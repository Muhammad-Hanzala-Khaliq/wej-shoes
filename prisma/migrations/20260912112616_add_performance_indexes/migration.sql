-- CreateIndex
CREATE INDEX "addresses_user_id_idx" ON "addresses"("user_id");

-- CreateIndex
CREATE INDEX "categories_gender_idx" ON "categories"("gender");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- CreateIndex
CREATE INDEX "orders_order_status_created_at_idx" ON "orders"("order_status", "created_at");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_hash_idx" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "products_status_deleted_at_idx" ON "products"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "products_is_featured_idx" ON "products"("is_featured");
