# Initialize Reviews Platform Project

Execute this command to set up the entire project structure and install dependencies.

## Steps to Execute

1. **Install Dependencies**
Since package.json is already configured with all dependencies, simply run:
```bash
npm install
```

This will install all the required packages including:
- Next.js 15.5.2 with React 19.1.0
- Tailwind CSS v4 with PostCSS
- Prisma v6.2.0 for database ORM
- NextAuth v5.1.0 for authentication
- Radix UI components for accessible UI
- React Hook Form with Zod validation
- Recharts for data visualization
- And all other necessary dependencies

2. **Initialize Prisma**
```bash
npx prisma init
```

Note: Tailwind CSS v4 is already configured with @tailwindcss/postcss in your package.json

3. **Create Project Structure**
```bash
mkdir -p app/api
mkdir -p app/r/[code]
mkdir -p app/admin
mkdir -p app/client
mkdir -p components/ui
mkdir -p components/reviews
mkdir -p components/admin
mkdir -p components/client
mkdir -p lib/api
mkdir -p lib/validators
mkdir -p lib/services
mkdir -p prisma
mkdir -p public
mkdir -p styles
```

4. **Set Up Environment Variables**
Create `.env.local`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/reviews_platform"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

5. **Initialize Database**
```bash
npx prisma generate
npx prisma db push  # For development, or use migrate for production
```

6. **Run Development Server**
```bash
npm run dev
```

## Validation
- [ ] All dependencies installed
- [ ] Project structure created
- [ ] Database connected
- [ ] Development server running
- [ ] TypeScript configured