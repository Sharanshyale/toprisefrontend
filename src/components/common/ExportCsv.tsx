

// Helper function to parse CSV text
export const parseCSV = (csvText: string) => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  const data = lines.slice(1).filter(line => line.trim() !== '').map(line => {
    const values = line.split(',');
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] ? values[index].trim() : '';
    });
    return obj;
  });
  return { headers, data };
};

// Helper function to convert data to CSV text
export const convertToCSV = (data: Array<Record<string, string>>, headers: string[]) => {
  const headerRow = headers.join(',');
  const rows = data.map(obj => {
    return headers.map(header => {
      const value = obj[header] || '';
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  return [headerRow, ...rows].join('\n');
};

// Helper function to download CSV file
export const downloadCSV = (csvString: string, filename: string) => {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Main function to fetch and download CSV using a provided function
export const fetchAndDownloadCSV = async (fetchCSVFunction: () => Promise<string>, filename: string) => {
  try {
    const csvText = await fetchCSVFunction();
    const { headers, data } = parseCSV(csvText);
    const newCSVText = convertToCSV(data, headers);
    downloadCSV(newCSVText, filename);
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; // Re-throw the error to handle it in the component
  }
};
