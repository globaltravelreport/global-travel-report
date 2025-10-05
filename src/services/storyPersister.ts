// Story Persister Service
// Handles markdown file generation, atomic file operations, publishing state, and integration
import type { Story } from '../../types/Story';
import type { ServiceResult, ContentState } from '../types/contentPipeline';
import fs from 'fs/promises';
import path from 'path';

export class StoryPersister {
  async save(story: Story, options: any = {}): Promise<ServiceResult> {
    try {
      const dir = path.join(process.cwd(), 'content', story.category || 'misc');
      await fs.mkdir(dir, { recursive: true });
      const filename = path.join(dir, `${story.date || Date.now()}-${story.slug}.md`);
      const frontmatter = this.generateFrontmatter(story);
      const content = `---\n${frontmatter}\n---\n\n${story.content}`;
      await fs.writeFile(filename, content, { flag: 'w' });
      return { service: 'StoryPersister', success: true, data: { filename } };
    } catch (error: any) {
      return { service: 'StoryPersister', success: false, error: error.message };
    }
  }

  generateFrontmatter(story: Story): string {
    // Simple YAML frontmatter generator
    const fields = Object.entries(story)
      .filter(([k, v]) => k !== 'content')
      .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
      .join('\n');
    return fields;
  }
}

const storyPersister = new StoryPersister();
export default storyPersister;
