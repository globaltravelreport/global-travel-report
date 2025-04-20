const { sendReport } = require('../email');

// Example usage
async function testEmail() {
    try {
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
        console.log('Email sent successfully:', result);
    } catch (error) {
        console.error('Failed to send email:', error);
    }
}

// Run the test
testEmail(); 