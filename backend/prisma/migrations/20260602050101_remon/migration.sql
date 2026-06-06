-- CreateTable
CREATE TABLE "papers" (
    "id" BIGSERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "cloudinary_url" TEXT NOT NULL,
    "core_problem" TEXT,
    "solution" TEXT,
    "drawbacks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "papers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paper_chunks" (
    "id" BIGSERIAL NOT NULL,
    "paper_id" BIGINT NOT NULL,
    "chunk_text" TEXT NOT NULL,
    "page_number" INTEGER,

    CONSTRAINT "paper_chunks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "paper_chunks" ADD CONSTRAINT "paper_chunks_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "papers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
