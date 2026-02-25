-- Migration: Add description column to pages table

-- Add description column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pages' AND column_name = 'description'
  ) THEN
    ALTER TABLE pages ADD COLUMN description TEXT DEFAULT '';
    RAISE NOTICE 'Added description column to pages table';
  ELSE
    RAISE NOTICE 'Description column already exists';
  END IF;
END $$;

-- Update any NULL values to empty string
UPDATE pages SET description = '' WHERE description IS NULL;
