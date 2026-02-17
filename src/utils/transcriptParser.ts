export interface Dialogue {
  speaker: string;
  text: string;
  timestamp?: string;
}

export interface TranscriptStats {
  totalDialogues: number;
  uniqueParticipants: number;
  participants: string[];
  estimatedDuration: number; // in minutes
  wordCount: number;
}

/**
 * Parses transcript text to extract participant names and dialogues
 * Handles various formats that might come from VTT conversion
 */
export function parseTranscript(transcript: string): {
  dialogues: Dialogue[];
  stats: TranscriptStats;
} {
  const dialogues: Dialogue[] = [];
  const participants = new Set<string>();
  let wordCount = 0;

  // Split by lines
  const lines = transcript.split('\n').filter(line => line.trim().length > 0);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;

    // Pattern 1: "Speaker Name: dialogue text"
    const colonMatch = line.match(/^([^:]+):\s*(.+)$/);
    if (colonMatch) {
      const speaker = colonMatch[1].trim();
      const text = colonMatch[2].trim();
      
      if (text.length > 0) {
        participants.add(speaker);
        wordCount += text.split(/\s+/).length;
        dialogues.push({ speaker, text });
      }
      continue;
    }

    // Pattern 2: Lines that look like speaker labels (all caps, short)
    if (line.length < 50 && line === line.toUpperCase() && /^[A-Z\s]+$/.test(line)) {
      // This might be a speaker label, check if next line is dialogue
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.length > 10) {
          // Next line is likely dialogue
          participants.add(line);
          wordCount += nextLine.split(/\s+/).length;
          dialogues.push({ speaker: line, text: nextLine });
          i++; // Skip next line as we've processed it
          continue;
        }
      }
    }

    // Pattern 3: If no speaker detected, check if previous dialogue had same pattern
    // and might be continuation
    if (dialogues.length > 0) {
      const lastDialogue = dialogues[dialogues.length - 1];
      // If line doesn't look like a speaker label, append to last dialogue
      if (line.length > 20 || !/^[A-Z\s:]+$/.test(line)) {
        lastDialogue.text += ' ' + line;
        wordCount += line.split(/\s+/).length;
        continue;
      }
    }

    // Pattern 4: Standalone text (no speaker detected)
    // Assign to "Unknown" speaker
    if (line.length > 5) {
      participants.add('Unknown');
      wordCount += line.split(/\s+/).length;
      dialogues.push({ speaker: 'Unknown', text: line });
    }
  }

  // Calculate estimated duration (assuming average speaking rate of 150 words per minute)
  const estimatedDuration = Math.ceil(wordCount / 150);

  const stats: TranscriptStats = {
    totalDialogues: dialogues.length,
    uniqueParticipants: participants.size,
    participants: Array.from(participants).sort(),
    estimatedDuration,
    wordCount,
  };

  return { dialogues, stats };
}

