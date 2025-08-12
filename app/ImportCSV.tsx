'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import {
  Anchor,
  Button,
  Container,
  FileInput,
  Group,
  Modal,
  SegmentedControl,
  Stack,
  Text,
  useMantineColorScheme,
} from '@mantine/core';
import { Attempt, db } from './db';
import downloadCsv from './downloadCsv';
import { SORTED_FLAT_GOALS } from './goals';

export default function ImportCSV() {
  const [isImporting, setIsImporting] = useState(false);
  const [csv, setCsv] = useState<File | null>(null);
  const [behavior, setBehavior] = useState('merge');
  const [csvType, setCsvType] = useState('actual');

  return (
    <>
      <Button onClick={() => setIsImporting(true)}>Import</Button>
      <Modal
        centered={true}
        onClose={() => setIsImporting(false)}
        opened={isImporting}
        title="Import from CSV"
      >
        <Stack>
          <Text>You may want to export your data to CSV first.</Text>
          <SegmentedControl
            value={csvType}
            onChange={(newCsvType) => {
              setCsvType(newCsvType);
              setCsv(null);
            }}
            data={[
              { label: 'Import full data', value: 'actual' },
              { label: 'Create estimated data', value: 'estimated' },
            ]}
          />
          {csvType === 'actual' && <Text>CSV format should match the export format.</Text>}
          {csvType === 'estimated' && (
            <Text>
              Download{' '}
              <Anchor
                onClick={() => downloadCsv(createTemplate(), 'ufo50_bingo_estimated_template.csv')}
              >
                this template
              </Anchor>{' '}
              and fill in your estimated data.
            </Text>
          )}
          <FileInput accept="text/csv" value={csv} onChange={setCsv} label="Select CSV" />
          <SegmentedControl
            value={behavior}
            onChange={setBehavior}
            data={[
              { label: 'Merge with existing history', value: 'merge' },
              { label: 'Replace existing history', value: 'replace' },
            ]}
          />
          <Group mt="lg" justify="flex-end">
            <Button onClick={() => setIsImporting(false)}>Cancel</Button>
            <Button
              disabled={csv == null}
              onClick={async () => {
                if (csv == null) {
                  throw new Error('csv should not be null');
                }
                const rows =
                  csvType === 'actual'
                    ? await parseActualCsv(csv)
                    : processEstimatedCsv(await parseEstimatedCsv(csv));
                await updateDB(rows, behavior === 'merge');
                setIsImporting(false);
              }}
              color="green"
            >
              Import
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

async function parseActualCsv(csv: File): Promise<Attempt[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Attempt>(csv, {
      dynamicTyping: true,
      header: true,
      complete: (results) => {
        const fields = results.meta.fields;
        if (
          fields == null ||
          fields.length != 3 ||
          fields[0] != 'goal' ||
          fields[1] != 'startTime' ||
          fields[2] != 'duration'
        ) {
          console.error('Unexpected CSV format', fields);
          reject(Error('Unexpected CSV format'));
        }
        resolve(results.data);
      },
      error: reject,
    });
  });
}

type Estimate = {
  Goal: string;
  'Number of attempts': number | null | undefined;
  'Average time in mins (example: 1.5)': number | null | undefined;
  '(optional) Best time in mins (example: 1.0)': number | null | undefined;
  '(optional) Date (example: 2025-04-30)': number | null | undefined;
};

async function parseEstimatedCsv(csv: File): Promise<Estimate[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Estimate>(csv, {
      dynamicTyping: true,
      header: true,
      complete: (results) => {
        const fields = results.meta.fields;
        if (
          fields == null ||
          fields.length != 5 ||
          fields[0] != 'Goal' ||
          fields[1] != 'Number of attempts' ||
          fields[2] != 'Average time in mins (example: 1.5)' ||
          fields[3] != '(optional) Best time in mins (example: 1.0)' ||
          fields[4] != '(optional) Date (example: 2025-04-30)'
        ) {
          console.error('Unexpected CSV format', fields);
          reject(Error('Unexpected CSV format'));
        }
        resolve(results.data);
      },
      error: reject,
    });
  });
}

function processEstimatedCsv(estimates: Estimate[]): Attempt[] {
  const attempts: Attempt[] = [];
  estimates.forEach((estimate) => {
    const goal = estimate.Goal;
    const count = Math.round(estimate['Number of attempts'] ?? 0);
    const averageMins = estimate['Average time in mins (example: 1.5)'];
    const bestMins = estimate['(optional) Best time in mins (example: 1.0)'];
    const date = estimate['(optional) Date (example: 2025-04-30)'];

    if (count === 0 || averageMins == null) {
      return;
    }
    if (SORTED_FLAT_GOALS.find((item) => item.name === goal) == null) {
      console.error('Unexpected goal name', goal);
      return;
    }

    const average = Math.round(averageMins * 60000);
    const bestOffset = bestMins != null ? Math.round((bestMins - averageMins) * 60000) : null;
    const startTime = date != null ? new Date(date).getTime() : 0;

    let avgCount = count;
    if (count >= 2 && bestOffset != null) {
      avgCount = avgCount - 2;
      attempts.push({
        goal,
        startTime,
        duration: average - bestOffset,
      });
      attempts.push({
        goal,
        startTime,
        duration: average + bestOffset,
      });
    }
    attempts.push(
      ...Array(avgCount).fill({
        goal,
        startTime,
        duration: average,
      })
    );
  });
  return attempts;
}

async function updateDB(csvRows: Attempt[], shouldMerge: boolean): Promise<void> {
  if (shouldMerge) {
    const existingRows = await db.attempts.toArray();
    const existingRowsJsonSet = new Set();
    existingRows.forEach((row) =>
      existingRowsJsonSet.add(
        JSON.stringify({
          goal: row.goal,
          startTime: row.startTime,
          duration: row.duration,
        })
      )
    );
    const newRows = csvRows.filter((row) => !existingRowsJsonSet.has(JSON.stringify(row)));
    await db.attempts.bulkAdd(newRows);
  } else {
    await db.attempts.clear();
    await db.attempts.bulkAdd(csvRows);
  }
}

function createTemplate(): string {
  const csv = Papa.unparse(
    SORTED_FLAT_GOALS.map((row) => {
      const estimate: Estimate = {
        Goal: row.name,
        'Number of attempts': null,
        'Average time in mins (example: 1.5)': null,
        '(optional) Best time in mins (example: 1.0)': null,
        '(optional) Date (example: 2025-04-30)': null,
      };
      return estimate;
    })
  );
  return csv;
}
