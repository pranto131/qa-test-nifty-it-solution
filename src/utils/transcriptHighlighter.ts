/**
 * Utility functions for highlighting transcript snippets using fuzzy matching
 */

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity ratio between two strings (0-1, where 1 is identical)
 */
function similarityRatio(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - distance / maxLen;
}

/**
 * Find all occurrences of a snippet in the transcript using fuzzy matching
 * Returns array of { start, end, text, similarity } objects
 */
export function findSnippetOccurrences(
  transcript: string,
  snippet: string,
  similarityThreshold: number = 0.7
): Array<{ start: number; end: number; text: string; similarity: number }> {
  const occurrences: Array<{ start: number; end: number; text: string; similarity: number }> = [];
  const snippetLength = snippet.length;
  const transcriptLower = transcript.toLowerCase();
  const snippetLower = snippet.toLowerCase().trim();

  // Try exact match first
  let searchIndex = 0;
  while (true) {
    const index = transcriptLower.indexOf(snippetLower, searchIndex);
    if (index === -1) break;

    occurrences.push({
      start: index,
      end: index + snippetLength,
      text: transcript.substring(index, index + snippetLength),
      similarity: 1.0,
    });
    searchIndex = index + 1;
  }

  // If no exact matches, try fuzzy matching with sliding window
  if (occurrences.length === 0) {
    const windowSize = snippetLength;
    const stepSize = Math.max(1, Math.floor(windowSize / 4)); // Overlap windows

    for (let i = 0; i <= transcript.length - windowSize; i += stepSize) {
      const window = transcript.substring(i, i + windowSize);
      const similarity = similarityRatio(window, snippet);

      if (similarity >= similarityThreshold) {
        // Check if this occurrence overlaps with an existing one
        const overlaps = occurrences.some(
          (occ) => !(occ.end < i || occ.start > i + windowSize)
        );

        if (!overlaps) {
          occurrences.push({
            start: i,
            end: i + windowSize,
            text: window,
            similarity,
          });
        }
      }
    }

    // Sort by similarity (highest first) and position
    occurrences.sort((a, b) => {
      if (Math.abs(a.similarity - b.similarity) > 0.01) {
        return b.similarity - a.similarity;
      }
      return a.start - b.start;
    });
  }

  return occurrences;
}

/**
 * Highlight all transcript snippets for a task in the transcript
 * Returns the transcript with HTML highlight markers
 */
export function highlightTranscriptSnippets(
  transcript: string,
  snippets: string[],
  similarityThreshold: number = 0.7
): { highlightedText: string; positions: Array<{ start: number; end: number }> } {
  if (!transcript || snippets.length === 0) {
    return { highlightedText: transcript, positions: [] };
  }

  // Find all occurrences for all snippets
  const allOccurrences: Array<{
    start: number;
    end: number;
    snippet: string;
    similarity: number;
  }> = [];

  snippets.forEach((snippet) => {
    const occurrences = findSnippetOccurrences(transcript, snippet, similarityThreshold);
    occurrences.forEach((occ) => {
      allOccurrences.push({
        ...occ,
        snippet,
      });
    });
  });

  // Sort by start position
  allOccurrences.sort((a, b) => a.start - b.start);

  // Merge overlapping occurrences
  const mergedOccurrences: Array<{ start: number; end: number }> = [];
  for (const occ of allOccurrences) {
    if (mergedOccurrences.length === 0) {
      mergedOccurrences.push({ start: occ.start, end: occ.end });
    } else {
      const last = mergedOccurrences[mergedOccurrences.length - 1];
      if (occ.start <= last.end) {
        // Overlapping, merge
        last.end = Math.max(last.end, occ.end);
      } else {
        // Non-overlapping, add new
        mergedOccurrences.push({ start: occ.start, end: occ.end });
      }
    }
  }

  // Build highlighted text by inserting markers
  let highlightedText = '';
  let lastIndex = 0;

  mergedOccurrences.forEach((occ) => {
    // Add text before highlight
    highlightedText += transcript.substring(lastIndex, occ.start);
    // Add highlighted text
    highlightedText += `<mark class="bg-yellow-200 dark:bg-yellow-900/50 px-1 rounded">${transcript.substring(occ.start, occ.end)}</mark>`;
    lastIndex = occ.end;
  });

  // Add remaining text
  highlightedText += transcript.substring(lastIndex);

  return {
    highlightedText,
    positions: mergedOccurrences,
  };
}

/**
 * Scroll to the first occurrence of highlighted snippets
 */
export function scrollToFirstHighlight(
  containerId: string,
  positions: Array<{ start: number; end: number }>
): void {
  if (positions.length === 0) return;

  const container = document.getElementById(containerId);
  if (!container) return;

  // Find the first mark element (highlight)
  const firstMark = container.querySelector('mark');
  if (firstMark) {
    firstMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Add a temporary flash effect
    firstMark.classList.add('animate-pulse');
    setTimeout(() => {
      firstMark.classList.remove('animate-pulse');
    }, 2000);
  }
}

