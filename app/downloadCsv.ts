export default function downloadCsv(csv: string, name: string): void {
  const blob = new Blob([csv], { type: 'data:text/csv;charset=utf-8' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = name;
  const event = document.createEvent('MouseEvents');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
