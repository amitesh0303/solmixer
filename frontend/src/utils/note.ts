import { NoteData, serializeNote, deserializeNote } from './crypto';

export function downloadNote(note: NoteData, denomination: number): void {
  const data = serializeNote(note);
  const timestamp = Date.now();
  const filename = `solmixer-note-${denomination}sol-${timestamp}.json`;

  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

export async function readNoteFile(file: File): Promise<NoteData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const note = deserializeNote(content);
        resolve(note);
      } catch {
        reject(new Error('Invalid note file format'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
