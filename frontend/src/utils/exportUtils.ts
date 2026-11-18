export function exportToCsv<T extends Record<string, any>>(
  filename: string,
  rows: T[],
  headers?: { key: keyof T; label: string }[]
): void {
  if (!rows || !rows.length) {
    return;
  }

  const columns = headers
    ? headers
    : (Object.keys(rows[0]) as (keyof T)[]).map((key) => ({
        key,
        label: String(key).toUpperCase(),
      }));

  const csvRows: string[] = [];

  // Header row
  csvRows.push(columns.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(','));

  // Data rows
  for (const row of rows) {
    const values = columns.map((col) => {
      const val = row[col.key];
      if (val === null || val === undefined) return '""';
      if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `${filename.endsWith('.csv') ? filename : `${filename}.csv`}`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function triggerPrint(): void {
  window.print();
}
