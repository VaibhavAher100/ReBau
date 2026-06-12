# 🤝 Contributing Guide

Thank you for considering contributing to BauBay! This guide will help you get started.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the issue, not the person
- Help create a welcoming environment

---

## How to Contribute

### Reporting Bugs 🐛

1. **Search existing issues** to avoid duplicates
2. **Use the bug template** when creating a new issue
3. **Include details:**
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser and OS version
   - Console errors

**Example:**
```
Title: Scanner crashes on large images

Description:
When uploading images larger than 5MB, the scanner component crashes with "Out of memory" error.

Steps to reproduce:
1. Click "Scan New Items"
2. Upload image > 5MB
3. Click "Analyze"

Expected: Analysis completes successfully
Actual: App crashes, console shows memory error

Environment:
- Browser: Chrome 120
- OS: macOS 14.0
- Image size: 8.2MB
```

---

### Suggesting Features 💡

1. **Check roadmap** first: [docs/roadmap.md](./roadmap.md)
2. **Search existing requests**
3. **Describe the use case** clearly
4. **Explain the benefit** to users
5. **Provide examples** or mockups

---

### Pull Requests 🔧

#### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/BauBay.git
cd BauBay
```

#### 2. Create a Branch

```bash
# Use descriptive names
git checkout -b feature/add-dark-mode
git checkout -b fix/scanner-memory-leak
git checkout -b docs/update-installation
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests

#### 3. Make Changes

Follow our [Code Style Guide](./code-style.md):

```typescript
// ✅ Good
const handleSubmit = async (item: MaterialItem) => {
  try {
    await saveItem(item)
    showNotification('Saved successfully')
  } catch (error) {
    console.error('Save failed:', error)
    showNotification('Save failed')
  }
}

// ❌ Bad
const submit = (i: any) => {
  saveItem(i)
  alert('saved')
}
```

#### 4. Test Your Changes

```bash
# Run development server
npm run dev

# Check TypeScript errors
npx tsc --noEmit

# Build to verify
npm run build
```

Manual testing checklist:
- [ ] Feature works as expected
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Works in Chrome, Safari, Firefox
- [ ] No TypeScript errors
- [ ] Code follows style guide

#### 5. Commit Changes

Use clear, descriptive commit messages:

```bash
# Good commit messages
git commit -m "feat: add dark mode toggle to settings"
git commit -m "fix: resolve scanner memory leak on large images"
git commit -m "docs: update installation guide with troubleshooting"

# Bad commit messages
git commit -m "update"
git commit -m "fix bug"
git commit -m "changes"
```

Commit message format:
```
<type>: <description>

[optional body]
[optional footer]
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting, missing semicolons
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance

#### 6. Push and Create PR

```bash
# Push to your fork
git push origin feature/add-dark-mode
```

On GitHub:
1. Click "Compare & pull request"
2. Fill out the PR template
3. Link related issues
4. Request review

**PR Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Testing
- [ ] Tested locally
- [ ] No TypeScript errors
- [ ] Works on mobile
- [ ] Tested in multiple browsers

## Screenshots
[If applicable]

## Related Issues
Fixes #123
```

---

## Development Workflow

### 1. Local Setup

```bash
# Install dependencies
npm install

# Create .env.local
echo "VITE_GEMINI_API_KEY=your_key" > .env.local

# Start dev server
npm run dev
```

### 2. Development

- Make changes in small, logical commits
- Test frequently
- Check console for errors
- Verify responsive design

### 3. Before Submitting

```bash
# Check types
npx tsc --noEmit

# Format code (if prettier installed)
npx prettier --write .

# Build test
npm run build
```

---

## Code Review Process

### What We Look For

✅ **Good:**
- Clear, descriptive variable names
- Proper TypeScript types
- Error handling
- Comments for complex logic
- Responsive design
- No console errors

❌ **Needs Improvement:**
- `any` types
- Missing error handling
- Magic numbers without explanation
- Deeply nested code
- Duplicate code
- Poor performance

### Review Feedback

- **Approve** - Ready to merge
- **Request changes** - Issues must be addressed
- **Comment** - Suggestions (optional)

### Responding to Feedback

```bash
# Make requested changes
git add .
git commit -m "refactor: address review comments"
git push origin feature/branch-name
```

---

## First-Time Contributors

New to open source? Start here:

### Good First Issues

Look for issues labeled:
- `good first issue` - Easy to tackle
- `help wanted` - We need help
- `documentation` - Docs improvements

### Simple Contributions

- Fix typos in documentation
- Improve error messages
- Add code comments
- Update README
- Add examples to docs

### Getting Help

Stuck? Ask for help:
- Comment on the issue
- Join discussions
- Ask maintainers

---

## Project Structure

```
baubay_2/
├── components/       # React components
├── services/         # API integrations
├── docs/            # Documentation
├── types.ts         # TypeScript types
└── App.tsx          # Main app
```

When adding features:
- New components → `components/`
- API integrations → `services/`
- Types → `types.ts`
- Documentation → `docs/`

---

## Style Guidelines

### TypeScript

```typescript
// Use interfaces for objects
interface Props {
  item: MaterialItem
  onAction: (item: MaterialItem) => void
}

// Use enums for constants
enum Status {
  PENDING = 'pending',
  APPROVED = 'approved'
}

// Always type function parameters and returns
const calculateTotal = (items: MaterialItem[]): number => {
  return items.reduce((sum, item) => sum + item.estimatedValue, 0)
}
```

### React

```typescript
// Functional components only
const Component: React.FC<Props> = ({ item, onAction }) => {
  const [state, setState] = useState<Type>(initial)
  
  useEffect(() => {
    // Side effects
  }, [dependencies])
  
  return <div>{/* JSX */}</div>
}

export { Component }
```

### CSS/Tailwind

```typescript
// Use Tailwind utilities
<div className="flex items-center gap-4 p-6 rounded-xl bg-white shadow-lg">

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Conditional classes
<div className={`btn ${isActive ? 'btn-active' : 'btn-default'}`}>
```

---

## Testing (Future)

When tests are added:

```bash
# Run tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

---

## Documentation

When adding features, update:

1. **Code comments** - Complex logic
2. **Component docs** - `docs/components.md`
3. **README** - If user-facing change
4. **Type docs** - `docs/types.md`
5. **Examples** - `docs/reference/code-examples.md`

---

## Release Process

**For Maintainers:**

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create git tag
4. Push to main
5. Create GitHub release
6. Deploy to production

---

## Recognition

Contributors will be:
- Listed in README
- Mentioned in release notes
- Given credit in commits

---

## Questions?

- **General:** GitHub Discussions
- **Bugs:** GitHub Issues
- **Security:** Email maintainers privately

---

**Thank you for contributing to BauBay!** 🎉

Every contribution, no matter how small, helps make construction more sustainable.
