#!/bin/sh
set -eu

echo "[minio-init] Waiting for MinIO..."
until mc alias set medvoice "http://minio:9000" "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}" 2>/dev/null; do
  sleep 2
done

echo "[minio-init] Creating application buckets..."
mc mb --ignore-existing "medvoice/${MINIO_BUCKET_VOICE}"
mc mb --ignore-existing "medvoice/${MINIO_BUCKET_TRANSCRIPTION}"
mc mb --ignore-existing "medvoice/${MINIO_BUCKET_DOCUMENTS}"

echo "[minio-init] Setting private bucket policy..."
mc anonymous set none "medvoice/${MINIO_BUCKET_VOICE}"
mc anonymous set none "medvoice/${MINIO_BUCKET_TRANSCRIPTION}"
mc anonymous set none "medvoice/${MINIO_BUCKET_DOCUMENTS}"

echo "[minio-init] MinIO buckets ready."
