/**
 * Service for suggesting skills based on position using Llama AI
 */

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import Groq from 'groq-sdk';

@Injectable()
export class SkillSuggestionService {
  private readonly logger = new Logger(SkillSuggestionService.name);
  private groq: Groq | null = null;
  private readonly model = 'llama-3.3-70b-versatile';

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      this.groq = new Groq({
        apiKey: apiKey,
      });
      this.logger.log('✅ Skill Suggestion Service initialized with Llama 3.3 70B');
    } else {
      this.logger.warn('⚠️  GROQ_API_KEY not found. Skill suggestions will not be available.');
    }
  }

  /**
   * Get skill suggestions based on position/role
   * @param position - The current position or role
   * @returns Array of suggested skills
   */
  async suggestSkills(position: string): Promise<string[]> {
    try {
      if (!this.groq) {
        throw new HttpException(
          'AI service not configured. Please set GROQ_API_KEY environment variable.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      if (!position || position.trim().length === 0) {
        return [];
      }

      const prompt = `You are a career development expert. Based on the position "${position}", suggest 8-12 essential technical and professional skills that someone in this role should have or develop.

Return ONLY a JSON array of skill names as strings, nothing else. No explanations, no markdown, just a plain JSON array.

Example format: ["JavaScript", "React", "Node.js", "TypeScript", "REST APIs", "Git", "Agile", "Problem Solving"]

Position: ${position}`;

      const messages = [
        {
          role: 'system' as const,
          content: 'You are a helpful career development assistant. Always respond with valid JSON arrays only, no additional text.',
        },
        {
          role: 'user' as const,
          content: prompt,
        },
      ];

      this.logger.log(`🤖 Requesting skill suggestions for position: ${position}`);

      const completion = await this.groq.chat.completions.create({
        messages: messages as any,
        model: this.model,
        temperature: 0.5, // Lower temperature for more consistent results
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content || '[]';
      
      this.logger.log(`📝 Raw AI response: ${response.substring(0, 200)}...`);

      // Try to parse the response
      let skills: string[] = [];
      
      try {
        // Try parsing as JSON object first
        const parsed = JSON.parse(response);
        
        // Check if it's an object with a skills array
        if (parsed.skills && Array.isArray(parsed.skills)) {
          skills = parsed.skills;
        } else if (Array.isArray(parsed)) {
          skills = parsed;
        } else if (typeof parsed === 'object') {
          // Extract array from object if it exists
          const values = Object.values(parsed);
          if (values.length > 0 && Array.isArray(values[0])) {
            skills = values[0] as string[];
          }
        }
      } catch (parseError) {
        // If JSON parsing fails, try to extract skills from text
        this.logger.warn('Failed to parse JSON, attempting text extraction');
        
        // Try to find array-like structure in the response
        const arrayMatch = response.match(/\[(.*?)\]/s);
        if (arrayMatch) {
          try {
            skills = JSON.parse(arrayMatch[0]);
          } catch (e) {
            // Last resort: split by common delimiters
            const lines = response
              .split(/[,\n]/)
              .map(line => line.trim().replace(/["'\[\]]/g, ''))
              .filter(line => line.length > 0 && line.length < 50);
            skills = lines.slice(0, 12); // Limit to 12 skills
          }
        }
      }

      // Clean and validate skills
      skills = skills
        .map(skill => {
          if (typeof skill === 'string') {
            return skill.trim().replace(/^["'-]+|["'-]+$/g, '');
          }
          return String(skill).trim();
        })
        .filter(skill => skill.length > 0 && skill.length < 50)
        .slice(0, 12); // Limit to 12 skills

      this.logger.log(`✅ Suggested ${skills.length} skills for position: ${position}`);
      this.logger.log(`📋 Skills: ${skills.join(', ')}`);

      return skills;
    } catch (error: any) {
      this.logger.error('Error getting skill suggestions:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }

      // Return fallback skills based on common patterns
      return this.getFallbackSkills(position);
    }
  }

  /**
   * Get fallback skills if AI service fails
   */
  private getFallbackSkills(position: string): string[] {
    const lowerPosition = position.toLowerCase();
    
    // Common skill mappings
    if (lowerPosition.includes('frontend') || lowerPosition.includes('react') || lowerPosition.includes('ui')) {
      return ['JavaScript', 'React', 'HTML', 'CSS', 'TypeScript', 'Git', 'REST APIs', 'Responsive Design'];
    }
    if (lowerPosition.includes('backend') || lowerPosition.includes('node') || lowerPosition.includes('api')) {
      return ['Node.js', 'JavaScript', 'REST APIs', 'Database', 'Git', 'Testing', 'Security', 'Performance'];
    }
    if (lowerPosition.includes('fullstack') || lowerPosition.includes('full stack')) {
      return ['JavaScript', 'React', 'Node.js', 'TypeScript', 'REST APIs', 'Database', 'Git', 'Agile'];
    }
    if (lowerPosition.includes('devops') || lowerPosition.includes('sre')) {
      return ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux', 'Git', 'Monitoring', 'Infrastructure'];
    }
    if (lowerPosition.includes('data') || lowerPosition.includes('analyst')) {
      return ['SQL', 'Python', 'Data Analysis', 'Excel', 'Statistics', 'Visualization', 'Machine Learning', 'ETL'];
    }
    
    // Default skills
    return ['Communication', 'Problem Solving', 'Teamwork', 'Time Management', 'Adaptability', 'Technical Skills', 'Learning', 'Project Management'];
  }
}

