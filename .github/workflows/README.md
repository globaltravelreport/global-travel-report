# GitHub Actions Workflows

GitHub Actions is now used for repository checks and manual/support workflows only.

Daily story generation is handled by the Supabase/Vercel story pipeline, not by GitHub Actions. Do not reintroduce scheduled workflows that generate or commit stories from `content/articles`; that creates a second publishing path and can cause duplicate stories, stale dates, and inconsistent metadata.

Active workflow categories:

- `ci.yml`: lint, typecheck, build, and image validation.
- `security-audit.yml`: scheduled dependency/security reporting.
- PR helpers: auto assignment, labelling, and template validation.
- `social-media-dispatch.yml`: repository-dispatch entrypoint only.
