# Somerset Window Cleaning - Decision Log

## 2025-09-10
- Restructured codebase into frontend/backend/shared folders
- Added pgvector to Supabase; created kb_items table for SOPs/pricing
- Implemented RAG endpoint at /api/assistant/answer for knowledge queries
- Removed 73+ screenshot/log files; cleaned test artifacts
- Set 7 absolute rules in CLAUDE.md for consistent development
- Stack decision: Astro+Vercel (frontend), Supabase (backend), EmailJS (client-side)
- Removed backend folder; full Supabase + EmailJS client-side implementation
- Created SupabaseBookingForm component with direct DB integration
- Added RLS policies for secure client-side database access
- Implemented Supabase Edge Function for assistant/RAG queries
- Reverted to single-folder structure (removed frontend/backend split)
- Cleaned up 20+ unnecessary folders and test files
- Removed 36+ debug/test/monitor scripts (screenshot-*.js, monitor-*.sh, etc)

## 2025-09-09
- Initial project setup with Astro 5.0 and Tailwind CSS
- Integrated Supabase for bookings and contact forms
- Deployed to Vercel with automatic GitHub deploys