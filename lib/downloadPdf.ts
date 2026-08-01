export async function downloadPdf(url: string, fileName: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Unable to download PDF.');

  const sourceBlob = await response.blob();
  const pdfBlob = new Blob([sourceBlob], { type: 'application/pdf' });
  const objectUrl = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(objectUrl);
}
