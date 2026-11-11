const service = require("../services/report.service");

class ReportController {

    async missionsPDF(req, res, next) {

        try {

            await service.missionsPDF(res);

        } catch (error) {

            next(error);

        }

    }

    async dronesExcel(req, res, next) {

        try {

            const workbook =
                await service.dronesExcel();

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );

            res.setHeader(
                "Content-Disposition",
                "attachment; filename=drones.xlsx"
            );

            await workbook.xlsx.write(res);

            res.end();

        } catch (error) {

            next(error);

        }

    }

}

module.exports = new ReportController();
