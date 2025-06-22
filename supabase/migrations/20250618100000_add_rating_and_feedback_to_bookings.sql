ALTER TABLE "public"."bookings"
ADD COLUMN "rating" INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN "feedback" TEXT; 