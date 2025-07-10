// Configuration - Replace with your Azure backend URL
const AZURE_BACKEND_URL =
  "https://langvault-ehefa6cje7ckegd8.centralindia-01.azurewebsites.net"; // Replace with your actual Azure URL

// DOM Elements
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const filePreview = document.getElementById("filePreview");
const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");
const removeFile = document.getElementById("removeFile");
const languageInput = document.getElementById("language");
const languageSuggestions = document.getElementById("languageSuggestions");
const uploadForm = document.getElementById("uploadForm");
const submitBtn = document.getElementById("submitBtn");
const themeToggle = document.getElementById("themeToggle");
const copyTextBtn = document.getElementById("copyText");
const bars = document.getElementById("mobileMenuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const mobileThemeToggle = document.getElementById("mobileThemeToggle");
const close = document.querySelector(".close");

// Language suggestions data - Will be loaded from API
let languages = [];

// Load supported languages from Azure backend
async function loadSupportedLanguages() {
  try {
    const response = await fetch(`${AZURE_BACKEND_URL}/api/languages`);
    if (response.ok) {
      const data = await response.json();
      // Transform API response to match existing format
      languages = data.languages.map((lang) => ({
        name: lang.charAt(0).toUpperCase() + lang.slice(1),
        flag: getLanguageFlag(lang),
      }));
    } else {
      // Fallback to default languages if API fails
      loadDefaultLanguages();
    }
  } catch (error) {
    console.error("Failed to load languages from API:", error);
    loadDefaultLanguages();
  }
}

// Fallback language list
function loadDefaultLanguages() {
  languages = [
    { name: "Spanish", flag: "🇪🇸" },
    { name: "French", flag: "🇫🇷" },
    { name: "German", flag: "🇩🇪" },
    { name: "Italian", flag: "🇮🇹" },
    { name: "Portuguese", flag: "🇵🇹" },
    { name: "Japanese", flag: "🇯🇵" },
    { name: "Korean", flag: "🇰🇷" },
    { name: "Chinese", flag: "🇨🇳" },
    { name: "Russian", flag: "🇷🇺" },
    { name: "Arabic", flag: "🇸🇦" },
    { name: "Hindi", flag: "🇮🇳" },
    { name: "Dutch", flag: "🇳🇱" },
    { name: "Swedish", flag: "🇸🇪" },
    { name: "Norwegian", flag: "🇳🇴" },
    { name: "Danish", flag: "🇩🇰" },
    { name: "Finnish", flag: "🇫🇮" },
    { name: "Polish", flag: "🇵🇱" },
    { name: "Turkish", flag: "🇹🇷" },
    { name: "Greek", flag: "🇬🇷" },
    { name: "Hebrew", flag: "🇮🇱" },
  ];
}

// Get flag emoji for language
function getLanguageFlag(language) {
  const flagMap = {
    spanish: "🇪🇸",
    french: "🇫🇷",
    german: "🇩🇪",
    italian: "🇮🇹",
    portuguese: "🇵🇹",
    japanese: "🇯🇵",
    korean: "🇰🇷",
    chinese: "🇨🇳",
    russian: "🇷🇺",
    arabic: "🇸🇦",
    hindi: "🇮🇳",
    dutch: "🇳🇱",
    swedish: "🇸🇪",
    norwegian: "🇳🇴",
    danish: "🇩🇰",
    finnish: "🇫🇮",
    polish: "🇵🇱",
    turkish: "🇹🇷",
    greek: "🇬🇷",
    hebrew: "🇮🇱",
  };
  return flagMap[language.toLowerCase()] || "🌐";
}

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  const body = document.body;
  const desktopIcon = themeToggle?.querySelector("i");
  const mobileIcon = mobileThemeToggle?.querySelector("i");

  if (savedTheme === "light") {
  body.classList.add("light-theme");
  if (desktopIcon) desktopIcon.className = "fas fa-sun";
  if (mobileIcon) mobileIcon.className = "fas fa-sun";
} else {
  body.classList.remove("light-theme");
  if (desktopIcon) desktopIcon.className = "fas fa-moon";
  if (mobileIcon) mobileIcon.className = "fas fa-moon";
}
}

function toggleTheme() {
  const body = document.body;
  const themeIcon = themeToggle?.querySelector("i");
  const isLight = body.classList.contains("light-theme");

 if (isLight) {
  body.classList.remove("light-theme");
  if (desktopIcon) desktopIcon.className = "fas fa-moon";
  if (mobileIcon) mobileIcon.className = "fas fa-moon";
  localStorage.setItem("theme", "dark");
  showToast("Dark mode enabled", "success");
} else {
  body.classList.add("light-theme");
  if (desktopIcon) desktopIcon.className = "fas fa-sun";
  if (mobileIcon) mobileIcon.className = "fas fa-sun";
  localStorage.setItem("theme", "light");
  showToast("Light mode enabled", "success");
}
}

// File Upload Handlers
function initFileUpload() {
  const browseText = document.getElementById("browseText");

  // Handle click on drop zone
  dropZone?.addEventListener("click", () => {
    fileInput?.click();
  });

  // Handle click on 'browse files' span separately
  if (browseText) {
    browseText.addEventListener("click", (e) => {
      e.stopPropagation();
      fileInput?.click();
    });
  }

  // Drag and drop handlers
  dropZone?.addEventListener("dragover", handleDragOver);
  dropZone?.addEventListener("dragleave", handleDragLeave);
  dropZone?.addEventListener("drop", handleDrop);

  // File input change
  fileInput?.addEventListener("change", handleFileSelect);

  // Remove file button
  if (removeFile) {
    removeFile.addEventListener("click", (e) => {
      e.stopPropagation();
      clearFile();
    });
  }
}

function handleDragOver(e) {
  e.preventDefault();
  dropZone?.classList.add("drag-over");
}

function handleDragLeave(e) {
  e.preventDefault();
  dropZone?.classList.remove("drag-over");
}

function handleDrop(e) {
  e.preventDefault();
  dropZone?.classList.remove("drag-over");

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (isValidFileType(file)) {
      displayFile(file);
      if (fileInput) fileInput.files = files;
    } else {
      showToast("Please select a valid file (PDF, DOCX, TXT)", "error");
    }
  }
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) {
    displayFile(file);
  }
}

function isValidFileType(file) {
  const validTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];
  const validExtensions = [".pdf", ".docx", ".txt"];
  return (
    validTypes.includes(file.type) ||
    validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
  );
}

function displayFile(file) {
  if (fileName) fileName.textContent = file.name;
  if (fileSize) fileSize.textContent = formatFileSize(file.size);
  if (filePreview) filePreview.style.display = "block";
  const dropZoneContent = dropZone?.querySelector(".drop-zone-content");
  if (dropZoneContent) dropZoneContent.style.display = "none";
}

function clearFile() {
  if (fileInput) fileInput.value = "";
  if (filePreview) filePreview.style.display = "none";
  const dropZoneContent = dropZone?.querySelector(".drop-zone-content");
  if (dropZoneContent) dropZoneContent.style.display = "block";
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Language Suggestions
function initLanguageSuggestions() {
  languageInput?.addEventListener("focus", showLanguageSuggestions);
  languageInput?.addEventListener("input", filterLanguageSuggestions);
  languageInput?.addEventListener("blur", hideLanguageSuggestions);

  // Handle suggestion clicks
  languageSuggestions?.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("suggestion-item")) {
      const language = e.target.dataset.lang;
      if (languageInput) languageInput.value = language;
      hideLanguageSuggestions();
    }
  });
}

function showLanguageSuggestions() {
  populateLanguageSuggestions();
  languageSuggestions?.classList.add("show");
}

function hideLanguageSuggestions() {
  setTimeout(() => {
    languageSuggestions?.classList.remove("show");
  }, 150);
}

function filterLanguageSuggestions() {
  const query = languageInput?.value.toLowerCase() || "";
  const filteredLanguages = languages.filter((lang) =>
    lang.name.toLowerCase().includes(query)
  );
  populateLanguageSuggestions(filteredLanguages);
}

function populateLanguageSuggestions(filteredLanguages = languages) {
  if (!languageSuggestions) return;

  languageSuggestions.innerHTML = "";
  filteredLanguages.slice(0, 8).forEach((lang) => {
    const item = document.createElement("div");
    item.className = "suggestion-item";
    item.dataset.lang = lang.name;
    item.innerHTML = `${lang.flag} ${lang.name}`;
    languageSuggestions.appendChild(item);
  });
}

// Form Submission - Modified for Azure backend
function initFormSubmission() {
  uploadForm?.addEventListener("submit", handleFormSubmit);
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const file = fileInput?.files[0];
  const language = languageInput?.value.trim();

  if (!file) {
    showToast("Please select a file", "error");
    return;
  }

  if (!language) {
    showToast("Please enter a target language", "error");
    return;
  }

  // Show loading state
  showLoadingState();

  try {
    // Submit form to Azure backend
    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);

    const response = await fetch(`${AZURE_BACKEND_URL}/api/translate`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Translation failed");
    }

    const result = await response.json();

    // Handle successful translation
    displayTranslationResults(result);
    showToast(
      result.message || "Translation completed successfully!",
      "success"
    );
  } catch (error) {
    console.error("Translation error:", error);
    showToast(
      error.message || "Translation failed. Please try again.",
      "error"
    );
  } finally {
    hideLoadingState();
  }
}

// Display translation results
function displayTranslationResults(result) {
  // Remove existing results section
  const existingResults = document.querySelector(".results-section");
  if (existingResults) {
    existingResults.remove();
  }

  // Create results section
  const resultsSection = document.createElement("section");
  resultsSection.className = "results-section";

  const translatedPages = Array.isArray(result.translated_text)
    ? result.translated_text.join("\n\n--- Page Break ---\n\n")
    : result.translated_text;

  resultsSection.innerHTML = `
        <div class="results-container">
            <div class="results-card glass-card">
                <div class="results-header">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="results-info">
                        <h3>Translation Complete</h3>
                        <p>${
                          result.translation_stats?.total_pages || 1
                        } pages successfully processed</p>
                    </div>
                    <div class="results-actions">
                        <button class="action-btn" id="copyText" title="Copy to clipboard">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="action-btn" id="downloadText" title="Download as text file">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>

                <div class="translation-content">
                    <div class="content-tabs">
                        <button class="tab-btn active" data-tab="preview">
                            <i class="fas fa-eye"></i>
                            Preview
                        </button>
                        <button class="tab-btn" data-tab="formatted">
                            <i class="fas fa-align-left"></i>
                            Formatted
                        </button>
                    </div>

                    <div class="tab-content active" id="preview">
                        <div class="translated-text">
                            ${translatedPages.replace(/\n/g, "<br>")}
                        </div>
                    </div>

                    <div class="tab-content" id="formatted">
                        <pre class="formatted-text">${translatedPages}</pre>
                    </div>
                </div>

                <div class="translation-stats">
                    <div class="stat-item">
                        <i class="fas fa-file-alt"></i>
                        <div class="stat-info">
                            <span class="stat-value">${
                              result.translation_stats?.total_pages || 1
                            }</span>
                            <span class="stat-label">Pages</span>
                        </div>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-language"></i>
                        <div class="stat-info">
                            <span class="stat-value">${
                              result.translation_stats?.target_language ||
                              language
                            }</span>
                            <span class="stat-label">Language</span>
                        </div>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-check-circle"></i>
                        <div class="stat-info">
                            <span class="stat-value">${
                              result.translation_stats
                                ?.successful_translations || 1
                            }</span>
                            <span class="stat-label">Success</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

  // Insert results after upload section
  const uploadSection = document.querySelector(".upload-section");
  if (uploadSection) {
    uploadSection.insertAdjacentElement("afterend", resultsSection);
  }

  // Reinitialize tab and copy functionality
  initTabs();
  initCopyFunction();
  initDownloadFunction();

  // Scroll to results
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Download functionality
function initDownloadFunction() {
  const downloadBtn = document.getElementById("downloadText");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", downloadTranslatedText);
  }
}

function downloadTranslatedText() {
  const translatedText = document.querySelector(".translated-text");
  if (translatedText) {
    const text = translatedText.textContent || translatedText.innerText;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "translated_document.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("File downloaded successfully!", "success");
  }
}

function showLoadingState() {
  const btnContent = submitBtn?.querySelector(".btn-content");
  const btnLoader = submitBtn?.querySelector(".btn-loader");

  if (btnContent && btnLoader) {
    btnContent.style.display = "none";
    btnLoader.style.display = "flex";
  }
  if (submitBtn) submitBtn.disabled = true;

  // Add progress animation
  const progressBar = document.createElement("div");
  progressBar.className = "progress-bar";
  progressBar.innerHTML = '<div class="progress-fill"></div>';
  progressBar.style.cssText = `
        width: 100%;
        height: 4px;
        background: rgba(255,255,255,0.1);
        border-radius: 2px;
        margin-top: 10px;
        overflow: hidden;
    `;
  progressBar.querySelector(".progress-fill").style.cssText = `
        height: 100%;
        background: linear-gradient(90deg, #6366f1, #8b5cf6);
        border-radius: 2px;
        width: 0%;
        transition: width 0.3s ease;
    `;

  uploadForm?.appendChild(progressBar);

  // Simulate progress
  let progress = 0;
  const progressFill = progressBar.querySelector(".progress-fill");
  const progressInterval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress > 90) {
      progress = 90;
      clearInterval(progressInterval);
    }
    if (progressFill) progressFill.style.width = progress + "%";
  }, 500);
}

function hideLoadingState() {
  const btnContent = submitBtn?.querySelector(".btn-content");
  const btnLoader = submitBtn?.querySelector(".btn-loader");
  const progressBar = document.querySelector(".progress-bar");

  if (btnContent && btnLoader) {
    btnContent.style.display = "flex";
    btnLoader.style.display = "none";
  }
  if (submitBtn) submitBtn.disabled = false;

  if (progressBar) {
    progressBar.remove();
  }
}

// Tab Functionality
function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;

      // Remove active class from all buttons and contents
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      // Add active class to clicked button and corresponding content
      btn.classList.add("active");
      const targetContent = document.getElementById(targetTab);
      if (targetContent) targetContent.classList.add("active");
    });
  });
}

// Copy to Clipboard
function initCopyFunction() {
  const copyBtn = document.getElementById("copyText");
  if (copyBtn) {
    copyBtn.addEventListener("click", copyTranslatedText);
  }
}

function copyTranslatedText() {
  const translatedText = document.querySelector(".translated-text");
  if (translatedText) {
    const text = translatedText.textContent || translatedText.innerText;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast("Text copied to clipboard!", "success");
        const copyBtn = document.getElementById("copyText");
        if (copyBtn) {
          copyBtn.classList.add("copy-success");
          setTimeout(() => {
            copyBtn.classList.remove("copy-success");
          }, 600);
        }
      })
      .catch(() => {
        showToast("Failed to copy text", "error");
      });
  }
}

// Toast Notifications
function showToast(message, type = "success") {
  // Remove existing toasts
  const existingToasts = document.querySelectorAll(".toast");
  existingToasts.forEach((toast) => toast.remove());

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "success" ? "#10b981" : "#ef4444"};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

  toast.innerHTML = `
        <i class="fas ${
          type === "success" ? "fa-check-circle" : "fa-exclamation-circle"
        }"></i>
        <span>${message}</span>
    `;

  document.body.appendChild(toast);

  // Show toast
  setTimeout(() => {
    toast.style.transform = "translateX(0)";
  }, 100);

  // Hide toast after 3 seconds
  setTimeout(() => {
    toast.style.transform = "translateX(100%)";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Smooth Scrolling for Navigation Links
function initSmoothScrolling() {
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
}

// Add loading animations
function addLoadingAnimations() {
  const animatedElements = document.querySelectorAll(
    ".upload-card, .feature-card, .results-card"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-in");
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }
  );

  animatedElements.forEach((el) => {
    observer.observe(el);
  });
}

// Keyboard shortcuts
function initKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // Ctrl/Cmd + U to focus file upload
    if ((e.ctrlKey || e.metaKey) && e.key === "u") {
      e.preventDefault();
      fileInput?.click();
    }

    // Ctrl/Cmd + L to focus language input
    if ((e.ctrlKey || e.metaKey) && e.key === "l") {
      e.preventDefault();
      languageInput?.focus();
    }

    // Ctrl/Cmd + Enter to submit form
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (fileInput?.files[0] && languageInput?.value.trim()) {
        uploadForm?.dispatchEvent(new Event("submit"));
      }
    }

    // Escape to close language suggestions
    if (e.key === "Escape") {
      hideLanguageSuggestions();
    }
  });
}

// Health check function
async function checkBackendHealth() {
  try {
    const response = await fetch(`${AZURE_BACKEND_URL}/api/health`);
    if (response.ok) {
      const data = await response.json();
      console.log("Backend health check:", data);
      return true;
    }
  } catch (error) {
    console.error("Backend health check failed:", error);
    showToast("Connection to server failed. Please try again later.", "error");
    return false;
  }
}

function initMobileMenuToggle() {
  if (bars && mobileMenu) {
    bars.addEventListener("click", () => {
      mobileMenu.classList.toggle("active");
      console.log("Bars clicked");
    });
  } else {
    console.error("Mobile menu toggle elements not found.");
  }
}

//event listener for mobile menu close button
close?.addEventListener("click", () => {
  if (mobileMenu) {
    mobileMenu.classList.remove("active");
    console.log("Close button clicked");
  } else {
    console.error("Mobile menu not found.");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenuToggle();

  // include other init functions if you have them
});

// Initialize all functionality
async function initializeApp() {
  initTheme();
  await loadSupportedLanguages();
  initFileUpload();
  initLanguageSuggestions();
  initFormSubmission();
  initTabs();
  initCopyFunction();
  initSmoothScrolling();
  addLoadingAnimations();
  initKeyboardShortcuts();
  initMobileMenuToggle();

  // Event listeners
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  if (mobileThemeToggle) {
  mobileThemeToggle.addEventListener("click", toggleTheme);
}

  // Check backend health
  await checkBackendHealth();
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeApp);

// Reinitialize when page content is dynamically updated
window.addEventListener("load", initializeApp);
