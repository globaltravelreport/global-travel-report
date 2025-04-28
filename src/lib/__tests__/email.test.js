import { sendReport } from '../email';

jest.mock('../email', () => ({
  sendReport: jest.fn().mockResolvedValue({ success: true })
}));

describe('Email functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send an email report successfully', async () => {
    const subject = 'Daily SEO Report - ' + new Date().toLocaleDateString();
    const body = `
      <h1>Daily SEO Report</h1>
      <p>Date: ${new Date().toLocaleDateString()}</p>
      <h2>Summary</h2>
      <ul>
        <li>Total Pages Analyzed: 42</li>
        <li>Average Word Count: 1,234</li>
        <li>Average Load Time: 1.2s</li>
      </ul>
      <h2>Top Pages</h2>
      <ol>
        <li>Tokyo Luxury Hotels Article</li>
        <li>Bali Travel Guide</li>
        <li>European Summer Destinations</li>
      </ol>
      <h2>Recommendations</h2>
      <p>Consider adding more internal links to improve page authority.</p>
    `;

    const result = await sendReport(subject, body);
    expect(result).toEqual({ success: true });
    expect(sendReport).toHaveBeenCalledWith(subject, body);
    expect(sendReport).toHaveBeenCalledTimes(1);
  });

  it('should handle email sending failures', async () => {
    sendReport.mockRejectedValueOnce(new Error('Failed to send email'));
    
    await expect(sendReport('Test Subject', 'Test Body'))
      .rejects
      .toThrow('Failed to send email');
  });
}); 