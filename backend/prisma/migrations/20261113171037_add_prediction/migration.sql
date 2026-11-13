-- CreateTable
CREATE TABLE "Prediction" (
    "id" SERIAL NOT NULL,
    "component" TEXT NOT NULL,
    "probability" INTEGER NOT NULL,
    "risk" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "droneId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_droneId_fkey" FOREIGN KEY ("droneId") REFERENCES "Drone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
