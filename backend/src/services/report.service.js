const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const prisma = require("../config/prisma");

class ReportService {

    async missionsPDF(res) {

        const missions = await prisma.mission.findMany({
            include: {
                drone: true
            }
        });

        const doc = new PDFDocument({
            margin: 40,
            size: "A4"
        });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=misiones.pdf"
        );

        doc.pipe(res);

        doc.fontSize(20).text("DIGIFLAI", {
            align: "center"
        });

        doc.moveDown();

        doc.fontSize(14).text("Reporte de Misiones");

        doc.moveDown();

        missions.forEach((mission) => {

            doc.fontSize(11);

            doc.text(`Misión: ${mission.name}`);
            doc.text(`Drone: ${mission.drone.code}`);
            doc.text(`Estado: ${mission.status}`);
            doc.text(`Ubicación: ${mission.location}`);

            doc.moveDown();

        });

        doc.end();

    }

    async dronesExcel() {

        const drones = await prisma.drone.findMany({
            include: {
                operator: true
            }
        });

        const workbook = new ExcelJS.Workbook();

        const sheet = workbook.addWorksheet("Drones");

        sheet.columns = [

            { header: "Código", key: "code", width: 20 },
            { header: "Modelo", key: "model", width: 25 },
            { header: "Fabricante", key: "manufacturer", width: 25 },
            { header: "Estado", key: "status", width: 18 },
            { header: "Batería", key: "battery", width: 12 },
            { header: "Operador", key: "operator", width: 25 }

        ];

        drones.forEach((drone) => {

            sheet.addRow({

                code: drone.code,

                model: drone.model,

                manufacturer: drone.manufacturer,

                status: drone.status,

                battery: drone.battery,

                operator: drone.operator
                    ? `${drone.operator.firstName} ${drone.operator.lastName}`
                    : "Sin asignar"

            });

        });

        return workbook;

    }

}

module.exports = new ReportService();
