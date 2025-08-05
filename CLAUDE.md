# Claude Code Instructions for Studio Booking System

## Build and Lint Commands

When making changes to the codebase, especially TypeScript/React code, run these commands to ensure code quality:

### Build (TypeScript compilation)
```bash
npm run build
```
This command will:
- Run TypeScript compiler to check for type errors
- Build the production bundle with Vite

### Lint (ESLint)
```bash
npm run lint
```
This command will:
- Check for code style issues
- Check for potential bugs
- Ensure TypeScript best practices

### Development Server
```bash
npm run dev
```
This starts the Vite development server for local testing.

## Important Notes

1. Always run `npm run build` after making TypeScript changes to ensure type safety
2. Run `npm run lint` to check for code style issues
3. The project uses TypeScript strict mode - avoid using `any` types
4. When adding new interfaces or types, ensure they're properly defined to avoid type conflicts