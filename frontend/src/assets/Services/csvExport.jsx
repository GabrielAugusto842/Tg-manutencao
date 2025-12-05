export function exportToCSV(filename, rows) {
  if (!rows || !rows.length) return;

  // Pega as chaves do primeiro objeto como cabeçalho
  const headers = Object.keys(rows[0]);

  const csvContent = [headers.join(",")] // cabeçalho
    .concat(
      rows.map((row) =>
        headers
          .map((field) => {
            let val = row[field] ?? "";
            // Escapa aspas duplas
            val =
              typeof val === "string" ? `"${val.replace(/"/g, '""')}"` : val;
            return val;
          })
          .join(",")
      )
    )
    .join("\r\n");

  // Cria um Blob com o CSV
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // Cria link de download
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
