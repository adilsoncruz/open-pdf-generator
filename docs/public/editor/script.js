// PDF Template Editor - GitHub Pages Script

// OS Detection and Download Configuration
const downloadConfig = {
    macos: {
        name: 'macOS',
        extension: '.dmg',
        url: 'https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/PDF-Template-Editor-macos.dmg',
        icon: '🍎',
        requirements: 'Requires macOS 10.15 (Catalina) or later'
    },
    windows: {
        name: 'Windows',
        extension: '.exe',
        url: 'https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/PDF-Template-Editor-windows.exe',
        icon: '🪟',
        requirements: 'Requires Windows 10 or later (64-bit)'
    },
    linux: {
        name: 'Linux',
        extension: '.AppImage',
        url: 'https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/PDF-Template-Editor-linux.AppImage',
        icon: '🐧',
        requirements: 'Works on most Linux distributions (64-bit)'
    }
};

function detectOS() {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    
    if (platform.includes('mac') || userAgent.includes('mac')) {
        return 'macos';
    } else if (platform.includes('win') || userAgent.includes('win')) {
        return 'windows';
    } else if (platform.includes('linux') || userAgent.includes('linux')) {
        return 'linux';
    }
    
    // Default to macOS if unknown
    return 'macos';
}

function updateDownloadButtons() {
    const os = detectOS();
    const config = downloadConfig[os];
    
    // Update hero download button
    const heroDownloadBtn = document.querySelector('.hero-actions .btn-primary');
    if (heroDownloadBtn) {
        heroDownloadBtn.href = config.url;
        heroDownloadBtn.innerHTML = `
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7,10 12,15 17,10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download for ${config.name}
        `;
    }
    
    // Update main download button
    const mainDownloadBtn = document.querySelector('.btn-download');
    if (mainDownloadBtn) {
        mainDownloadBtn.href = config.url;
        mainDownloadBtn.innerHTML = `
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7,10 12,15 17,10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download ${config.extension}
        `;
    }
    
    // Update requirements text
    const downloadNote = document.querySelector('.download-note');
    if (downloadNote) {
        downloadNote.textContent = config.requirements;
    }
    
    // Update platform info
    const platformInfo = document.querySelector('.info-item:nth-child(2)');
    if (platformInfo) {
        platformInfo.innerHTML = `<strong>Platform:</strong> ${config.name} (detected)`;
    }
    
    // Add other platforms dropdown
    addOtherPlatformsDropdown(os);
}

function addOtherPlatformsDropdown(currentOS) {
    const downloadContent = document.querySelector('.download-content');
    if (!downloadContent) return;
    
    // Check if dropdown already exists
    if (document.querySelector('.other-platforms')) return;
    
    const otherPlatforms = Object.entries(downloadConfig)
        .filter(([key]) => key !== currentOS)
        .map(([key, config]) => `
            <a href="${config.url}" class="platform-link">
                <span class="platform-icon">${config.icon}</span>
                <span>${config.name} (${config.extension})</span>
            </a>
        `).join('');
    
    const dropdown = document.createElement('div');
    dropdown.className = 'other-platforms';
    dropdown.innerHTML = `
        <p class="other-platforms-label">Other platforms:</p>
        <div class="platform-links">
            ${otherPlatforms}
        </div>
    `;
    
    // Insert after download note
    const downloadNote = downloadContent.querySelector('.download-note');
    if (downloadNote) {
        downloadNote.after(dropdown);
    }
    
    // Add styles for the dropdown
    const style = document.createElement('style');
    style.textContent = `
        .other-platforms {
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid var(--color-border);
        }
        .other-platforms-label {
            font-size: 0.9rem;
            color: var(--color-text-muted);
            margin-bottom: 12px;
        }
        .platform-links {
            display: flex;
            justify-content: center;
            gap: 16px;
            flex-wrap: wrap;
        }
        .platform-link {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            color: var(--color-text-secondary);
            text-decoration: none;
            font-size: 0.9rem;
            transition: var(--transition-fast);
        }
        .platform-link:hover {
            border-color: var(--color-primary);
            color: var(--color-text);
            transform: translateY(-2px);
        }
        .platform-icon {
            font-size: 1.2rem;
        }
    `;
    document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', () => {
    // Detect OS and update download buttons
    updateDownloadButtons();
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on load
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80; // Account for fixed navbar
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe all animated elements
    document.querySelectorAll('.feature-card, .doc-card, .screenshot-card, .element-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Add visible class styles
    const style = document.createElement('style');
    style.textContent = `
        .feature-card.visible,
        .doc-card.visible,
        .screenshot-card.visible,
        .element-item.visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
    
    // Download button click tracking (optional - for analytics)
    const downloadBtn = document.querySelector('.btn-download');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            console.log('Download initiated');
            // You can add analytics tracking here
        });
    }
    
    // Interactive preview window hover effect
    const previewWindow = document.querySelector('.app-preview');
    if (previewWindow) {
        previewWindow.addEventListener('mouseenter', () => {
            previewWindow.style.transform = 'rotateY(0) rotateX(0) scale(1.02)';
        });
        
        previewWindow.addEventListener('mouseleave', () => {
            previewWindow.style.transform = 'rotateY(-5deg) rotateX(2deg) scale(1)';
        });
    }
    
    // Keyboard shortcuts demo animation
    const shortcuts = document.querySelectorAll('.shortcut');
    shortcuts.forEach(shortcut => {
        shortcut.addEventListener('mouseenter', () => {
            const kbds = shortcut.querySelectorAll('kbd');
            kbds.forEach((kbd, index) => {
                setTimeout(() => {
                    kbd.style.transform = 'translateY(-2px)';
                    kbd.style.boxShadow = '0 4px 0 var(--color-primary)';
                }, index * 50);
            });
        });
        
        shortcut.addEventListener('mouseleave', () => {
            const kbds = shortcut.querySelectorAll('kbd');
            kbds.forEach(kbd => {
                kbd.style.transform = '';
                kbd.style.boxShadow = '';
            });
        });
    });
    
    // Copy code blocks on click
    document.querySelectorAll('.code-block code, .mini-code').forEach(codeBlock => {
        codeBlock.style.cursor = 'pointer';
        codeBlock.title = 'Click to copy';
        
        codeBlock.addEventListener('click', async () => {
            const text = codeBlock.textContent;
            try {
                await navigator.clipboard.writeText(text);
                
                // Show feedback
                const originalText = codeBlock.textContent;
                codeBlock.textContent = '✓ Copied!';
                codeBlock.style.color = 'var(--color-success)';
                
                setTimeout(() => {
                    codeBlock.textContent = originalText;
                    codeBlock.style.color = '';
                }, 1500);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });
    });
    
    // Parallax effect for floating shapes
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const shapes = document.querySelectorAll('.shape');
                
                shapes.forEach((shape, index) => {
                    const speed = (index + 1) * 0.05;
                    shape.style.transform = `translateY(${scrollY * speed}px)`;
                });
                
                ticking = false;
            });
            
            ticking = true;
        }
    });
    
    // Feature card hover effects
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            const icon = card.querySelector('.feature-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
                icon.style.transition = 'transform 0.3s ease';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            const icon = card.querySelector('.feature-icon');
            if (icon) {
                icon.style.transform = '';
            }
        });
    });
    
    // Mobile menu toggle (if needed in the future)
    // This is a placeholder for mobile navigation
    
    console.log('PDF Template Editor page loaded successfully! 🚀');
});

// Utility function to check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}















