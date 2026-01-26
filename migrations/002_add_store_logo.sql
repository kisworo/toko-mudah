-- Migration: Add store_logo column to store_settings
ALTER TABLE store_settings ADD COLUMN store_logo TEXT;
