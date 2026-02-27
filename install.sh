#!/bin/bash
set -e
echo "🚀 Setting up project..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js required"; exit 1; }
npm install
if [ ! -f .env ]; then cp .env.example .env; echo "📝 Created .env"; fi
npx prisma generate
npx prisma db push
echo "✅ Setup complete! Run 'npm run dev' to start."
