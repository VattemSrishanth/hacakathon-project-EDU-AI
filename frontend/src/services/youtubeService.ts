import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface Lesson {
  title: string;
  description: string;
}

export interface YouTubeVideoResult {
  videoId: string;
  embedUrl: string;
}

/**
 * Step 1: Generates a search query for YouTube based on the lesson
 */
export const generateSearchQuery = (lesson: Lesson): string => {
  // Sanitize title by removing slashes and brackets which can confuse search
  const cleanTitle = lesson.title.replace(/[\/\\()]/g, ' ').replace(/\s+/g, ' ').trim();
  // Adding "ISL" or "Indian Sign Language" as the curriculum suggests Indian users
  return `${cleanTitle} ISL sign language explanation`;
};

/**
 * Step 2: Service to search for sign language videos via our backend
 */
export const youtubeService = {
  /**
   * Calls the backend to search for a video and returns the video details
   */
  searchSignLanguageVideo: async (query: string): Promise<YouTubeVideoResult> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/youtube-search`, {
        params: { q: query }
      });

      if (response.data && response.data.videoId) {
        return {
          videoId: response.data.videoId,
          embedUrl: `https://www.youtube.com/embed/${response.data.videoId}`
        };
      }
      
      throw new Error('No video found for this topic.');
    } catch (error: any) {
      console.error('Error searching YouTube video:', error);
      const message = error.response?.data?.error || error.message || 'Failed to connect to video service.';
      throw new Error(message);
    }
  },

  /**
   * Fetches captions for a video ID
   */
  getVideoCaptions: async (videoId: string): Promise<string> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/youtube-captions`, {
        params: { videoId }
      });
      return response.data.transcript;
    } catch (error) {
      console.error('Error fetching captions:', error);
      throw error;
    }
  }
};
