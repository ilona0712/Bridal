-- Silhouette is now stored as an attribute value in dress_attribute_values.
-- Remove the redundant column from the dresses table.
ALTER TABLE dresses DROP COLUMN IF EXISTS silhouette;
