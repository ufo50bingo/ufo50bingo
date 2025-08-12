'use client';

import Papa from 'papaparse';
import { Button } from '@mantine/core';
import { Attempt, db } from './db';
import downloadCsv from './downloadCsv';

export default function ExportCSV() {
  return <Button onClick={exportExistingRows}>Export</Button>;
}

async function exportExistingRows(): Promise<void> {
  const existingRows = await db.attempts.toArray();
  const csv = Papa.unparse(
    existingRows.map((row) => ({
      goal: row.goal,
      startTime: row.startTime,
      duration: row.duration,
    }))
  );
  downloadCsv(csv, 'ufo50_bingo_export.csv');
}
