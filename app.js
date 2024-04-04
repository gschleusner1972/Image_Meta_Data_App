document.getElementById('save').addEventListener('click', function() {
    var fileInput = document.getElementById('capture');
    var file = fileInput.files[0];
    var metadata = document.getElementById('metadata').value;

    if (file) {
        // Create a new JSZip instance
        var zip = new JSZip();

        // Read the image file as a Blob
        var reader = new FileReader();
        reader.onload = function(e) {
            // Add the image to the ZIP file
            zip.file(file.name, e.target.result, {binary: true});

            // Create a JSON file with metadata and add it to the ZIP file
            var metadataBlob = new Blob([JSON.stringify({ metadata: metadata })], { type: 'application/json' });
            zip.file('metadata.json', metadataBlob);

            // Generate the ZIP file and use FileSaver.js to trigger the download
            zip.generateAsync({type: 'blob'}).then(function(content) {
                var timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                var filename = 'image-metadata-' + timestamp + '.zip';
                saveAs(content, filename);
            });
        };
        reader.readAsArrayBuffer(file);
    }
});
