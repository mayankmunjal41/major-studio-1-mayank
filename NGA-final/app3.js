document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Fetch CSV file
        const response = await fetch('sample-sample.csv');
        const data = await response.text();

        // Parse CSV
        const rows = data.split('\n');
        const imageData = [];

        // Extract image URLs from CSV
        rows.forEach(row => {
            const columns = row.split(',');
            const imageUrl = columns[3]; // Adjust this index based on your CSV structure
            imageData.push(imageUrl);
        });

        // Append images to the body
        const body = document.querySelector('body');

        imageData.forEach(imageUrl => {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.width = 200;
            img.height = 200;
            body.appendChild(img);
        });

    } catch (error) {
        console.error('Error fetching or processing CSV:', error);
    }
});
