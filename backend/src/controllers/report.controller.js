const { Parser } = require('json2csv');
const exceljs = require('exceljs');
const puppeteer = require('puppeteer');
const DepartmentScore = require('../models/DepartmentScore');
const CarbonTransaction = require('../models/CarbonTransaction');
const CSRActivity = require('../models/CSRActivity');
const ComplianceIssue = require('../models/ComplianceIssue');

exports.exportReport = async (req, res) => {
  try {
    // Note: The frontend passes 'module' as the report category (env, social, governance, esg-summary, or All)
    // and 'type' as the format (CSV, Excel, PDF).
    const { module: reportModule, type: format, filters = {} } = req.body;
    
    let rawData = [];
    let exportData = [];
    let columns = [];

    // Filter logic placeholder (this would ideally map to mongoose query objects)
    const dateQuery = {};
    if (filters.dateFrom) dateQuery.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) dateQuery.$lte = new Date(filters.dateTo);
    
    // Fetch data based on module
    if (reportModule === 'env' || filters.module === 'Environmental') {
      const query = Object.keys(dateQuery).length ? { transactionDate: dateQuery } : {};
      rawData = await CarbonTransaction.find(query).populate('department', 'name').populate('emissionFactor', 'name unit').lean();
      exportData = rawData.map(d => ({
        Department: d.department?.name || 'Unknown',
        Date: d.transactionDate ? new Date(d.transactionDate).toLocaleDateString() : '',
        Activity: d.emissionFactor?.name || d.description || 'Carbon Log',
        ActivityValue: d.activityValue || 0,
        EmissionsCO2e: Number((d.carbonEmitted || 0).toFixed(2))
      }));
      columns = ['Department', 'Date', 'Activity', 'ActivityValue', 'EmissionsCO2e'];
    } 
    else if (reportModule === 'social' || filters.module === 'Social') {
      const query = Object.keys(dateQuery).length ? { date: dateQuery } : {};
      rawData = await CSRActivity.find(query).populate('department_id', 'name').lean();
      exportData = rawData.map(d => ({
        Department: d.department_id?.name || 'Unknown',
        Title: d.title,
        Date: d.date ? new Date(d.date).toLocaleDateString() : '',
        Status: d.status,
        XPReward: d.xpReward || 0
      }));
      columns = ['Department', 'Title', 'Date', 'Status', 'XPReward'];
    }
    else if (reportModule === 'governance' || filters.module === 'Governance') {
      const query = Object.keys(dateQuery).length ? { reportedDate: dateQuery } : {};
      rawData = await ComplianceIssue.find(query).populate('department', 'name').lean();
      exportData = rawData.map(d => ({
        Department: d.department?.name || 'Unknown',
        Title: d.title,
        Status: d.status,
        Severity: d.severity,
        DueDate: d.dueDate ? new Date(d.dueDate).toLocaleDateString() : ''
      }));
      columns = ['Department', 'Title', 'Status', 'Severity', 'DueDate'];
    }
    else {
      // Default / esg-summary / All
      rawData = await DepartmentScore.find().populate('department', 'name').lean();
      exportData = rawData.map(s => ({
        Department: s.department?.name || 'Unknown',
        Year: s.year,
        Month: String(s.month + 1).padStart(2, '0'),
        EnvScore: Math.round(s.environmentalScore),
        SocScore: Math.round(s.socialScore),
        GovScore: Math.round(s.governanceScore),
        Total: Math.round(s.combinedScore)
      }));
      columns = ['Department', 'Year', 'Month', 'EnvScore', 'SocScore', 'GovScore', 'Total'];
    }

    if (exportData.length === 0) {
      exportData = [ { Message: 'No data matches the selected filters.' } ];
      columns = ['Message'];
    }

    // --- CSV FORMAT ---
    if (format === 'CSV') {
      const json2csvParser = new Parser({ fields: columns });
      const csv = json2csvParser.parse(exportData);
      res.header('Content-Type', 'text/csv');
      res.attachment(`ESG_Report_${Date.now()}.csv`);
      return res.send(csv);
    } 
    
    // --- EXCEL FORMAT ---
    if (format === 'Excel') {
      const workbook = new exceljs.Workbook();
      const worksheet = workbook.addWorksheet('Report Data');
      worksheet.columns = columns.map(c => ({ header: c, key: c, width: 20 }));
      worksheet.addRows(exportData);
      res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.attachment(`ESG_Report_${Date.now()}.xlsx`);
      await workbook.xlsx.write(res);
      return res.end();
    }
    
    // --- PDF FORMAT (PUPPETEER) ---
    if (format === 'PDF') {
      // Generate basic HTML table for the PDF
      const tableHeaders = columns.map(c => `<th>${c}</th>`).join('');
      const tableRows = exportData.map(row => {
        return `<tr>${columns.map(c => `<td>${row[c] || ''}</td>`).join('')}</tr>`;
      }).join('');
      
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
              h1 { color: #1F5C4D; text-align: center; }
              p.meta { text-align: center; color: #666; font-size: 12px; margin-bottom: 30px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #1F5C4D; color: white; }
              tr:nth-child(even) { background-color: #f9f9f9; }
            </style>
          </head>
          <body>
            <h1>EcoSphere ESG Report</h1>
            <p class="meta">Generated on ${new Date().toLocaleString()} | Module: ${reportModule || filters.module || 'ESG Summary'}</p>
            <table>
              <thead>
                <tr>${tableHeaders}</tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ 
        format: 'A4', 
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
      });
      await browser.close();

      res.header('Content-Type', 'application/pdf');
      res.attachment(`ESG_Report_${Date.now()}.pdf`);
      return res.send(pdfBuffer);
    }

    res.status(400).json({ success: false, message: 'Invalid export format requested' });
  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
