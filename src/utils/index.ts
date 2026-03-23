import ExcelJS from 'exceljs';

type ConfirmRow = {
  full_name?: string | null;
  alergias_resumen?: string | null;
  attending?: boolean | null;
  email?: string | null;
  guest_count?: number | null;
  allergy_other?: string | null;
  message?: string | null;
};

const getMaxNameLength = (confirms: ConfirmRow[]) => {
  let maxLength = 'Nombre'.length;

  confirms.forEach((confirm: ConfirmRow) => {
    const length = String(confirm.full_name || '').trim().length;
    if (length > maxLength) {
      maxLength = length;
    }
  });

  return maxLength + 2;
};

const getMaxAllergenLength = (confirms: ConfirmRow[]) => {
  let maxLength = 150;

  confirms.forEach((confirm: ConfirmRow) => {
    const allergens = confirm.alergias_resumen?.split(',') || [];
    allergens.forEach((allergen) => {
      const length = allergen.trim().length;
      if (length > maxLength) {
        maxLength = length;
      }
    });
  });

  return maxLength + 2;
};

const getMaxMessageLength = (confirms: ConfirmRow[]) => {
  let maxLength = 100;

  confirms.forEach((confirm: ConfirmRow) => {
    const length = String(confirm.message || '').trim().length;
    if (length > maxLength) {
      maxLength = length;
    }
  });

  return maxLength + 2;
};

export const createXlsx = async (confirms: ConfirmRow[]) => {
  let xlsBuffer = Buffer.from('Un buffer vacío');

  try {
    const workhook = new ExcelJS.Workbook();
    const worksheet = workhook.addWorksheet('Confirmaciones', {
      pageSetup: { paperSize: 9, orientation: 'landscape' },
    });

    let rowIndex = 2;
    let rowHeader = worksheet.getRow(rowIndex - 1);
    rowHeader.values = [
      'Asistiré',
      'Nombre',
      'Email',
      'Invitados',
      'Alergias',
      'Otras alergias',
      'Mensaje',
    ];
    rowHeader.font = { bold: true };

    const namesMaxLength = getMaxNameLength(confirms);
    const allergensMaxLength = getMaxAllergenLength(confirms);
    const messageMaxLength = getMaxMessageLength(confirms);
    const columnsWidths = [
      10,
      namesMaxLength,
      25,
      10,
      allergensMaxLength,
      20,
      messageMaxLength,
    ];

    rowHeader.eachCell((cell, colNumber) => {
      const columnIndex = colNumber - 1;
      const columnWidth = columnsWidths[columnIndex];
      worksheet.getColumn(colNumber).width = columnWidth;
    });

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

    worksheet.eachRow((row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
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

    xlsBuffer = await workhook.xlsx.writeBuffer();
  } catch (err) {
    console.log({ err });
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
