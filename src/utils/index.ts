import ExcelJS from 'exceljs';

export type ConfirmRow = {
  full_name?: string | null;
  alergias_resumen?: string | null;
  attending?: boolean | null;
  email?: string | null;
  guest_count?: number | null;
  allergy_other?: string | null;
  message?: string | null;
};

export const createXlsx = async (confirms: ConfirmRow[] | undefined) => {
  let xlsBuffer = Buffer.alloc(0);

  try {
    const workhook = new ExcelJS.Workbook();
    const worksheet = workhook.addWorksheet('Confirmaciones', {
      pageSetup: { paperSize: 9, orientation: 'landscape' },
    });

    let rowIndex = 2;
    let rowHeader = worksheet.getRow(rowIndex - 1);
    const rowHeaderValues = [
      'Asistiré',
      'Nombre',
      'Email',
      'Invitados',
      'Alergias',
      'Otras alergias',
      'Mensaje',
    ];

    rowHeader.values = rowHeaderValues;
    rowHeader.font = { bold: true };

    confirms?.forEach((confirm: ConfirmRow, index: number) => {
      const rowValue = worksheet.getRow(rowIndex + index);
      rowValue.getCell('A').value = confirm.attending;
      rowValue.getCell('B').value = confirm.full_name;
      rowValue.getCell('C').value = confirm.email;
      rowValue.getCell('D').value = confirm.guest_count;
      rowValue.getCell('E').value = confirm.alergias_resumen;
      rowValue.getCell('F').value = confirm.allergy_other;
      rowValue.getCell('G').value = confirm.message;
    });

    // Fijamos algunas columnas y autoajustamos el resto por contenido.
    const fixedWidthsByColumn: Record<number, number> = {
      1: 10, // Asistiré
      4: 10, // Invitados
    };

    worksheet.columns.forEach((column, index) => {
      if (!column) return;

      const colNumber = index + 1;
      const fixedWidth = fixedWidthsByColumn[colNumber];

      if (fixedWidth) {
        column.width = fixedWidth;
        return;
      }

      const headerText = String(rowHeaderValues[index] ?? '').trim();
      let maxLength = headerText.length;

      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const cellText = String(cell.value ?? '').trim();
        if (cellText.length > maxLength) {
          maxLength = cellText.length;
        }
      });

      const minWidth = 12;
      const maxWidth = 80;
      column.width = Math.min(Math.max(maxLength + 2, minWidth), maxWidth);
    });

    worksheet.eachRow((row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: {
            style: 'thin', // You can use 'thin', 'medium', 'thick', or other valid styles
            color: { argb: '00000000' },
          },
          bottom: {
            style: 'thin', // You can use 'thin', 'medium', 'thick', or other valid styles
            color: { argb: '00000000' },
          },
        };
      });
    });

    const rawBuffer = await workhook.xlsx.writeBuffer();
    xlsBuffer = Buffer.isBuffer(rawBuffer) ? rawBuffer : Buffer.from(rawBuffer);
  } catch (err) {
    ({ err });
  }

  return xlsBuffer;
};

export const getRemainingTime = (date: Date) => {
  const now = new Date().getTime();
  const remainingTime = date.getTime() - now;
  const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, remainingTime };
};
