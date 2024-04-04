<<<<<<< HEAD
document.getElementById('capture-form').addEventListener('submit', function(event) {
    event.preventDefault();

    var fileInput = document.getElementById('capture');
    var file = fileInput.files[0];
    var metadata = document.getElementById('metadata').value;
    var token = document.getElementById('github-token').value;
    var username = document.getElementById('github-username').value;
    var repo = document.getElementById('github-repo').value;

    if (file && token && username && repo) {
        var zip = new JSZip();
        var reader = new FileReader();
        reader.onload = function(e) {
            zip.file(file.name, e.target.result, {binary: true});
            var metadataBlob = new Blob([JSON.stringify({ metadata: metadata })], { type: 'application/json' });
            zip.file('metadata.json', metadataBlob);
            zip.generateAsync({type: 'blob'}).then(function(content) {
                var timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                var filename = 'image-metadata-' + timestamp + '.zip';
                saveToGitHub(content, filename, token, username, repo);
            });
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert('Please provide all required fields.');
    }
});

async function saveToGitHub(zipContent, filename, token, username, repo) {
    const latestCommitResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/git/refs/heads/main`, {
        headers: { 'Authorization': `token ${token}` }
    });
    const latestCommitData = await latestCommitResponse.json();
    const latestCommitSha = latestCommitData.object.sha;

    const commitResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/git/commits/${latestCommitSha}`, {
        headers: { 'Authorization': `token ${token}` }
    });
    const commitData = await commitResponse.json();
    const treeSha = commitData.tree.sha;

    const blobResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/git/blobs`, {
        method: 'POST',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: btoa(String.fromCharCode.apply(null, new Uint8Array(zipContent))), encoding: 'base64' })
    });
    const blobData = await blobResponse.json();
    const blobSha = blobData.sha;

    const treeResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/git/trees`, {
        method: 'POST',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            base_tree: treeSha,
            tree: [
                {
                    path: filename,
                    mode: '100644',
                    type: 'blob',
                    sha: blobSha
                }
            ]
        })
    });
    const treeData = await treeResponse.json();
    const newTreeSha = treeData.sha;

    const newCommitResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/git/commits`, {
        method: 'POST',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Upload ZIP file',
            tree: newTreeSha,
            parents: [latestCommitSha]
        })
    });
    const newCommitData = await newCommitResponse.json();
    const newCommitSha = newCommitData.sha;

    await fetch(`https://api.github.com/repos/${username}/${repo}/git/refs/heads/main`, {
        method: 'PATCH',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sha: newCommitSha })
    });
}
=======
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
>>>>>>> parent of e39296c (git upload)
