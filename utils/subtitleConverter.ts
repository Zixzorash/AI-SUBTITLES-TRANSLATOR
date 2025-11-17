/**
 * Converts WebVTT content to SRT format.
 * - Removes WEBVTT header.
 * - Adds sequential numbering for cues.
 * - Replaces decimal dots with commas in timestamps.
 * @param vttContent The VTT content as a string.
 * @returns The converted SRT content as a string.
 */
export const vttToSrt = (vttContent: string): string => {
  if (!vttContent) return '';
  // Remove WEBVTT header and other metadata, then trim whitespace
  const cleanVtt = vttContent
    .replace(/^WEBVTT[^\n]*\r?\n/i, '')
    .trim();

  const cues = cleanVtt.split(/\r?\n\r?\n/); // Split by blank lines
  let srtContent = '';
  let cueNumber = 1;

  for (const cue of cues) {
    if (cue.trim()) {
      const lines = cue.split(/\r?\n/);
      const timestampIndex = lines.findIndex(line => line.includes('-->'));
      
      if (timestampIndex !== -1) {
        const timestamp = lines[timestampIndex];
        srtContent += `${cueNumber}\n`;
        srtContent += timestamp.replace(/\./g, ',') + '\n';
        
        // Cue text is everything after the timestamp line
        const cueText = lines.slice(timestampIndex + 1).join('\n');
        srtContent += cueText + '\n\n';
        
        cueNumber++;
      }
    }
  }

  return srtContent.trim();
};

/**
 * Converts SRT content to WebVTT format.
 * - Adds WEBVTT header.
 * - Removes cue numbers.
 * - Replaces decimal commas with dots in timestamps.
 * @param srtContent The SRT content as a string.
 * @returns The converted VTT content as a string.
 */
export const srtToVtt = (srtContent: string): string => {
  if (!srtContent) return '';
  const cues = srtContent.trim().replace(/\r/g, '').split(/\n\n/);
  let vttContent = 'WEBVTT\n\n';

  for (const cue of cues) {
    if (cue.trim()) {
      const lines = cue.split('\n');
      const timestampIndex = lines.findIndex(line => line.includes('-->'));
      if (timestampIndex !== -1) { // Found a timestamp line
        const timestamp = lines[timestampIndex];
        vttContent += timestamp.replace(/,/g, '.') + '\n';
        
        const cueText = lines.slice(timestampIndex + 1).join('\n');
        vttContent += cueText + '\n\n';
      }
    }
  }

  return vttContent.trim();
};


/**
 * Converts WebVTT content to plain text format.
 * - Strips WEBVTT header, cue identifiers, and timestamps.
 * @param vttContent The VTT content as a string.
 * @returns The extracted dialogue as a string.
 */
export const vttToTxt = (vttContent: string): string => {
    if (!vttContent) return '';
    const lines = vttContent.split(/\r?\n/);
    let textContent = '';
  
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (
        trimmedLine === '' ||
        trimmedLine.toLowerCase().startsWith('webvtt') ||
        trimmedLine.includes('-->') ||
        /^\d+$/.test(trimmedLine) // Simple check for cue numbers
      ) {
        continue;
      }
      textContent += trimmedLine + '\n';
    }
  
    return textContent.trim();
};