import fetch from 'cross-fetch';
import { ParseResult, ParseOptions } from './types';
import { parseTabularData } from './parseTabularData';

export async function parseGoogleSheet(
  googleSheet: {
    spreadsheetId: string;
    sheetName: string;
    apiKey: string;
  },
  options: ParseOptions
): Promise<ParseResult> {
  const { spreadsheetId, sheetName, apiKey } = googleSheet;

  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/` +
    `${spreadsheetId}/values/${encodeURIComponent(sheetName)}?key=${apiKey}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Google Sheet (status: ${response.status}). ` +
        `Make sure the sheet is shared as "Anyone with the link can view".`
    );
  }

  const data = await response.json();
  const rows: any[][] = data.values || [];

  return parseTabularData(rows, options);
}
