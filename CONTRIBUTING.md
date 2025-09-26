# Contributing to Global Travel Report

Thank you for your interest in contributing to Global Travel Report! This guide will help you understand our contribution process and how to use our PR templates effectively.

## Pull Request Process

### 1. Choosing the Right Template

When creating a pull request, you'll be presented with several templates based on the type of change:

- **Bug Fix** (`bugfix.md`): For fixing issues and bugs
- **Feature** (`feature.md`): For new features and enhancements
- **Documentation** (`documentation.md`): For documentation updates
- **Security** (`security.md`): For security-related changes
- **Refactor** (`refactor.md`): For code refactoring
- **Configuration** (`config.md`): For configuration changes
- **Default** (`default.md`): For changes that don't fit other categories

Choose the template that best matches your change. If your PR spans multiple categories, choose the template that matches the primary purpose of your changes.

### 2. Template Guidelines

Each template has specific sections designed to capture important information about your changes:

#### Bug Fix Template
- Clearly describe the bug and its impact
- Include steps to reproduce
- Detail the root cause analysis
- Explain the fix implementation
- Add test cases that verify the fix

#### Feature Template
- Describe the new feature and its value
- Detail technical implementation
- Include performance considerations
- Document testing approach
- Provide usage examples

#### Documentation Template
- Specify what documentation is being changed
- Ensure technical accuracy
- Follow style guidelines
- Include examples where appropriate
- Verify all links work

#### Security Template
- Detail the security impact
- Include CVE references if applicable
- Document testing and verification
- Consider compliance requirements
- Plan for responsible disclosure

#### Refactor Template
- Explain motivation for refactoring
- Document architectural changes
- Include performance impact
- Detail migration strategy
- Provide rollback plan

#### Configuration Template
- List configuration changes
- Document impact on environments
- Include validation steps
- Provide rollback instructions
- Add configuration examples

### 3. Automated Validation

Our PR template validator will automatically check your PR for:
- Required sections based on the template
- Unchecked checkboxes
- Breaking changes
- Security implications

The validator will:
1. Add appropriate labels to your PR
2. Warn about missing sections
3. Flag incomplete checklist items

### 4. Best Practices

1. **Complete All Sections**
   - Fill out all relevant sections in the template
   - Mark N/A for truly non-applicable sections
   - Don't leave sections empty without explanation

2. **Quality Checklist**
   - Review all checklist items
   - Check off items only when completed
   - Add comments for partial completions

3. **Documentation**
   - Update relevant documentation
   - Include code comments
   - Update README if needed
   - Add examples for complex changes

4. **Testing**
   - Add/update tests as needed
   - Verify existing tests pass
   - Include manual testing steps
   - Document edge cases

5. **Review Process**
   - Respond to reviewer comments
   - Update PR based on feedback
   - Keep PR description updated
   - Link related issues/PRs

### 5. Labels and Automation

Your PR will automatically receive labels based on:
- Template type used
- Content analysis
- Completion status
- Security implications

Common labels include:
- `breaking-change`: For changes that break compatibility
- `security-review-needed`: For changes with security impact
- `incomplete`: For PRs with unchecked items
- Template-specific labels (e.g., `bug`, `enhancement`)

## Getting Help

If you need help with:
- Choosing the right template
- Filling out sections
- Understanding requirements
- Technical implementation

Please:
1. Check existing documentation
2. Review similar PRs
3. Ask in PR comments
4. Contact the maintainers

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms. 