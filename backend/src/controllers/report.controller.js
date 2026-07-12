const { Parser } = require('json2csv');
const exceljs = require('exceljs');
const DepartmentScore = require('../models/DepartmentScore');

exports.exportReport = async (req, res) => {
  try {
    const { type } = req.body;
    const scores = await DepartmentScore.find().populate('department', 'name').lean();
    
    // Prepare data
    const exportData = scores.map(s => ({
      Department: s.department?.name || 'Unknown',
      Year: s.year,
      Month: s.month,
      EnvScore: s.environmentalScore,
      SocScore: s.socialScore,
      GovScore: s.governanceScore,
      Total: s.combinedScore
    }));

    // Guard: nothing to export yet
    if (exportData.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'No scores recorded yet. Run a recalculation first to generate data.'
      });
    }

    if (type === 'CSV') {
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(exportData);
      res.header('Content-Type', 'text/csv');
      res.attachment('ESG_Report.csv');
      return res.send(csv);
    } 
    
    if (type === 'Excel') {
      const workbook = new exceljs.Workbook();
      const worksheet = workbook.addWorksheet('ESG Scores');
      worksheet.columns = [
        { header: 'Department', key: 'Department', width: 20 },
        { header: 'Year', key: 'Year', width: 10 },
        { header: 'Month', key: 'Month', width: 10 },
        { header: 'EnvScore', key: 'EnvScore', width: 15 },
        { header: 'SocScore', key: 'SocScore', width: 15 },
        { header: 'GovScore', key: 'GovScore', width: 15 },
        { header: 'Total', key: 'Total', width: 15 },
      ];
      worksheet.addRows(exportData);
      res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.attachment('ESG_Report.xlsx');
      await workbook.xlsx.write(res);
      return res.end();
    }
    
    if (type === 'PDF') {
      // Mocking PDF export due to puppeteer setup complexities in quick sprint
      res.json({ success: true, message: 'PDF export triggered (Mocked for Demo)' });
      return;
    }

    res.status(400).json({ success: false, message: 'Invalid export type' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
