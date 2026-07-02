"use client";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportDashboardPDF(
  dashboardEl: HTMLElement,
  mapEl: HTMLElement | null
) {
  const pdf = new jsPDF("landscape", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.setFontSize(18);
  pdf.setTextColor(27, 79, 114);
  pdf.text("Sierra Leone CDMU Dashboard", 14, 15);
  pdf.setFontSize(10);
  pdf.setTextColor(100, 116, 139);
  pdf.text(
    `Mission 300 · National Energy Compact · Generated ${new Date().toLocaleDateString()}`,
    14,
    22
  );

  const dashCanvas = await html2canvas(dashboardEl, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#F8FAFC",
  });

  const dashImg = dashCanvas.toDataURL("image/png");
  const dashAspect = dashCanvas.width / dashCanvas.height;
  const dashWidth = pageWidth - 28;
  const dashHeight = Math.min(dashWidth / dashAspect, pageHeight - 35);

  pdf.addImage(dashImg, "PNG", 14, 28, dashWidth, dashHeight);

  if (mapEl) {
    pdf.addPage();
    pdf.setFontSize(14);
    pdf.setTextColor(27, 79, 114);
    pdf.text("Settlement Map", 14, 15);

    const mapCanvas = await html2canvas(mapEl, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const mapImg = mapCanvas.toDataURL("image/png");
    const mapAspect = mapCanvas.width / mapCanvas.height;
    const mapWidth = pageWidth - 28;
    const mapHeight = Math.min(mapWidth / mapAspect, pageHeight - 25);

    pdf.addImage(mapImg, "PNG", 14, 20, mapWidth, mapHeight);
  }

  pdf.save("sl-cdmu-dashboard-report.pdf");
}

export async function exportMapImage(mapEl: HTMLElement) {
  const canvas = await html2canvas(mapEl, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const link = document.createElement("a");
  link.download = "sl-cdmu-map.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}
