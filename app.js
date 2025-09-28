// app.js - VERSÃO FINAL E COMPLETA (24/09/2025)
// Inclui troca de foto por tema e layout original com margem ajustada.

async function loadTranslations() {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get('lang') || navigator.language.split('-')[0] || 'pt';
    try {
        const response = await fetch('translations.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const translations = await response.json();
        const langData = translations[lang] || translations['pt'];
        
        initializePage(langData);

    } catch (error) { console.error('Falha ao carregar ou aplicar traduções:', error); }
}

function initializePage(data) {
    applyTextContent(data);
    populateExperience(data.experienceEntries);
    populateEducation(data.educationEntries);
    populateProjects(data.projectsEntries);
    populateLists(data.skillsList, 'skills-list');
    populateLists(data.languagesList, 'languages-list');
    document.documentElement.lang = data.lang || 'pt';

    setupThemeToggleButton(data.photoUrls);
    setupPhotoToggleButton();
    setupDownloadButton(data);
    applySavedTheme(data.photoUrls);
    document.getElementById('current-year').textContent = new Date().getFullYear();
}

function applyTextContent(data) {
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (data[key]) {
            el.innerHTML = data[key];
        }
    });
}

function populateExperience(entries) {
    const container = document.getElementById('experience-container');
    container.innerHTML = '';
    entries.forEach(job => {
        const jobDiv = document.createElement('div');
        jobDiv.className = 'job';
        jobDiv.innerHTML = `<h3><span class="job-title">${job.role}</span> • ${job.company}</h3><p class="date">${job.date}</p><ul>${job.duties.map(duty => `<li>${duty}</li>`).join('')}</ul>`;
        container.appendChild(jobDiv);
    });
}

function populateEducation(entries) {
    const container = document.getElementById('education-container');
    container.innerHTML = '';
    entries.forEach(edu => {
        const eduDiv = document.createElement('div');
        eduDiv.className = 'education-entry';
        eduDiv.innerHTML = `<h3>${edu.degree}</h3><p><strong>${edu.institution}</strong><br><em>${edu.period}</em></p>`;
        container.appendChild(eduDiv);
    });
}

function populateProjects(entries) {
    const container = document.getElementById('projects-container');
    container.innerHTML = '';
    entries.forEach(proj => {
        const projDiv = document.createElement('div');
        projDiv.className = 'project';
        projDiv.innerHTML = `<h3>${proj.name}</h3><p><strong>Descrição:</strong> ${proj.description}</p><p><strong>Tecnologias:</strong> ${proj.tech}</p><p><strong>Repositório:</strong> <a href="https://github.com/icarosqz/gespec" target="_blank">${proj.repo}</a></p>`;
        container.appendChild(projDiv);
    });
}

function populateLists(items, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    items.forEach(itemText => {
        const li = document.createElement('li');
        li.innerHTML = itemText;
        container.appendChild(li);
    });
}

function setupDownloadButton(langData) {
    const downloadButton = document.getElementById('download-btn');
    if (downloadButton) {
        downloadButton.addEventListener('click', () => {
            const isDarkMode = document.body.classList.contains('dark-mode');
            const theme = isDarkMode ? 'dark' : 'light';
            const isPhotoVisible = document.querySelector('.profile-photo').classList.contains('visible');
            generatePdf(langData, theme, isPhotoVisible);
        });
    }
}

function updateProfilePhoto(theme, photoUrls) {
    const profileImg = document.getElementById('profile-img');
    if (profileImg && photoUrls) {
        profileImg.src = theme === 'dark' ? photoUrls.dark : photoUrls.light;
    }
}

function setupThemeToggleButton(photoUrls) {
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            const newTheme = isDarkMode ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            updateProfilePhoto(newTheme, photoUrls);
        });
    }
}

function setupPhotoToggleButton() {
    const photoToggleButton = document.getElementById('photo-toggle');
    const photoContainer = document.querySelector('.profile-photo');
    if (photoToggleButton && photoContainer) {
        photoToggleButton.addEventListener('click', () => {
            photoContainer.classList.toggle('visible');
        });
    }
}

function applySavedTheme(photoUrls) {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    updateProfilePhoto(savedTheme, photoUrls);
}

function generatePdf(data, theme, showPhoto) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const colors = {
        light: { bg: '#FFFFFF', text: '#555', heading: '#34495e', strong: '#2c3e50', accent: '#007bff', border: '#e0e0e0' },
        dark: { bg: '#2B2B2B', text: '#e0e0e0', heading: '#ffffff', strong: '#8be9fd', accent: '#8be9fd', border: '#333' }
    };
    const currentTheme = colors[theme];
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const leftMargin = 12;
    const contentWidth = pageWidth - (leftMargin * 2);
    
    let yPos = 10; 

    const drawBackground = () => {
        if (theme === 'dark') {
            doc.setFillColor(currentTheme.bg);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
        }
    };

    const checkPageBreak = () => {
        if (yPos > 275) {
            doc.addPage();
            yPos = 10; 
            drawBackground();
        }
    };

    const addSection = (title, options = {}) => {
        const marginTop = options.marginTop || 0;
        yPos += marginTop;
        checkPageBreak();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(currentTheme.heading);
        doc.text(title, leftMargin, yPos);
        doc.setDrawColor(currentTheme.border);
        doc.setLineWidth(0.2);
        doc.line(leftMargin, yPos + 1.5, pageWidth - leftMargin, yPos + 1.5);
        yPos += 8;
    };
    
    const drawHeaderText = () => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(currentTheme.strong);
        doc.text(data.name, pageWidth / 2, yPos, { align: 'center' });
        yPos += 7;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const email = 'icarogabriels@proton.me';
        const otherInfo = ` • +55 (83) 98195-0410 • ${data.location}`;
        const emailWidth = doc.getStringUnitWidth(email) * doc.getFontSize() / doc.internal.scaleFactor;
        const otherInfoWidth = doc.getStringUnitWidth(otherInfo) * doc.getFontSize() / doc.internal.scaleFactor;
        const totalWidth = emailWidth + otherInfoWidth;
        let currentX = (pageWidth / 2) - (totalWidth / 2);
        doc.setTextColor(currentTheme.accent);
        doc.text(email, currentX, yPos);
        currentX += emailWidth;
        doc.setTextColor(currentTheme.text);
        doc.text(otherInfo, currentX, yPos);
        yPos += 4;

        const githubText = 'GitHub: icarosqz';
        const linkedinText = 'LinkedIn';
        const separator = ' • ';
        doc.setFont("helvetica", "bold");
        const githubWidth = doc.getStringUnitWidth(githubText) * doc.getFontSize() / doc.internal.scaleFactor;
        const linkedinWidth = doc.getStringUnitWidth(linkedinText) * doc.getFontSize() / doc.internal.scaleFactor;
        doc.setFont("helvetica", "normal");
        const separatorWidth = doc.getStringUnitWidth(separator) * doc.getFontSize() / doc.internal.scaleFactor;
        const totalLinkWidth = githubWidth + separatorWidth + linkedinWidth;
        currentX = (pageWidth / 2) - (totalLinkWidth / 2);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(currentTheme.accent);
        doc.textWithLink(githubText, currentX, yPos, { url: 'https://github.com/icarosqz' });
        currentX += githubWidth;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(currentTheme.text);
        doc.text(separator, currentX, yPos);
        currentX += separatorWidth;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(currentTheme.accent);
        doc.textWithLink(linkedinText, currentX, yPos, { url: 'https://www.linkedin.com/in/icaro-saldanha-845061352/' });
    };

    const drawBody = () => {
        addSection(data.summaryTitle, { marginTop: 10 });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(currentTheme.text);
        const summaryLines = doc.splitTextToSize(data.summaryContent.replace(/<[^>]*>/g, ''), contentWidth);
        doc.text(summaryLines, leftMargin, yPos);
        yPos += (summaryLines.length * 4) + 3;

        addSection(data.experienceTitle, { marginTop: 6 });
        data.experienceEntries.forEach(job => {
            checkPageBreak();
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(currentTheme.strong);
            const roleText = job.role;
            const companyText = ` • ${job.company}`;
            doc.text(roleText, leftMargin, yPos);
            const roleWidth = doc.getStringUnitWidth(roleText) * doc.getFontSize() / doc.internal.scaleFactor;
            doc.setFont("helvetica", "normal");
            doc.setTextColor(currentTheme.text);
            doc.text(companyText, leftMargin + roleWidth, yPos);
            yPos += 4;
            doc.setFont("helvetica", "italic");
            doc.setFontSize(10);
            doc.text(job.date, leftMargin, yPos);
            yPos += 5;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            job.duties.forEach(duty => {
                const dutyText = '• ' + duty.replace(/<[^>]*>/g, '');
                const lines = doc.splitTextToSize(dutyText, contentWidth - 3);
                checkPageBreak();
                doc.text(lines, leftMargin + 3, yPos);
                yPos += (lines.length * 3.8) + 1.5;
            });
            yPos += 4;
        });

        addSection(data.educationTitle, { marginTop: 6 });
        data.educationEntries.forEach(edu => {
            checkPageBreak();
            doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(currentTheme.strong);
            doc.text(edu.degree, leftMargin, yPos);
            yPos += 4;
            doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(currentTheme.text);
            doc.text(edu.institution, leftMargin, yPos);
            yPos += 4;
            doc.setFont("helvetica", "italic"); doc.setFontSize(10);
            doc.text(edu.period, leftMargin, yPos);
            yPos += 6;
        });

        addSection(data.projectsTitle, { marginTop: 6 });
        data.projectsEntries.forEach(proj => {
            checkPageBreak();
            doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(currentTheme.strong);
            const nameText = proj.name.split('—')[0] + '—';
            const descText = proj.name.split('—')[1] || '';
            doc.text(nameText, leftMargin, yPos);
            const nameWidth = doc.getStringUnitWidth(nameText) * doc.getFontSize() / doc.internal.scaleFactor;
            doc.setFont("helvetica", "normal"); doc.setTextColor(currentTheme.text);
            doc.text(descText, leftMargin + nameWidth, yPos);
            yPos += 5;
            doc.setFont("helvetica", "normal");
            const desc = `Descrição: ${proj.description}`.replace(/<[^>]*>/g, '');
            const descLines = doc.splitTextToSize(desc, contentWidth);
            doc.text(descLines, leftMargin, yPos);
            yPos += (descLines.length * 3.8) + 2;
            doc.text(`Tecnologias: ${proj.tech}`, leftMargin, yPos);
            yPos += 4;
            doc.setFont("helvetica", "bold"); doc.setTextColor(currentTheme.accent);
            doc.textWithLink(`Repositório: ${proj.repo}`, leftMargin, yPos, { url: `https://github.com/icarosqz/gespec` });
            yPos += 6;
        });
        
        addSection(data.skillsTitle, { marginTop: 6 });
        doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(currentTheme.text);
        const skillsText = data.skillsList.map(skill => "• " + skill.replace(/<\/?ul>/g, '').replace(/<li>/g, '  - ').replace(/<\/?li>/g, '').replace(/<[^>]*>/g, '')).join('\n');
        const skillLines = doc.splitTextToSize(skillsText, contentWidth);
        doc.text(skillLines, leftMargin, yPos);
        yPos += (skillLines.length * 3.8) + 3;
        
        addSection(data.languagesTitle, { marginTop: 6 });
        doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(currentTheme.text);
        data.languagesList.forEach(lang => {
            const cleanedLang = "• " + lang.replace(/<[^>]*>/g, '');
            doc.text(cleanedLang, leftMargin, yPos);
            yPos += 5;
        });
    };
    
    drawBackground();

    if (showPhoto) {
        const img = document.getElementById('profile-img');
        if (img && img.complete && img.naturalHeight !== 0) {
            const imgSize = 25;
            const x = (pageWidth / 2) - (imgSize / 2);
            const y = yPos;
            try {
                doc.addImage(img, 'JPEG', x, y, imgSize, imgSize);
            } catch (e) { console.error("Erro ao adicionar imagem:", e); }
            yPos = y + imgSize + 8;
        }
    }
    
    drawHeaderText();
    drawBody();

    doc.save('curriculo-icaro-saldanha.pdf');
}

document.addEventListener('DOMContentLoaded', loadTranslations);