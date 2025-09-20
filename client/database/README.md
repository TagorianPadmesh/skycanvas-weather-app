# Database Setup Instructions

## Applying the Schema to Supabase

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** section
3. Copy the contents of `schema.sql` 
4. Paste into a new query in the SQL Editor
5. Run the query to create all tables and policies

## What this creates:

- **profiles**: User profile information linked to Supabase Auth
- **user_settings**: User preferences (units, refresh intervals, etc.)
- **locations**: Saved cities and favorite locations per user
- **recent_searches**: Quick access to previously searched cities
- **weather_cache**: Cached weather data for offline/fast loading
- **refresh_logs**: Diagnostics for background refresh operations

## Row Level Security (RLS)

All tables have RLS enabled with policies that ensure users can only access their own data.

## Next Steps

After applying the schema, you can:
1. Test authentication flows
2. Save user preferences to the database
3. Cache weather data for offline access
4. Track user's favorite locations