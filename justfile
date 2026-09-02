default: dev

# Install dependencies
install:
    bun install

# Run the dev server
dev:
    bun run dev

# Build for production
build:
    bun run build

# Preview the production build
preview:
    bun run preview

# Lint the source
lint:
    bun run lint
