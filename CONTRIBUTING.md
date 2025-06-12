# Contributing to Shinmen Takezo IDE

Thank you for your interest in contributing to Shinmen Takezo IDE! This document provides guidelines and information for contributors.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:
- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain a professional environment

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Git
- Basic knowledge of React, TypeScript, and Next.js

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/shinmen-takezo-ide.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`
5. Start development server: `npm run dev`

## 📝 Contribution Types

### 🐛 Bug Reports
- Use the bug report template
- Include steps to reproduce
- Provide system information
- Add screenshots if applicable

### ✨ Feature Requests
- Use the feature request template
- Explain the use case
- Provide mockups if possible
- Consider implementation complexity

### 🔧 Code Contributions
- Follow the coding standards
- Add tests for new features
- Update documentation
- Ensure all tests pass

## 🏗️ Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### Component Structure
```typescript
// components/example/ExampleComponent.tsx
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ExampleComponentProps {
  title: string
  onAction?: () => void
}

export function ExampleComponent({ title, onAction }: ExampleComponentProps) {
  const [isActive, setIsActive] = useState(false)

  return (
    <div className={cn("base-styles", isActive && "active-styles")}>
      <h2>{title}</h2>
      {onAction && (
        <button onClick={onAction}>Action</button>
      )}
    </div>
  )
}
```

### File Organization
- Components: `components/[category]/ComponentName.tsx`
- Utilities: `lib/utilityName.ts`
- Types: `types/categoryName.ts`
- Hooks: `hooks/useHookName.ts`

### Styling Guidelines
- Use Tailwind CSS classes
- Follow the design system
- Use CSS variables for themes
- Avoid inline styles

### Testing
- Write unit tests for utilities
- Add integration tests for components
- Test AI integration thoroughly
- Ensure cross-browser compatibility

## 🔄 Pull Request Process

### Before Submitting
1. Ensure your code follows the style guide
2. Run tests: `npm test`
3. Run linting: `npm run lint`
4. Update documentation if needed
5. Test your changes thoroughly

### PR Requirements
- Clear title and description
- Link to related issues
- Include screenshots for UI changes
- Add tests for new functionality
- Update CHANGELOG.md

### Review Process
1. Automated checks must pass
2. Code review by maintainers
3. Address feedback promptly
4. Squash commits before merge

## 🏷️ Commit Guidelines

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples
```
feat(editor): add auto-save functionality
fix(terminal): resolve command history bug
docs(readme): update installation instructions
```

## 🧪 Testing Guidelines

### Unit Tests
```typescript
// lib/__tests__/utils.test.ts
import { formatFileSize } from '../utils'

describe('formatFileSize', () => {
  it('should format bytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1 KB')
    expect(formatFileSize(1048576)).toBe('1 MB')
  })
})
```

### Component Tests
```typescript
// components/__tests__/ExampleComponent.test.tsx
import { render, screen } from '@testing-library/react'
import { ExampleComponent } from '../ExampleComponent'

describe('ExampleComponent', () => {
  it('should render title', () => {
    render(<ExampleComponent title="Test Title" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })
})
```

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for public APIs
- Include usage examples
- Document complex algorithms
- Explain non-obvious code

### README Updates
- Keep installation instructions current
- Update feature lists
- Add new configuration options
- Include troubleshooting tips

## 🐛 Debugging

### Common Issues
- **Build Errors**: Check TypeScript types
- **Runtime Errors**: Check browser console
- **AI Integration**: Verify API keys
- **File System**: Clear IndexedDB if needed

### Debug Tools
- React Developer Tools
- Redux DevTools (if using Redux)
- Browser Network tab
- Console logging

## 🚀 Release Process

### Version Numbering
- Major: Breaking changes
- Minor: New features
- Patch: Bug fixes

### Release Checklist
1. Update version in package.json
2. Update CHANGELOG.md
3. Create release notes
4. Tag the release
5. Deploy to production

## 📞 Getting Help

### Communication Channels
- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: General questions and ideas
- Discord: Real-time chat (if available)
- Email: Direct contact for sensitive issues

### Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Monaco Editor API](https://microsoft.github.io/monaco-editor/api/)

## 🎯 Roadmap

### Short Term
- [ ] WebContainer integration
- [ ] Git integration
- [ ] Plugin system
- [ ] Real-time collaboration

### Long Term
- [ ] Mobile app
- [ ] Desktop app
- [ ] Cloud synchronization
- [ ] Advanced debugging tools

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project website
- Annual contributor highlights

Thank you for contributing to Shinmen Takezo IDE! Together, we're building the future of web-based development environments.

---

*"The way is in training."* - Miyamoto Musashi
