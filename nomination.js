document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('nominationForm');
    const manifesto = document.getElementById('manifesto');
    const wordCount = document.getElementById('wordCount');
    const fileInput = document.getElementById('photo');
    const fileName = document.getElementById('fileName');

    // Manifesto word counter
    manifesto.addEventListener('input', function() {
        const words = manifesto.value.trim().split(/\s+/).filter(Boolean).length;
        wordCount.textContent = '${words}/500 words';
        if (words > 500) {
            wordCount.style.color = 'red';
        } else {
            wordCount.style.color = '#7f8c8d';
        }
    });

    // File upload display
    fileInput.addEventListener('change', function() {
        if (fileInput.files.length > 0) {
            fileName.textContent = fileInput.files[0].name;
        } else {
            fileName.textContent = 'No file chosen';
        }
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate file size (2MB max)
        if (fileInput.files[0] && fileInput.files[0].size > 2 * 1024 * 1024) {
            alert('Profile photo must be less than 2MB!');
            return;
        }

        // Simulate submission (replace with actual API call)
        alert('Nomination submitted successfully! An admin will review your application.');
        form.reset();
        fileName.textContent = 'No file chosen';
        wordCount.textContent = '0/500 words';
    });
});
