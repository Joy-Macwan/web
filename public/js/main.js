document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Auto-hide alerts after 5 seconds
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
        alerts.forEach(function(alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Form validation feedback
    const forms = document.querySelectorAll('.needs-validation');
    Array.prototype.slice.call(forms).forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    // Dynamic search functionality
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(function(input) {
        let timeout;
        input.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                performSearch(input.value, input.dataset.searchType);
            }, 500);
        });
    });

    // Like/Unlike functionality
    document.addEventListener('click', function(e) {
        if (e.target.matches('.like-btn') || e.target.closest('.like-btn')) {
            e.preventDefault();
            const btn = e.target.matches('.like-btn') ? e.target : e.target.closest('.like-btn');
            const type = btn.dataset.type;
            const id = btn.dataset.id;
            handleLike(type, id, btn);
        }
    });

    // Report functionality
    document.addEventListener('click', function(e) {
        if (e.target.matches('.report-btn') || e.target.closest('.report-btn')) {
            e.preventDefault();
            const btn = e.target.matches('.report-btn') ? e.target : e.target.closest('.report-btn');
            const type = btn.dataset.type;
            const id = btn.dataset.id;
            handleReport(type, id, btn);
        }
    });
});

function performSearch(query, type) {
    if (query.length < 2) return;
    
    fetch(`/search?q=${encodeURIComponent(query)}&type=${type}`)
        .then(response => response.json())
        .then(data => {
            updateSearchResults(data, type);
        })
        .catch(error => {
            console.error('Search error:', error);
        });
}

function updateSearchResults(results, type) {
    const container = document.querySelector(`#${type}-results`);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (results.length === 0) {
        container.innerHTML = '<p class="text-muted">No results found</p>';
        return;
    }
    
    results.forEach(result => {
        const item = createSearchResultItem(result, type);
        container.appendChild(item);
    });
}

function createSearchResultItem(result, type) {
    const div = document.createElement('div');
    div.className = 'search-result-item p-3 border-bottom';
    
    let content = '';
    switch(type) {
        case 'resources':
            content = `
                <h6><a href="/resources/${result._id}">${result.title}</a></h6>
                <p class="mb-1">${result.description}</p>
                <small class="text-muted">Type: ${result.type} | Category: ${result.category}</small>
            `;
            break;
        case 'forum':
            content = `
                <h6><a href="/forum/${result._id}">${result.title}</a></h6>
                <p class="mb-1">${result.content.substring(0, 150)}...</p>
                <small class="text-muted">Category: ${result.category} | ${result.replies.length} replies</small>
            `;
            break;
    }
    
    div.innerHTML = content;
    return div;
}

function handleLike(type, id, btn) {
    fetch(`/${type}/${id}/like`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const countSpan = btn.querySelector('.like-count');
            if (countSpan) {
                countSpan.textContent = data.likes;
            }
            btn.classList.add('liked');
            
            // Show success message
            showToast('Liked successfully!', 'success');
        }
    })
    .catch(error => {
        console.error('Like error:', error);
        showToast('Failed to like. Please try again.', 'error');
    });
}

function handleReport(type, id, btn) {
    if (confirm('Are you sure you want to report this content?')) {
        fetch(`/${type}/${id}/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                btn.disabled = true;
                btn.textContent = 'Reported';
                showToast('Content reported successfully!', 'success');
            }
        })
        .catch(error => {
            console.error('Report error:', error);
            showToast('Failed to report. Please try again.', 'error');
        });
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    const container = document.querySelector('#toast-container') || createToastContainer();
    container.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(container);
    return container;
}

// Mental health assessment progress tracking
function updateAssessmentProgress() {
    const questions = document.querySelectorAll('.question-block');
    const answeredQuestions = document.querySelectorAll('input[type="radio"]:checked');
    const progress = (answeredQuestions.length / questions.length) * 100;
    
    const progressBar = document.querySelector('#assessment-progress');
    if (progressBar) {
        progressBar.style.width = progress + '%';
        progressBar.setAttribute('aria-valuenow', progress);
    }
    
    const submitBtn = document.querySelector('#submit-assessment');
    if (submitBtn) {
        submitBtn.disabled = progress < 100;
    }
}

// Add event listeners for assessment forms
document.addEventListener('change', function(e) {
    if (e.target.matches('input[type="radio"][name^="answers"]')) {
        updateAssessmentProgress();
    }
});

// Crisis detection and intervention
function checkForCrisisKeywords(message) {
    const crisisKeywords = [
        'suicide', 'kill myself', 'end it all', 'die', 'hurt myself', 
        'self-harm', 'cutting', 'overdose', 'worthless', 'hopeless'
    ];
    
    const lowerMessage = message.toLowerCase();
    return crisisKeywords.some(keyword => lowerMessage.includes(keyword));
}

function showCrisisIntervention() {
    const modal = new bootstrap.Modal(document.getElementById('crisisModal'));
    modal.show();
}

// Export functions for use in other files
window.MentalHealthApp = {
    showToast,
    handleLike,
    handleReport,
    checkForCrisisKeywords,
    showCrisisIntervention
};